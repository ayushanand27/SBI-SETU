-- SBI Setu Supabase Schema
-- Run this in the Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Chat logs (Saarthi conversations)
CREATE TABLE IF NOT EXISTS chat_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'bot')),
    message TEXT NOT NULL,
    intent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_logs_session_id ON chat_logs (session_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created_at ON chat_logs (created_at DESC);

-- 2. Tokens (SwiftDesk queue tokens)
CREATE TABLE IF NOT EXISTS tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_number TEXT NOT NULL UNIQUE,
    service TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    aadhaar_last4 TEXT,
    counter TEXT NOT NULL,
    wait_minutes INT NOT NULL,
    queue_position INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'serving', 'done')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tokens_created_at ON tokens (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON tokens (status);

-- 3. Footfall logs (BranchOS analytics)
CREATE TABLE IF NOT EXISTS footfall_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hour INT NOT NULL CHECK (hour >= 0 AND hour <= 23),
    walk_ins INT NOT NULL DEFAULT 0,
    deflected INT NOT NULL DEFAULT 0,
    branch_id TEXT NOT NULL DEFAULT 'MUM-MAIN-001',
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_footfall_logs_logged_at ON footfall_logs (logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_footfall_logs_branch_id ON footfall_logs (branch_id);

-- Enable RLS (use service_role key in backend to bypass, or add policies for anon)
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE footfall_logs ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS. For development with anon key, allow all operations:
CREATE POLICY "Allow all chat_logs" ON chat_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all tokens" ON tokens FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all footfall_logs" ON footfall_logs FOR ALL USING (true) WITH CHECK (true);
