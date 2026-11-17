import { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="card w-full max-w-md animate-slideUp shadow-2xl p-4 sm:p-6"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-extrabold text-starlight tracking-tight truncate flex-1 min-w-0 pr-2">{title}</h2>
          <button
            onClick={onClose}
            className="text-dust-gray hover:text-starlight transition-colors text-xl leading-none cursor-pointer p-1 flex-shrink-0"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
