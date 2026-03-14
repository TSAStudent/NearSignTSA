'use client';

import Link from 'next/link';
import { HandMetal } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-600 via-purple-700 to-indigo-900 px-6">
      <div className="text-center text-white">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 mx-auto mb-6">
          <HandMetal size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-purple-200 mb-8 max-w-xs">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>
        <Link
          href="/"
          className="inline-block py-3.5 px-6 bg-white text-purple-700 font-semibold rounded-2xl hover:bg-white/90 transition-colors"
        >
          Go to NearSign
        </Link>
      </div>
    </div>
  );
}
