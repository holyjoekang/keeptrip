import React, { useEffect, useState } from 'react';

/** 오프라인일 때 상단 알림, 처음 오프라인 준비가 끝나면 잠깐 안내 */
export const OfflineStatus: React.FC = () => {
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    const onReady = () => { setReady(true); setTimeout(() => setReady(false), 5000); };
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    window.addEventListener('keeptrip-offline-ready', onReady);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
      window.removeEventListener('keeptrip-offline-ready', onReady);
    };
  }, []);

  if (!offline && !ready) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full shadow-lg text-xs font-semibold text-white whitespace-nowrap pointer-events-none"
         style={{ background: offline ? '#1E2856' : '#16a34a' }} role="status">
      {offline ? '오프라인 · 저장된 일정 보기' : '오프라인 준비 완료'}
    </div>
  );
};
