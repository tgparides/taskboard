-- Adds archive support to columns (lists).
-- Run this in the Supabase SQL Editor for the taskboard project (bssxdwgwztngjrduhano).

-- archived_at: nullable timestamptz. when set, the whole list is hidden from the
-- board and only visible in the Archive view (cards inside it travel with it).
ALTER TABLE columns ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Partial index to keep board-side queries (which filter to active lists) fast
CREATE INDEX IF NOT EXISTS idx_columns_active ON columns(board_id, position) WHERE archived_at IS NULL;
