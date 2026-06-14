
-- Evaluations
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  case_title TEXT NOT NULL,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  response TEXT NOT NULL DEFAULT '',
  score INTEGER,
  max_score INTEGER NOT NULL DEFAULT 100,
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_evaluations" ON evaluations FOR SELECT
  TO authenticated USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM cases c WHERE c.id = evaluations.case_id AND c.professor_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "insert_evaluations" ON evaluations FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases c WHERE c.id = case_id AND c.professor_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "update_evaluations" ON evaluations FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM cases c WHERE c.id = evaluations.case_id AND c.professor_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases c WHERE c.id = evaluations.case_id AND c.professor_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "delete_evaluations" ON evaluations FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Rubric items for each evaluation
CREATE TABLE rubric_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  criterion TEXT NOT NULL,
  max_score INTEGER NOT NULL,
  score INTEGER,
  comment TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE rubric_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_rubric_items" ON rubric_items FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM evaluations e
      WHERE e.id = rubric_items.evaluation_id
        AND (
          e.student_id = auth.uid()
          OR EXISTS (SELECT 1 FROM cases c WHERE c.id = e.case_id AND c.professor_id = auth.uid())
          OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
        )
    )
  );

CREATE POLICY "insert_rubric_items" ON rubric_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM evaluations e
      JOIN cases c ON c.id = e.case_id
      WHERE e.id = evaluation_id AND c.professor_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "update_rubric_items" ON rubric_items FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM evaluations e
      JOIN cases c ON c.id = e.case_id
      WHERE e.id = rubric_items.evaluation_id AND c.professor_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM evaluations e
      JOIN cases c ON c.id = e.case_id
      WHERE e.id = rubric_items.evaluation_id AND c.professor_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "delete_rubric_items" ON rubric_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
