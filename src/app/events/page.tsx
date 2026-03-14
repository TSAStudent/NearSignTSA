'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Plus, MapPin, Clock, Users, Tag, X,
  CheckCircle2, Circle
} from 'lucide-react';
import MobileFrame from '@/components/MobileFrame';
import BottomNav from '@/components/BottomNav';
import useStore from '@/store/useStore';
import { SEED_EVENTS } from '@/lib/seedData';

const EVENT_TAGS = [
  'ASL-friendly', 'Quiet Place', 'Captioned Venue', 'Games',
  'Workshop', 'Social', 'Sports', 'Art', 'STEM', 'Casual'
];

export default function EventsPage() {
  const router = useRouter();
  const {
    currentUser, events, rsvpEvent, unrsvpEvent, createEvent,
    loadFromStorage, highContrastMode
  } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    tags: [] as string[],
    communicationSupport: '',
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
      return;
    }
    // Seed events if empty
    if (events.length === 0) {
      const store = useStore.getState();
      SEED_EVENTS.forEach((e) => {
        store.createEvent({
          title: e.title,
          description: e.description,
          location: e.location,
          date: e.date,
          time: e.time,
          tags: e.tags,
          communicationSupport: e.communicationSupport,
        });
      });
    }
  }, [currentUser, router, events.length]);

  if (!currentUser) return null;

  const toggleTag = (tag: string) => {
    setNewEvent((e) => ({
      ...e,
      tags: e.tags.includes(tag) ? e.tags.filter((t) => t !== tag) : [...e.tags, tag],
    }));
  };

  const handleCreate = () => {
    if (!newEvent.title || !newEvent.date) return;
    createEvent(newEvent);
    setShowCreate(false);
    setNewEvent({
      title: '', description: '', location: '', date: '', time: '',
      tags: [], communicationSupport: '',
    });
  };

  return (
    <MobileFrame>
      <div className={`min-h-full pb-24 ${highContrastMode ? 'bg-black' : 'bg-gray-50'}`}>
        {/* Header */}
        <div className={`px-6 pt-4 pb-4 ${highContrastMode ? 'bg-gray-900' : 'bg-white'} shadow-sm`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={20} className={highContrastMode ? 'text-yellow-400' : 'text-purple-500'} />
              <h1 className={`text-xl font-bold ${highContrastMode ? 'text-yellow-100' : 'text-gray-900'}`}>
                Events
              </h1>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className={`p-2 rounded-xl ${
                highContrastMode ? 'bg-yellow-400 text-black' : 'bg-purple-500 text-white'
              }`}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Events list */}
        <div className="px-4 py-4 space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-16">
              <Calendar size={48} className={`mx-auto mb-4 ${highContrastMode ? 'text-yellow-400/50' : 'text-gray-300'}`} />
              <h3 className={`text-lg font-bold mb-2 ${highContrastMode ? 'text-yellow-100' : 'text-gray-700'}`}>
                No events yet
              </h3>
              <p className={`text-sm ${highContrastMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Create one to get started!
              </p>
            </div>
          ) : (
            events.map((event, index) => {
              const isRsvpd = event.rsvps.includes(currentUser.id);
              const eventDate = new Date(event.date);
              const monthShort = eventDate.toLocaleDateString('en-US', { month: 'short' });
              const dayNum = eventDate.getDate();

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-2xl overflow-hidden ${
                    highContrastMode ? 'bg-gray-900 border border-yellow-400/30' : 'bg-white shadow-sm'
                  }`}
                >
                  {/* Colored top bar */}
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
                  <div className="p-4">
                    <div className="flex gap-4">
                      {/* Date badge */}
                      <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                        highContrastMode ? 'bg-yellow-400/20 border border-yellow-400/50' : 'bg-purple-50'
                      }`}>
                        <span className={`text-[10px] font-bold uppercase ${
                          highContrastMode ? 'text-yellow-400' : 'text-purple-500'
                        }`}>
                          {monthShort}
                        </span>
                        <span className={`text-xl font-bold ${
                          highContrastMode ? 'text-yellow-100' : 'text-gray-900'
                        }`}>
                          {dayNum}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-sm mb-1 ${highContrastMode ? 'text-yellow-100' : 'text-gray-900'}`}>
                          {event.title}
                        </h3>
                        <div className={`flex items-center gap-1.5 text-xs mb-1 ${
                          highContrastMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <Clock size={12} />
                          <span>{event.time}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs mb-2 ${
                          highContrastMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <MapPin size={12} />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    </div>

                    <p className={`text-xs mb-3 ${highContrastMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {event.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {event.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            highContrastMode
                              ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40'
                              : 'bg-purple-50 text-purple-600'
                          }`}
                        >
                          <Tag size={8} />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Communication support */}
                    {event.communicationSupport && (
                      <div className={`text-xs mb-3 px-3 py-2 rounded-xl ${
                        highContrastMode ? 'bg-gray-800 text-yellow-200' : 'bg-blue-50 text-blue-700'
                      }`}>
                        📋 {event.communicationSupport}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-1.5 text-xs ${
                        highContrastMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        <Users size={12} />
                        <span>{event.rsvps.length} going</span>
                      </div>
                      <button
                        onClick={() => isRsvpd ? unrsvpEvent(event.id) : rsvpEvent(event.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isRsvpd
                            ? highContrastMode
                              ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/50'
                              : 'bg-purple-50 text-purple-600 border border-purple-200'
                            : highContrastMode
                            ? 'bg-yellow-400 text-black'
                            : 'bg-purple-500 text-white'
                        }`}
                      >
                        {isRsvpd ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                        {isRsvpd ? 'Going' : 'RSVP'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Create Event Modal */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
              onClick={() => setShowCreate(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-sm rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto ${
                  highContrastMode ? 'bg-gray-900' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-bold ${highContrastMode ? 'text-yellow-100' : 'text-gray-900'}`}>
                    Create Event
                  </h2>
                  <button onClick={() => setShowCreate(false)} className="p-1">
                    <X size={20} className={highContrastMode ? 'text-gray-500' : 'text-gray-400'} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`text-sm font-semibold mb-1 block ${highContrastMode ? 'text-yellow-200' : 'text-gray-700'}`}>
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="e.g., ASL Game Night"
                      className={`w-full p-3 rounded-xl text-sm ${
                        highContrastMode
                          ? 'bg-gray-800 text-yellow-100 border border-yellow-400/30'
                          : 'bg-gray-50 border border-gray-200 text-gray-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-sm font-semibold mb-1 block ${highContrastMode ? 'text-yellow-200' : 'text-gray-700'}`}>
                      Description
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      rows={2}
                      className={`w-full p-3 rounded-xl text-sm resize-none ${
                        highContrastMode
                          ? 'bg-gray-800 text-yellow-100 border border-yellow-400/30'
                          : 'bg-gray-50 border border-gray-200 text-gray-800'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-sm font-semibold mb-1 block ${highContrastMode ? 'text-yellow-200' : 'text-gray-700'}`}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder="Where is it?"
                      className={`w-full p-3 rounded-xl text-sm ${
                        highContrastMode
                          ? 'bg-gray-800 text-yellow-100 border border-yellow-400/30'
                          : 'bg-gray-50 border border-gray-200 text-gray-800'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`text-sm font-semibold mb-1 block ${highContrastMode ? 'text-yellow-200' : 'text-gray-700'}`}>
                        Date
                      </label>
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                        className={`w-full p-3 rounded-xl text-sm ${
                          highContrastMode
                            ? 'bg-gray-800 text-yellow-100 border border-yellow-400/30'
                            : 'bg-gray-50 border border-gray-200 text-gray-800'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`text-sm font-semibold mb-1 block ${highContrastMode ? 'text-yellow-200' : 'text-gray-700'}`}>
                        Time
                      </label>
                      <input
                        type="text"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        placeholder="e.g., 3:00 PM"
                        className={`w-full p-3 rounded-xl text-sm ${
                          highContrastMode
                            ? 'bg-gray-800 text-yellow-100 border border-yellow-400/30'
                            : 'bg-gray-50 border border-gray-200 text-gray-800'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`text-sm font-semibold mb-2 block ${highContrastMode ? 'text-yellow-200' : 'text-gray-700'}`}>
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {EVENT_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            newEvent.tags.includes(tag)
                              ? highContrastMode
                                ? 'bg-yellow-400 text-black'
                                : 'bg-purple-500 text-white'
                              : highContrastMode
                              ? 'bg-gray-800 text-gray-300'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={`text-sm font-semibold mb-1 block ${highContrastMode ? 'text-yellow-200' : 'text-gray-700'}`}>
                      Communication support needed? (optional)
                    </label>
                    <input
                      type="text"
                      value={newEvent.communicationSupport}
                      onChange={(e) => setNewEvent({ ...newEvent, communicationSupport: e.target.value })}
                      placeholder="e.g., ASL interpreters available"
                      className={`w-full p-3 rounded-xl text-sm ${
                        highContrastMode
                          ? 'bg-gray-800 text-yellow-100 border border-yellow-400/30'
                          : 'bg-gray-50 border border-gray-200 text-gray-800'
                      }`}
                    />
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={!newEvent.title || !newEvent.date}
                    className={`w-full py-3.5 rounded-2xl font-bold text-base transition-all ${
                      newEvent.title && newEvent.date
                        ? highContrastMode
                          ? 'bg-yellow-400 text-black'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : highContrastMode
                        ? 'bg-gray-800 text-gray-600'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    Create Event
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <BottomNav />
      </div>
    </MobileFrame>
  );
}
