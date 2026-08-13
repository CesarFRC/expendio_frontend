import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { productosService } from '../api/productos.service';
import { categoriasService } from '../api/categorias.service';
import { proveedoresService } from '../api/proveedores.service';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { StockBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { useOptimisticDelete } from '../hooks/useOptimisticDelete';
import toast from 'react-hot-toast';

const EMPTY_FORM = { nombre: '', precio: '', stock: '', stock_minimo: '', codigo_barras: '', imagen_url: '', categoria_id: '', proveedor_id: '' };

export default function Productos() {
  const { isAdmin } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () =>
    Promise.all([productosService.getAll(), categoriasService.getAll(), proveedoresService.getAll()])
      .then(([p, c, pv]) => { setProductos(p); setCategorias(c); setProveedores(pv); })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const handleNewShortcut = () => openCreate();
    window.addEventListener('shortcut:new', handleNewShortcut);
    return () => window.removeEventListener('shortcut:new', handleNewShortcut);
  }, [isAdmin]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      nombre: p.nombre, precio: p.precio, stock: p.stock ?? '',
      stock_minimo: p.stock_minimo ?? '', codigo_barras: p.codigo_barras ?? '',
      imagen_url: p.imagen_url ?? '',
      categoria_id: p.categoria?.id ?? '', proveedor_id: p.proveedor?.id ?? '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre, precio: parseFloat(form.precio),
        ...(form.stock !== '' ? { stock: parseInt(form.stock) } : {}),
        ...(form.stock_minimo !== '' ? { stock_minimo: parseInt(form.stock_minimo) } : {}),
        ...(form.codigo_barras ? { codigo_barras: form.codigo_barras } : {}),
        ...(form.imagen_url ? { imagen_url: form.imagen_url } : {}),
        ...(form.categoria_id ? { categoria_id: parseInt(form.categoria_id) } : {}),
        ...(form.proveedor_id ? { proveedor_id: parseInt(form.proveedor_id) } : {}),
      };
      if (editing) {
        await productosService.update(editing.id, payload);
        toast.success('Producto actualizado');
      } else {
        await productosService.create(payload);
        toast.success('Producto creado');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // Sistema de "Deshacer" (Eliminación optimista)
  const { handleDelete } = useOptimisticDelete(
    (id) => setProductos((prev) => prev.filter((p) => p.id !== id)), // onRemove
    (restoredItem) => setProductos((prev) => [...prev, restoredItem]), // onRestore
    async (id) => {
      await productosService.descontinuar(id);
      load(); // Recargar en background para confirmar estado real
    }, // apiDelete
    'Producto' // itemName
  );

  const handleDescontinuar = (p) => {
    handleDelete(p.id, p);
  };

  const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  const filtered = productos.filter((p) =>
    !p.descontinuado &&
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fadeInUp">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Productos</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{filtered.length} productos activos</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input id="productos-search" type="text" className="input" placeholder="Buscar..." value={search}
              onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem', width: 220 }} />
          </div>
          {isAdmin && (
            <button id="productos-create-btn" className="btn btn-primary" onClick={openCreate}>
              <Plus size={16} /> Nuevo
            </button>
          )}
        </div>
      </div>

      <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Proveedor</th>
                <th>Estado</th>
                {isAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Package size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 0.75rem' }} />
                  No hay productos
                </td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.nombre}</div>
                    {p.codigo_barras && <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'monospace' }}>{p.codigo_barras}</div>}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{fmt(p.precio)}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{p.stock ?? 0}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}> uds.</span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.categoria?.nombre || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.proveedor?.razon_social || '—'}</td>
                  <td><StockBadge stock={p.stock ?? 0} stockMinimo={p.stock_minimo ?? 5} /></td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(p)} title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => handleDescontinuar(p)} title="Descontinuar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Nombre *</label>
              <input className="input" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Coca-Cola 600ml" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Precio *</label>
                <input className="input" type="number" min="0" step="0.01" required value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Stock</label>
                <input className="input" type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Stock mínimo</label>
                <input className="input" type="number" min="0" value={form.stock_minimo} onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })} placeholder="5" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Código de barras</label>
                <input className="input" value={form.codigo_barras} onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })} placeholder="Opcional" />
              </div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>URL de la imagen (Opcional)</label>
              <input className="input" value={form.imagen_url} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} placeholder="https://ejemplo.com/imagen.png" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Categoría</label>
                <select className="input" value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}>
                  <option value="">Sin categoría</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Proveedor</label>
                <select className="input" value={form.proveedor_id} onChange={(e) => setForm({ ...form, proveedor_id: e.target.value })}>
                  <option value="">Sin proveedor</option>
                  {proveedores.map((p) => <option key={p.id} value={p.id}>{p.razon_social}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : (editing ? 'Actualizar' : 'Crear')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
