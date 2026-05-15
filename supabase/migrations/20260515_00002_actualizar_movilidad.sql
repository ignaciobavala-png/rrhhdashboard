-- ============================================================================
-- Migration: Actualizar Movilidad — PetraLabs RRHH
-- Origen: Legajo Colaboradores.xlsx — columna "Movilidad"
-- ============================================================================

-- TORASSA, Maximo: Auto particular / Caminando
UPDATE empleados
SET movilidad = 'Auto particular / Caminando'
WHERE nombre_apellido = 'TORASSA, Maximo';

-- OLIVERA, Mercedes: Tren Mitre (desde estacion San Isidro C)
UPDATE empleados
SET movilidad = 'Tren Mitre (desde estacion San Isidro C)'
WHERE nombre_apellido = 'OLIVERA, Mercedes';