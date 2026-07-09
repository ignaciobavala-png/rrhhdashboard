# Sesión 2026-07-09: Auditorías de IA, notificaciones, vacaciones y producción

**Fecha:** 2026-07-09
**Alcance:** Asistente de IA, importación de Google Sheets, notificaciones de calendario/vacaciones, deshacer (undo) global, y auditoría de producción de Supabase.
**Commits de esta sesión:** `560e5c6` … `cb58a4f` (rama `main`)

---

## 1. Bug de fondo: alta de empleados/líneas desde Google Sheets

**Síntoma reportado:** Carolina Acuña estaba en el Google Sheet pero nunca apareció en Legajo ni generó su cumpleaños en el calendario.

**Causa raíz:** `importLegajo()` en `src/features/google-sheets/lib/import-engine.ts` insertaba empleados nuevos sin chequear el error de Supabase. La tabla `empleados` exige `empresa_id NOT NULL`, pero el importer nunca lo seteaba — el insert fallaba siempre para altas nuevas, y como el error no se revisaba, el sync igual reportaba "1 registro creado".

Mismo patrón de bug en `importLineasMoviles` (líneas de celulares nuevas tampoco se creaban nunca, aunque ahí sí se contaban como *skipped*).

**Fix:** `4f40447` — se agrega `empresa_id: 1` al insert y se verifica el error, contabilizando *skipped* en vez de *created* cuando falla. Carolina Acuña se insertó manualmente (id 886) para no esperar el próximo sync.

**Fixes previos relacionados** (misma raíz, sesión anterior): `560e5c6` (dejar de silenciar errores de import) y `b7d5846` (invalidar las query keys reales del dashboard tras sincronizar, ya que usaban claves que no existían: `['empleados']` en vez de `['legajo', ...]`, etc.).

---

## 2. Auditoría del Asistente de IA (`/dashboard/assistant`)

| # | Hallazgo | Severidad | Archivo | Fix |
|---|----------|-----------|---------|-----|
| 1 | `execute/route.ts` contaba `affected++` por iteración sin chequear si Supabase tocó alguna fila realmente — un `update`/`delete` sin match reportaba éxito sin cambiar nada | Alta | `src/app/api/ai/execute/route.ts` | ✅ `407b8a0` |
| 2 | Acciones de riesgo alto (update/delete masivo) se ejecutaban con el mismo botón que las de riesgo bajo, sin fricción extra | Alta | `src/features/ai-assistant/components/action-preview.tsx` | ✅ `407b8a0` — `ConfirmDialog` de segunda confirmación solo para `risk: 'high'` |
| 3 | Catches vacíos en el guardado de sesión/mensajes de chat (`chat-interface.tsx`, `session-list.tsx`) perdían la conversación en silencio si fallaba la persistencia | Media | `src/features/ai-assistant/components/{chat-interface,session-list}.tsx` | ✅ `407b8a0` — toast de aviso al fallar |

**Quedó pendiente** (no bloqueante, prioridad menor): prompt injection sin mitigación desde texto libre de sheets, sin límite de tokens/historial en `chat/route.ts`, stream sin `AbortController` al cambiar de sesión, badge de riesgo sin fallback si el modelo omite `risk`.

---

## 3. Notificaciones: eventos de calendario nunca notificaban

**Síntoma reportado:** dudas sobre si el calendario realmente dispara notificaciones, y si el botón de deshacer está en todas las acciones.

**Causa raíz:** las tablas `eventos_calendario` (estudio/ausencia/mudanza) y `vacaciones` **no tenían el trigger `notify_*`** que sí tienen `empleados`/`reuniones`/`manuales`/`flota_laptops`/`lineas_moviles`/`puestos`. Confirmado con `information_schema.triggers`: solo tenían `set_updated_at`.

**Fix:** `174ec80` — migración `20260709_00006_notificar_calendario.sql`:
- Se agregan triggers `notify_eventos_calendario` y `notify_vacaciones` (AFTER INSERT/UPDATE/DELETE).
- Se extiende `log_change()` con casos específicos para ambas tablas (tipo, empleado, fecha en vez del fallback genérico).
- Probado en vivo: insert de prueba generó *"Nuevo evento de calendario (estudio): ACUÑA, Carolina — 01/08/2026"*.

---

## 4. Bug de fondo: `registrar_vacaciones()` nunca funcionó

Al construir el "deshacer" de vacaciones se detectó que la función RPC fallaba **siempre**, en cualquier llamada:

```
ERROR: 42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification
```

**Causa:** el `ON CONFLICT (vacaciones_id, mes)` de `registrar_vacaciones()` no coincidía con ninguna constraint real — la única existente es `vacaciones_dias_vac_anio_mes_key` sobre `(vacaciones_id, anio_uso, mes)`. Postgres rechaza el plan de la consulta en cualquier ejecución, no solo cuando hay un conflicto real. Esto explica por qué `vacaciones`/`vacaciones_dias` estaban vacías (0 filas) pese a que la UI de registro existe hace semanas.

**Fix:** `cb58a4f` — migración `20260709_00008_fix_registrar_vacaciones_conflict.sql`, corrige el `ON CONFLICT` a `(vacaciones_id, anio_uso, mes)`. Probado en vivo: registro exitoso (5 días, empleado 886).

---

## 5. Deshacer (undo) — cobertura global a 15 segundos

Se generalizó `showUndoToast()` (`src/lib/undo-toast.ts`) de 10s → **15s**, y se extendió a todas las mutaciones donde tiene sentido semántico:

| Sección | Acción | Mecanismo de undo | Commit |
|---|---|---|---|
| Payroll | Guardar sueldo | Revierte al valor anterior o borra si era nuevo | `3f35ccd` |
| Documentos / Manuales | Eliminar archivo | Soft-delete: la purga real del storage se difiere 15s | `3f35ccd` |
| Calendario | Crear/editar/eliminar evento | `crearEvento`/`actualizarEvento`/`eliminarEvento` con reconstrucción del estado anterior | `174ec80` |
| Calendario | Registrar vacaciones | Nueva función `revertir_vacaciones()` — reversa exacta por mes, no un simple borrado (ver §6) | `cb58a4f` |
| Google Sheets | Agregar fila manual | Soft-delete de la fila (`deleteSheetRow`) | `cb58a4f` |
| Google Sheets | Conectar sheet nuevo | Elimina la conexión (`deleteGoogleSheet`) | `cb58a4f` |
| Google Sheets | Eliminar sheet | Recrea la conexión y re-sincroniza (seguro: todas las FK son `ON DELETE CASCADE`) | `cb58a4f` |
| Notificaciones | "Marcar todo como leído" | Vuelve a marcar como no leídas solo las que estaban no leídas antes del click | `cb58a4f` |

**Deliberadamente sin undo** (decisión, no olvido):
- **Cambio de PIN**: un botón de "deshacer" visible 15s después de cambiar el PIN es un riesgo de seguridad (alguien mirando la pantalla podría revertirlo).
- **Sincronizaciones completas de Google Sheets**: no son una operación atómica — revertir un resync de decenas de filas en varias tablas arriesga dejar datos a medio importar.
- **Edición de celdas inline en la grilla de sheets**: se evaluó y se descartó por ahora para no volver ruidoso un flujo tipo Excel (click-y-escribís).

---

## 6. Por qué el undo de vacaciones necesitó una función propia

A diferencia del resto (donde undo = borrar lo creado), `registrar_vacaciones()` **acumula sobre filas existentes** en vez de crear una fila nueva por registro: si un empleado ya tiene vacaciones cargadas ese año/mes, el nuevo registro se **suma** al total en vez de crear una fila aparte.

Un undo naive (borrar/poner en cero la fila) borraría también días de otros registros legítimos acumulados en el mismo mes. `revertir_vacaciones()` resuelve esto recalculando exactamente los mismos días-por-mes que sumó el registro original y restándolos puntualmente — verificado con un caso de dos registros de 5 días en el mismo mes: revertir uno solo dejó el acumulado en 10 (no en 0), sin afectar el otro.

---

## 7. Auditoría de producción de Supabase

Migración `20260709_00005_auditoria_produccion.sql` (`9913b19`):

| Hallazgo | Fix |
|---|---|
| 6 funciones sin `search_path` fijo (`get_vacaciones_calendario`, `get_eventos_calendario`, `registrar_vacaciones`, `trigger_set_updated_at`, `update_ai_session_timestamp`, `log_change`) — riesgo de schema injection | `ALTER FUNCTION ... SET search_path = public, pg_temp` |
| Buckets públicos `expedientes`/`manuales` permitían **listar** todos los archivos vía API (no solo acceder por URL directa) | Se elimina la policy de `SELECT` sobre `storage.objects` — el acceso por URL pública no la necesita |
| ~~Tabla `app_config`: RLS habilitada sin ninguna policy, 0 filas, sin ninguna referencia en el código~~ | ~~`DROP TABLE`~~ — **ERROR, ver incidente §7.1 abajo** |
| 12 tablas con policy `_select` redundante además de `_write` (`ALL`, `using(true)`) que ya cubre lectura | Se consolidan; se alinean antes `vacaciones`/`vacaciones_dias` al patrón `anon+authenticated` para no perder acceso de `anon` |
| 5 foreign keys sin índice (`documentos_empleados.empresa_id`, `lineas_moviles.empleado_id`, `sheet_sections.{sheet_id,sync_id}`, `sheet_syncs.sheet_id`) | `CREATE INDEX` |

Verificado con `get_advisors` antes y después — sin regresiones sobre la línea base ya aceptada (RLS permisiva por decisión de producto, ver `project_rrhh_auth_decision` en memoria).

### 7.1. Incidente: `app_config` sí estaba en uso — login roto y restaurado

La conclusión de "tabla huérfana" de la tabla de arriba fue un **error de diagnóstico**. `app_config` es donde `verify_pin()`/`change_pin()` guardan el hash bcrypt del PIN de acceso (`key='pin_hash'`) y el estado de intentos fallidos (`key='pin_state'`) — accedida solo desde SQL dentro de esas funciones `SECURITY DEFINER`, por eso un grep sobre el código TypeScript no la encontró. El `DROP TABLE` de la migración `20260709_00005` **rompió el login del dashboard en producción** (el endpoint devolvía un error crudo `relation "app_config" does not exist`).

**Resolución** (migración `20260709_00009_restaurar_app_config.sql`):
1. Se reconstruyó el schema de `app_config` a partir de los cuerpos de `verify_pin`/`change_pin` (tampoco existía una migración local que la creara originalmente — era otro caso de drift, aplicada directo a producción en su momento).
2. El hash del PIN anterior **no era recuperable** (bcrypt de un solo sentido, sin backup previo al drop) — se generó y sembró un PIN nuevo con el usuario.
3. Verificado en vivo con `select verify_pin('...')` antes de dar el incidente por cerrado.
4. `get_advisors` post-fix confirma que quedó exactamente en el mismo estado original (RLS habilitada, sin policies — acceso solo vía las funciones `SECURITY DEFINER`, ese es el diseño correcto, no un descuido).

**Lección aplicada**: antes de dropear cualquier tabla en producción, no alcanza con grepear el código de la app — hay que revisar también si algún trigger o función `SECURITY DEFINER` la referencia (`select pg_get_functiondef(oid) from pg_proc where prosrc ilike '%nombre_tabla%'`), y confirmar el conteo real de filas con una query directa, no asumirlo.

---

## 8. Otros cambios menores de la sesión

- **Sidebar**: se elimina el botón de avatar "CN" (dropdown sin acciones útiles tras quitar Perfil/Notificaciones duplicadas). `30fe087`
- **Expediente Digital**: sección `/dashboard/documents` construida desde cero (antes era un placeholder sin bucket ni backend). `48c1bf6`
- **Flota**: celulares y laptops ahora reordenables con botones subir/bajar. `7f3f6cc`
- **Calendario**: botón "Nuevo evento" renombrado a "Nuevo", selector de las 6 categorías, fecha editable al cargar estudio/ausencia/mudanza. `e108f8f`

---

## Pendientes para una próxima sesión

1. **Fuente de verdad Sheets → Dashboard**: el sync de Google Sheets sobreescribe sin condición los campos de un empleado que matchee por DNI/nombre en cada sincronización. Falta decidir el mecanismo (`dashboard_locked` por fila, o cortar el sync de escritura en una fecha) para que una edición manual futura no se pierda en el próximo sync.
2. **AI Assistant** (severidad menor, ver §2): prompt injection, límite de tokens/historial, `AbortController` del stream, fallback del badge de riesgo.
3. **Backups**: confirmar en el dashboard de Supabase (Settings → Database → Backups) si el plan actual tiene PITR o solo backups diarios, y la retención — no verificable desde las herramientas de este agente.
