import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function ToastContainer() {
  const { toast, dismissToast } = useGameStore();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, 3000);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className="toast">{toast}</div>
    </div>
  );
}
