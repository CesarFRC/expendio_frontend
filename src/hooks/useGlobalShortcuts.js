import { useEffect } from 'react';

export function useGlobalShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar atajos si el usuario está escribiendo en un input o textarea
      if (
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA' ||
        document.activeElement.isContentEditable
      ) {
        return;
      }

      // F2: Enfocar búsqueda global
      if (e.key === 'F2') {
        e.preventDefault();
        // Buscar por varios atributos comunes para asegurar que lo encuentre
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="Buscar"], input[placeholder*="buscar"]');
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Alt + N: Disparar evento para abrir modal de "Nuevo"
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('shortcut:new'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
