# Control Operativo — `/dashboard/operations`

> **Estado:** 🔲 Placeholder — sin implementar

---

## Descripción

Módulo de control operativo. UI estática sin datos ni conexión a Supabase. Placeholder para futura implementación.

---

## Estado Actual

**Pantalla estática** con mensaje "Sin información disponible aún" o similar. No tiene queries, no tiene componentes de datos.

---

## Archivos

```
src/features/operations/       # Vacío o placeholder
src/app/dashboard/operations/
└── page.tsx                    # Página placeholder estática
```

---

## Implementación Futura

Pendiente de definición. Posibles funcionalidades:
- Control horario / fichajes
- Gestión de turnos y guardias
- Asistencia y ausentismo
- Reportes de horas trabajadas
- Dashboard de métricas operativas (horas extras, ausencias, rotación)

---

## Tablas Requeridas (no creadas)

| Tabla | Propósito |
|-------|-----------|
| `fichajes` | Registro entrada/salida por empleado + día |
| `turnos` | Definición de turnos (mañana, tarde, noche) |
| `asignaciones_turno` | Empleado ↔ turno (por período) |
| `ausencias` | Registro de ausencias con motivo |

---

## Integración con Otros Módulos

- **Empleados:** Cada fichaje/ausencia vinculado al empleado
- **Calendario:** Eventos de ausencias visibles en el calendario
- **Sueldos:** Cálculo de horas extras impacta en payroll
- **Notificaciones:** Fichajes fuera de horario, ausencias sin aviso