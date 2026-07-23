import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Star, Users } from 'lucide-react';
import { clientesService } from '../api/clientes.service';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';

const EMPTY_FORM = { nombre: '', email: '', telefono: '' };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => clientesService.getAll().then(setClientes).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ nombre: c.nombre, email: c.email || '', telefono: c.telefono || '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { nombre: form.nombre, email: form.email || undefined, telefono: form.telefono || undefined };
      if (editing) { await clientesService.update(editing.id, payload); toast.success('Cliente actualizado'); }
      else { await clientesService.create(payload); toast.success('Cliente creado'); }
      setModalOpen(false); load();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Error');
    } finally { setSaving(false); }
  };

  const handleClasificar = async (c) => {
    try {
      await clientesService.clasificar(c.id);
      toast.success('Cliente marcado como frecuente');
      load();
    } catch { toast.error('Error'); }
  };

  const filtered = clientes.filter((c) =>
    `${c.nombre}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fadeInUp">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Clientes</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{filtered.length} clientes · {clientes.filter(c => c.es_frecuente).length} frecuentes</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" className="input" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem', width: 200 }} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo</button>
        </div>
      </div>

      <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Users size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 0.75rem' }} />No hay clientes
                </td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.nombre}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.email || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.telefono || '—'}</td>
                  <td>
                    {c.es_frecuente
                      ? <Badge variant="amber"><Star size={10} style={{ display: 'inline', marginRight: 2 }} /> Frecuente</Badge>
                      : <Badge variant="gray">Regular</Badge>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(c)} title="Editar"><Edit2 size={14} /></button>
                      {!c.es_frecuente && (
                        <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--accent-amber)' }} onClick={() => handleClasificar(c)} title="Marcar frecuente">
                          <Star size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Nombre completo *</label>
              <input className="input" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Carlos Ramírez" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Email</label>
              <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="cliente@correo.com" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Teléfono</label>
              <input className="input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="555-1234567" />
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
