import React, { useState } from 'react';

export type FontSize = 'normal' | 'large' | 'xlarge';
const KEY = 'keeptrip_font_size';
const OPTIONS: { id: FontSize; label: string; px: number }[] = [
  { id: 'normal', label: '일반', px: 12 },
  { id: 'large', label: '크게', px: 14 },
  { id: 'xlarge', label: '아주크게', px: 16 }
];

export const readFontSize = (): FontSize => {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'large' || v === 'xlarge') return v;
  } catch {}
  return 'normal';
};

/** <html data-font="..."> 로 화면 전체 배율을 바꾼다 (index.css) */
export const applyFontSize = (v: FontSize) => {
  document.documentElement.dataset.font = v;
};

/** 일반 · 크게 · 아주크게. 이 기기(브라우저)에 저장되어 계속 유지된다 */
export const FontSizeControl: React.FC<{ dark?: boolean; className?: string }> = ({ dark, className = '' }) => {
  const [size, setSize] = useState<FontSize>(readFontSize);
  const pick = (v: FontSize) => {
    setSize(v);
    applyFontSize(v);
    try {
      localStorage.setItem(KEY, v);
    } catch {}
  };
  return (
    <div
      role="radiogroup"
      aria-label="글자 크기"
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-xl ${
        dark ? 'bg-black/25 backdrop-blur' : 'bg-slate-100 border border-slate-200'
      } ${className}`}
    >
      <span className={`px-1.5 text-[11px] font-bold whitespace-nowrap ${dark ? 'text-white/80' : 'text-slate-500'}`}>글자</span>
      {OPTIONS.map((o) => {
        const on = size === o.id;
        return (
          <button
            key={o.id}
            role="radio"
            aria-checked={on}
            onClick={() => pick(o.id)}
            style={{ fontSize: o.px }}
            className={`px-2 py-1 rounded-lg font-bold leading-none whitespace-nowrap transition-colors ${
              on
                ? 'bg-[#1E2856] text-white'
                : dark
                ? 'text-white hover:bg-white/15'
                : 'text-slate-600 hover:bg-white'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
};
