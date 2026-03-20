-- Migration 004: adiciona trial_ends_at em subscribers
-- Execute no Supabase SQL Editor

ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

-- Preenche trial_ends_at para subscribers existentes em trial que não têm data definida
-- (7 dias a partir de created_at, como seria feito no register)
UPDATE subscribers
SET trial_ends_at = created_at + INTERVAL '7 days'
WHERE status = 'trial'
  AND trial_ends_at IS NULL;
