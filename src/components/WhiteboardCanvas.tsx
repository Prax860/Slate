'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

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

interface Whiteboard {
  id: string;
  name: string;
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

const FloatingDecorations = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {['🎨', '✏️', '🖌️'].map((emoji, i) => (
      <motion.div
        key={i}
        className="absolute text-3xl opacity-30"
        animate={{
          y: [0, -300, 0],
          x: [0, Math.sin(i) * 100, 0],
          opacity: [0, 0.5, 0],
        }}
        transition={{
          duration: 5 + i,
          repeat: Infinity,
          delay: i * 1,
        }}
        style={{
          left: `${20 + i * 30}%`,
          bottom: '-20%',
        }}
      />
    ))}
  </div>
);

export default function WhiteboardCanvas() {
  const { user, isLoaded } = useUser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(colors[0]);
  const [brushSize, setBrushSize] = useState(3);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [userCount, setUserCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const gridContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const userIdRef = useRef<string>('');
  const usernameRef = useRef<string>('');
  const [whiteboard, setWhiteboard] = useState<Whiteboard | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareCodeExpiry, setShareCodeExpiry] = useState<number | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [shareCopyMessage, setShareCopyMessage] = useState('');
  const router = useRouter();
  const params = useParams();
  const boardId = (params?.id as string) || '';

  // Get user from Clerk
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
      return;
    }

    if (isLoaded && user && boardId) {
      userIdRef.current = user.id;
      usernameRef.current = user.firstName || user.username || 'Anonymous';

      // Load whiteboard info from localStorage
      const storedBoards = localStorage.getItem(`whiteboards_${user.id}`);
      if (storedBoards) {
        try {
          const boards = JSON.parse(storedBoards);
          const board = boards.find((b: { id: string }) => b.id === boardId);
          if (board) {
            setWhiteboard(board);
          } else {
            // Whiteboard not found, create a default one
            setWhiteboard({ id: boardId, name: 'Whiteboard' });
          }
        } catch {
          // Ignore invalid JSON and create default
          setWhiteboard({ id: boardId, name: 'Whiteboard' });
        }
      } else {
        // No stored boards, create default
        setWhiteboard({ id: boardId, name: 'Whiteboard' });
      }
    }
  }, [isLoaded, user, boardId, router]);

  // Update share code expiry timer
  useEffect(() => {
    if (!shareCodeExpiry) return;

    const interval = setInterval(() => {
      getTimeRemaining();
    }, 1000);

    return () => clearInterval(interval);
  }, [shareCodeExpiry]);

  // Initialize canvas and socket
  useEffect(() => {
    if (!whiteboard || !userIdRef.current || !usernameRef.current) return;

    // Only initialize if socket isn't already connected to this board
    if (socketRef.current?.connected && socketRef.current?.io._query?.boardId === boardId) {
      return;
    }

    const userId = userIdRef.current;
    const username = usernameRef.current;

    // Initialize main canvas
    const canvas = canvasRef.current;
    const gridCanvas = gridCanvasRef.current;

    if (!canvas || !gridCanvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 120;

    gridCanvas.width = window.innerWidth;
    gridCanvas.height = window.innerHeight - 120;

    const context = canvas.getContext('2d');
    const gridContext = gridCanvas.getContext('2d');

    if (!context || !gridContext) return;

    // Setup main canvas
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.fillStyle = '#0f172a';
    context.fillRect(0, 0, canvas.width, canvas.height);
    contextRef.current = context;

    // Draw grid
    gridContext.strokeStyle = '#334155';
    gridContext.lineWidth = 0.5;
    const gridSize = 50;

    for (let x = 0; x <= gridCanvas.width; x += gridSize) {
      gridContext.beginPath();
      gridContext.moveTo(x, 0);
      gridContext.lineTo(x, gridCanvas.height);
      gridContext.stroke();
    }

    for (let y = 0; y <= gridCanvas.height; y += gridSize) {
      gridContext.beginPath();
      gridContext.moveTo(0, y);
      gridContext.lineTo(gridCanvas.width, y);
      gridContext.stroke();
    }

    gridContextRef.current = gridContext;

    // Save initial state
    historyRef.current.push(context.getImageData(0, 0, canvas.width, canvas.height));

    // Initialize Socket.io with board ID
    const socket = io(undefined, {
      path: '/api/socketio/',
      query: {
        boardId,
        username: usernameRef.current,
      },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);

      socket.emit('user:join', {
        userId,
        username,
        boardId,
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
      const gridCanvas = gridCanvasRef.current;

      if (!canvas || !gridCanvas) return;

      const currentImageData = contextRef.current?.getImageData(0, 0, canvas.width, canvas.height);

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 120;

      gridCanvas.width = window.innerWidth;
      gridCanvas.height = window.innerHeight - 120;

      const context = canvasRef.current?.getContext('2d');
      const gridContext = gridCanvasRef.current?.getContext('2d');

      if (context && currentImageData) {
        context.putImageData(currentImageData, 0, 0);
        contextRef.current = context;
      }

      if (gridContext) {
        gridContext.strokeStyle = '#334155';
        gridContext.lineWidth = 0.5;
        const gridSize = 50;

        for (let x = 0; x <= gridCanvas.width; x += gridSize) {
          gridContext.beginPath();
          gridContext.moveTo(x, 0);
          gridContext.lineTo(x, gridCanvas.height);
          gridContext.stroke();
        }

        for (let y = 0; y <= gridCanvas.height; y += gridSize) {
          gridContext.beginPath();
          gridContext.moveTo(0, y);
          gridContext.lineTo(gridCanvas.width, y);
          gridContext.stroke();
        }

        gridContextRef.current = gridContext;
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.disconnect();
    };
  }, [whiteboard, boardId]);

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
      boardId,
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

    socketRef.current?.emit('canvas:clear', { boardId });
  };

  const handleUndo = () => {
    if (historyRef.current.length <= 1) return;

    socketRef.current?.emit('canvas:undo', { boardId });
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (context && canvas) {
      historyRef.current.pop();
      const imageData = historyRef.current[historyRef.current.length - 1];
      context.putImageData(imageData, 0, 0);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  const generateShareCode = async () => {
    if (!whiteboard || !userIdRef.current) return;

    setIsGeneratingCode(true);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardId: whiteboard.id,
          boardName: whiteboard.name,
          userId: userIdRef.current,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate share code');

      const data = await response.json();
      setShareCode(data.shareCode);
      setShareCodeExpiry(data.expiresAt);

      // Clear message after 3 seconds
      setShareCopyMessage('');
    } catch (error) {
      console.error('Error generating share code:', error);
      setShareCopyMessage('Failed to generate code');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const copyToClipboard = () => {
    if (shareCode) {
      const shareUrl = `${window.location.origin}/dashboard?joinCode=${shareCode}`;
      navigator.clipboard.writeText(shareUrl);
      setShareCopyMessage('Link copied to clipboard!');
      setTimeout(() => setShareCopyMessage(''), 3000);
    }
  };

  const shareViaEmail = () => {
    if (shareCode) {
      const shareUrl = `${window.location.origin}/dashboard?joinCode=${shareCode}`;
      const subject = `Join my whiteboard: ${whiteboard?.name}`;
      const body = `I'd like to invite you to collaborate on my whiteboard. Click the link below to join:\n\n${shareUrl}\n\nThis link expires in 5 minutes.`;
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  const getTimeRemaining = () => {
    if (!shareCodeExpiry) return '';
    const remaining = Math.ceil((shareCodeExpiry - Date.now()) / 1000);
    if (remaining <= 0) {
      setShareCode(null);
      setShareCodeExpiry(null);
      return 'Expired';
    }
    return `${remaining}s`;
  };

  if (!whiteboard || !usernameRef.current) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="text-6xl">🎨</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex flex-col">
      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <FloatingDecorations />

        {/* Grid Canvas (background) */}
        <canvas
          ref={gridCanvasRef}
          className={`absolute inset-0 ${showGrid ? 'opacity-30' : 'opacity-0'} transition-opacity`}
          style={{ pointerEvents: 'none' }}
        />

        {/* Main Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="absolute inset-0 cursor-crosshair"
        />

        {/* Top Bar - Board Info */}
        <motion.div
          className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md rounded-lg p-4 border border-purple-500/20 z-20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-2">
            <motion.span
              className="text-2xl"
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              🎨
            </motion.span>
            <div>
              <p className="text-xs text-gray-400">Board Name</p>
              <p className="text-sm font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {whiteboard.name}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.button
          onClick={handleBack}
          className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-lg border border-purple-500/20 hover:border-purple-400/60 text-gray-300 hover:text-white transition-all z-20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back
        </motion.button>

        {/* Online Users List */}
        <motion.div
          className="absolute bottom-32 right-4 bg-slate-900/80 backdrop-blur-md rounded-lg p-4 max-w-xs border border-purple-500/20 z-20"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
            👥 Artists Online ({userCount})
          </h3>
          <AnimatePresence>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {Array.from(users.values()).map((user) => (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 text-sm text-gray-300"
                >
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: user.color }}
                    animate={{
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                  <span>{user.username}</span>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Toolbar */}
      <motion.div
        className="bg-gradient-to-t from-slate-950 to-transparent p-4 flex items-center justify-center gap-4 flex-wrap border-t border-purple-500/20"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Connection Status */}
        <motion.div
          className="flex items-center gap-2"
          animate={{
            opacity: isConnected ? 1 : 0.5,
          }}
        >
          <motion.div
            className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}
            animate={isConnected ? {
              boxShadow: ['0 0 0 0 rgba(16, 185, 129, 0.7)', '0 0 0 10px rgba(16, 185, 129, 0)'],
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
          <span className="text-xs text-gray-400">{isConnected ? 'Connected' : 'Connecting...'}</span>
        </motion.div>

        <div className="w-px h-6 bg-gray-600" />

        {/* Color Picker */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-gray-400">🎨</span>
          <div className="flex gap-2">
            {colors.map((c) => (
              <motion.button
                key={c}
                onClick={() => {
                  setColor(c);
                  socketRef.current?.emit('color:change', { color: c, boardId });
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
          <span className="text-xs text-gray-400">✏️</span>
          <motion.input
            type="range"
            min="1"
            max="30"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-400 w-6">{brushSize}</span>
        </div>

        <div className="w-px h-6 bg-gray-600" />

        {/* Grid Toggle */}
        <motion.button
          onClick={() => setShowGrid(!showGrid)}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            showGrid
              ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white'
              : 'bg-slate-700/50 text-gray-300'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          📐 Grid
        </motion.button>

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

        <motion.button
          onClick={() => setShowShareModal(true)}
          className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔗 Share
        </motion.button>
      </motion.div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-purple-500/20 shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
                Share Whiteboard
              </h2>

              {!shareCode ? (
                <div className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    Generate a one-time share code to invite others to collaborate on this whiteboard. The code expires in 5 minutes.
                  </p>
                  <motion.button
                    onClick={generateShareCode}
                    disabled={isGeneratingCode}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isGeneratingCode ? 'Generating...' : 'Generate Share Code'}
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/30">
                    <p className="text-xs text-gray-400 mb-2">Share Code:</p>
                    <p className="text-2xl font-mono font-bold text-purple-300 tracking-widest">
                      {shareCode}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        Expires in: <span className="text-yellow-400 font-semibold">{getTimeRemaining()}</span>
                      </p>
                      <motion.button
                        onClick={() => {
                          setShareCode(null);
                          setShareCodeExpiry(null);
                        }}
                        className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-gray-300 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Clear
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <motion.button
                      onClick={copyToClipboard}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      📋 Copy Share Link
                    </motion.button>

                    <motion.button
                      onClick={shareViaEmail}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      📧 Share via Email
                    </motion.button>
                  </div>

                  {shareCopyMessage && (
                    <motion.div
                      className="text-center text-sm font-semibold text-green-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {shareCopyMessage}
                    </motion.div>
                  )}

                  <motion.button
                    onClick={() => setShowShareModal(false)}
                    className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 font-semibold rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
