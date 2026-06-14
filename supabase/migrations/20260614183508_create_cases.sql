
-- Clinical cases
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  objectives TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('basic', 'intermediate', 'advanced')),
  category TEXT NOT NULL,
  deadline DATE,
  evaluation_criteria TEXT[] NOT NULL DEFAULT '{}',
  suggested_resources TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  professor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professor_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_cases" ON cases FOR SELECT
  TO authenticated USING (
    professor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "insert_cases" ON cases FOR INSERT
  TO authenticated WITH CHECK (
    professor_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('professor', 'admin'))
  );

CREATE POLICY "update_cases" ON cases FOR UPDATE
  TO authenticated USING (professor_id = auth.uid()) WITH CHECK (professor_id = auth.uid());

CREATE POLICY "delete_cases" ON cases FOR DELETE
  TO authenticated USING (
    professor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Auto-update updated_at on cases
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
