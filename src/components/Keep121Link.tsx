import React from 'react';
import { Home } from 'lucide-react';

export const KEEP121_URL = 'https://keep121.co.kr/';

export const Keep121Link: React.FC<{ className?: string }> = ({ className = '' }) => (
  <a
    href={KEEP121_URL}
    className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold text-[#1E2856] bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors ${className}`}
    aria-label="Keep121 홈으로 이동"
    title="Keep121 홈"
  >
    <Home className="w-4 h-4" />
    <span>Keep121</span>
  </a>
);
