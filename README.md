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
