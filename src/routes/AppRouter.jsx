import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { PrivateRoute } from './PrivateRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import POS from '../pages/POS';
import Ventas from '../pages/Ventas';
import Ticket from '../pages/Ticket';
import Productos from '../pages/Productos';
import Inventario from '../pages/Inventario';
import Clientes from '../pages/Clientes';
import Empleados from '../pages/Empleados';
import Categorias from '../pages/Categorias';
import Proveedores from '../pages/Proveedores';
import NotFound from '../pages/NotFound';

export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected: all authenticated employees */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/clientes" element={<Clientes />} />
        </Route>
      </Route>

      {/* Protected: Admin only */}
      <Route element={<PrivateRoute adminOnly />}>
        <Route element={<Layout />}>
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/ventas/:id/ticket" element={<Ticket />} />
          <Route path="/inventario" element={<Inventario />} />
          <Route path="/empleados" element={<Empleados />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/proveedores" element={<Proveedores />} />
        </Route>
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
