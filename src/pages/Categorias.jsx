import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { categoriasService } from '../api/categorias.service';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [saving, setSaving] = useState(false);

  const load = () => categoriasService.getAll().then(setCategorias).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handleNewShortcut = () => openCreate();
    window.addEventListener('shortcut:new', handleNewShortcut);
    return () => window.removeEventListener('shortcut:new', handleNewShortcut);
  }, []);

  const openCreate = () => { setEditing(null); setForm({ nombre: '', descripcion: '' }); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ nombre: c.nombre, descripcion: c.descripcion || '' }); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { nombre: form.nombre, descripcion: form.descripcion || undefined };
      if (editing) { await categoriasService.update(editing.id, payload); toast.success('Categoría actualizada'); }
      else { await categoriasService.create(payload); toast.success('Categoría creada'); }
      setModalOpen(false); load();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Error');
    } finally { setSaving(false); }
  };

  const handleRemove = async (c) => {
    if (!confirm(`¿Eliminar categoría "${c.nombre}"?`)) return;
    try { await categoriasService.remove(c.id); toast.success('Categoría eliminada'); load(); }
    catch { toast.error('Error al eliminar'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fadeInUp">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Categorías</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{categorias.length} categorías registradas</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nueva</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.875rem' }}>
        {categorias.length === 0 ? (
          <div className="glass" style={{ borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
            <Tag size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 0.75rem' }} />
            No hay categorías
          </div>
        ) : categorias.map((c) => (
          <div key={c.id} className="glass" style={{ borderRadius: '1rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '0.625rem', flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Tag size={18} style={{ color: 'var(--accent-purple)' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(c)}><Edit2 size={13} /></button>
                <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => handleRemove(c)}><Trash2 size={13} /></button>
              </div>
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{c.nombre}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.4 }}>{c.descripcion || 'Sin descripción'}</p>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Categoría' : 'Nueva Categoría'}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Nombre *</label>
              <input className="input" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Bebidas" />
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
