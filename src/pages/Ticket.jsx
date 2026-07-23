import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Store, CheckCircle } from 'lucide-react';
import { ventasService } from '../api/ventas.service';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { MetodoPagoBadge } from '../components/ui/Badge';

export default function Ticket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ventasService.getTicket(id).then(res => res.ticket || res)
      .then(setTicket)
      .catch(() => navigate('/ventas'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  if (loading) return <PageLoader />;
  if (!ticket) return null;

  return (
    <div className="animate-fadeInUp" style={{ maxWidth: 520, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/ventas')}>
          <ArrowLeft size={14} /> Volver
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
          <Printer size={14} /> Imprimir
        </button>
      </div>

      <div className="glass" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          padding: '1.5rem', textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 0.75rem',
          }}>
            <Store size={24} color="#fff" />
          </div>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem' }}>Expendio</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            Ticket de Venta
          </p>
        </div>

        <div style={{ padding: '1.25rem' }}>
          {/* Status */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '0.625rem', padding: '0.625rem', marginBottom: '1.25rem',
          }}>
            <CheckCircle size={18} style={{ color: 'var(--accent-green)' }} />
            <span style={{ fontWeight: 600, color: 'var(--accent-green)', fontSize: '0.875rem' }}>
              Venta registrada exitosamente
            </span>
          </div>

          {/* Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Folio', value: ticket.folio },
              { label: 'Fecha', value: ticket.fecha ? new Date(ticket.fecha).toLocaleDateString('es-MX') : '—' },
              { label: 'Hora', value: ticket.fecha ? new Date(ticket.fecha).toLocaleTimeString('es-MX', { timeStyle: 'short' }) : '—' },
              { label: 'Empleado', value: ticket.cajero || ticket.empleado?.nombre || '—' },
              { label: 'Cliente', value: ticket.cliente ? ticket.cliente.nombre : 'General' },
              { label: 'Método', value: <MetodoPagoBadge metodo={ticket.metodo_pago} /> },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'rgba(26,39,68,0.5)', borderRadius: '0.5rem', padding: '0.625rem 0.75rem' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </p>
                <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Items */}
          <div style={{ borderRadius: '0.625rem', overflow: 'hidden', marginBottom: '1rem', border: '1px solid var(--border)' }}>
            <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(26,39,68,0.8)', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Producto</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cant.</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subtotal</span>
            </div>
            {(ticket.detalles || ticket.productos)?.map((d, i) => (
              <div key={i} style={{
                padding: '0.625rem 0.75rem',
                display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.5rem',
                alignItems: 'center',
                borderTop: '1px solid var(--border)',
              }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{d.producto?.nombre || d.nombre}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmt(d.precio_unitario || d.precio_unitario)} c/u</p>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>×{d.cantidad}</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', textAlign: 'right' }}>{fmt(d.subtotal)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={{ background: 'rgba(26,39,68,0.6)', borderRadius: '0.625rem', padding: '0.875rem' }}>
            {[
              { label: 'Subtotal', value: fmt(ticket.subtotal), muted: true },
              ...(parseFloat(ticket.descuento) > 0 ? [{ label: 'Descuento', value: `-${fmt(ticket.descuento)}`, amber: true }] : []),
            ].map(({ label, value, muted, amber }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                <span style={{ fontSize: '0.85rem', color: muted || amber ? (amber ? 'var(--accent-amber)' : 'var(--text-muted)') : 'var(--text-primary)' }}>{label}</span>
                <span style={{ fontSize: '0.85rem', color: amber ? 'var(--accent-amber)' : 'var(--text-muted)' }}>{value}</span>
              </div>
            ))}
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem' }}>
              <span>TOTAL</span>
              <span style={{ color: 'var(--accent-green)' }}>{fmt(ticket.total)}</span>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1.25rem' }}>
            ¡Gracias por su compra! 🙏
          </p>
        </div>
      </div>
    </div>
  );
}
