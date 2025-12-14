'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { nanoid } from 'nanoid';

interface Whiteboard {
  id: string;
  name: string;
  createdAt: string;
  participantCount: number;
}

const CartoonDance = () => (
  <motion.svg
    className="w-16 h-16"
    viewBox="0 0 200 200"
    fill="none"
    animate={{
      y: [0, -10, 0],
      rotate: [-5, 5, -5],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
    }}
  >
    {/* Head */}
    <circle cx="100" cy="60" r="25" fill="#FF6B6B" stroke="#FFD700" strokeWidth="2" />
    {/* Eyes */}
    <circle cx="90" cy="55" r="5" fill="#000" />
    <circle cx="110" cy="55" r="5" fill="#000" />
    {/* Smile */}
    <path d="M 90 65 Q 100 72 110 65" stroke="#000" strokeWidth="2" strokeLinecap="round" />
    {/* Body */}
    <rect x="80" y="85" width="40" height="50" rx="8" fill="#FFD700" />
    {/* Arms */}
    <rect x="55" y="95" width="25" height="12" rx="6" fill="#FF6B6B" />
    <rect x="120" y="95" width="25" height="12" rx="6" fill="#FF6B6B" />
    {/* Legs */}
    <rect x="85" y="135" width="10" height="30" rx="5" fill="#4ECDC4" />
    <rect x="105" y="135" width="10" height="30" rx="5" fill="#4ECDC4" />
  </motion.svg>
);

const FloatingEmojis = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {['🎨', '✏️', '🖌️', '💡', '🌟', '🎭', '🎪'].map((emoji, i) => (
      <motion.div
        key={i}
        className="absolute text-3xl"
        animate={{
          y: [0, -100, 0],
          x: [0, Math.sin(i) * 50, 0],
          rotate: [0, 360],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 4 + i * 0.5,
          repeat: Infinity,
          delay: i * 0.3,
        }}
        style={{
          left: `${15 + i * 12}%`,
          bottom: '-10%',
        }}
      >
        {emoji}
      </motion.div>
    ))}
  </div>
);

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [newBoardName, setNewBoardName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (isLoaded && !user) {
      router.push('/');
      return;
    }

    if (isLoaded && user) {
      // Load whiteboards from localStorage (keyed by user ID)
      const stored = localStorage.getItem(`whiteboards_${user.id}`);
      if (stored) {
        try {
          setWhiteboards(JSON.parse(stored));
        } catch {
          // Ignore invalid JSON
        }
      }
    }
  }, [user?.id, isLoaded, router]);

  const createWhiteboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim() || !user) return;

    setIsCreating(true);
    setTimeout(() => {
      const newBoard: Whiteboard = {
        id: nanoid(12),
        name: newBoardName,
        createdAt: new Date().toISOString(),
        participantCount: 1,
      };

      const updated = [newBoard, ...whiteboards];
      setWhiteboards(updated);
      localStorage.setItem(`whiteboards_${user.id}`, JSON.stringify(updated));
      setNewBoardName('');
      setShowNewForm(false);
      setIsCreating(false);
    }, 600);
  };

  const deleteWhiteboard = (id: string) => {
    if (!user) return;
    const updated = whiteboards.filter((b) => b.id !== id);
    setWhiteboards(updated);
    localStorage.setItem(`whiteboards_${user.id}`, JSON.stringify(updated));
  };

  const enterWhiteboard = (id: string) => {
    router.push(`/whiteboard/${id}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Show loading state while auth is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-4xl"
        >
          ✨
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 relative overflow-hidden">
      <FloatingEmojis />

      {/* Header */}
      <motion.header
        className="border-b border-purple-500/20 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="text-3xl"
            >
              🎨
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Canvas Collab
              </h1>
              <p className="text-sm text-gray-400">
                Welcome, {user?.firstName || user?.username || 'Creator'}! 👋
              </p>
            </div>
          </div>

          <SignOutButton>
            <motion.button
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Out
            </motion.button>
          </SignOutButton>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        className="max-w-7xl mx-auto px-4 py-12 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Create New Board */}
        <motion.div variants={itemVariants} className="mb-12">
          <AnimatePresence>
            {!showNewForm ? (
              <motion.button
                onClick={() => setShowNewForm(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl group-hover:rotate-12 transition-transform">
                  ✨
                </span>
                Create New Whiteboard
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-purple-500/30 max-w-md"
              >
                <h3 className="text-lg font-bold text-purple-300 mb-4">
                  🎨 Name Your Masterpiece
                </h3>
                <form onSubmit={createWhiteboard} className="space-y-4">
                  <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="e.g., Sunset Dreams, Abstract Thoughts..."
                    className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <motion.button
                      type="submit"
                      disabled={isCreating || !newBoardName.trim()}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isCreating ? 'Creating...' : 'Create'}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setShowNewForm(false)}
                      className="px-4 py-2 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-600/50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Whiteboards Grid */}
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <span>Your Whiteboards</span>
            <CartoonDance />
          </h2>

          {whiteboards.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                🎨
              </motion.div>
              <p className="text-xl text-gray-400 mb-6">
                No whiteboards yet! Create one to start drawing.
              </p>
              <motion.button
                onClick={() => setShowNewForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Your First Board
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
            >
              {whiteboards.map((board) => (
                <motion.div
                  key={board.id}
                  className="group relative"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    layoutId={`glow-${board.id}`}
                  />

                  <div className="relative bg-slate-900/50 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/60 transition-all cursor-pointer"
                    onClick={() => enterWhiteboard(board.id)}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-purple-300 group-hover:text-purple-200 transition-colors">
                          {board.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(board.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWhiteboard(board.id);
                        }}
                        className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        🗑️
                      </motion.button>
                    </div>

                    {/* Preview */}
                    <motion.div
                      className="w-full h-40 bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg mb-4 flex items-center justify-center group-hover:from-slate-700 group-hover:to-slate-600 transition-colors"
                      whileHover={{
                        scale: 1.02,
                      }}
                    >
                      <motion.span
                        className="text-6xl"
                        animate={{
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      >
                        🎨
                      </motion.span>
                    </motion.div>

                    {/* Info */}
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>👥 {board.participantCount} artist{board.participantCount !== 1 ? 's' : ''}</span>
                      <motion.span
                        className="text-purple-400"
                        whileHover={{ scale: 1.1 }}
                      >
                        Enter →
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.main>

      {/* Footer Decoration */}
      <motion.div
        className="fixed bottom-4 left-4 text-4xl"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        ✨
      </motion.div>
      <motion.div
        className="fixed bottom-4 right-4 text-4xl"
        animate={{
          y: [0, -15, 0],
          rotate: [0, -10, 10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: 0.5,
        }}
      >
        🎨
      </motion.div>
    </div>
  );
}
