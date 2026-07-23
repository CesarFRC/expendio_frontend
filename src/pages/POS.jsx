import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, Trash2, ShoppingBag, X, CreditCard } from 'lucide-react';
import { productosService } from '../api/productos.service';
import { ventasService } from '../api/ventas.service';
import { clientesService } from '../api/clientes.service';
import { useCart } from '../context/CartContext';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { StockBadge } from '../components/ui/Badge';
import toast from 'react-hot-toast';

const METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia'];

export default function POS() {
  const { items, addItem, removeItem, updateCantidad, clearCart, subtotal } = useCart();
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [descuento, setDescuento] = useState(0);
  const [clienteId, setClienteId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      productosService.getAll(),
      clientesService.getAll(),
    ]).then(([p, c]) => {
      setProductos(p);
      setClientes(c);
      setLoading(false);
    });
  }, []);

  const filtered = productos.filter((p) =>
    !p.descontinuado &&
    p.stock > 0 &&
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const total = Math.max(0, subtotal - parseFloat(descuento || 0));

  const fmt = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

  const handleVenta = async () => {
    if (items.length === 0) { toast.error('El carrito está vacío'); return; }
    setSubmitting(true);
    try {
      const payload = {
        productos: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        metodo_pago: metodoPago,
        descuento: parseFloat(descuento) || 0,
        ...(clienteId ? { cliente_id: parseInt(clienteId) } : {}),
      };
      const venta = await ventasService.create(payload);
      toast.success(`¡Venta ${venta.folio} registrada!`);
      clearCart();
      setDescuento(0);
      setClienteId('');
      navigate(`/ventas/${venta.id}/ticket`);
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Error al procesar la venta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.25rem', height: 'calc(100vh - 100px)' }}>
      {/* Left: Productos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            id="pos-search"
            type="text"
            className="input"
            placeholder="Buscar producto por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.75rem', overflowY: 'auto', paddingBottom: '1rem' }}>
          {filtered.map((p) => (
            <div
              key={p.id}
              className="glass"
              style={{
                borderRadius: '0.875rem', padding: '1rem', cursor: 'pointer',
                transition: 'all 0.2s', border: '1px solid var(--border)',
              }}
              onClick={() => {
                const inCart = items.find((i) => i.producto_id === p.id);
                if (inCart && inCart.cantidad >= p.stock) {
                  toast.error('Stock insuficiente'); return;
                }
                addItem(p);
                toast.success(`${p.nombre} agregado`, { duration: 1000 });
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent-green)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
            >
              <div style={{
                width: '100%', height: 60, borderRadius: '0.5rem', marginBottom: '0.75rem',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.1))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ShoppingBag size={24} style={{ color: 'var(--accent-green)', opacity: 0.7 }} />
              </div>
              <p style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '0.25rem', lineHeight: 1.3 }}>
                {p.nombre}
              </p>
              <p style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.375rem' }}>
                {fmt(p.precio)}
              </p>
              <StockBadge stock={p.stock} stockMinimo={p.stock_minimo || 5} />
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <ShoppingBag size={40} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <p>No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="glass" style={{ borderRadius: '1rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Cart header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={18} style={{ color: 'var(--accent-green)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Carrito</span>
            {items.length > 0 && (
              <span style={{
                background: 'var(--accent-green)', color: '#fff',
                borderRadius: '9999px', width: 20, height: 20,
                fontSize: '0.7rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {items.length}
              </span>
            )}
          </div>
          {items.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearCart} style={{ color: 'var(--accent-red)' }}>
              <X size={14} /> Limpiar
            </button>
          )}
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <ShoppingBag size={36} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
              <p style={{ fontSize: '0.85rem' }}>Selecciona productos para agregar al carrito</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.producto_id} style={{
                display: 'flex', gap: '0.5rem', alignItems: 'center',
                padding: '0.6rem 0.5rem', borderRadius: '0.625rem', marginBottom: '0.375rem',
                background: 'rgba(26,39,68,0.5)',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.nombre}
                  </p>
                  <p style={{ color: 'var(--accent-green)', fontSize: '0.78rem', fontWeight: 600 }}>
                    {fmt(item.precio * item.cantidad)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-icon" style={{ width: 26, height: 26, padding: 0 }}
                    onClick={() => updateCantidad(item.producto_id, item.cantidad - 1)}>
                    <Minus size={12} />
                  </button>
                  <span style={{ width: 24, textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                    {item.cantidad}
                  </span>
                  <button className="btn btn-ghost btn-icon" style={{ width: 26, height: 26, padding: 0 }}
                    onClick={() => {
                      if (item.cantidad >= item.stock) { toast.error('Stock insuficiente'); return; }
                      updateCantidad(item.producto_id, item.cantidad + 1);
                    }}>
                    <Plus size={12} />
                  </button>
                  <button className="btn btn-ghost btn-icon" style={{ width: 26, height: 26, padding: 0, color: 'var(--accent-red)' }}
                    onClick={() => removeItem(item.producto_id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Totals + Pay */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)' }}>
          {/* Cliente */}
          <div style={{ marginBottom: '0.625rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Cliente (opcional)
            </label>
            <select id="pos-cliente" className="input" style={{ fontSize: '0.8rem' }} value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">— Venta general —</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
              ))}
            </select>
          </div>

          {/* Método de pago */}
          <div style={{ marginBottom: '0.625rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Método de pago
            </label>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {METODOS_PAGO.map((m) => (
                <button
                  key={m}
                  className={`btn btn-sm ${metodoPago === m ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, textTransform: 'capitalize' }}
                  onClick={() => setMetodoPago(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Descuento */}
          <div style={{ marginBottom: '0.875rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
              Descuento ($)
            </label>
            <input
              id="pos-descuento"
              type="number" min="0" step="0.01"
              className="input"
              style={{ fontSize: '0.8rem' }}
              value={descuento}
              onChange={(e) => setDescuento(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Totals */}
          <div style={{ background: 'rgba(26,39,68,0.6)', borderRadius: '0.625rem', padding: '0.75rem', marginBottom: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            {parseFloat(descuento) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--accent-amber)' }}>Descuento</span>
                <span style={{ color: 'var(--accent-amber)' }}>-{fmt(descuento)}</span>
              </div>
            )}
            <div className="divider" style={{ margin: '0.375rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.05rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent-green)' }}>{fmt(total)}</span>
            </div>
          </div>

          <button
            id="pos-cobrar-btn"
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
            onClick={handleVenta}
            disabled={submitting || items.length === 0}
          >
            <CreditCard size={18} />
            {submitting ? 'Procesando...' : 'Cobrar'}
          </button>
        </div>
      </div>
    </div>
  );
}
