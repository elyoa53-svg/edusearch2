
-- Fix recursive RLS policies in audit_logs
DROP POLICY IF EXISTS "select_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "delete_audit_logs" ON audit_logs;

CREATE POLICY "select_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (public.get_auth_role() = 'admin');

CREATE POLICY "delete_audit_logs" ON audit_logs FOR DELETE
  TO authenticated USING (public.get_auth_role() = 'admin');

-- Fix recursive RLS policies in hedge_rules
DROP POLICY IF EXISTS "select_hedge_rules" ON hedge_rules;
DROP POLICY IF EXISTS "insert_hedge_rules" ON hedge_rules;
DROP POLICY IF EXISTS "delete_hedge_rules" ON hedge_rules;

CREATE POLICY "select_hedge_rules" ON hedge_rules FOR SELECT
  TO authenticated USING (
    professor_id = auth.uid()
    OR public.get_auth_role() IN ('student', 'admin')
  );

CREATE POLICY "insert_hedge_rules" ON hedge_rules FOR INSERT
  TO authenticated WITH CHECK (
    professor_id = auth.uid()
    AND public.get_auth_role() IN ('professor', 'admin')
  );

CREATE POLICY "delete_hedge_rules" ON hedge_rules FOR DELETE
  TO authenticated USING (
    professor_id = auth.uid()
    OR public.get_auth_role() = 'admin'
  );
