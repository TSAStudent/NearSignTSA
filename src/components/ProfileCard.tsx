'use client';

import React from 'react';
import { MapPin, Bookmark, UserPlus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DiscoverProfile } from '@/types';
import { COMMUNICATION_ICONS, COMMUNICATION_LABELS, IDENTITY_LABELS } from '@/types';
import useStore from '@/store/useStore';

interface ProfileCardProps {
  profile: DiscoverProfile;
  onConnect: () => void;
  onPass: () => void;
  onSave: () => void;
  isSaved: boolean;
}

const AVATAR_COLORS = [
  'from-purple-400 to-pink-400',
  'from-blue-400 to-cyan-400',
  'from-green-400 to-emerald-400',
  'from-orange-400 to-amber-400',
  'from-rose-400 to-red-400',
  'from-indigo-400 to-violet-400',
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ProfileCard({ profile, onConnect, onPass, onSave, isSaved }: ProfileCardProps) {
  const highContrastMode = useStore((s) => s.highContrastMode);
  const avatarColor = getAvatarColor(profile.id);
  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={`rounded-3xl overflow-hidden shadow-lg mx-4 ${
        highContrastMode ? 'bg-gray-900 border-2 border-yellow-400' : 'bg-white'
      }`}
    >
      {/* Avatar area */}
      <div className={`relative h-48 bg-gradient-to-br ${avatarColor} flex items-center justify-center`}>
        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <span className="text-3xl font-bold text-white">{initials}</span>
        </div>
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              highContrastMode ? 'bg-black text-yellow-400' : 'bg-white/90 text-gray-700'
            }`}
          >
            {Math.round(profile.matchScore)}% Match
          </span>
        </div>
        <button
          onClick={onSave}
          className={`absolute top-3 left-3 p-2 rounded-full ${
            isSaved ? 'bg-purple-500 text-white' : 'bg-white/90 text-gray-600'
          }`}
          aria-label={isSaved ? 'Unsave profile' : 'Save profile'}
        >
          <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className={`text-xl font-bold ${highContrastMode ? 'text-yellow-100' : 'text-gray-900'}`}>
              {profile.name}
            </h3>
            <span className={`text-sm ${highContrastMode ? 'text-yellow-300' : 'text-purple-600'} font-medium`}>
              {IDENTITY_LABELS[profile.identity]}
            </span>
          </div>
          <div className={`flex items-center gap-1 text-sm ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <MapPin size={14} />
            <span>{profile.distance} mi</span>
          </div>
        </div>

        {/* Communication preferences */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {profile.communicationPreferences.map((pref) => (
            <span
              key={pref}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                highContrastMode
                  ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/50'
                  : 'bg-purple-50 text-purple-700 border border-purple-100'
              }`}
            >
              <span>{COMMUNICATION_ICONS[pref]}</span>
              {COMMUNICATION_LABELS[pref]}
            </span>
          ))}
        </div>

        {/* Interests */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {profile.interests.slice(0, 4).map((interest) => (
            <span
              key={interest}
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                highContrastMode
                  ? 'bg-gray-800 text-gray-300 border border-gray-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {interest}
            </span>
          ))}
          {profile.interests.length > 4 && (
            <span className={`px-2.5 py-1 text-xs ${highContrastMode ? 'text-gray-500' : 'text-gray-400'}`}>
              +{profile.interests.length - 4} more
            </span>
          )}
        </div>

        {/* Availability */}
        <div className={`text-xs mb-4 ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Available: {profile.availability.map((a) => a.replace('_', ' ')).join(', ')}
        </div>

        {/* Bio preview */}
        {profile.bio.perfectHangout && (
          <p className={`text-sm mb-4 italic ${highContrastMode ? 'text-gray-300' : 'text-gray-600'}`}>
            &ldquo;{profile.bio.perfectHangout}&rdquo;
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPass}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-all ${
              highContrastMode
                ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label="Pass"
          >
            <X size={18} />
            Pass
          </button>
          <button
            onClick={onConnect}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-all ${
              highContrastMode
                ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
            }`}
            aria-label="Connect"
          >
            <UserPlus size={18} />
            Connect
          </button>
        </div>
      </div>
    </motion.div>
  );
}
