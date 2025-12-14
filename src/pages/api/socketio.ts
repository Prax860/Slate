import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HTTPServer } from 'http';
import { Server as IOServer, Socket } from 'socket.io';
import redisClient, { connectRedis } from '@/lib/redis';

interface CustomSocket extends Socket {
  userId?: string;
  username?: string;
  boardId?: string;
}

let io: IOServer;

export const getIO = () => io;

export const socketHandler = async (req: NextApiRequest, res: any) => {
  if (res.socket.server.io) {
    console.log('Socket.io already running');
    res.end();
    return;
  }

  await connectRedis();

  const httpServer: HTTPServer = res.socket.server as any;
  io = new IOServer(httpServer, {
    path: '/api/socketio/',
    addTrailingSlash: false,
  });

  io.on('connection', async (socket: CustomSocket) => {
    console.log('New client connected:', socket.id);

    // Handle user join
    socket.on('user:join', async (data: { username: string; userId: string; boardId: string }) => {
      socket.username = data.username;
      socket.userId = data.userId;
      socket.boardId = data.boardId;

      // Join room based on board ID
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

      // Get users in this board room
      const userCount = io.sockets.adapter.rooms.get(`board:${data.boardId}`)?.size || 1;

      // Broadcast user joined only to this board
      io.to(`board:${data.boardId}`).emit('user:joined', {
        userId: data.userId,
        username: data.username,
        userCount,
      });

      io.to(`board:${data.boardId}`).emit('userCount', userCount);

      // Publish to Redis
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

    // Handle drawing events
    socket.on('draw', async (data) => {
      if (!socket.boardId) return;

      // Broadcast to this board only
      socket.to(`board:${socket.boardId}`).emit('draw', {
        ...data,
        userId: socket.userId,
        username: socket.username,
      });

      // Publish to Redis for persistence
      await redisClient.publish(
        `whiteboard:${socket.boardId}:draw`,
        JSON.stringify(data)
      );
    });

    // Handle clear canvas
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

        // Get remaining users in this board
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

  res.socket.server.io = io;
  res.end();
};

export default socketHandler;
