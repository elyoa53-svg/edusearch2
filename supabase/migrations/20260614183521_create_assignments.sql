
-- Assignments (student <-> case relationship)
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'reviewed')),
  response TEXT,
  submitted_at TIMESTAMPTZ,
  feedback TEXT,
  score INTEGER,
  max_score INTEGER NOT NULL DEFAULT 100,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (case_id, student_id)
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_assignments" ON assignments FOR SELECT
  TO authenticated USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM cases c WHERE c.id = assignments.case_id AND c.professor_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "insert_assignments" ON assignments FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases c WHERE c.id = case_id AND c.professor_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "update_assignments" ON assignments FOR UPDATE
  TO authenticated USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM cases c WHERE c.id = assignments.case_id AND c.professor_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM cases c WHERE c.id = assignments.case_id AND c.professor_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "delete_assignments" ON assignments FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM cases c WHERE c.id = assignments.case_id AND c.professor_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Now add the student-facing policy on cases that requires assignments to exist
CREATE POLICY "student_select_assigned_cases" ON cases FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM assignments a WHERE a.case_id = cases.id AND a.student_id = auth.uid())
  );
