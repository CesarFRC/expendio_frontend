import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (producto, cantidad = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.producto_id === producto.id);
      if (existing) {
        return prev.map((i) =>
          i.producto_id === producto.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        );
      }
      return [
        ...prev,
        {
          producto_id: producto.id,
          nombre: producto.nombre,
          precio: parseFloat(producto.precio),
          cantidad,
          stock: producto.stock,
        },
      ];
    });
  };

  const removeItem = (productoId) =>
    setItems((prev) => prev.filter((i) => i.producto_id !== productoId));

  const updateCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) { removeItem(productoId); return; }
    setItems((prev) =>
      prev.map((i) => (i.producto_id === productoId ? { ...i, cantidad } : i))
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateCantidad, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
