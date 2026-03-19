'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Send, Sparkles, MoreVertical, Flag, Ban,
  Calendar, X
} from 'lucide-react';
import MobileFrame from '@/components/MobileFrame';
import useStore from '@/store/useStore';
import { SEED_PROFILES } from '@/lib/seedData';
import { ICEBREAKERS } from '@/types';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const chatId = params.id as string;
  const {
    currentUser, chats, chatMessages, sendMessage,
    submitReport, loadFromStorage, highContrastMode
  } = useStore();
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showReportThanks, setShowReportThanks] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!currentUser) router.push('/');
  }, [currentUser, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatId]);

  if (!currentUser) return null;

  const chat = chats.find((c) => c.id === chatId);
  if (!chat) return null;

  const otherId = chat.participants.find((id) => id !== currentUser.id);
  const otherProfile = SEED_PROFILES.find((p) => p.id === otherId);
  const otherName = otherProfile?.name || 'Unknown';
  const otherInitials = otherName.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  const messages = chatMessages[chatId] || [];

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(chatId, message.trim());
    setMessage('');
  };

  const handleIcebreaker = (text: string) => {
    sendMessage(chatId, text, 'icebreaker');
    setShowIcebreakers(false);
  };

  const handleHangout = () => {
    sendMessage(chatId, "Hey! Want to plan a hangout? What works for you?", 'hangout_request');
  };

  const handleReport = () => {
    if (!otherId || !reportReason) return;

    const details = reportReason === 'Other' ? reportDetails.trim() : '';
    if (reportReason === 'Other' && !details) return;

    submitReport(otherId, reportReason, details);
    setShowReport(false);
    setReportReason('');
    setReportDetails('');
    setShowReportThanks(true);

    setTimeout(() => setShowReportThanks(false), 2600);
  };

  return (
    <MobileFrame>
      <div className={`flex flex-col h-full ${highContrastMode ? 'bg-black' : 'bg-[color:var(--background)] text-[color:var(--foreground)]'}`}>
        {/* Header */}
        <div className={`px-4 pt-4 pb-3 flex items-center gap-3 ${highContrastMode ? 'bg-gray-900 border-b border-yellow-400/30' : 'bg-[color:var(--background)] shadow-sm'
          }`}>
          <button onClick={() => router.push('/chat')} className="p-1">
            <ArrowLeft size={22} className={highContrastMode ? 'text-yellow-400' : 'text-gray-700'} />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{otherInitials}</span>
          </div>
          <div className="flex-1">
            <h2 className={`font-bold text-sm ${highContrastMode ? 'text-yellow-100' : 'text-gray-900'}`}>
              {otherName}
            </h2>
          </div>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2">
              <MoreVertical size={18} className={highContrastMode ? 'text-yellow-400' : 'text-gray-500'} />
            </button>
            {showMenu && (
              <div className={`absolute right-0 top-10 w-48 rounded-xl shadow-lg z-20 py-1 ${highContrastMode ? 'bg-gray-800 border border-yellow-400/30' : 'bg-white border border-gray-100'
                }`}>
                <button
                  onClick={() => { setShowReport(true); setShowMenu(false); }}
                  className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2 ${highContrastMode ? 'text-yellow-100 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Flag size={14} /> Report User
                </button>
                <button
                  onClick={() => { /* block action not yet assigned */ }}
                  className="w-full px-4 py-3 text-left text-sm flex items-center gap-2 text-red-500 hover:bg-red-50"
                >
                  <Ban size={14} /> Block User
                </button>

              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.type === 'icebreaker'
                    ? highContrastMode
                      ? 'bg-yellow-400/20 border border-yellow-400/50 text-yellow-100'
                      : 'bg-purple-50 border border-purple-100 text-purple-800'
                    : msg.type === 'hangout_request'
                      ? highContrastMode
                        ? 'bg-green-400/20 border border-green-400/50 text-green-100'
                        : 'bg-green-50 border border-green-100 text-green-800'
                      : isMe
                        ? highContrastMode
                          ? 'bg-yellow-400 text-black'
                          : 'bg-purple-500 text-white'
                        : highContrastMode
                          ? 'bg-gray-800 text-yellow-100'
                          : 'bg-white text-gray-800 shadow-sm'
                    }`}
                >
                  {msg.type === 'icebreaker' && (
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles size={12} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Icebreaker</span>
                    </div>
                  )}
                  {msg.type === 'hangout_request' && (
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar size={12} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">Hangout</span>
                    </div>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <span className={`text-[10px] mt-1 block ${isMe
                    ? highContrastMode ? 'text-black/60' : 'text-white/70'
                    : highContrastMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Icebreaker panel */}
        {showIcebreakers && (
          <div className={`px-4 py-3 border-t ${highContrastMode ? 'bg-gray-900 border-yellow-400/30' : 'bg-white border-gray-100'
            }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold ${highContrastMode ? 'text-yellow-200' : 'text-gray-700'}`}>
                Pick an icebreaker
              </span>
              <button onClick={() => setShowIcebreakers(false)}>
                <X size={16} className={highContrastMode ? 'text-gray-500' : 'text-gray-400'} />
              </button>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {ICEBREAKERS.slice(0, 5).map((ib, i) => (
                <button
                  key={i}
                  onClick={() => handleIcebreaker(ib)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${highContrastMode
                    ? 'bg-gray-800 text-yellow-100 hover:bg-gray-700'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                >
                  {ib}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className={`px-4 py-3 pb-8 border-t ${highContrastMode ? 'bg-gray-900 border-yellow-400/30' : 'bg-white border-gray-100'
          }`}>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setShowIcebreakers(!showIcebreakers)}
              className={`p-2 rounded-xl ${highContrastMode ? 'bg-gray-800 text-yellow-400' : 'bg-purple-50 text-purple-500'
                }`}
              title="Icebreaker"
            >
              <Sparkles size={16} />
            </button>
            <button
              onClick={handleHangout}
              className={`p-2 rounded-xl ${highContrastMode ? 'bg-gray-800 text-yellow-400' : 'bg-green-50 text-green-500'
                }`}
              title="Suggest hangout"
            >
              <Calendar size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className={`flex-1 py-3 px-4 rounded-2xl text-sm ${highContrastMode
                ? 'bg-gray-800 text-yellow-100 border border-yellow-400/30 placeholder-gray-600'
                : 'bg-gray-100 text-gray-800 placeholder-gray-400'
                }`}
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className={`p-3 rounded-2xl transition-all ${message.trim()
                ? highContrastMode
                  ? 'bg-yellow-400 text-black'
                  : 'bg-purple-500 text-white'
                : highContrastMode
                  ? 'bg-gray-800 text-gray-600'
                  : 'bg-gray-200 text-gray-400'
                }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Report Thanks */}
        {showReportThanks && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
            <div className={`w-full max-w-xs rounded-2xl p-6 ${highContrastMode ? 'bg-gray-900' : 'bg-white'}`}>
              <h3 className={`text-lg font-bold ${highContrastMode ? 'text-yellow-100' : 'text-gray-900'}`}>
                Thanks for reporting
              </h3>
              <p className={`text-sm mt-2 ${highContrastMode ? 'text-yellow-200' : 'text-gray-600'}`}>
                We’ll review this report and take appropriate action.
              </p>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReport && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6" onClick={() => setShowReport(false)}>
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-xs rounded-2xl p-6 ${highContrastMode ? 'bg-gray-900' : 'bg-white'}`}
            >
              <h3 className={`text-lg font-bold mb-4 ${highContrastMode ? 'text-yellow-100' : 'text-gray-900'}`}>
                Report {otherName}
              </h3>
              <div className="space-y-2 mb-4">
                {['Harassment', 'Inappropriate content', 'Spam', 'Fake profile', 'Other'].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setReportReason(reason)}
                    className={`w-full py-2.5 px-4 rounded-xl text-sm text-left transition-all ${reportReason === reason
                      ? highContrastMode
                        ? 'bg-yellow-400 text-black'
                        : 'bg-purple-500 text-white'
                      : highContrastMode
                        ? 'bg-gray-800 text-gray-300'
                        : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              {reportReason === 'Other' && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Describe the issue</label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    rows={3}
                    placeholder="Type a short reason for reporting..."
                    className={`w-full p-3 rounded-xl border ${highContrastMode ? 'bg-gray-800 text-yellow-100 border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'}`}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReport(false)}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm ${highContrastMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={!reportReason}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm ${reportReason
                    ? 'bg-red-500 text-white'
                    : highContrastMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-200 text-gray-400'
                    }`}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileFrame>
  );
}
