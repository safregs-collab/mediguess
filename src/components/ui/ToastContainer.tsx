import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export function ToastContainer() {
  const { toast, clearToast } = useGameStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(clearToast, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className="toast">{toast}</div>
    </div>
  );
}
