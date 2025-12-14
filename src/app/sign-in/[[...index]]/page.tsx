"use client";

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center p-4">
      {/* Floating background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
          style={{ top: "20%", left: "10%" }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
          style={{ top: "50%", right: "10%" }}
        />
      </div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full max-w-md",
              card: "bg-slate-900/80 backdrop-blur-xl border border-purple-500/20 shadow-2xl rounded-2xl",
              headerTitle: "text-white text-2xl font-bold",
              headerSubtitle: "text-gray-400",
              socialButtonsBlockButton: "bg-slate-800 hover:bg-slate-700 text-white border border-purple-500/30",
              formFieldLabel: "text-gray-300 text-sm font-medium",
              formFieldInput:
                "bg-slate-800 border border-purple-500/30 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500",
              formButtonPrimary:
                "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold",
              footerActionLink: "text-purple-400 hover:text-purple-300",
              dividerLine: "bg-purple-500/20",
              dividerText: "text-gray-400",
            },
          }}
        />
      </motion.div>
    </div>
  );
}
