'use client';

import { motion } from 'framer-motion';
import { SignUpButton, SignInButton, useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FigmaFeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  index: number;
}

const FigmaFeatureCard = ({ icon, title, description, color, index }: FigmaFeatureCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="group relative bg-slate-900/50 backdrop-blur-md border border-purple-500/20 rounded-xl p-6 hover:border-purple-400/60 transition-all"
  >
    <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`} />
    <div className="relative z-10">
      <div className={`text-4xl mb-4 transform group-hover:scale-110 transition-transform`}>{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  </motion.div>
);

interface FloatingShapeProps {
  delay: number;
  duration: number;
  size: number;
  color: string;
}

const FloatingShape = ({ delay, duration, size, color }: FloatingShapeProps) => (
  <motion.div
    className={`absolute ${color} rounded-full filter blur-3xl opacity-20`}
    style={{
      width: size,
      height: size,
    }}
    animate={{
      y: [0, -50, 0],
      x: [0, 50, 0],
    }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
    }}
  />
);

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, isLoaded, router]);

  const features = [
    {
      icon: '🎨',
      title: 'Real-time Collaboration',
      description: 'Draw together with multiple artists simultaneously with instant synchronization',
      color: 'from-purple-600 to-pink-600',
    },
    {
      icon: '📐',
      title: 'Smart Grid System',
      description: 'Toggle precision grid for pixel-perfect drawing and alignment',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      icon: '🎭',
      title: 'Unlimited Boards',
      description: 'Create and manage as many whiteboards as you need',
      color: 'from-green-600 to-emerald-600',
    },
    {
      icon: '👥',
      title: 'Live Presence',
      description: 'See who\'s drawing with you in real-time',
      color: 'from-orange-600 to-red-600',
    },
    {
      icon: '🎨',
      title: '8 Beautiful Colors',
      description: 'Express yourself with a vibrant palette of gradient colors',
      color: 'from-pink-600 to-rose-600',
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Optimized performance with 60fps drawing and instant sync',
      color: 'from-yellow-600 to-amber-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 overflow-hidden">
      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingShape delay={0} duration={8} size={400} color="bg-purple-500" />
        <FloatingShape delay={2} duration={10} size={300} color="bg-pink-500" />
        <FloatingShape delay={4} duration={12} size={250} color="bg-blue-500" />
      </div>

      {/* Navigation */}
      <motion.nav
        className="relative z-40 max-w-7xl mx-auto px-4 py-6 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl"
          >
            🎨
          </motion.div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Canvas Collab
          </h1>
        </div>

        {!isSignedIn && (
          <div className="flex items-center gap-4">
            <SignInButton mode="modal">
              <button className="px-6 py-2 text-gray-300 hover:text-white transition-colors font-medium">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-bold transition-all">
                Get Started
              </button>
            </SignUpButton>
          </div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="relative z-10 max-w-7xl mx-auto px-4 py-20 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="text-5xl md:text-7xl font-black mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Design Together
          </span>
          <br />
          <span className="text-white">in Real-Time</span>
        </motion.h2>

        <motion.p
          className="text-xl text-gray-300 max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          A beautiful, modern collaborative whiteboard for teams, designers, and creative professionals. 
          Draw, collaborate, and bring your ideas to life with stunning real-time synchronization.
        </motion.p>

        <motion.div
          className="flex gap-4 justify-center flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <SignUpButton mode="modal">
            <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105">
              Start Creating Now →
            </button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className="px-8 py-4 border-2 border-purple-500/50 text-white text-lg font-bold rounded-xl hover:border-purple-400 hover:bg-purple-500/10 transition-all">
              Sign In
            </button>
          </SignInButton>
        </motion.div>

        {/* Demo section */}
        <motion.div
          className="mt-20 relative rounded-2xl overflow-hidden border border-purple-500/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl"
            >
              🎨
            </motion.div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </motion.section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <motion.h3
          className="text-4xl font-black text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          Powerful Features for Creative Teams
        </motion.h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <FigmaFeatureCard key={idx} {...feature} index={idx} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { number: '100%', label: 'Real-time Sync' },
            { number: '∞', label: 'Collaborators' },
            { number: '60fps', label: 'Performance' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <p className="text-xl text-gray-300">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <motion.h3
          className="text-4xl font-black text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          How It Works
        </motion.h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: 1, title: 'Sign Up', icon: '🔐' },
            { step: 2, title: 'Create Board', icon: '📝' },
            { step: 3, title: 'Invite Friends', icon: '👥' },
            { step: 4, title: 'Start Drawing', icon: '🎨' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="bg-slate-900/50 backdrop-blur-md border border-purple-500/20 rounded-xl p-6 text-center hover:border-purple-400/60 transition-all">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-3xl font-bold text-purple-400 mb-2">{item.step}</div>
                <h4 className="text-lg font-bold text-white">{item.title}</h4>
              </div>
              {idx < 3 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-2xl text-purple-500">
                  →
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.div
          className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-12 backdrop-blur-md"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          <h3 className="text-4xl font-black mb-6 text-white">
            Ready to Create Something Amazing?
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of creative teams using Canvas Collab to bring their ideas to life.
          </p>
          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            whileHover={{ scale: 1.05 }}
          >
            <SignUpButton mode="modal">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">
                Start for Free →
              </button>
            </SignUpButton>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer
        className="relative z-10 border-t border-purple-500/20 mt-20 py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          <p>
            Made with ❤️ by creative minds • Canvas Collab © 2025
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
