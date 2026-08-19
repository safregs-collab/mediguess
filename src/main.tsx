import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './shared/styles/theme.css';
import './features/home/home.css';
import './features/games/games.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
