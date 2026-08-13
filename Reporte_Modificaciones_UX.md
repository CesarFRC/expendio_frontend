# Reporte de Modificaciones de Software: Mejoras de Experiencia de Usuario (UX)

**Proyecto:** Expendio — Sistema de Gestión
**Materia/Tema:** Aplicación de Principios y Heurísticas de Experiencia de Usuario (UX)

---

## Introducción
El presente documento detalla las modificaciones y nuevas características implementadas en el sistema "Expendio", con el objetivo de resolver problemas de usabilidad existentes y elevar la calidad de la interfaz para cumplir con los estándares y heurísticas de usabilidad de Jakob Nielsen.

---

## 1. Rediseño Arquitectónico de Modales (Ventanas Emergentes)
**Problema original:** Los modales presentaban errores de renderizado (franjas negras) debido a conflictos con filtros CSS (`backdrop-filter`) y el contenido (como formularios) provocaba un "auto-scroll" indeseado que ocultaba el título y los botones de control, dejando al usuario sin contexto.

**Modificación realizada:** 
- Se reescribió la arquitectura del componente `Modal` utilizando **React Portals** (`createPortal`), lo que permite que el modal se renderice de forma independiente al árbol del DOM principal.
- Se implementó un sistema de capas de scroll aislando el encabezado (`flex-shrink: 0`) para garantizar que el título y el botón de cierre sean **siempre visibles**, sin importar el tamaño del contenido o el foco del navegador.

**Heurística de UX aplicada:** 
- *Visibilidad del estado del sistema:* El usuario nunca pierde de vista el contexto de la acción (título fijo).
- *Diseño estético y minimalista:* Se eliminó el ruido visual (bugs de renderizado).

---

## 2. Implementación de Sistema de Ayuda Contextual (Tooltips)
**Problema original:** La interfaz carecía de explicaciones en pantalla para funciones específicas, obligando al usuario a adivinar el propósito de ciertos botones o métricas.

**Modificación realizada:** 
- Se desarrolló e integró un componente global de **Tooltip**.
- Este componente muestra pequeñas etiquetas informativas flotantes cuando el usuario pasa el cursor sobre elementos interactivos complejos, mejorando la curva de aprendizaje del sistema.

**Heurística de UX aplicada:** 
- *Ayuda y documentación:* Proveer información en el momento exacto en que el usuario la necesita.
- *Reconocer en lugar de recordar:* El usuario no necesita memorizar para qué sirve cada botón; el sistema se lo recuerda visualmente.

---

## 3. Prevención y Recuperación de Errores (Página 404 Personalizada)
**Problema original:** Navegar a una ruta inexistente o con errores de tipeo en la URL podía resultar en una pantalla en blanco o colapsar el flujo de navegación de la aplicación (el llamado "callejón sin salida").

**Modificación realizada:** 
- Se creó una **Pantalla 404 (Not Found)** con un diseño amigable utilizando la estética *Glassmorphism*.
- Incluye un mensaje claro y no técnico, acompañado de un botón principal y visible para "Volver al Inicio" (Dashboard).

**Heurística de UX aplicada:** 
- *Ayudar a los usuarios a reconocer, diagnosticar y recuperarse de errores:* Los errores se expresan en lenguaje claro, indicando el problema y ofreciendo una solución inmediata (volver al inicio).

---

## 4. Aceleradores de Tareas (Atajos de Teclado Globales)
**Problema original:** Al ser un sistema de Punto de Venta (POS) y gestión de inventario, los usuarios recurrentes perdían mucho tiempo utilizando exclusivamente el ratón para tareas repetitivas como buscar o agregar nuevos registros.

**Modificación realizada:** 
- Se implementó un *Hook Global* en React (`useGlobalShortcuts`) que escucha eventos de teclado en toda la aplicación.
- Se agregaron los siguientes atajos:
  - **`F2`**: Enfoca automáticamente la barra de búsqueda en cualquier tabla de datos (optimizado con selectores robustos para soportar cualquier pantalla del sistema).
  - **`Alt + N`**: Abre directamente el modal para crear un "Nuevo Registro" dependiendo de la pantalla activa. Se implementó exitosamente en las pantallas principales de gestión: **Productos, Clientes, Empleados, Categorías y Proveedores**.

**Heurística de UX aplicada:** 
- *Flexibilidad y eficiencia de uso:* Se integraron "aceleradores" que no son vistos por los usuarios novatos, pero que permiten a los usuarios expertos navegar e interactuar de forma mucho más rápida.

---

## 5. Sistema de "Deshacer" (Eliminación Optimista)
**Problema original:** Para evitar eliminaciones accidentales de productos o clientes, el sistema utilizaba ventanas de alerta intrusivas (`window.confirm`) que bloqueaban la pantalla y requerían confirmación constante, ralentizando el flujo de trabajo.

**Modificación realizada:** 
- Se reemplazaron las alertas bloqueantes por un **sistema de eliminación optimista**.
- Al eliminar un registro, este desaparece *instantáneamente* de la vista del usuario. 
- Inmediatamente aparece una notificación sutil (Toast) en la esquina inferior con un botón de **Deshacer** que dura 5 segundos. 
- Si el usuario cometió un error, puede restaurar el dato con un clic; si no hace nada, la eliminación se confirma en la base de datos de forma silenciosa.

**Heurística de UX aplicada:** 
- *Control y libertad del usuario:* Se ofrecen "salidas de emergencia" (Deshacer) para que los usuarios puedan revertir acciones por error sin tener que pasar por diálogos de confirmación lentos e intrusivos.

---
*Documento generado para entrega académica.*
