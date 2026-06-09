# Expediente Digital — `/dashboard/documents`

> **Estado:** 🔲 Placeholder — sin implementar

---

## Descripción

Módulo de expediente digital. UI estática sin datos ni conexión a Supabase. Placeholder para futura implementación.

---

## Estado Actual

**Pantalla estática** con mensaje "Sin información disponible aún" o similar. No tiene queries, no tiene componentes de datos.

---

## Archivos

```
src/features/documents/         # Vacío o placeholder
src/app/dashboard/documents/
└── page.tsx                    # Página placeholder estática
```

---

## Implementación Futura

Pendiente de definición. Posibles funcionalidades:
- Digitalización de legajos físicos
- Firma digital de documentos
- Historial de versiones de documentos
- Carga de archivos (similar a manuales, bucket separado `documentos` en Supabase Storage)
- Búsqueda full-text

---

## Tablas Requeridas (no creadas)

| Tabla | Propósito |
|-------|-----------|
| `documentos` | Metadata: título, tipo, estado, fecha, storage_path |
| `documentos_empleados` | Asignación documento ↔ empleado |

---

## Integración con Otros Módulos

- **Empleados:** Asociar documentos al legajo del empleado
- **Manuales:** Mismo patrón de Storage (bucket separado)
- **Notificaciones:** Trigger para registrar subida/edición de documentos