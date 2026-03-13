'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Camera, Shield, Sun, Moon, LogOut, ChevronRight,
  Edit3, MapPin, Clock, Save
} from 'lucide-react';
import MobileFrame from '@/components/MobileFrame';
import BottomNav from '@/components/BottomNav';
import useStore from '@/store/useStore';
import { COMMUNICATION_ICONS, COMMUNICATION_LABELS, IDENTITY_LABELS, COMFORT_LABELS, WOULD_YOU_RATHER_QUESTIONS } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { currentUser, updateCurrentUser, highContrastMode, toggleHighContrast, loadFromStorage } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState({
    perfectHangout: '',
    communicationStyle: '',
    lookingForFriend: '',
  });
  const [wyrAnswers, setWyrAnswers] = useState<Record<string, 'a' | 'b'>>({});

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
      return;
    }
    setBio({
      perfectHangout: currentUser.bio?.perfectHangout || '',
      communicationStyle: currentUser.bio?.communicationStyle || '',
      lookingForFriend: currentUser.bio?.lookingForFriend || '',
    });
    setWyrAnswers(currentUser.wouldYouRatherAnswers ?? {});
  }, [currentUser, router]);

  if (!currentUser) return null;

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const handleSaveBio = () => {
    updateCurrentUser({ bio, wouldYouRatherAnswers: Object.keys(wyrAnswers).length > 0 ? wyrAnswers : undefined });
    setIsEditing(false);
  };

  const handleSignOut = () => {
    signOut({ redirect: false });
    useStore.getState().setCurrentUser(null);
    router.push('/');
  };

  return (
    <MobileFrame>
      <div className={`min-h-full pb-24 ${highContrastMode ? 'bg-black' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 px-6 pt-6 pb-16 relative">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-white">Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <Edit3 size={18} />
            </button>
          </div>
        </div>

        {/* Avatar overlapping header */}
        <div className="px-6 -mt-12 mb-4 relative z-10">
          <div className={`flex items-end gap-4 ${highContrastMode ? '' : ''}`}>
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-xl border-4 border-white">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">{initials}</span>
              )}
              <button className="absolute bottom-0 right-0 p-1.5 bg-purple-500 rounded-full text-white shadow-lg">
                <Camera size={12} />
              </button>
            </div>
            <div className="pb-2">
              <h2 className={`text-xl font-bold ${highContrastMode ? 'text-yellow-100' : 'text-gray-900'}`}>
                {currentUser.name}
              </h2>
              <span className={`text-sm font-medium ${highContrastMode ? 'text-yellow-300' : 'text-purple-600'}`}>
                {IDENTITY_LABELS[currentUser.identity]}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 space-y-4">
          {/* Communication Icons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl ${highContrastMode ? 'bg-gray-900 border border-yellow-400/30' : 'bg-white shadow-sm'}`}
          >
            <h3 className={`text-sm font-semibold mb-3 ${highContrastMode ? 'text-yellow-200' : 'text-gray-700'}`}>
              Communication
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentUser.communicationPreferences.map((pref) => (
                <span
                  key={pref}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                    highContrastMode
                      ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/50'
                      : 'bg-purple-50 text-purple-700'
                  }`}
                >
                  {COMMUNICATION_ICONS[pref]} {COMMUNICATION_LABELS[pref]}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Bio Prompts */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-4 rounded-2xl ${highContrastMode ? 'bg-gray-900 border border-yellow-400/30' : 'bg-white shadow-sm'}`}
          >
            <h3 className={`text-sm font-semibold mb-3 ${highContrastMode ? 'text-yellow-200' : 'text-gray-700'}`}>
              About Me
            </h3>
            {isEditing ? (
              <div className="space-y-3">
                {[
                  { key: 'perfectHangout' as const, label: 'A perfect hangout is...' },
                  { key: 'communicationStyle' as const, label: 'My communication style is...' },
                  { key: 'lookingForFriend' as const, label: "I'd love a friend to..." },
                ].map((prompt) => (
                  <div key={prompt.key}>
                    <label className={`text-xs font-medium block mb-1 ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {prompt.label}
                    </label>
                    <textarea
                      value={bio[prompt.key] || ''}
                      onChange={(e) => setBio({ ...bio, [prompt.key]: e.target.value })}
                      rows={2}
                      className={`w-full p-3 rounded-xl text-sm resize-none ${
                        highContrastMode
                          ? 'bg-gray-800 text-yellow-100 border border-yellow-400/30'
                          : 'bg-gray-50 text-gray-800 border border-gray-200'
                      }`}
                      placeholder="Tell us..."
                    />
                  </div>
                ))}
                <button
                  onClick={handleSaveBio}
                  className="w-full py-2.5 rounded-xl bg-purple-500 text-white font-semibold flex items-center justify-center gap-2"
                >
                  <Save size={16} /> Save
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { key: 'perfectHangout' as const, label: 'A perfect hangout is...' },
                  { key: 'communicationStyle' as const, label: 'My communication style is...' },
                  { key: 'lookingForFriend' as const, label: "I'd love a friend to..." },
                ].map((prompt) => (
                  <div key={prompt.key}>
                    <div className={`text-xs font-medium mb-0.5 ${highContrastMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {prompt.label}
                    </div>
                    <p className={`text-sm ${highContrastMode ? 'text-yellow-100' : 'text-gray-800'}`}>
                      {currentUser.bio?.[prompt.key] || 'Tap edit to add...'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Would you rather */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`p-4 rounded-2xl ${highContrastMode ? 'bg-gray-900 border border-yellow-400/30' : 'bg-white shadow-sm'}`}
          >
            <h3 className={`text-sm font-semibold mb-3 ${highContrastMode ? 'text-yellow-200' : 'text-gray-700'}`}>
              Would you rather
            </h3>
            {isEditing ? (
              <div className="space-y-3">
                {WOULD_YOU_RATHER_QUESTIONS.map((q) => (
                  <div key={q.id}>
                    <p className={`text-xs font-medium mb-2 ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {q.question}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setWyrAnswers((prev) => ({ ...prev, [q.id]: 'a' }))}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                          wyrAnswers[q.id] === 'a'
                            ? highContrastMode ? 'bg-yellow-400 text-black' : 'bg-purple-500 text-white'
                            : highContrastMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {q.optionA}
                      </button>
                      <button
                        type="button"
                        onClick={() => setWyrAnswers((prev) => ({ ...prev, [q.id]: 'b' }))}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                          wyrAnswers[q.id] === 'b'
                            ? highContrastMode ? 'bg-yellow-400 text-black' : 'bg-purple-500 text-white'
                            : highContrastMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {q.optionB}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {WOULD_YOU_RATHER_QUESTIONS.map((q) => {
                  const choice = currentUser.wouldYouRatherAnswers?.[q.id];
                  const text = choice === 'a' ? q.optionA : choice === 'b' ? q.optionB : null;
                  return (
                    <div key={q.id} className={`text-xs ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <span className="font-medium">{q.question}</span>
                      <span className={highContrastMode ? 'text-yellow-100' : 'text-gray-800'}>
                        {text ? ` ${text}` : ' — Tap edit to add'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Location & Interests */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-4 rounded-2xl ${highContrastMode ? 'bg-gray-900 border border-yellow-400/30' : 'bg-white shadow-sm'}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={14} className={highContrastMode ? 'text-yellow-400' : 'text-purple-500'} />
              <span className={`text-sm ${highContrastMode ? 'text-yellow-100' : 'text-gray-800'}`}>
                {currentUser.location.city} ({currentUser.location.radiusMiles} mi radius)
              </span>
            </div>
            {currentUser.comfortPreferences.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <Clock size={14} className={highContrastMode ? 'text-yellow-400' : 'text-purple-500'} />
                <span className={`text-sm ${highContrastMode ? 'text-yellow-100' : 'text-gray-800'}`}>
                  {currentUser.comfortPreferences.map((p) => COMFORT_LABELS[p]).join(', ')}
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {currentUser.interests.map((interest) => (
                <span
                  key={interest}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    highContrastMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {interest}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <button
              onClick={toggleHighContrast}
              className={`w-full p-4 rounded-2xl flex items-center justify-between ${
                highContrastMode ? 'bg-gray-900 border border-yellow-400/30' : 'bg-white shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                {highContrastMode ? <Moon size={18} className="text-yellow-400" /> : <Sun size={18} className="text-gray-600" />}
                <span className={`font-medium text-sm ${highContrastMode ? 'text-yellow-100' : 'text-gray-800'}`}>
                  High Contrast Mode
                </span>
              </div>
              <div className={`w-10 h-5 rounded-full transition-all relative ${highContrastMode ? 'bg-yellow-400' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${highContrastMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>

            <button
              onClick={() => router.push('/safety')}
              className={`w-full p-4 rounded-2xl flex items-center justify-between ${
                highContrastMode ? 'bg-gray-900 border border-yellow-400/30' : 'bg-white shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield size={18} className={highContrastMode ? 'text-yellow-400' : 'text-gray-600'} />
                <span className={`font-medium text-sm ${highContrastMode ? 'text-yellow-100' : 'text-gray-800'}`}>
                  Safety Center
                </span>
              </div>
              <ChevronRight size={18} className={highContrastMode ? 'text-gray-500' : 'text-gray-400'} />
            </button>

            <button
              onClick={handleSignOut}
              className={`w-full p-4 rounded-2xl flex items-center gap-3 ${
                highContrastMode ? 'bg-gray-900 border border-red-400/30' : 'bg-white shadow-sm'
              }`}
            >
              <LogOut size={18} className="text-red-500" />
              <span className="font-medium text-sm text-red-500">Sign Out</span>
            </button>
          </motion.div>
        </div>

        <BottomNav />
      </div>
    </MobileFrame>
  );
}
