
-- Bibliography items per user
CREATE TABLE bibliography_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('book', 'article', 'web', 'journal', 'doi')),
  author TEXT NOT NULL,
  title TEXT NOT NULL,
  year TEXT NOT NULL,
  publisher TEXT,
  journal TEXT,
  url TEXT,
  doi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE bibliography_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_bibliography" ON bibliography_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_bibliography" ON bibliography_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_bibliography" ON bibliography_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_bibliography" ON bibliography_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Hedge rules (professor-created search/evaluation criteria)
CREATE TABLE hedge_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('search', 'verification', 'evaluation')),
  active BOOLEAN NOT NULL DEFAULT true,
  examples TEXT[] NOT NULL DEFAULT '{}',
  professor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE hedge_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_hedge_rules" ON hedge_rules FOR SELECT
  TO authenticated USING (
    professor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('student', 'admin'))
  );

CREATE POLICY "insert_hedge_rules" ON hedge_rules FOR INSERT
  TO authenticated WITH CHECK (
    professor_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('professor', 'admin'))
  );

CREATE POLICY "update_hedge_rules" ON hedge_rules FOR UPDATE
  TO authenticated USING (professor_id = auth.uid()) WITH CHECK (professor_id = auth.uid());

CREATE POLICY "delete_hedge_rules" ON hedge_rules FOR DELETE
  TO authenticated USING (
    professor_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Audit logs (append-only)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  ip TEXT NOT NULL DEFAULT '0.0.0.0',
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "insert_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (true);

-- No UPDATE on audit_logs (immutable)
CREATE POLICY "update_audit_logs" ON audit_logs FOR UPDATE
  TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "delete_audit_logs" ON audit_logs FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context TEXT NOT NULL CHECK (context IN ('student', 'professor', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_chat" ON chat_messages FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_chat" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_chat" ON chat_messages FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_chat" ON chat_messages FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
