-- ============================================================================
-- Arreglar RLS: extender escritura a anon y simplificar política de puestos
-- ============================================================================

-- empleados: extender política de escritura a anon
DROP POLICY IF EXISTS "empleados_write" ON empleados;
CREATE POLICY "empleados_write" ON empleados
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- home_office_semanal: extender política de escritura a anon
DROP POLICY IF EXISTS "home_office_write" ON home_office_semanal;
CREATE POLICY "home_office_write" ON home_office_semanal
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- puestos: reemplazar política que requería app.empresa_id por una simple
DROP POLICY IF EXISTS "puestos_tenant_isolation" ON puestos;
CREATE POLICY "puestos_all" ON puestos
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
