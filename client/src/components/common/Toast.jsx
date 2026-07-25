import { useState, useEffect } from 'react';

export default function Toast({ message, type = 'success', duration = 4000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeClass = type === 'error' ? 'toast-error' : type === 'badge' ? 'toast-badge' : 'toast-success';

  return (
    <div
      className={`toast ${typeClass}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.3s ease',
      }}
    >
      {type === 'badge' && <span className="mr-2">🏆</span>}
      {type === 'success' && <span className="mr-2">✓</span>}
      {type === 'error' && <span className="mr-2">✕</span>}
      {message}
    </div>
  );
}
