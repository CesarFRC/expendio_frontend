import { useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { productosService } from '../../api/productos.service';

const PAGE_TITLES = {
  '/dashboard':  'Dashboard',
  '/pos':        'Punto de Venta',
  '/ventas':     'Ventas',
  '/productos':  'Productos',
  '/inventario': 'Inventario',
  '/clientes':   'Clientes',
  '/empleados':  'Empleados',
  '/categorias': 'Categorías',
  '/proveedores':'Proveedores',
};

export function Navbar() {
  const location = useLocation();
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    productosService.getAlertas().then(setAlertas).catch(() => {});
  }, []);

  const title = PAGE_TITLES[location.pathname] || 'Expendio';
  const isTicket = location.pathname.includes('/ticket');

  return (
    <header style={{
      height: 52,
      background: 'var(--bg-base)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.75rem',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      <h1 style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '0.95rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '-0.01em',
      }}>
        {isTicket ? 'Ticket de Venta' : title}
      </h1>

      {alertas.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          background: 'rgba(244,63,94,0.08)',
          border: '1px solid rgba(244,63,94,0.2)',
          borderRadius: 6,
          padding: '0.275rem 0.75rem',
          fontSize: '0.75rem',
          color: 'var(--red)',
          fontWeight: 600,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          <AlertTriangle size={13} strokeWidth={2.5} />
          {alertas.length} sin stock
        </div>
      )}
    </header>
  );
}
