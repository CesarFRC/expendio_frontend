import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, ShoppingCart, Package, AlertTriangle,
  Users, TrendingUp, ArrowUpRight, Clock,
} from 'lucide-react';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { MetodoPagoBadge } from '../components/ui/Badge';
import { ventasService } from '../api/ventas.service';
import { productosService } from '../api/productos.service';
import { clientesService } from '../api/clientes.service';
import { useAuth } from '../context/AuthContext';

function KpiCard({ icon: Icon, label, value, sub, color = 'var(--amber)', onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1.375rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.18s, transform 0.18s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Top-right glow dot */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        width: 36, height: 36, borderRadius: 8,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={17} style={{ color }} strokeWidth={2} />
      </div>

      <p style={{
        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--text-muted)',
        fontFamily: "'Space Grotesk', sans-serif",
        marginBottom: '0.75rem',
      }}>{label}</p>
      <p style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '1.6rem', fontWeight: 800,
        color: 'var(--text-primary)', lineHeight: 1,
        marginBottom: '0.5rem',
      }}>{value}</p>
      {sub && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ventas, setVentas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    Promise.all([
      isAdmin ? ventasService.getAll().catch(() => []) : Promise.resolve([]),
      productosService.getAlertas().catch(() => []),
      clientesService.getAll().catch(() => []),
    ]).then(([v, a, c]) => {
      setVentas(v); setAlertas(a); setClientes(c);
      setLoading(false);
    });
  }, [isAdmin]);

  if (loading) return <PageLoader />;

  const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
  const totalVentas = ventas.reduce((acc, v) => acc + parseFloat(v.total || 0), 0);
  const ventasHoy = ventas.filter((v) => new Date(v.fecha).toDateString() === new Date().toDateString());
  const totalHoy = ventasHoy.reduce((acc, v) => acc + parseFloat(v.total || 0), 0);
  const recentVentas = [...ventas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 8);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="animate-fadeInUp">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.6rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
          }}>
            {greeting}, <span style={{ color: 'var(--amber)' }}>{user?.nombre?.split(' ')[0]}</span>
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Clock size={13} />
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${isAdmin ? 4 : 2}, 1fr)`,
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        {isAdmin && (
          <>
            <KpiCard
              icon={DollarSign} label="Total Ventas"
              value={fmt(totalVentas)}
              sub={`${ventas.length} ventas en total`}
              color="var(--amber)"
              onClick={() => navigate('/ventas')}
            />
            <KpiCard
              icon={TrendingUp} label="Ventas Hoy"
              value={fmt(totalHoy)}
              sub={`${ventasHoy.length} transacciones hoy`}
              color="var(--green)"
            />
          </>
        )}
        <KpiCard
          icon={AlertTriangle} label="Alertas Stock"
          value={alertas.length}
          sub={alertas.length > 0 ? 'Productos con bajo stock' : 'Todo en orden ✓'}
          color={alertas.length > 0 ? 'var(--red)' : 'var(--green)'}
          onClick={() => navigate('/productos')}
        />
        <KpiCard
          icon={Users} label="Clientes"
          value={clientes.length}
          sub={`${clientes.filter(c => c.es_frecuente).length} frecuentes`}
          color="var(--blue)"
          onClick={() => navigate('/clientes')}
        />
      </div>

      {/* ── CTA POS ─────────────────────────────────────────────── */}
      <div
        onClick={() => navigate('/pos')}
        style={{
          background: 'var(--amber)',
          borderRadius: 12,
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          marginBottom: '1.75rem',
          transition: 'background 0.18s, transform 0.18s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--amber-light)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--amber)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: 40, height: 40,
            background: 'rgba(10,10,10,0.15)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShoppingCart size={20} color="#0a0a0a" strokeWidth={2.5} />
          </div>
          <div>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#0a0a0a' }}>
              Abrir Punto de Venta
            </p>
            <p style={{ fontSize: '0.78rem', color: 'rgba(10,10,10,0.6)' }}>Registrar una nueva venta</p>
          </div>
        </div>
        <ArrowUpRight size={22} color="#0a0a0a" strokeWidth={2.5} />
      </div>

      {/* ── Lower grid ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1.4fr' : '1fr', gap: '1.25rem' }}>

        {/* Alertas */}
        {alertas.length > 0 && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={15} style={{ color: 'var(--red)' }} strokeWidth={2} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.875rem' }}>
                  Stock bajo
                </span>
              </div>
              <span style={{
                background: 'var(--red-glow)', color: 'var(--red)',
                fontSize: '0.7rem', fontWeight: 700,
                padding: '0.15rem 0.5rem', borderRadius: 4,
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                {alertas.length} alertas
              </span>
            </div>
            <div style={{ padding: '0.75rem' }}>
              {alertas.slice(0, 6).map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate('/productos')}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 8, marginBottom: '0.375rem',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={13} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.nombre}</span>
                  </div>
                  <span style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700, fontSize: '0.8rem', color: 'var(--red)',
                  }}>
                    {p.stock} uds.
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ventas recientes */}
        {isAdmin && recentVentas.length > 0 && (
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.875rem' }}>
                Ventas recientes
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/ventas')}
                style={{ fontSize: '0.75rem' }}
              >
                Ver todas →
              </button>
            </div>
            <div>
              {recentVentas.map((v, i) => (
                <div
                  key={v.id}
                  onClick={() => navigate(`/ventas/${v.id}/ticket`)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1.25rem',
                    borderBottom: i < recentVentas.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                      {v.folio}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {new Date(v.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                      {v.empleado?.nombre && ` · ${v.empleado.nombre}`}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <MetodoPagoBadge metodo={v.metodo_pago} />
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: 'var(--amber)', fontSize: '0.9rem' }}>
                      {fmt(v.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
