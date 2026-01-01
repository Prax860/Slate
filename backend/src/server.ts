import express, { Express, Request, Response } from 'express';
import { Server as HTTPServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import { nanoid } from 'nanoid';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// Redis Client
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err) => console.error('Redis Error:', err));
redisClient.on('connect', () => console.log('✅ Connected to Redis'));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ SHARE CODE API ============

// POST /api/share - Generate share code
app.post('/api/share', async (req: Request, res: Response) => {
  try {
    const { boardId, boardName, userId } = req.body;

    if (!boardId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const shareCode = nanoid(6).toUpperCase();

    const shareData = {
      boardId,
      boardName,
      createdBy: userId,
      createdAt: Date.now(),
    };

    // Store in Redis with 5-minute TTL
    await redisClient.setEx(
      `share:${shareCode}`,
      300,
      JSON.stringify(shareData)
    );

    res.json({
      shareCode,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
  } catch (error) {
    console.error('Error generating share code:', error);
    res.status(500).json({ error: 'Failed to generate share code' });
  }
});

// GET /api/share - Validate share code
app.get('/api/share', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing share code' });
    }

    const data = await redisClient.get(`share:${code}`);

    if (!data) {
      return res.status(404).json({ error: 'Share code not found or expired' });
    }

    const shareData = JSON.parse(data);
    res.json(shareData);
  } catch (error) {
    console.error('Error validating share code:', error);
    res.status(500).json({ error: 'Failed to validate share code' });
  }
});

// ============ SOCKET.IO ============

interface CustomSocket extends Socket {
  userId?: string;
  username?: string;
  boardId?: string;
}

const httpServer: HTTPServer = require('http').createServer(app);
const io: IOServer = new IOServer(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

io.on('connection', async (socket: CustomSocket) => {
  console.log('New client connected:', socket.id);

  // Handle user join
  socket.on('user:join', async (data: { username: string; userId: string; boardId: string }) => {
    socket.username = data.username;
    socket.userId = data.userId;
    socket.boardId = data.boardId;

    socket.join(`board:${data.boardId}`);

    // Cache user info in Redis
    await redisClient.setEx(
      `user:${data.boardId}:${data.userId}`,
      3600,
      JSON.stringify({
        username: data.username,
        socketId: socket.id,
        boardId: data.boardId,
        joinedAt: new Date().toISOString(),
      })
    );

    const userCount = io.sockets.adapter.rooms.get(`board:${data.boardId}`)?.size || 1;

    io.to(`board:${data.boardId}`).emit('user:joined', {
      userId: data.userId,
      username: data.username,
      userCount,
    });

    io.to(`board:${data.boardId}`).emit('userCount', userCount);

    await redisClient.publish(
      `whiteboard:${data.boardId}`,
      JSON.stringify({
        type: 'user:joined',
        userId: data.userId,
        username: data.username,
        timestamp: Date.now(),
      })
    );
  });

  // Handle drawing
  socket.on('draw', async (data) => {
    if (!socket.boardId) return;

    socket.to(`board:${socket.boardId}`).emit('draw', {
      ...data,
      userId: socket.userId,
      username: socket.username,
    });

    await redisClient.publish(
      `whiteboard:${socket.boardId}:draw`,
      JSON.stringify(data)
    );
  });

  // Handle canvas clear
  socket.on('canvas:clear', async (data: { boardId: string }) => {
    io.to(`board:${data.boardId}`).emit('canvas:clear');
    await redisClient.publish(
      `whiteboard:${data.boardId}`,
      JSON.stringify({
        type: 'canvas:clear',
        userId: socket.userId,
        timestamp: Date.now(),
      })
    );
  });

  // Handle undo
  socket.on('canvas:undo', async (data: { boardId: string }) => {
    io.to(`board:${data.boardId}`).emit('canvas:undo');
  });

  // Handle color change
  socket.on('color:change', async (data: { color: string; boardId: string }) => {
    io.to(`board:${data.boardId}`).emit('color:change', {
      ...data,
      userId: socket.userId,
    });
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);

    if (socket.userId && socket.boardId) {
      await redisClient.del(`user:${socket.boardId}:${socket.userId}`);

      const userCount = io.sockets.adapter.rooms.get(`board:${socket.boardId}`)?.size || 0;

      io.to(`board:${socket.boardId}`).emit('user:left', {
        userId: socket.userId,
        userCount,
      });

      io.to(`board:${socket.boardId}`).emit('userCount', userCount);

      await redisClient.publish(
        `whiteboard:${socket.boardId}`,
        JSON.stringify({
          type: 'user:left',
          userId: socket.userId,
          timestamp: Date.now(),
        })
      );
    }
  });
});

// ============ START SERVER ============

async function startServer() {
  try {
    // Connect to Redis
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // Start HTTP server with Socket.io
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Backend server running on port ${PORT}`);
      console.log(`📡 Socket.io endpoint: ws://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
