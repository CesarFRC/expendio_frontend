import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className={`page-content ${collapsed ? 'sidebar-collapsed' : ''}`}
        style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column' }}
      >
        <Navbar />
        <main style={{ flex: 1, padding: '1.5rem', background: 'var(--bg-primary)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
