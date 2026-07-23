import { useEffect, useState } from 'react';
import { Plus, Edit2, Truck, Phone, Mail } from 'lucide-react';
import { proveedoresService } from '../api/proveedores.service';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';

const EMPTY_FORM = { nombre: '', contacto: '', telefono: '', email: '' };

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => proveedoresService.getAll().then(setProveedores).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ nombre: p.nombre, contacto: p.contacto || '', telefono: p.telefono || '', email: p.email || '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { nombre: form.nombre, contacto: form.contacto || undefined, telefono: form.telefono || undefined, email: form.email || undefined };
      if (editing) { await proveedoresService.update(editing.id, payload); toast.success('Proveedor actualizado'); }
      else { await proveedoresService.create(payload); toast.success('Proveedor creado'); }
      setModalOpen(false); load();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Error');
    } finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fadeInUp">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Proveedores</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{proveedores.length} proveedores</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
        {proveedores.length === 0 ? (
          <div className="glass" style={{ borderRadius: '1rem', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
            <Truck size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 0.75rem' }} />No hay proveedores
          </div>
        ) : proveedores.map((p) => (
          <div key={p.id} className="glass" style={{ borderRadius: '1rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '0.625rem',
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(59,130,246,0.2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Truck size={18} style={{ color: 'var(--accent-green)' }} />
                </div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.nombre}</p>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(p)}><Edit2 size={13} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {p.contacto && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <Truck size={12} /> {p.contacto}
                </div>
              )}
              {p.telefono && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <Phone size={12} /> {p.telefono}
                </div>
              )}
              {p.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <Mail size={12} /> {p.email}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Nombre *</label>
              <input className="input" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Distribuidora XYZ" />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Persona de contacto</label>
              <input className="input" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} placeholder="Nombre del contacto" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Teléfono</label>
                <input className="input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="555-1234567" />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Email</label>
                <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="proveedor@email.com" />
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
