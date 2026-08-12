import { useEffect, useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { inventarioService } from '../api/inventario.service';
import { productosService } from '../api/productos.service';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';

const EMPTY_FORM = { producto_id: '', cantidad: '', motivo: '' };

export default function Inventario() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [tipoModal, setTipoModal] = useState('entrada');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () =>
    Promise.all([inventarioService.getAll(), productosService.getAll()])
      .then(([m, p]) => { setMovimientos(m); setProductos(p); })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openModal = (tipo) => { setTipoModal(tipo); setForm(EMPTY_FORM); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        producto_id: parseInt(form.producto_id),
        cantidad: parseInt(form.cantidad),
        motivo: form.motivo,
        tipo_movimiento: tipoModal,
      };
      if (tipoModal === 'entrada') await inventarioService.registrarEntrada(payload);
      else await inventarioService.registrarSalida(payload);
      toast.success(`${tipoModal === 'entrada' ? 'Entrada' : 'Salida'} registrada`);
      setModalOpen(false);
      load();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fadeInUp">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Inventario</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{movimientos.length} movimientos registrados</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => openModal('salida')}>
            <TrendingDown size={16} /> Registrar Salida
          </button>
          <button className="btn btn-primary" onClick={() => openModal('entrada')}>
            <TrendingUp size={16} /> Registrar Entrada
          </button>
        </div>
      </div>

      <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Motivo</th>
                <th>Empleado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Package size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 0.75rem' }} />
                  No hay movimientos
                </td></tr>
              ) : movimientos.map((m) => (
                <tr key={m.id}>
                  <td>
                    <Badge variant={m.tipo_movimiento === 'entrada' ? 'green' : 'red'}>
                      {m.tipo_movimiento === 'entrada' ? '▲ Entrada' : '▼ Salida'}
                    </Badge>
                  </td>
                  <td style={{ fontWeight: 600 }}>{m.producto?.nombre || '—'}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: m.tipo_movimiento === 'entrada' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                      {m.tipo_movimiento === 'entrada' ? '+' : '-'}{m.cantidad}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{m.motivo || '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{m.empleado?.nombre || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {new Date(m.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={tipoModal === 'entrada' ? '▲ Registrar Entrada' : '▼ Registrar Salida'}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Producto *</label>
              <select className="input" required value={form.producto_id} onChange={(e) => setForm({ ...form, producto_id: e.target.value })}>
                <option value="">Seleccionar producto</option>
                {productos.filter(p => !p.descontinuado).map((p) => <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Cantidad *</label>
              <input className="input" type="number" min="1" required value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} placeholder="Ej: 50" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Motivo</label>
              <input className="input" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} placeholder="Ej: Compra a proveedor" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className={`btn ${tipoModal === 'entrada' ? 'btn-primary' : 'btn-danger'}`} disabled={saving}>
              {saving ? 'Guardando...' : `Registrar ${tipoModal}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
