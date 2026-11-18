import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyFontSize, readFontSize } from './components/FontSizeControl';

applyFontSize(readFontSize());

import { OfflineStatus } from './components/OfflineStatus';
import { flushPackingOutbox } from './lib/db';

createRoot(document.getElementById('root')!).render(<><OfflineStatus /><App /></>);

// 오프라인 앱: 빌드 결과(dist/sw.js)를 등록해 앱·사진·일정 데이터를 기기에 저장
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const first = !navigator.serviceWorker.controller;
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then((reg) => {
      const done = () => first && window.dispatchEvent(new Event('keeptrip-offline-ready'));
      if (reg.active && !reg.installing) return;
      const w = reg.installing || reg.waiting;
      w?.addEventListener('statechange', () => w.state === 'activated' && done());
    }).catch((e) => console.warn('서비스워커 등록 실패', e));
  });
}
window.addEventListener('online', () => { flushPackingOutbox(); });
flushPackingOutbox();
