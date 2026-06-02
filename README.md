# GECI-VA — Sistema Web de Gestión del Comando de Incidentes

**Coordinación de Protección Civil y Bomberos de Metepec**
Víctor Andrés Villanueva Castañeda — ES202111227

---

## Estructura de archivos

```
GECI-VA/
├── index.html          → Inicio de sesión
├── dashboard.html      → Panel principal con métricas y módulos
├── incidente.html      → Registro del incidente
├── comando.html        → Estructura SCI con organigrama en vivo
├── operaciones.html    → Asignación de recursos y tareas (tabla dinámica)
├── planeacion.html     → Plan de acción del incidente
├── logistica.html      → Inventario de recursos y apoyo al personal
├── bitacora.html       → Registro cronológico tipo timeline
├── cierre.html         → Informe final, checklist y validación
│
├── css/
│   ├── base.css        → Variables globales, header, nav, footer, animaciones
│   ├── dashboard.css   → Cards, métricas, grid de módulos
│   ├── formularios.css → Inputs, fieldsets, botones, tablas
│   └── index.css       → Pantalla de login
│
└── img/
    ├── pc_metepec.png  → Logo Protección Civil Metepec
    └── bomberos.png    → Logo Bomberos Metepec
```

---

## Cómo usar

1. Coloca los logos institucionales en la carpeta `img/`:
   - `pc_metepec.png`
   - `bomberos.png`

2. Abre `index.html` en cualquier navegador moderno (Chrome, Firefox, Edge).

3. Navega con el menú superior a cada módulo.

---

## Novedades del rediseño

| Característica         | Descripción |
|------------------------|-------------|
| **Tema operacional**   | Dark mode institucional, paleta rojo/gris oscuro inspirada en centros de mando reales |
| **Tipografía**         | Rajdhani (títulos/display) + IBM Plex Sans (cuerpo) + IBM Plex Mono (datos/horas) |
| **CSS Variables**      | Todo personalizable desde `:root` en `base.css` |
| **Animaciones**        | Entrada escalonada en cada página, transiciones suaves |
| **Header fijo**        | Sticky con indicador de estado del sistema (en línea / activo / cerrado) |
| **Nav mejorado**       | Sin duplicados, con íconos, item activo resaltado |
| **Dashboard**          | Cronómetro en tiempo real del incidente, métricas visuales, acceso rápido a módulos |
| **Incidente**          | Selector visual de nivel de emergencia (Bajo/Medio/Alto) con colores semafóricos |
| **Comando**            | Organigrama SCI que se actualiza en tiempo real al escribir los nombres |
| **Operaciones**        | Tabla dinámica de tareas con badges de estado y prioridad, eliminación por fila |
| **Logística**          | Inventario con categorías agrupadas y tabla dinámica |
| **Bitácora**           | Timeline cronológico con código de color por área y registro más reciente primero |
| **Cierre**             | Checklist interactivo con barra de progreso, alerta al completar todos los puntos |
| **Toast de éxito**     | Notificación flotante en todos los formularios al guardar |
| **Validación visual**  | Campos obligatorios marcados, error resaltado en rojo, limpieza automática al corregir |
| **Responsivo**         | Adaptable a tablets y móviles en todos los módulos |

---

## Variables de color (base.css)

Para cambiar la paleta, edita solo estas líneas en `css/base.css`:

```css
:root {
  --color-primary:      #e03030;   /* Rojo institucional */
  --color-primary-dark: #b01e1e;
  --color-bg:           #0d0f14;   /* Fondo principal */
  --color-surface:      #151820;   /* Cards / paneles */
  --color-green:        #27c97a;   /* Estado: activo / ok */
  --color-amber:        #f5a623;   /* Estado: alerta */
  --color-blue:         #3d8ef0;   /* Métricas / énfasis */
}
```
