import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, UserCircle } from 'lucide-react';
import { empleadosService } from '../api/empleados.service';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import toast from 'react-hot-toast';

const EMPTY_FORM = { nombre: '', email: '', password: '', rol_id: 2 };

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => empleadosService.getAll().then(setEmpleados).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (e) => {
    setEditing(e);
    setForm({ nombre: e.nombre, email: e.email, password: '', rol_id: e.rol?.id || 2 });
    setModalOpen(true);
  };

  const handleSave = async (ev) => {
    ev.preventDefault(); setSaving(true);
    try {
      if (editing) {
        const payload = { nombre: form.nombre, email: form.email, ...(form.password ? { password: form.password } : {}) };
        await empleadosService.update(editing.id, payload);
        toast.success('Empleado actualizado');
      } else {
        await empleadosService.create({ nombre: form.nombre, email: form.email, password: form.password, rol_id: parseInt(form.rol_id) });
        toast.success('Empleado creado');
      }
      setModalOpen(false); load();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Error');
    } finally { setSaving(false); }
  };

  const handleRemove = async (e) => {
    if (!confirm(`¿Eliminar empleado "${e.nombre}"?`)) return;
    try { await empleadosService.remove(e.id); toast.success('Empleado eliminado'); load(); }
    catch { toast.error('Error al eliminar'); }
  };

  const filtered = empleados.filter((e) =>
    e.nombre.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="animate-fadeInUp">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem' }}>Empleados</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>{filtered.length} empleados activos</p>
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
                <th>Empleado</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <UserCircle size={32} style={{ opacity: 0.3, display: 'block', margin: '0 auto 0.75rem' }} />No hay empleados
                </td></tr>
              ) : filtered.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}>
                        {e.nombre[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{e.nombre}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{e.email}</td>
                  <td>
                    <Badge variant={e.rol?.nombre === 'Admin' ? 'purple' : 'blue'}>
                      {e.rol?.nombre || 'Sin rol'}
                    </Badge>
                  </td>
                  <td><Badge variant={e.activo ? 'green' : 'red'}>{e.activo ? 'Activo' : 'Inactivo'}</Badge></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(e)} title="Editar"><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => handleRemove(e)} title="Eliminar"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Empleado' : 'Nuevo Empleado'}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Nombre completo *</label>
              <input className="input" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Email *</label>
              <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>{editing ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</label>
              <input className="input" type="password" required={!editing} minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" />
            </div>
            {!editing && (
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Rol *</label>
                <select className="input" value={form.rol_id} onChange={(e) => setForm({ ...form, rol_id: e.target.value })}>
                  <option value={1}>Admin</option>
                  <option value={2}>Empleado</option>
                </select>
              </div>
            )}
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
