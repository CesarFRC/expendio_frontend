export function LoadingSpinner({ size = 24, className = '' }) {
  return (
    <div
      className={`animate-spin ${className}`}
      style={{
        width: size,
        height: size,
        border: '2px solid rgba(16,185,129,0.2)',
        borderTopColor: '#10b981',
        borderRadius: '50%',
      }}
    />
  );
}

export function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '300px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <LoadingSpinner size={40} />
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.875rem' }}>
          Cargando...
        </p>
      </div>
    </div>
  );
}
