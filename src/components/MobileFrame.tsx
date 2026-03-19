'use client';

import React from 'react';
import useStore from '@/store/useStore';

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  const highContrastMode = useStore((s) => s.highContrastMode);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        backgroundImage: 'linear-gradient(to bottom right, #0F172A, rgba(124, 58, 237, 0.15), #0F172A)',
      }}
    >
      <div
        className={`relative w-full max-w-sm h-[812px] rounded-[3rem] overflow-hidden shadow-2xl border-4 ${
          highContrastMode
            ? 'border-yellow-400 bg-black'
            : 'border-gray-800 bg-[color:var(--background)]'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-black rounded-b-2xl z-50" />
        
        {/* Screen content */}
        <div
          className={`h-full overflow-y-auto overflow-x-hidden pt-8 ${
            highContrastMode ? 'bg-black text-yellow-100' : 'bg-[color:var(--background)] text-[color:var(--foreground)]'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
