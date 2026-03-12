'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Ear, HandMetal, UserPlus, LogIn } from 'lucide-react';
import MobileFrame from '@/components/MobileFrame';
import useStore from '@/store/useStore';

export default function SplashPage() {
  const router = useRouter();
  const { currentUser, loadFromStorage } = useStore();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isCreateAccount, setIsCreateAccount] = useState(true); // true = Create account, false = Sign in
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // Load stored profile on mount (no redirect — user must choose an option)
  React.useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await signIn('credentials', {
      email,
      name: name || email.split('@')[0],
      redirect: false,
    });
    // Always go to onboarding; it will redirect to discover if user already has a complete profile
    router.push('/onboarding');
  };

  const handleGoogleLogin = (createAccount: boolean) => {
    signIn('google', { callbackUrl: '/onboarding' });
  };

  return (
    <MobileFrame>
      <div className="flex flex-col items-center justify-center min-h-full px-8 py-12 bg-gradient-to-b from-purple-600 via-purple-700 to-indigo-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-40 -right-10 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl" />
        </div>

        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <HandMetal size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            NearSign
          </h1>
          <p className="text-purple-200 text-base font-medium leading-relaxed max-w-xs">
            Meet people who communicate like you.
          </p>
        </motion.div>

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 flex items-center justify-center gap-4 mb-10"
        >
          <div className="flex -space-x-3">
            {['from-pink-400 to-rose-400', 'from-blue-400 to-cyan-400', 'from-green-400 to-emerald-400'].map((bg, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${bg} border-3 border-white/30 flex items-center justify-center`}
              >
                {i === 0 && <span className="text-lg">🤟</span>}
                {i === 1 && <Ear size={18} className="text-white" />}
                {i === 2 && <span className="text-lg">💬</span>}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Auth Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative z-10 w-full space-y-3"
        >
          {!showEmailForm ? (
            <>
              <div className="flex rounded-2xl bg-white/10 p-1 gap-1 mb-3">
                <button
                  type="button"
                  onClick={() => setIsCreateAccount(true)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isCreateAccount ? 'bg-white text-purple-700' : 'text-white/80'
                  }`}
                >
                  Create account
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateAccount(false)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    !isCreateAccount ? 'bg-white text-purple-700' : 'text-white/80'
                  }`}
                >
                  Sign in
                </button>
              </div>
              <button
                onClick={() => handleGoogleLogin(isCreateAccount)}
                className="w-full py-4 px-6 bg-white rounded-2xl font-semibold text-gray-800 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isCreateAccount ? 'Continue with Google' : 'Sign in with Google'}
              </button>

              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full py-4 px-6 bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl font-semibold text-white flex items-center justify-center gap-3 hover:bg-white/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Mail size={20} />
                {isCreateAccount ? 'Create account with Email' : 'Sign in with Email'}
              </button>
            </>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full py-3.5 px-5 bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full py-3.5 px-5 bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="w-full py-4 px-6 bg-white rounded-2xl font-semibold text-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isCreateAccount ? (
                  <>
                    <UserPlus size={20} className="inline mr-2" />
                    Create account
                  </>
                ) : (
                  <>
                    <LogIn size={20} className="inline mr-2" />
                    Sign in
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="w-full py-2 text-purple-200 text-sm hover:text-white transition-colors"
              >
                Back to options
              </button>
            </form>
          )}
        </motion.div>

        {/* Accessibility note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 text-purple-300 text-xs text-center mt-8 max-w-xs leading-relaxed"
        >
          Designed with accessibility first. High-contrast mode, large tap targets, and no audio-only cues.
        </motion.p>
      </div>
    </MobileFrame>
  );
}
