'use client';

import { motion } from 'framer-motion';

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
    transition: {
      duration: 0.8,
      ease: 'easeOut' as const,
    },
  },
};

const orbitVariants = {
  rotate: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear" as const,
    },
  },
};

const dotVariants = {
  pulse: {
    scale: [1, 1.5, 1],
    opacity: [0.3, 1, 0.3],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: 2,
          }}
        />
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Rotating orbit */}
        <motion.div
          className="relative w-40 h-40 mx-auto mb-8"
          variants={orbitVariants}
          animate="rotate"
        >
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-400 border-r-pink-400" />

          {/* Orbiting dots */}
          <motion.div
            className="absolute top-0 left-1/2 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
            style={{ x: '-50%', y: '-70%' }}
            variants={dotVariants}
            animate="pulse"
          />
          <motion.div
            className="absolute bottom-0 right-0 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
            style={{ x: '20%', y: '20%' }}
            variants={dotVariants}
            animate="pulse"
            transition={{ delay: 0.67 }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-3 h-3 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full"
            style={{ x: '-20%', y: '20%' }}
            variants={dotVariants}
            animate="pulse"
            transition={{ delay: 1.34 }}
          />

          {/* Center dot */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-sm" />
          </motion.div>
        </motion.div>

        {/* Text content */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4"
          variants={itemVariants}
        >
          Whiteboard Live
        </motion.h1>

        <motion.p
          className="text-lg text-gray-300 mb-8"
          variants={itemVariants}
        >
          Connecting to the creative space...
        </motion.p>

        {/* Loading bar */}
        <motion.div
          className="w-64 h-1 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full overflow-hidden"
          variants={itemVariants}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            }}
          />
        </motion.div>

        {/* Floating status text */}
        <motion.p
          className="text-sm text-gray-400 mt-8"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          Loading real-time canvas...
        </motion.p>
      </motion.div>
    </div>
  );
}
