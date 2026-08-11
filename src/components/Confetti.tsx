import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function Confetti() {
  const { confetti, dismissConfetti } = useGameStore();

  useEffect(() => {
    if (!confetti) return;
    const container = document.getElementById('confettiContainer');
    if (!container) return;

    const colors = ['#0d9488', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];
    const elements: HTMLDivElement[] = [];

    for (let i = 0; i < 60; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = `${Math.random() * 100}vw`;
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.animationDuration = `${2 + Math.random() * 2}s`;
      c.style.width = `${6 + Math.random() * 8}px`;
      c.style.height = `${6 + Math.random() * 8}px`;
      c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      container.appendChild(c);
      elements.push(c);
    }

    const timer = setTimeout(() => {
      elements.forEach((el) => el.remove());
      dismissConfetti();
    }, 4000);

    return () => {
      clearTimeout(timer);
      elements.forEach((el) => el.remove());
    };
  }, [confetti, dismissConfetti]);

  return <div className="confetti-container" id="confettiContainer" />;
}
