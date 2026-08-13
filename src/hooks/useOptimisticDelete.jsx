import { useRef } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook para eliminar elementos de forma optimista con opción a "Deshacer".
 * 
 * @param {Function} onRemove - Función para actualizar el estado local inmediatamente (ocultar el elemento)
 * @param {Function} onRestore - Función para restaurar el estado local (si el usuario presiona Deshacer)
 * @param {Function} apiDelete - Promesa/Función que llama al endpoint DELETE del backend
 * @param {String} itemName - Nombre de la entidad (ej: 'Producto', 'Cliente')
 */
export function useOptimisticDelete(onRemove, onRestore, apiDelete, itemName = 'Elemento') {
  const timeouts = useRef(new Map());

  const handleDelete = (id, itemData) => {
    // 1. Eliminación optimista de la UI (sensación inmediata)
    onRemove(id);

    // 2. Mostrar toast con opción a deshacer
    toast(
      (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>
            <b>{itemName} eliminado.</b>
          </span>
          <button
            onClick={() => {
              // Si se presiona deshacer: cancelar timeout y restaurar UI
              clearTimeout(timeouts.current.get(id));
              timeouts.current.delete(id);
              toast.dismiss(t.id);
              onRestore(itemData);
            }}
            style={{
              padding: '4px 12px',
              background: 'var(--amber)',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Deshacer
          </button>
        </div>
      ),
      { duration: 5000, id: `delete-${id}` } // El toast dura 5 segundos
    );

    // 3. Programar la eliminación real en el backend después de 5 segundos
    const timeoutId = setTimeout(async () => {
      timeouts.current.delete(id);
      try {
        await apiDelete(id);
      } catch (err) {
        // Si la petición falla, lo restauramos por seguridad y avisamos
        onRestore(itemData);
        toast.error(`Error al eliminar en la base de datos`);
      }
    }, 5000);

    timeouts.current.set(id, timeoutId);
  };

  return { handleDelete };
}
