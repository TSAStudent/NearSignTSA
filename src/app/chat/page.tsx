'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import MobileFrame from '@/components/MobileFrame';
import BottomNav from '@/components/BottomNav';
import useStore from '@/store/useStore';
import { SEED_PROFILES } from '@/lib/seedData';

export default function ChatListPage() {
  const router = useRouter();
  const { currentUser, chats, chatMessages, loadFromStorage, highContrastMode } = useStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!currentUser) router.push('/');
  }, [currentUser, router]);

  if (!currentUser) return null;

  const getParticipantName = (participantIds: string[]) => {
    const otherId = participantIds.find((id) => id !== currentUser.id);
    const profile = SEED_PROFILES.find((p) => p.id === otherId);
    return profile?.name || 'Unknown';
  };

  const getParticipantInitials = (participantIds: string[]) => {
    const name = getParticipantName(participantIds);
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const getLastMessage = (chatId: string) => {
    const messages = chatMessages[chatId] || [];
    return messages[messages.length - 1];
  };

  return (
    <MobileFrame>
      <div className={`min-h-full pb-24 ${highContrastMode ? 'bg-black' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className={`px-6 pt-4 pb-4 ${highContrastMode ? 'bg-gray-900' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className={highContrastMode ? 'text-yellow-400' : 'text-purple-500'} />
            <h1 className={`text-xl font-bold ${highContrastMode ? 'text-yellow-100' : 'text-gray-900'}`}>
              Messages
            </h1>
          </div>
        </div>

        {/* Chat list */}
        <div className="px-4 py-4 space-y-2">
          {chats.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles size={48} className={`mx-auto mb-4 ${highContrastMode ? 'text-yellow-400/50' : 'text-gray-300'}`} />
              <h3 className={`text-lg font-bold mb-2 ${highContrastMode ? 'text-yellow-100' : 'text-gray-700'}`}>
                No messages yet
              </h3>
              <p className={`text-sm ${highContrastMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Connect with someone to start chatting!
              </p>
              <button
                onClick={() => router.push('/discover')}
                className={`mt-4 px-6 py-3 rounded-2xl font-semibold ${
                  highContrastMode
                    ? 'bg-yellow-400 text-black'
                    : 'bg-purple-500 text-white'
                }`}
              >
                Discover People
              </button>
            </div>
          ) : (
            chats.map((chat, index) => {
              const lastMsg = getLastMessage(chat.id);
              return (
                <motion.button
                  key={chat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push(`/chat/${chat.id}`)}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 text-left transition-all ${
                    highContrastMode
                      ? 'bg-gray-900 border border-yellow-400/30 hover:bg-gray-800'
                      : 'bg-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white">
                      {getParticipantInitials(chat.participants)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-bold text-sm ${highContrastMode ? 'text-yellow-100' : 'text-gray-900'}`}>
                        {getParticipantName(chat.participants)}
                      </h3>
                      {lastMsg && (
                        <span className={`text-[10px] ${highContrastMode ? 'text-gray-600' : 'text-gray-400'}`}>
                          {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs truncate ${highContrastMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {lastMsg ? lastMsg.content : 'Start a conversation!'}
                    </p>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>

        <BottomNav />
      </div>
    </MobileFrame>
  );
}
