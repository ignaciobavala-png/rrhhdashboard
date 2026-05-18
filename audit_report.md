# ============================================================
# AUDIT REPORT: Supabase DB vs Excel Data
# Generated: 2026-05-15T02:03:13.949475
# ============================================================

## PART 1: SUPABASE DATABASE STATE

### empleados
  Row count: 22
  Columns (16): ['id', 'empresa_id', 'nombre_apellido', 'activo', 'fecha_nacimiento', 'dni', 'celular', 'contacto_emergencia', 'equipo_ingreso', 'fecha_ingreso', 'email', 'direccion', 'movilidad', 'modalidad', 'created_at', 'updated_at']
  No all-null columns found.
  Sample rows:
    id: 1
    empresa_id: 1
    nombre_apellido: LIDERMAN, Stephanie
    activo: True
    fecha_nacimiento: 1991-02-10
    dni: 36527776
    celular: 1131537856
    contacto_emergencia: 1131535679 I Sonia Madre
    equipo_ingreso: Direccion
    fecha_ingreso: 2024-07-15
    email: slidermancontexto@gmail.com
    direccion: Charcas 3480 1ero "B" (CABA)
    movilidad: NULL
    modalidad: presencial
    created_at: 2026-05-11T02:31:03.541333+00:00
    updated_at: 2026-05-11T02:31:03.541333+00:00
    ---
    id: 2
    empresa_id: 1
    nombre_apellido: STRANO, Brian
    activo: True
    fecha_nacimiento: 1994-05-08
    dni: 38464406
    celular: 1167217873
    contacto_emergencia: 1167622650 I Pablo Padre
    equipo_ingreso: Fiananzas
    fecha_ingreso: 2023-09-01
    email: bstrano@contextoinvestments.com.ar
    direccion: Fray Cayetano Rodriguez 970 1ro "D" (CABA)
    movilidad: NULL
    modalidad: presencial
    created_at: 2026-05-11T02:31:03.541333+00:00
    updated_at: 2026-05-11T02:31:03.541333+00:00

### home_office_semanal
  Row count: 55
  Columns (7): ['id', 'empleado_id', 'dia_semana', 'modalidad', 'fecha_desde', 'fecha_hasta', 'created_at']
  ⚠️  ALL-NULL COLUMNS: ['fecha_hasta']
  Sample rows:
    id: 1
    empleado_id: 5
    dia_semana: lu
    modalidad: Presencial
    fecha_desde: 2026-05-11
    fecha_hasta: NULL
    created_at: 2026-05-11T02:34:12.058792+00:00
    ---
    id: 2
    empleado_id: 5
    dia_semana: ma
    modalidad: Presencial
    fecha_desde: 2026-05-11
    fecha_hasta: NULL
    created_at: 2026-05-11T02:34:12.058792+00:00

### vacaciones
  Row count: 23
  Columns (7): ['id', 'empleado_id', 'anio', 'saldo_inicial', 'dias_correspondientes', 'saldo_actual', 'created_at']
  No all-null columns found.
  Sample rows:
    id: 1
    empleado_id: 5
    anio: 2025
    saldo_inicial: 2.0
    dias_correspondientes: 10
    saldo_actual: 0.0
    created_at: 2026-05-11T02:37:43.326885+00:00
    ---
    id: 2
    empleado_id: 15
    anio: 2025
    saldo_inicial: 0.0
    dias_correspondientes: 10
    saldo_actual: 5.0
    created_at: 2026-05-11T02:37:43.326885+00:00

### vacaciones_dias
  Row count: 36
  Columns (8): ['id', 'vacaciones_id', 'mes', 'dias_usados', 'created_at', 'anio_uso', 'fecha_inicio', 'fecha_fin']
  No all-null columns found.
  Sample rows:
    id: 11
    vacaciones_id: 12
    mes: 10
    dias_usados: 4.0
    created_at: 2026-05-11T04:27:11.269392+00:00
    anio_uso: 2024
    fecha_inicio: NULL
    fecha_fin: NULL
    ---
    id: 22
    vacaciones_id: 17
    mes: 10
    dias_usados: 5.0
    created_at: 2026-05-11T04:27:23.728791+00:00
    anio_uso: 2025
    fecha_inicio: NULL
    fecha_fin: NULL

### lineas_moviles
  Row count: 7
  Columns (9): ['id', 'empleado_id', 'empresa_id', 'numero', 'rol', 'usuario', 'equipo', 'estado', 'created_at']
  ⚠️  ALL-NULL COLUMNS: ['empleado_id']
  Sample rows:
    id: 1
    empleado_id: NULL
    empresa_id: 1
    numero: 1123117902
    rol: Asesoramiento 3
    usuario: HE, Ig
    equipo: Samsung Galaxy A04
    estado: asignado
    created_at: 2026-05-11T02:39:19.52893+00:00
    ---
    id: 2
    empleado_id: NULL
    empresa_id: 1
    numero: 1123468236
    rol: Asesoramiento 4
    usuario: TO, Ma
    equipo: Motorola G06
    estado: asignado
    created_at: 2026-05-11T02:39:19.52893+00:00

### sueldos
  Row count: 263
  Columns (9): ['id', 'empleado_id', 'empresa_id', 'moneda', 'mes', 'anio', 'monto', 'bono_anual', 'created_at']
  ⚠️  ALL-NULL COLUMNS: ['bono_anual']
  Sample rows:
    id: 404
    empleado_id: 15
    empresa_id: 1
    moneda: PESOS ARG
    mes: 1
    anio: 2023
    monto: 200000.0
    bono_anual: NULL
    created_at: 2026-05-11T04:04:53.915712+00:00
    ---
    id: 405
    empleado_id: 15
    empresa_id: 1
    moneda: PESOS ARG
    mes: 2
    anio: 2023
    monto: 200000.0
    bono_anual: NULL
    created_at: 2026-05-11T04:04:53.915712+00:00

### manuales
  Row count: 50
  Columns (7): ['id', 'empresa_id', 'tarea', 'link_manual', 'area', 'created_at', 'updated_at']
  No all-null columns found.
  Sample rows:
    id: 1
    empresa_id: 1
    tarea: Apertura Fisica en Balanz BCI (Panamá).
    link_manual: APERTURA FISICA BALANZ BCI
    area: Comercial
    created_at: 2026-05-11T02:41:51.652391+00:00
    updated_at: 2026-05-11T02:41:51.652391+00:00
    ---
    id: 2
    empresa_id: 1
    tarea: Apertura Juridica en Balanz BCI (Panamá).
    link_manual: APERTURA JURIDICA BALANZ BCI
    area: Comercial
    created_at: 2026-05-11T02:41:51.652391+00:00
    updated_at: 2026-05-11T02:41:51.652391+00:00

### eventos_calendario
  Row count: 0
  No data returned (empty table or RLS blocked).


## PART 2: EXCEL RAW DATA

### 📄 Legajo Colaboradores.xlsx
  Sheets: ['Legajo', 'HO', 'Vacaciones 2025', 'Regalos cumples!', 'Nombre puestos', 'Lineas Móviles', 'Vacaciones', 'Insumos Vajilla', 'Mails']

  Sheet: **Legajo**
    Rows: 22
    Columns: ['Nombre & Apellido', 'Activo', 'Fecha de Nacimiento', 'DNI', 'Celular', 'Contacto Emergencia', 'Equipo ingreso', 'Fecha de Ingreso', 'Mail Contexto', 'Dirección', 'Movilidad', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_26']
    ⚠️  ALL-NULL COLUMNS in Excel: ['col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_26']
    Sample rows:
      Nombre & Apellido: LIDERMAN, Stephanie
      Activo: SI 
      Fecha de Nacimiento: 1991-02-10T00:00:00
      DNI: 36527776.0
      Celular: 1131537856.0
      Contacto Emergencia: 1131535679 I Sonia Madre
      Equipo ingreso: Direccion
      Fecha de Ingreso: 15/07/2024
      Mail Contexto: slidermancontexto@gmail.com
      Dirección: Charcas 3480 1ero "B" (CABA)
      Movilidad: NULL
      col_11: NULL
      col_12: NULL
      col_13: NULL
      col_14: NULL
      col_15: NULL
      col_16: NULL
      col_17: NULL
      col_18: NULL
      col_19: NULL
      col_20: NULL
      col_21: NULL
      col_22: NULL
      col_23: NULL
      col_24: NULL
      col_25: NULL
      col_26: NULL
      ---
      Nombre & Apellido: STRANO, Brian
      Activo: SI 
      Fecha de Nacimiento: 1994-05-08T00:00:00
      DNI: 38464406.0
      Celular: 1167217873.0
      Contacto Emergencia: 1167622650 I Pablo Padre
      Equipo ingreso: Fiananzas
      Fecha de Ingreso: 2023-09-01T00:00:00
      Mail Contexto: bstrano@contextoinvestments.com.ar
      Dirección: Fray Cayetano Rodriguez 970 1ro "D" (CABA)
      Movilidad: NULL
      col_11: NULL
      col_12: NULL
      col_13: NULL
      col_14: NULL
      col_15: NULL
      col_16: NULL
      col_17: NULL
      col_18: NULL
      col_19: NULL
      col_20: NULL
      col_21: NULL
      col_22: NULL
      col_23: NULL
      col_24: NULL
      col_25: NULL
      col_26: NULL


  Sheet: **HO**
    Rows: 986
    Columns: ['Nombre & Apellido', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'col_6', 'col_7', 'col_8', 'col_9', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25']
    ⚠️  ALL-NULL COLUMNS in Excel: ['col_6', 'col_7', 'col_8', 'col_9', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25']
    Sample rows:
      Nombre & Apellido: BANDIERI, Mariano
      Lu: Presencial
      Ma: Presencial
      Mi: Presencial
      Ju: Presencial
      Vi: Remoto
      col_6: NULL
      col_7: NULL
      col_8: NULL
      col_9: NULL
      col_10: NULL
      col_11: NULL
      col_12: NULL
      col_13: NULL
      col_14: NULL
      col_15: NULL
      col_16: NULL
      col_17: NULL
      col_18: NULL
      col_19: NULL
      col_20: NULL
      col_21: NULL
      col_22: NULL
      col_23: NULL
      col_24: NULL
      col_25: NULL
      ---
      Nombre & Apellido: TEJERINA, Franco
      Lu: Presencial
      Ma: Presencial
      Mi: Presencial
      Ju: Presencial
      Vi: Remoto
      col_6: NULL
      col_7: NULL
      col_8: NULL
      col_9: NULL
      col_10: NULL
      col_11: NULL
      col_12: NULL
      col_13: NULL
      col_14: NULL
      col_15: NULL
      col_16: NULL
      col_17: NULL
      col_18: NULL
      col_19: NULL
      col_20: NULL
      col_21: NULL
      col_22: NULL
      col_23: NULL
      col_24: NULL
      col_25: NULL


  Sheet: **Vacaciones 2025**
    Rows: 975
    Columns: ['col_0', 'Saldo', 'QDIAS25', 'SALDO', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_26', 'col_27', 'col_28']
    ⚠️  ALL-NULL COLUMNS in Excel: ['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_26', 'col_27', 'col_28']
    Sample rows:
      col_0: BANDIERI, Mariano
      Saldo: 2.0
      QDIAS25: 10.0
      SALDO: 0
      Ene: NULL
      Feb: NULL
      Mar: NULL
      Abr: NULL
      May: 10.0
      Jun: NULL
      Jul: NULL
      Ago: NULL
      Sep: NULL
      Oct: NULL
      Nov: NULL
      Dic: NULL
      col_16: NULL
      col_17: NULL
      col_18: NULL
      col_19: NULL
      col_20: NULL
      col_21: NULL
      col_22: NULL
      col_23: NULL
      col_24: NULL
      col_25: NULL
      col_26: NULL
      col_27: NULL
      col_28: NULL
      ---
      col_0: COSCIONE, Jonathan
      Saldo: 0.0
      QDIAS25: 10.0
      SALDO: 5
      Ene: NULL
      Feb: 5.0
      Mar: NULL
      Abr: NULL
      May: NULL
      Jun: NULL
      Jul: NULL
      Ago: NULL
      Sep: NULL
      Oct: NULL
      Nov: NULL
      Dic: NULL
      col_16: NULL
      col_17: NULL
      col_18: NULL
      col_19: NULL
      col_20: NULL
      col_21: NULL
      col_22: NULL
      col_23: NULL
      col_24: NULL
      col_25: NULL
      col_26: NULL
      col_27: NULL
      col_28: NULL


  Sheet: **Regalos cumples!**
    Rows: 999
    Columns: ['Presupuesto USD250', 'col_1', 'col_2', 'col_3', 'col_4', 'col_5', 'col_6', 'col_7', 'col_8', 'col_9', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25']
    ⚠️  ALL-NULL COLUMNS in Excel: ['col_3', 'col_4', 'col_5', 'col_6', 'col_7', 'col_8', 'col_9', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25']
    Sample rows:
      Presupuesto USD250: Enero 8
      col_1: Franco 
      col_2: 28000.0
      col_3: NULL
      col_4: NULL
      col_5: NULL
      col_6: NULL
      col_7: NULL
      col_8: NULL
      col_9: NULL
      col_10: NULL
      col_11: NULL
      col_12: NULL
      col_13: NULL
      col_14: NULL
      col_15: NULL
      col_16: NULL
      col_17: NULL
      col_18: NULL
      col_19: NULL
      col_20: NULL
      col_21: NULL
      col_22: NULL
      col_23: NULL
      col_24: NULL
      col_25: NULL
      ---
      Presupuesto USD250: Febrero 17
      col_1: Eliana
      col_2: 24000.0
      col_3: NULL
      col_4: NULL
      col_5: NULL
      col_6: NULL
      col_7: NULL
      col_8: NULL
      col_9: NULL
      col_10: NULL
      col_11: NULL
      col_12: NULL
      col_13: NULL
      col_14: NULL
      col_15: NULL
      col_16: NULL
      col_17: NULL
      col_18: NULL
      col_19: NULL
      col_20: NULL
      col_21: NULL
      col_22: NULL
      col_23: NULL
      col_24: NULL
      col_25: NULL


  Sheet: **Nombre puestos**
    Rows: 18
    Columns: ['Apellido y Nombre', 'Puesto de Trabajo']
    Sample rows:
      Apellido y Nombre: MARTINEZ, Valeria
      Puesto de Trabajo: Admin Analyst
      ---
      Apellido y Nombre: ROZEMBERG, Tomas
      Puesto de Trabajo: CEO


  Sheet: **Lineas Móviles**
    Rows: 8
    Columns: ['Lineas Movistar', 'col_1', 'col_2', 'col_3', 'col_4']
    ⚠️  ALL-NULL COLUMNS in Excel: ['col_4']
    Sample rows:
      Lineas Movistar: Número
      col_1: Rol
      col_2: Usuario
      col_3: Equipo
      col_4: NULL
      ---
      Lineas Movistar: 1123117902.0
      col_1: Asesoramiento 3
      col_2: HE, Ig
      col_3: Samsung Galaxy A04
      col_4: NULL


  Sheet: **Vacaciones**
    Rows: 982
    Columns: ['Periodo 2023 / Goce 2023 & 2024', 'col_1', 'col_2', 'col_3', 'col_4', 'col_5', 'col_6', 'col_7', 'col_8', 'col_9', 'col_10', 'col_11', 'col_12', 'col_13', 'Periodo 2024 / Goce 2024 & 2025', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_26', 'col_27', 'col_28', 'col_29', 'col_30']
    Sample rows:
      Periodo 2023 / Goce 2023 & 2024: NULL
      col_1: SALDO
      col_2: 2024-11-23T00:00:00
      col_3: Dic 24
      col_4: Ene 24
      col_5: 2024-02-24T00:00:00
      col_6: 2024-03-24T00:00:00
      col_7: Abr 24
      col_8: 2024-05-24T00:00:00
      col_9: 2024-06-24T00:00:00
      col_10: 2024-07-24T00:00:00
      col_11: Ago 24
      col_12: 2024-09-24T00:00:00
      col_13: 2024-10-24T00:00:00
      Periodo 2024 / Goce 2024 & 2025: SALDO
      col_15: Dias 2025
      col_16: 2024-11-24T00:00:00
      col_17: Dic 24
      col_18: Ene 25
      col_19: 2024-02-25T00:00:00
      col_20: 2024-03-25T00:00:00
      col_21: Abr 25
      col_22: 2024-05-25T00:00:00
      col_23: 2024-06-25T00:00:00
      col_24: 2024-07-25T00:00:00
      col_25: Ago 25
      col_26: 2025-09-25T00:00:00
      col_27: 2025-10-25T00:00:00
      col_28: 2025-11-25T00:00:00
      col_29: Dic 25
      col_30: Ene 25
      ---
      Periodo 2023 / Goce 2023 & 2024: BANDIERI, Mariano
      col_1: -7
      col_2: NULL
      col_3: NULL
      col_4: NULL
      col_5: NULL
      col_6: 21.0
      col_7: NULL
      col_8: NULL
      col_9: NULL
      col_10: NULL
      col_11: NULL
      col_12: NULL
      col_13: NULL
      Periodo 2024 / Goce 2024 & 2025: 2.0
      col_15: 2
      col_16: NULL
      col_17: NULL
      col_18: NULL
      col_19: 8.0
      col_20: NULL
      col_21: NULL
      col_22: NULL
      col_23: NULL
      col_24: NULL
      col_25: 8.0
      col_26: NULL
      col_27: NULL
      col_28: NULL
      col_29: NULL
      col_30: NULL


  Sheet: **Insumos Vajilla**
    Rows: 21
    Columns: []
    Sample rows:
      ---
      col_0: NULL
      col_1: NULL
      col_2: NULL
      Insumos Vajilla: ARTICULO


  Sheet: **Mails**
    Rows: 44
    Columns: ['Nombre y Apellido', 'User', 'Dominio', 'Mail', 'Mails GMAIL']
    Sample rows:
      Nombre y Apellido: NULL
      User: tomasr
      Dominio: contextoinvestments.com.ar
      Mail: tomasr@contextoinvestments.com.ar
      Mails GMAIL: trozemberg@gmail.com
      ---
      Nombre y Apellido: Tomas Rozemberg
      User: trozemberg
      Dominio: contextoinvestments.com.ar
      Mail: trozemberg@contextoinvestments.com.ar
      Mails GMAIL: trozemberg@gmail.com

### 📄 💰Sueldos Contexto.xlsx
  Sheets: ['Sueldos Contexto Investments 20', 'Beneficios', 'Pesos Arg', 'USD', 'Bonos Junio 2025', 'MarianBrian']

  Sheet: **Sueldos Contexto Investments 20**
    Rows: 25
    Columns: ['Nombre', 'Moneda', 'Enero', 'Bono 2025', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    ⚠️  ALL-NULL COLUMNS in Excel: ['Octubre', 'Noviembre', 'Diciembre']
    Sample rows:
      Nombre: Gemio Veronica 
      Moneda: PESOS ARG
      Enero: 1405000.0
      Bono 2025: 1475250
      Febrero: 1750000.0
      Marzo: 1750000.0
      Abril: 1750000.0
      Mayo: 1750000.0
      Junio: 1750000.0
      Julio: NULL
      Agosto: NULL
      Septiembre: NULL
      Octubre: NULL
      Noviembre: NULL
      Diciembre: NULL
      ---
      Nombre: Guardiola Fernanda 
      Moneda: PESOS ARG
      Enero: 1863000.0
      Bono 2025: 1397250.0
      Febrero: 2002725
      Marzo: 2002725.0
      Abril: 2002725.0
      Mayo: 2002725.0
      Junio: 2002725.0
      Julio: NULL
      Agosto: NULL
      Septiembre: NULL
      Octubre: NULL
      Noviembre: NULL
      Diciembre: NULL


  Sheet: **Beneficios**
    Rows: 8
    Columns: ['Esquema híbrido según corresponda']
    Sample rows:
      Esquema híbrido según corresponda: 10 Días hábiles de Vacaciones
      ---
      Esquema híbrido según corresponda: Extra 5 home office anuales


  Sheet: **Pesos Arg**
    Rows: 11
    Columns: ['col_0', '2023.0', 'col_2', 'col_3', 'col_4', 'col_5', 'col_6', 'col_7', 'col_8', 'col_9', 'col_10', 'col_11', 'col_12', '2024.0', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_26', 'col_27', 'col_28', '2025.0', 'col_30', 'col_31', 'col_32', 'col_33', 'col_34', 'col_35', 'col_36', 'col_37', 'col_38', 'col_39', 'col_40', 'col_41', 'col_42', 'col_43', 'col_44', 'col_45', 'col_46', 'col_47', 'col_48', 'col_49', 'col_50', 'col_51', 'col_52', 'col_53', 'col_54', 'col_55']
    Sample rows:
      col_0: Nombre
      2023.0: ene-23
      col_2: Feb-23
      col_3: Mar-23
      col_4: abr-23
      col_5: May-23
      col_6: Jun-23
      col_7: Jul-23
      col_8: ago-23
      col_9: sept-23
      col_10: Oct-23
      col_11: Nov-23
      col_12: dic-23
      2024.0: Ene-24
      col_14: Feb-24
      col_15: Mar-24
      col_16: abr-24
      col_17: May-24
      col_18: Jun-24
      col_19: Jul-24
      col_20: ago-24
      col_21: BONUS
      col_22: Sep-24
      col_23: Oct -24
      col_24: Nov-24
      col_25: Dic-24
      col_26: Redondeo
      col_27: Aguinaldo
      col_28: BONUS 2
      2025.0: Ene-25
      col_30: Feb-25
      col_31: Mar-25
      col_32: Abril-25
      col_33: May-25
      col_34: Jun-25
      col_35: BONO
      col_36: Jul-25
      col_37: BONO en cuotas
      col_38: Ago-25
      col_39: Sept25
      col_40: Oct25
      col_41: Nov-25
      col_42: Dic25
      col_43: BONO 2
      col_44: Ene26
      col_45: Feb26
      col_46: Mar26
      col_47: Abr26
      col_48: May26
      col_49: Jun26
      col_50: Jul26
      col_51: Ago26
      col_52: Sep26
      col_53: Oct26
      col_54: Nov26
      col_55: Dic26
      ---
      col_0: COSCIONE, Jonathan
      2023.0: 200000.0
      col_2: 200000.0
      col_3: 240000.0
      col_4: 240000.0
      col_5: 300000.0
      col_6: 320000.0
      col_7: 400000.0
      col_8: 400000.0
      col_9: 500000.0
      col_10: 500000.0
      col_11: 625000.0
      col_12: 625000.0
      2024.0: 625000.0
      col_14: 785000.0
      col_15: 1000000.0
      col_16: 1200000.0
      col_17: 1200000.0
      col_18: 1320000.0
      col_19: 1320000.0
      col_20: 1452000
      col_21: 1980000
      col_22: 1452000.0000000002
      col_23: 1452000.0000000002
      col_24: 1452000.0000000002
      col_25: 1597200
      col_26: 1600000.0
      col_27: 800000
      col_28: 2400000
      2025.0: 1600000.0
      col_30: 1600000
      col_31: 1712000
      col_32: 1712000.0
      col_33: 1712000.0
      col_34: 1797600.0
      col_35: No
      col_36: 1797600.0
      col_37: 0.0
      col_38: 1797600.0
      col_39: 1797600.0
      col_40: 1894670.4
      col_41: 1894670.4
      col_42: 1894670.4000000001
      col_43: 473667.6
      col_44: NULL
      col_45: NULL
      col_46: NULL
      col_47: NULL
      col_48: NULL
      col_49: NULL
      col_50: NULL
      col_51: NULL
      col_52: NULL
      col_53: NULL
      col_54: NULL
      col_55: NULL


  Sheet: **USD**
    Rows: 7
    Columns: ['col_0', 'col_1', 'col_2', 'col_3', 'col_4', 'col_5', 'col_6', 'col_7', 'col_8', 'col_9', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_26', 'col_27', 'col_28', 'col_29', 'col_30', 'col_31', 'col_32', 'col_33', 'col_34', 'col_35', 'col_36', 'col_37', 'col_38', 'col_39', 'col_40']
    Sample rows:
      col_0: NULL
      col_1: 2023.0
      col_2: NULL
      col_3: NULL
      col_4: NULL
      col_5: NULL
      col_6: NULL
      col_7: NULL
      col_8: NULL
      col_9: NULL
      col_10: NULL
      col_11: NULL
      col_12: NULL
      col_13: 2024.0
      col_14: NULL
      col_15: NULL
      col_16: NULL
      col_17: NULL
      col_18: NULL
      col_19: NULL
      col_20: NULL
      col_21: NULL
      col_22: NULL
      col_23: NULL
      col_24: NULL
      col_25: NULL
      col_26: NULL
      col_27: 2025.0
      col_28: NULL
      col_29: NULL
      col_30: NULL
      col_31: NULL
      col_32: NULL
      col_33: NULL
      col_34: NULL
      col_35: NULL
      col_36: NULL
      col_37: NULL
      col_38: NULL
      col_39: NULL
      col_40: 2026.0
      ---
      col_0: Nombre
      col_1: ene-23
      col_2: Feb-23
      col_3: Mar-23
      col_4: abr-23
      col_5: May-23
      col_6: Jun-23
      col_7: Jul-23
      col_8: ago-23
      col_9: sept-23
      col_10: Oct-23
      col_11: Nov-23
      col_12: dic-23
      col_13: ene-24
      col_14: Feb-24
      col_15: Mar-24
      col_16: abr-24
      col_17: May-24
      col_18: Jun-24
      col_19: Jul-24
      col_20: Ago-24
      col_21: Sept-24
      col_22: Oct-24
      col_23: Nov-24
      col_24: Dic-24
      col_25: Aguinaldo
      col_26: BONUS
      col_27: Ene-25
      col_28: Feb-25
      col_29: Mar-25
      col_30: Abr-25
      col_31: May-25
      col_32: Jun-25
      col_33: Jul 25
      col_34: BONO
      col_35: Ago 25
      col_36: Sep 25
      col_37: Oct25
      col_38: Nov25
      col_39: Dic25
      col_40: Ene26
      col_41: BONO 2
      col_42: Feb26
      col_43: Mar26
      col_44: Abr26
      col_45: May26
      col_46: Jun26
      col_47: Jul26
      col_48: Ago26
      col_49: Sep26
      col_50: Oct26
      col_51: Nov26
      col_52: Dic26


  Sheet: **Bonos Junio 2025**
    Rows: 13
    Columns: ['Nombre', 'Moneda', 'Monto']
    Sample rows:
      Nombre: COSCIONE, Jonathan
      Moneda: PESOS
      Monto: 0.0
      ---
      Nombre: MARTINEZ, Valeria
      Moneda: PESOS
      Monto: 0.0


  Sheet: **MarianBrian**
    Rows: 998
    Columns: ['Fecha', 'Tipo', 'Comprobante', 'Proveedor', 'Moneda', 'Importe Bruto', 'col_6', 'col_7', 'col_8', 'col_9', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25']
    ⚠️  ALL-NULL COLUMNS in Excel: ['col_6', 'col_7', 'col_8', 'col_9', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25']
    Sample rows:
      Fecha: 2024-01-01T00:00:00
      Tipo: Factura
      Comprobante: C-00001-00000047
      Proveedor: MARIANO BANDIERI
      Moneda: Dólares
      Importe Bruto: 6000.0
      col_6: NULL
      col_7: NULL
      col_8: NULL
      col_9: NULL
      col_10: NULL
      col_11: NULL
      col_12: NULL
      col_13: NULL
      col_14: NULL
      col_15: NULL
      col_16: NULL
      col_17: NULL
      col_18: NULL
      col_19: NULL
      col_20: NULL
      col_21: NULL
      col_22: NULL
      col_23: NULL
      col_24: NULL
      col_25: NULL
      ---
      Fecha: 2024-01-01T00:00:00
      Tipo: Factura
      Comprobante: C-00001-00000046
      Proveedor: MARIANO BANDIERI
      Moneda: Dólares
      Importe Bruto: 1000.0
      col_6: NULL
      col_7: NULL
      col_8: NULL
      col_9: NULL
      col_10: NULL
      col_11: NULL
      col_12: NULL
      col_13: NULL
      col_14: NULL
      col_15: NULL
      col_16: NULL
      col_17: NULL
      col_18: NULL
      col_19: NULL
      col_20: NULL
      col_21: NULL
      col_22: NULL
      col_23: NULL
      col_24: NULL
      col_25: NULL

### 📄 Listado de Manuales por Area.xlsx
  Sheets: ['Comercial', 'Admin!']

  Sheet: **Comercial**
    Rows: 970
    Columns: ['Tarea', 'Link al manual', 'col_2', 'col_3', 'col_4', 'col_5', 'col_6', 'col_7', 'col_8', 'col_9', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24']
    ⚠️  ALL-NULL COLUMNS in Excel: ['col_2', 'col_3', 'col_4', 'col_5', 'col_6', 'col_7', 'col_8', 'col_9', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24']
    Sample rows:
      Tarea: Apertura Fisica en Balanz BCI (Panamá).
      Link al manual: APERTURA FISICA BALANZ BCI
      col_2: NULL
      col_3: NULL
      col_4: NULL
      col_5: NULL
      col_6: NULL
      col_7: NULL
      col_8: NULL
      col_9: NULL
      col_10: NULL
      col_11: NULL
      col_12: NULL
      col_13: NULL
      col_14: NULL
      col_15: NULL
      col_16: NULL
      col_17: NULL
      col_18: NULL
      col_19: NULL
      col_20: NULL
      col_21: NULL
      col_22: NULL
      col_23: NULL
      col_24: NULL
      ---
      Tarea: Apertura Juridica en Balanz BCI (Panamá).
      Link al manual: APERTURA JURIDICA BALANZ BCI
      col_2: NULL
      col_3: NULL
      col_4: NULL
      col_5: NULL
      col_6: NULL
      col_7: NULL
      col_8: NULL
      col_9: NULL
      col_10: NULL
      col_11: NULL
      col_12: NULL
      col_13: NULL
      col_14: NULL
      col_15: NULL
      col_16: NULL
      col_17: NULL
      col_18: NULL
      col_19: NULL
      col_20: NULL
      col_21: NULL
      col_22: NULL
      col_23: NULL
      col_24: NULL


  Sheet: **Admin!**
    Rows: 20
    Columns: ['Tarea', 'Link al manual']
    Sample rows:
      Tarea: Actualizar "Posicion financiera 
      Link al manual: ACTUALIZACION POSICION FINANCIERA
      ---
      Tarea: Emision facturas mensuales C.I 
      Link al manual: EMISION FACTURAS C.I 


## PART 3: COMPARISON: Excel vs Database

### 3a. Legajo (Excel) → empleados (DB)

  Excel columns (27): ['Activo', 'Celular', 'Contacto Emergencia', 'DNI', 'Dirección', 'Equipo ingreso', 'Fecha de Ingreso', 'Fecha de Nacimiento', 'Mail Contexto', 'Movilidad', 'Nombre & Apellido', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_26']
  DB columns (16): ['activo', 'celular', 'contacto_emergencia', 'created_at', 'direccion', 'dni', 'email', 'empresa_id', 'equipo_ingreso', 'fecha_ingreso', 'fecha_nacimiento', 'id', 'modalidad', 'movilidad', 'nombre_apellido', 'updated_at']
  ❌ IN EXCEL BUT NOT IN DB: ['Activo', 'Celular', 'Contacto Emergencia', 'DNI', 'Dirección', 'Equipo ingreso', 'Fecha de Ingreso', 'Fecha de Nacimiento', 'Mail Contexto', 'Movilidad', 'Nombre & Apellido', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_26']
  ℹ️  IN DB BUT NOT EXCEL: ['activo', 'celular', 'contacto_emergencia', 'direccion', 'dni', 'email', 'equipo_ingreso', 'fecha_ingreso', 'fecha_nacimiento', 'modalidad', 'movilidad', 'nombre_apellido'] (expected metadata: ['created_at', 'empresa_id', 'id', 'updated_at'])

  Row count: Excel=22, DB=22

### 3b. HO (Excel) → home_office_semanal (DB)

  Excel columns (26): ['Ju', 'Lu', 'Ma', 'Mi', 'Nombre & Apellido', 'Vi', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_6', 'col_7', 'col_8', 'col_9']
  DB columns (7): ['created_at', 'dia_semana', 'empleado_id', 'fecha_desde', 'fecha_hasta', 'id', 'modalidad']
  ❌ IN EXCEL BUT NOT IN DB: ['Ju', 'Lu', 'Ma', 'Mi', 'Nombre & Apellido', 'Vi', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_6', 'col_7', 'col_8', 'col_9']
  IN DB BUT NOT EXCEL: ['created_at', 'dia_semana', 'empleado_id', 'fecha_desde', 'fecha_hasta', 'id', 'modalidad']

  Row count: Excel=986, DB=55
  ⚠️  MISMATCH: DB has 55, Excel has 986

### 3c. Vacaciones 2025 (Excel) → vacaciones + vacaciones_dias (DB)

  Excel columns (29): ['Abr', 'Ago', 'Dic', 'Ene', 'Feb', 'Jul', 'Jun', 'Mar', 'May', 'Nov', 'Oct', 'QDIAS25', 'SALDO', 'Saldo', 'Sep', 'col_0', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_26', 'col_27', 'col_28']
  DB vacaciones columns (7): ['anio', 'created_at', 'dias_correspondientes', 'empleado_id', 'id', 'saldo_actual', 'saldo_inicial']
  ❌ IN EXCEL BUT NOT IN DB: ['Abr', 'Ago', 'Dic', 'Ene', 'Feb', 'Jul', 'Jun', 'Mar', 'May', 'Nov', 'Oct', 'QDIAS25', 'SALDO', 'Saldo', 'Sep', 'col_0', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_26', 'col_27', 'col_28']

  Row count: Excel=975, DB vacaciones=23, DB vacaciones_dias=36

### 3d. Lineas Móviles (Excel) → lineas_moviles (DB)

  Excel columns (5): ['Lineas Movistar', 'col_1', 'col_2', 'col_3', 'col_4']
  DB columns (9): ['created_at', 'empleado_id', 'empresa_id', 'equipo', 'estado', 'id', 'numero', 'rol', 'usuario']
  ❌ IN EXCEL BUT NOT IN DB: ['Lineas Movistar', 'col_1', 'col_2', 'col_3', 'col_4']
  IN DB BUT NOT EXCEL: ['created_at', 'empleado_id', 'empresa_id', 'equipo', 'estado', 'id', 'numero', 'rol', 'usuario']

  Row count: Excel=8, DB=7
  ⚠️  MISMATCH: Excel has more rows

### 3e. 💰Sueldos Contexto.xlsx → Sheet 'Sueldos Contexto Investments 20' → sueldos (DB)

  Excel 'Sueldos Contexto Investments 20' columns (15): ['Abril', 'Agosto', 'Bono 2025', 'Diciembre', 'Enero', 'Febrero', 'Julio', 'Junio', 'Marzo', 'Mayo', 'Moneda', 'Nombre', 'Noviembre', 'Octubre', 'Septiembre']
  DB sueldos columns (9): ['anio', 'bono_anual', 'created_at', 'empleado_id', 'empresa_id', 'id', 'mes', 'moneda', 'monto']
  ❌ IN EXCEL BUT NOT IN DB: ['Abril', 'Agosto', 'Bono 2025', 'Diciembre', 'Enero', 'Febrero', 'Julio', 'Junio', 'Marzo', 'Mayo', 'Moneda', 'Nombre', 'Noviembre', 'Octubre', 'Septiembre']
  IN DB BUT NOT EXCEL: ['anio', 'bono_anual', 'created_at', 'empleado_id', 'empresa_id', 'id', 'mes', 'moneda', 'monto']

  Row count: Excel='Sueldos Contexto Investments 20'=25, DB sueldos=263
  Sample row (Excel):
    Nombre: Gemio Veronica 
    Moneda: PESOS ARG
    Enero: 1405000.0
    Bono 2025: 1475250
    Febrero: 1750000.0
    Marzo: 1750000.0
    Abril: 1750000.0
    Mayo: 1750000.0
    Junio: 1750000.0
    Julio: NULL

### 3e. 💰Sueldos Contexto.xlsx → Sheet 'Beneficios' → sueldos (DB)

  Excel 'Beneficios' columns (1): ['Esquema híbrido según corresponda']
  DB sueldos columns (9): ['anio', 'bono_anual', 'created_at', 'empleado_id', 'empresa_id', 'id', 'mes', 'moneda', 'monto']
  ❌ IN EXCEL BUT NOT IN DB: ['Esquema híbrido según corresponda']
  IN DB BUT NOT EXCEL: ['anio', 'bono_anual', 'created_at', 'empleado_id', 'empresa_id', 'id', 'mes', 'moneda', 'monto']

  Row count: Excel='Beneficios'=8, DB sueldos=263
  Sample row (Excel):
    Esquema híbrido según corresponda: 10 Días hábiles de Vacaciones

### 3e. 💰Sueldos Contexto.xlsx → Sheet 'Pesos Arg' → sueldos (DB)

  Excel 'Pesos Arg' columns (56): ['2023.0', '2024.0', '2025.0', 'col_0', 'col_10', 'col_11', 'col_12', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_2', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_26', 'col_27', 'col_28', 'col_3', 'col_30', 'col_31', 'col_32', 'col_33', 'col_34', 'col_35', 'col_36', 'col_37', 'col_38', 'col_39', 'col_4', 'col_40', 'col_41', 'col_42', 'col_43', 'col_44', 'col_45', 'col_46', 'col_47', 'col_48', 'col_49', 'col_5', 'col_50', 'col_51', 'col_52', 'col_53', 'col_54', 'col_55', 'col_6', 'col_7', 'col_8', 'col_9']
  DB sueldos columns (9): ['anio', 'bono_anual', 'created_at', 'empleado_id', 'empresa_id', 'id', 'mes', 'moneda', 'monto']
  ❌ IN EXCEL BUT NOT IN DB: ['2023.0', '2024.0', '2025.0', 'col_0', 'col_10', 'col_11', 'col_12', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_2', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_26', 'col_27', 'col_28', 'col_3', 'col_30', 'col_31', 'col_32', 'col_33', 'col_34', 'col_35', 'col_36', 'col_37', 'col_38', 'col_39', 'col_4', 'col_40', 'col_41', 'col_42', 'col_43', 'col_44', 'col_45', 'col_46', 'col_47', 'col_48', 'col_49', 'col_5', 'col_50', 'col_51', 'col_52', 'col_53', 'col_54', 'col_55', 'col_6', 'col_7', 'col_8', 'col_9']
  IN DB BUT NOT EXCEL: ['anio', 'bono_anual', 'created_at', 'empleado_id', 'empresa_id', 'id', 'mes', 'moneda', 'monto']

  Row count: Excel='Pesos Arg'=11, DB sueldos=263
  Sample row (Excel):
    col_0: Nombre
    2023.0: ene-23
    col_2: Feb-23
    col_3: Mar-23
    col_4: abr-23
    col_5: May-23
    col_6: Jun-23
    col_7: Jul-23
    col_8: ago-23
    col_9: sept-23

### 3e. 💰Sueldos Contexto.xlsx → Sheet 'USD' → sueldos (DB)

  Excel 'USD' columns (41): ['col_0', 'col_1', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_2', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_26', 'col_27', 'col_28', 'col_29', 'col_3', 'col_30', 'col_31', 'col_32', 'col_33', 'col_34', 'col_35', 'col_36', 'col_37', 'col_38', 'col_39', 'col_4', 'col_40', 'col_5', 'col_6', 'col_7', 'col_8', 'col_9']
  DB sueldos columns (9): ['anio', 'bono_anual', 'created_at', 'empleado_id', 'empresa_id', 'id', 'mes', 'moneda', 'monto']
  ❌ IN EXCEL BUT NOT IN DB: ['col_0', 'col_1', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_2', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_26', 'col_27', 'col_28', 'col_29', 'col_3', 'col_30', 'col_31', 'col_32', 'col_33', 'col_34', 'col_35', 'col_36', 'col_37', 'col_38', 'col_39', 'col_4', 'col_40', 'col_5', 'col_6', 'col_7', 'col_8', 'col_9']
  IN DB BUT NOT EXCEL: ['anio', 'bono_anual', 'created_at', 'empleado_id', 'empresa_id', 'id', 'mes', 'moneda', 'monto']

  Row count: Excel='USD'=7, DB sueldos=263
  Sample row (Excel):
    col_0: NULL
    col_1: 2023.0
    col_2: NULL
    col_3: NULL
    col_4: NULL
    col_5: NULL
    col_6: NULL
    col_7: NULL
    col_8: NULL
    col_9: NULL

### 3e. 💰Sueldos Contexto.xlsx → Sheet 'Bonos Junio 2025' → sueldos (DB)

  Excel 'Bonos Junio 2025' columns (3): ['Moneda', 'Monto', 'Nombre']
  DB sueldos columns (9): ['anio', 'bono_anual', 'created_at', 'empleado_id', 'empresa_id', 'id', 'mes', 'moneda', 'monto']
  ❌ IN EXCEL BUT NOT IN DB: ['Moneda', 'Monto', 'Nombre']
  IN DB BUT NOT EXCEL: ['anio', 'bono_anual', 'created_at', 'empleado_id', 'empresa_id', 'id', 'mes', 'moneda', 'monto']

  Row count: Excel='Bonos Junio 2025'=13, DB sueldos=263
  Sample row (Excel):
    Nombre: COSCIONE, Jonathan
    Moneda: PESOS
    Monto: 0.0

### 3e. 💰Sueldos Contexto.xlsx → Sheet 'MarianBrian' → sueldos (DB)

  Excel 'MarianBrian' columns (26): ['Comprobante', 'Fecha', 'Importe Bruto', 'Moneda', 'Proveedor', 'Tipo', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_6', 'col_7', 'col_8', 'col_9']
  DB sueldos columns (9): ['anio', 'bono_anual', 'created_at', 'empleado_id', 'empresa_id', 'id', 'mes', 'moneda', 'monto']
  ❌ IN EXCEL BUT NOT IN DB: ['Comprobante', 'Fecha', 'Importe Bruto', 'Moneda', 'Proveedor', 'Tipo', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_25', 'col_6', 'col_7', 'col_8', 'col_9']
  IN DB BUT NOT EXCEL: ['anio', 'bono_anual', 'created_at', 'empleado_id', 'empresa_id', 'id', 'mes', 'moneda', 'monto']

  Row count: Excel='MarianBrian'=998, DB sueldos=263
  Sample row (Excel):
    Fecha: 2024-01-01T00:00:00
    Tipo: Factura
    Comprobante: C-00001-00000047
    Proveedor: MARIANO BANDIERI
    Moneda: Dólares
    Importe Bruto: 6000.0
    col_6: NULL
    col_7: NULL
    col_8: NULL
    col_9: NULL

### 3f. Listado de Manuales por Area.xlsx → Sheet 'Comercial' → manuales (DB)

  Excel columns (25): ['Link al manual', 'Tarea', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_2', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_3', 'col_4', 'col_5', 'col_6', 'col_7', 'col_8', 'col_9']
  DB columns (7): ['area', 'created_at', 'empresa_id', 'id', 'link_manual', 'tarea', 'updated_at']
  ❌ IN EXCEL BUT NOT IN DB: ['Link al manual', 'Tarea', 'col_10', 'col_11', 'col_12', 'col_13', 'col_14', 'col_15', 'col_16', 'col_17', 'col_18', 'col_19', 'col_2', 'col_20', 'col_21', 'col_22', 'col_23', 'col_24', 'col_3', 'col_4', 'col_5', 'col_6', 'col_7', 'col_8', 'col_9']
  IN DB BUT NOT EXCEL: ['area', 'created_at', 'empresa_id', 'id', 'link_manual', 'tarea', 'updated_at']

  Row count: Excel=970, DB=50
  ⚠️  MISMATCH: Excel has more rows

### 3g. Sheets in Excel with NO corresponding DB table

  ❌ 'Legajo Colaboradores.xlsx' → Sheet 'Insumos Vajilla' has NO DB table
  ❌ 'Legajo Colaboradores.xlsx' → Sheet 'Mails' has NO DB table
  ❌ 'Legajo Colaboradores.xlsx' → Sheet 'Nombre puestos' has NO DB table
  ❌ 'Legajo Colaboradores.xlsx' → Sheet 'Regalos cumples!' has NO DB table
  ❌ 'Legajo Colaboradores.xlsx' → Sheet 'Vacaciones' has NO DB table

#### Reuniones (frontend only)

  The 'Reuniones' feature exists only in the frontend (src/features/reuniones/)
  with columns: id, titulo, fecha, hora, duracion, participantes, resumen
  and returns empty data. There is NO Supabase table for reuniones.
  

## PART 4: FORMAT DIFFERENCES

### 4a. Legajo Colaboradores → empleados

  'Nombre & Apellido' → (no direct mapping in DB)
  'Fecha de Nacimiento' → (no direct mapping in DB)
  'DNI' → (no direct mapping in DB)
  'Celular' → 'celular'
  'Contacto Emergencia' → (no direct mapping in DB)
  'Equipo ingreso' → (no direct mapping in DB)
  'Fecha de Ingreso' → 'fecha_ingreso'
  'Mail Contexto' → (no direct mapping in DB)
  'Dirección' → 'direccion'
  'Movilidad' → 'movilidad'
  'col_11' → (no direct mapping in DB)
  'col_12' → (no direct mapping in DB)
  'col_13' → (no direct mapping in DB)
  'col_14' → (no direct mapping in DB)
  'col_15' → (no direct mapping in DB)
  'col_16' → (no direct mapping in DB)
  'col_17' → (no direct mapping in DB)
  'col_18' → (no direct mapping in DB)
  'col_19' → (no direct mapping in DB)
  'col_20' → (no direct mapping in DB)
  'col_21' → (no direct mapping in DB)
  'col_22' → (no direct mapping in DB)
  'col_23' → (no direct mapping in DB)
  'col_24' → (no direct mapping in DB)
  'col_25' → (no direct mapping in DB)
  'col_26' → (no direct mapping in DB)

---

# END OF REPORT