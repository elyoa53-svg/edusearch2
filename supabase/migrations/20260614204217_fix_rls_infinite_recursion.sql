
-- Drop the recursive policies
DROP POLICY IF EXISTS "admin_select_all_profiles" ON profiles;
DROP POLICY IF EXISTS "admin_update_all_profiles" ON profiles;
DROP POLICY IF EXISTS "professor_select_competencies" ON competencies;

-- Security definer function to check role without triggering RLS
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Recreate admin policies using the security definer function
CREATE POLICY "admin_select_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    id = auth.uid() OR public.get_auth_role() = 'admin'
  );

CREATE POLICY "admin_update_all_profiles" ON profiles FOR UPDATE
  TO authenticated USING (
    id = auth.uid() OR public.get_auth_role() = 'admin'
  ) WITH CHECK (
    id = auth.uid() OR public.get_auth_role() = 'admin'
  );

-- Fix competencies policy too
CREATE POLICY "professor_select_competencies" ON competencies FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR public.get_auth_role() IN ('professor', 'admin')
  );
