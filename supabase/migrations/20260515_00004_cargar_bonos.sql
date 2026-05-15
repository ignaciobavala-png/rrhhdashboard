-- ============================================================================
-- Migration: Cargar Bonos Junio 2025 — PetraLabs RRHH
-- Origen: 💰Sueldos Contexto.xlsx — hoja "Bonos Junio 2025"
-- ============================================================================

-- Actualizar bono_anual para empleados que ya tienen registro en junio 2025

-- Jonathan Coscione: 0
UPDATE sueldos SET bono_anual = 0 WHERE empleado_id = (SELECT id FROM empleados WHERE nombre_apellido = 'COSCIONE, Jonathan') AND mes = 6 AND anio = 2025;

-- Fernanda Guardiola: 2578432.5
UPDATE sueldos SET bono_anual = 2578432.5 WHERE empleado_id = (SELECT id FROM empleados WHERE nombre_apellido = 'GUARDIOLA, Fernanda') AND mes = 6 AND anio = 2025;

-- Ignacio Hernandez (Nacho): 2835000
UPDATE sueldos SET bono_anual = 2835000 WHERE empleado_id = (SELECT id FROM empleados WHERE nombre_apellido = 'HERNANDEZ, Ignacio') AND mes = 6 AND anio = 2025;

-- Mariano Bandieri: 3000 USD
UPDATE sueldos SET bono_anual = 3000 WHERE empleado_id = (SELECT id FROM empleados WHERE nombre_apellido = 'BANDIERI, Mariano') AND mes = 6 AND anio = 2025;

-- Brian Strano: 5000 USD
UPDATE sueldos SET bono_anual = 5000 WHERE empleado_id = (SELECT id FROM empleados WHERE nombre_apellido = 'STRANO, Brian') AND mes = 6 AND anio = 2025;

-- Nicolas Reinero: 720 USD (=1800*40%)
UPDATE sueldos SET bono_anual = 720 WHERE empleado_id = (SELECT id FROM empleados WHERE nombre_apellido = 'REINERO, Nicolas') AND mes = 6 AND anio = 2025;

-- Franco Tejerina: 1800 USD
UPDATE sueldos SET bono_anual = 1800 WHERE empleado_id = (SELECT id FROM empleados WHERE nombre_apellido = 'TEJERINA, Franco') AND mes = 6 AND anio = 2025;

-- Los que tienen bono 0 no necesitan UPDATE (ya están en 0 o no existen)