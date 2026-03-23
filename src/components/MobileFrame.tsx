'use client';

import React from 'react';
import useStore from '@/store/useStore';

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  const highContrastMode = useStore((s) => s.highContrastMode);
  const themePreference = useStore((s) => s.currentUser?.themePreference ?? 'white');
  const brandLight = !highContrastMode && themePreference === 'white';

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={
        brandLight
          ? {
              background: 'var(--gradient-mobile-shell-outer)',
            }
          : {
              backgroundImage:
                'linear-gradient(to bottom right, #0F172A, rgba(51, 65, 85, 0.35), #0F172A)',
            }
      }
    >
      <div
        className={`relative w-full max-w-sm h-[812px] rounded-[3rem] overflow-hidden shadow-2xl border-4 ${
          highContrastMode
            ? 'border-yellow-400 bg-black'
            : brandLight
              ? 'border-slate-800/90 bg-white shadow-xl shadow-slate-900/10'
              : 'border-slate-700/90 bg-[color:var(--background)]'
        }`}
        style={{ maxHeight: '90vh' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-black rounded-b-2xl z-50" />

        <div
          className={`h-full overflow-y-auto overflow-x-hidden pt-8 ${
            highContrastMode
              ? 'bg-black text-yellow-100'
              : brandLight
                ? 'bg-app-theme text-slate-900'
                : 'bg-[color:var(--background)] text-[color:var(--foreground)]'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
