'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const Cartoon = () => (
  <svg className="w-32 h-32" viewBox="0 0 200 200" fill="none">
    {/* Head */}
    <circle cx="100" cy="80" r="40" fill="#FFD700" stroke="#FF69B4" strokeWidth="3" />
    {/* Eyes */}
    <circle cx="85" cy="70" r="8" fill="#000" />
    <circle cx="115" cy="70" r="8" fill="#000" />
    <circle cx="87" cy="68" r="3" fill="#fff" />
    <circle cx="117" cy="68" r="3" fill="#fff" />
    {/* Smile */}
    <path d="M 85 85 Q 100 95 115 85" stroke="#FF1493" strokeWidth="3" strokeLinecap="round" />
    {/* Body */}
    <rect x="75" y="120" width="50" height="50" rx="10" fill="#FF69B4" />
    {/* Arms */}
    <rect x="50" y="130" width="25" height="15" rx="7" fill="#FFD700" />
    <rect x="125" y="130" width="25" height="15" rx="7" fill="#FFD700" />
    {/* Legs */}
    <rect x="80" y="170" width="12" height="25" fill="#FF1493" />
    <rect x="108" y="170" width="12" height="25" fill="#FF1493" />
  </svg>
);

const FloatingStars = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute text-3xl"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 3 + i,
          repeat: Infinity,
          delay: i * 0.2,
        }}
        style={{
          left: `${20 + i * 15}%`,
          top: `${10 + i * 5}%`,
        }}
      >
        ✨
      </motion.div>
    ))}
  </>
);

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    // Simulate auth delay
    setTimeout(() => {
      localStorage.setItem('username', username);
      router.push('/dashboard');
    }, 800);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-950 to-pink-950 flex items-center justify-center overflow-hidden relative">
      {/* Floating background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -100, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
      </div>

      <FloatingStars />

      {/* Main Content */}
      <motion.div
        className="relative z-10 w-full max-w-md px-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Cartoon Character */}
        <motion.div
          className="flex justify-center mb-8"
          variants={itemVariants}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        >
          <Cartoon />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl md:text-6xl font-black text-center mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
          variants={itemVariants}
        >
          Canvas
        </motion.h1>

        <motion.p
          className="text-center text-xl text-gray-300 mb-8"
          variants={itemVariants}
        >
          Collab
        </motion.p>

        {/* Form Card */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 shadow-2xl"
          variants={itemVariants}
        >
          <motion.form
            onSubmit={handleLogin}
            className="space-y-6"
            variants={itemVariants}
          >
            <div>
              <label className="block text-sm font-semibold text-purple-300 mb-3">
                🎨 Choose Your Artist Name
              </label>
              <motion.input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 transition-all"
                whileFocus={{
                  scale: 1.02,
                }}
              />
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !username.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      🎨
                    </motion.span>
                    Entering...
                  </>
                ) : (
                  <>
                    Enter the Studio
                    <span className="text-lg">→</span>
                  </>
                )}
              </span>
            </motion.button>
          </motion.form>

          {/* Decorative elements */}
          <motion.div
            className="mt-6 text-center text-sm text-gray-400"
            variants={itemVariants}
          >
            <p>✨ No account needed, just create and paint! ✨</p>
          </motion.div>
        </motion.div>

        {/* Fun Footer */}
        <motion.p
          className="text-center mt-8 text-gray-400 text-sm"
          variants={itemVariants}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          🎨 Let your creativity flow... 🎨
        </motion.p>
      </motion.div>
    </div>
  );
}
