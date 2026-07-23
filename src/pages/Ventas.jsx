import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import { ventasService } from '../api/ventas.service';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { MetodoPagoBadge } from '../components/ui/Badge';

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    ventasService.getAll()
      .then(setVentas)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  const filtered = ventas.filter((v) =>
    v.folio?.toLowerCase().includes(search.toLowerCase()) ||
    v.empleado?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    v.cliente?.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  const totalGeneral = filtered.reduce((acc, v) => acc + parseFloat(v.total || 0), 0);

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fadeInUp">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Historial de Ventas</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {filtered.length} ventas · Total: <strong style={{ color: 'var(--accent-green)' }}>{fmt(totalGeneral)}</strong>
          </p>
        </div>
        <div style={{ position: 'relative', maxWidth: 280, width: '100%' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input id="ventas-search" type="text" className="input" placeholder="Buscar folio, empleado..." value={search}
            onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
        </div>
      </div>

      <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Folio</th>
                <th>Fecha</th>
                <th>Empleado</th>
                <th>Cliente</th>
                <th>Método</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No hay ventas registradas
                </td></tr>
              ) : filtered.map((v) => (
                <tr key={v.id}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--accent-green)', fontFamily: 'monospace' }}>
                      {v.folio}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {new Date(v.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td>{v.empleado?.nombre || '—'}</td>
                  <td style={{ color: v.cliente ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {v.cliente ? v.cliente.nombre : 'General'}
                  </td>
                  <td><MetodoPagoBadge metodo={v.metodo_pago} /></td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{fmt(v.total)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/ventas/${v.id}/ticket`)}>
                      <Eye size={14} /> Ticket
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
