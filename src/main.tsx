import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyFontSize, readFontSize } from './components/FontSizeControl';

applyFontSize(readFontSize());

createRoot(document.getElementById('root')!).render(<App />);
