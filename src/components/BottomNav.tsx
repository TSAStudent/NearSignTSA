'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Compass, Users, Calendar, MessageCircle, User } from 'lucide-react';
import useStore from '@/store/useStore';

const NAV_ITEMS = [
  { label: 'Discover', icon: Compass, path: '/discover' },
  { label: 'Groups', icon: Users, path: '/groups' },
  { label: 'Events', icon: Calendar, path: '/events' },
  { label: 'Messages', icon: MessageCircle, path: '/chat' },
  { label: 'Profile', icon: User, path: '/profile' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const highContrastMode = useStore((s) => s.highContrastMode);

  return (
    <div
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm z-40 ${
        highContrastMode
          ? 'bg-gray-900 border-t-2 border-yellow-400'
          : 'bg-white/95 backdrop-blur-lg border-t border-gray-200'
      }`}
      style={{ borderBottomLeftRadius: '2.5rem', borderBottomRightRadius: '2.5rem' }}
    >
      <div className="flex items-center justify-around px-2 py-2 pb-6">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[3.5rem] ${
                isActive
                  ? highContrastMode
                    ? 'text-yellow-400 bg-yellow-400/10'
                    : 'text-purple-600 bg-purple-50'
                  : highContrastMode
                  ? 'text-gray-400 hover:text-yellow-300'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={item.label}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
