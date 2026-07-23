import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, maxWidth = '520px' }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} id="modal-close-btn">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
