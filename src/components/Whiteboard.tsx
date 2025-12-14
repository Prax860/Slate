'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

interface DrawingPoint {
  x: number;
  y: number;
  color: string;
  size: number;
}

interface User {
  userId: string;
  username: string;
  color: string;
}

const colors = [
  '#a78bfa',
  '#f472b6',
  '#38bdf8',
  '#34d399',
  '#fbbf24',
  '#f87171',
  '#c084fc',
  '#22d3ee',
];

export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(colors[0]);
  const [brushSize, setBrushSize] = useState(3);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [userCount, setUserCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const userIdRef = useRef<string>('');
  const usernameRef = useRef<string>('');

  // Generate unique user ID and fetch username
  useEffect(() => {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const username = `Artist ${Math.floor(Math.random() * 1000)}`;
    userIdRef.current = userId;
    usernameRef.current = username;

    // Initialize canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.fillStyle = '#0f172a';
    context.fillRect(0, 0, canvas.width, canvas.height);
    contextRef.current = context;

    // Save initial state
    historyRef.current.push(context.getImageData(0, 0, canvas.width, canvas.height));

    // Initialize Socket.io
    const socket = io(undefined, {
      path: '/api/socketio/',
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);

      // Emit user joined event
      socket.emit('user:join', {
        userId,
        username,
      });
    });

    socket.on('draw', (data: DrawingPoint & { userId: string; username: string }) => {
      const context = contextRef.current;
      if (!context) return;

      context.strokeStyle = data.color;
      context.lineWidth = data.size;
      context.beginPath();
      context.moveTo(data.x - 10, data.y - 10);
      context.lineTo(data.x, data.y);
      context.stroke();
    });

    socket.on('canvas:clear', () => {
      const context = contextRef.current;
      const canvas = canvasRef.current;
      if (!context || !canvas) return;

      context.fillStyle = '#0f172a';
      context.fillRect(0, 0, canvas.width, canvas.height);
      historyRef.current = [context.getImageData(0, 0, canvas.width, canvas.height)];
    });

    socket.on('canvas:undo', () => {
      const context = contextRef.current;
      const canvas = canvasRef.current;
      if (!context || !canvas || historyRef.current.length <= 1) return;

      historyRef.current.pop();
      const imageData = historyRef.current[historyRef.current.length - 1];
      context.putImageData(imageData, 0, 0);
    });

    socket.on('user:joined', (data: { userId: string; username: string; userCount: number }) => {
      setUserCount(data.userCount);
      const newUsers = new Map(users);
      newUsers.set(data.userId, {
        userId: data.userId,
        username: data.username,
        color: colors[newUsers.size % colors.length],
      });
      setUsers(newUsers);
    });

    socket.on('user:left', (data: { userCount: number }) => {
      setUserCount(data.userCount);
    });

    socket.on('userCount', (count: number) => {
      setUserCount(count);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    // Handle window resize
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const currentImageData = contextRef.current?.getImageData(0, 0, canvas.width, canvas.height);

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 100;

      const context = canvasRef.current?.getContext('2d');
      if (context && currentImageData) {
        context.putImageData(currentImageData, 0, 0);
        contextRef.current = context;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.disconnect();
    };
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    contextRef.current!.strokeStyle = color;
    contextRef.current!.lineWidth = brushSize;
    contextRef.current!.lineTo(x, y);
    contextRef.current!.stroke();

    socketRef.current?.emit('draw', {
      x,
      y,
      color,
      size: brushSize,
    });
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);

    // Save to history
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      historyRef.current.push(context.getImageData(0, 0, canvas.width, canvas.height));
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.fillStyle = '#0f172a';
    context.fillRect(0, 0, canvas.width, canvas.height);
    historyRef.current = [context.getImageData(0, 0, canvas.width, canvas.height)];

    socketRef.current?.emit('canvas:clear');
  };

  const handleUndo = () => {
    if (historyRef.current.length <= 1) return;

    socketRef.current?.emit('canvas:undo');
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (context && canvas) {
      historyRef.current.pop();
      const imageData = historyRef.current[historyRef.current.length - 1];
      context.putImageData(imageData, 0, 0);
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="block w-full cursor-crosshair"
      />

      {/* Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 to-transparent p-4 flex items-center justify-center gap-4 flex-wrap">
        {/* Connection Status */}
        <motion.div
          className="flex items-center gap-2"
          animate={{
            opacity: isConnected ? 1 : 0.5,
          }}
        >
          <motion.div
            className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}
            animate={{
              boxShadow: isConnected ? ['0 0 0 0 rgba(16, 185, 129, 0.7)', '0 0 0 10px rgba(16, 185, 129, 0)'] : 'none',
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          <span className="text-xs text-gray-400">{isConnected ? 'Connected' : 'Connecting...'}</span>
        </motion.div>

        {/* User Count */}
        <motion.div
          className="flex items-center gap-2 text-sm text-gray-300"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 12a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <span>{userCount} user{userCount !== 1 ? 's' : ''}</span>
        </motion.div>

        <div className="w-px h-6 bg-gray-600" />

        {/* Color Picker */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-400">Color:</span>
          <div className="flex gap-2">
            {colors.map((c) => (
              <motion.button
                key={c}
                onClick={() => {
                  setColor(c);
                  socketRef.current?.emit('color:change', { color: c });
                }}
                className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'ring-2 ring-white' : ''}`}
                style={{ backgroundColor: c }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              />
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-600" />

        {/* Brush Size */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-400">Size:</span>
          <motion.input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-400 w-6">{brushSize}</span>
        </div>

        <div className="w-px h-6 bg-gray-600" />

        {/* Action Buttons */}
        <motion.button
          onClick={handleUndo}
          className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ↶ Undo
        </motion.button>

        <motion.button
          onClick={handleClear}
          className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm rounded-lg hover:from-red-700 hover:to-red-600 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🗑 Clear
        </motion.button>
      </div>

      {/* Online Users List */}
      <motion.div
        className="fixed top-4 right-4 bg-slate-900/80 backdrop-blur-md rounded-lg p-4 max-w-xs border border-purple-500/20"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h3 className="text-sm font-semibold text-purple-300 mb-2">Artists Online</h3>
        <AnimatePresence>
          <div className="space-y-1.5">
            {Array.from(users.values()).map((user) => (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 text-sm text-gray-300"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span>{user.username}</span>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </motion.div>

      {/* Your Username */}
      <motion.div
        className="fixed top-4 left-4 bg-slate-900/80 backdrop-blur-md rounded-lg p-4 border border-purple-500/20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <p className="text-xs text-gray-400">You</p>
        <p className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {usernameRef.current}
        </p>
      </motion.div>
    </div>
  );
}
