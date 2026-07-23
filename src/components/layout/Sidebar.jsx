import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Receipt, Package,
  BarChart2, Users, UserCircle, Tag, Truck,
  ChevronLeft, ChevronRight, Store, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/pos', icon: ShoppingCart, label: 'Punto de Venta' },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { to: '/ventas', icon: Receipt, label: 'Ventas', adminOnly: true },
      { to: '/productos', icon: Package, label: 'Productos' },
      { to: '/inventario', icon: BarChart2, label: 'Inventario', adminOnly: true },
    ],
  },
  {
    label: 'Contactos',
    items: [
      { to: '/clientes', icon: Users, label: 'Clientes' },
      { to: '/empleados', icon: UserCircle, label: 'Empleados', adminOnly: true },
    ],
  },
  {
    label: 'Catálogos',
    items: [
      { to: '/categorias', icon: Tag, label: 'Categorías', adminOnly: true },
      { to: '/proveedores', icon: Truck, label: 'Proveedores', adminOnly: true },
    ],
  },
];

export function Sidebar({ collapsed, setCollapsed }) {
  const { isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>

      {/* ── Brand ─────────────────────────────────────────────────── */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Store size={18} color="#0a0a0a" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div>
            <div className="sidebar-brand-name">Expendio</div>
            <div className="sidebar-brand-role">{user?.rol?.nombre || 'Sistema'}</div>
          </div>
        )}
      </div>

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
        {NAV_GROUPS.map((group) => {
          const visible = group.items.filter((i) => !i.adminOnly || isAdmin);
          if (visible.length === 0) return null;

          return (
            <div key={group.label}>
              {!collapsed && (
                <div className="sidebar-group-label">{group.label}</div>
              )}
              {visible.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={17} className="sidebar-icon" strokeWidth={2} />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div style={{ paddingBottom: '0.5rem' }}>
        {/* User info */}
        {!collapsed && (
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.nombre?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{
                fontSize: '0.8rem', fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.nombre}
              </p>
              <p style={{
                fontSize: '0.68rem', color: 'var(--text-muted)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.email}
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          className="sidebar-logout"
          onClick={handleLogout}
          title={collapsed ? 'Cerrar sesión' : undefined}
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <LogOut size={16} strokeWidth={2} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>

        {/* Collapse toggle */}
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
          style={{ justifyContent: collapsed ? 'center' : 'flex-end' }}
          title="Colapsar"
        >
          {collapsed
            ? <ChevronRight size={15} />
            : <><span>Colapsar</span><ChevronLeft size={15} /></>
          }
        </button>
      </div>
    </aside>
  );
}
