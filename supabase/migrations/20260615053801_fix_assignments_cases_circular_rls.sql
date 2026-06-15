
-- Fix 1: Break the circular RLS between assignments and cases.
-- The problem: assignments.select policy checks cases table, and
-- cases.student_select_assigned_cases checks assignments table → infinite recursion.
-- Solution: use a security definer function to check case ownership without triggering RLS.

CREATE OR REPLACE FUNCTION get_case_professor_id(p_case_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT professor_id FROM cases WHERE id = p_case_id;
$$;

-- Drop and recreate assignments policies without circular reference
DROP POLICY IF EXISTS "select_assignments" ON assignments;
DROP POLICY IF EXISTS "insert_assignments" ON assignments;
DROP POLICY IF EXISTS "update_assignments" ON assignments;
DROP POLICY IF EXISTS "delete_assignments" ON assignments;

CREATE POLICY "select_assignments" ON assignments FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid()
    OR get_case_professor_id(case_id) = auth.uid()
    OR get_auth_role() = 'admin'
  );

CREATE POLICY "insert_assignments" ON assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    get_case_professor_id(case_id) = auth.uid()
    OR get_auth_role() = 'admin'
  );

CREATE POLICY "update_assignments" ON assignments FOR UPDATE
  TO authenticated
  USING (
    student_id = auth.uid()
    OR get_case_professor_id(case_id) = auth.uid()
    OR get_auth_role() = 'admin'
  )
  WITH CHECK (
    student_id = auth.uid()
    OR get_case_professor_id(case_id) = auth.uid()
    OR get_auth_role() = 'admin'
  );

CREATE POLICY "delete_assignments" ON assignments FOR DELETE
  TO authenticated
  USING (
    get_case_professor_id(case_id) = auth.uid()
    OR get_auth_role() = 'admin'
  );

-- Fix 2: Also fix cases.student_select_assigned_cases to avoid triggering assignments RLS.
-- Drop the circular policy and replace with a security definer function check.

CREATE OR REPLACE FUNCTION student_has_assignment(p_case_id uuid, p_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM assignments
    WHERE case_id = p_case_id AND student_id = p_student_id
  );
$$;

DROP POLICY IF EXISTS "student_select_assigned_cases" ON cases;

CREATE POLICY "student_select_assigned_cases" ON cases FOR SELECT
  TO authenticated
  USING (
    student_has_assignment(id, auth.uid())
  );

-- Fix 3: audit_logs INSERT should allow any authenticated user (for login/logout events)
-- The current policy with_check: true only allows authenticated. The issue is that
-- audit events sometimes fire after signOut. Allow unauthenticated inserts for audit trail.
DROP POLICY IF EXISTS "insert_audit_logs" ON audit_logs;

CREATE POLICY "insert_audit_logs" ON audit_logs FOR INSERT
  WITH CHECK (true);
