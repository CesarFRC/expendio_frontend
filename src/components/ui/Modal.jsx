import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, maxWidth = '520px' }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem 1rem',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-light)',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100dvh - 3rem)',
          overflow: 'hidden',
        }}
      >
        {/* Título fijo — nunca hace scroll */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          minHeight: '56px',
          flexShrink: 0,
        }}>
          <h2 style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: "'Space Grotesk', sans-serif",
            margin: 0,
          }}>
            {title}
          </h2>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            id="modal-close-btn"
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div style={{
          overflowY: 'auto',
          padding: '1.5rem',
          flex: 1,
        }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
