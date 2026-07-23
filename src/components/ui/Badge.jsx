export function Badge({ children, variant = 'gray' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function MetodoPagoBadge({ metodo }) {
  const map = {
    efectivo: { variant: 'green', label: 'Efectivo' },
    tarjeta: { variant: 'blue', label: 'Tarjeta' },
    transferencia: { variant: 'purple', label: 'Transferencia' },
  };
  const { variant, label } = map[metodo] || { variant: 'gray', label: metodo };
  return <Badge variant={variant}>{label}</Badge>;
}

export function StockBadge({ stock, stockMinimo = 5 }) {
  if (stock === 0) return <Badge variant="red">Sin stock</Badge>;
  if (stock <= stockMinimo) return <Badge variant="amber">Stock bajo</Badge>;
  return <Badge variant="green">En stock</Badge>;
}
