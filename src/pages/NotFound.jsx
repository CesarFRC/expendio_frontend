import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        className="glass animate-fadeInUp"
        style={{
          padding: '4rem 3rem',
          borderRadius: '1.5rem',
          maxWidth: '500px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(251, 191, 36, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--amber)',
          }}
        >
          <FileQuestion size={40} />
        </div>

        <div>
          <h1
            style={{
              fontSize: '4rem',
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
              color: 'var(--text-primary)',
              lineHeight: 1,
              marginBottom: '0.5rem',
            }}
          >
            404
          </h1>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
            }}
          >
            Página no encontrada
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            La ruta a la que intentas acceder no existe o fue movida.
          </p>
        </div>

        <Link
          to="/dashboard"
          className="btn btn-primary"
          style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1rem' }}
        >
          <ArrowLeft size={18} />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
