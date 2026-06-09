# People — `/dashboard/people`

> **Estado:** ✅ Datos reales — Supabase conectado
> **Archivos:** `src/features/people/`, `src/features/reuniones/`, `src/features/manuales/`
> **Rutas:** `/dashboard/people` + sub-rutas `/new`, `/[id]`, `/reuniones`, `/manuales`

---

## Descripción

Módulo agrupador "People" que consolida:
- Listado de empleados + formulario nuevo empleado
- Detalle individual de empleado
- Sub-módulos: Reuniones y Manuales (cada uno en su propia feature)

---

## Rutas

| Ruta | Feature | Contenido |
|------|---------|-----------|
| `/dashboard/people` | `people` | Listado empleados (alternativo a `/legajo`) |
| `/dashboard/people/new` | `legajo` | Formulario nuevo empleado |
| `/dashboard/people/[id]` | `legajo` | Detalle empleado (vista alternativa) |
| `/dashboard/people/reuniones` | `reuniones` | Minutas de reuniones |
| `/dashboard/people/manuales` | `manuales` | Repositorio de manuales |

---

## Listado Actual

### People Listing (`people/components/people-listing.tsx`)

Server Component que muestra un listado simplificado de empleados. Es un entrypoint alternativo al Legajo completo.

---

## Formulario Nuevo Empleado (`/dashboard/people/new`)

Formulario completo para crear un empleado nuevo. Campos:

| Sección | Campos |
|---------|--------|
| **Datos Personales** | Nombre, DNI, Fecha Nacimiento, Email, Teléfono |
| **Datos Laborales** | Equipo, Puesto, Fecha Ingreso, Modalidad |
| **Contacto Emergencia** | Nombre, Teléfono |
| **Ubicación** | Dirección, Movilidad |

Flujo:
1. Formulario con validación (Zod schemas)
2. Submit → insert en `empleados` via Supabase
3. Toast de éxito + redirect al listado

---

## Redirecciones (next.config.ts)

```typescript
{ source: '/dashboard/talent', destination: '/dashboard/people', permanent: true },
{ source: '/dashboard/talent/:path*', destination: '/dashboard/people/:path*', permanent: true },
{ source: '/dashboard/reuniones', destination: '/dashboard/people/reuniones', permanent: true },
{ source: '/dashboard/manuales', destination: '/dashboard/people/manuales', permanent: true },
```

---

## Estructura de Archivos

```
src/features/people/
└── components/
    └── people-listing.tsx      # Server: listado simplificado empleados

src/app/dashboard/people/
├── page.tsx                    # Listado people
├── new/
│   └── page.tsx                # Formulario nuevo empleado
├── [id]/
│   └── page.tsx                # Detalle empleado
├── reuniones/
│   └── page.tsx                # → ver docs/features/reuniones.md
└── manuales/
    └── page.tsx                # → ver docs/features/manuales.md
```

---

## Relación con Legajo

El módulo `people` y `legajo` comparten los mismos datos y queries de Supabase (misma tabla `empleados`). La separación es solo de navegación:

- **`/dashboard/legajo`**: Vista de datos tabular completa con edición inline
- **`/dashboard/people`**: Vista lista simplificada, formulario nuevo, sub-módulos agrupados

Ambos usan `src/features/legajo/api/service.ts` para las queries de empleados.

---

## Estados

| Estado | UI |
|--------|-----|
| **Listado loading** | Skeleton DataTable |
| **Nuevo empleado** | Form con validación en tiempo real |
| **Loading submit** | Botón deshabilitado + spinner |
| **Éxito creación** | Toast verde + redirect a listado |
| **Error validación** | Errores inline debajo de cada campo |
| **Error API** | Toast rojo "Error al crear empleado" |