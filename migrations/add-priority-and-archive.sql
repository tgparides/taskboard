-- Adds priority + archive support to cards.
-- Run this in the Supabase SQL Editor for the taskboard project (bssxdwgwztngjrduhano).

-- priority: nullable smallint. 0 = low, 1 = medium, 2 = high, 3 = urgent. null = none.
ALTER TABLE cards ADD COLUMN IF NOT EXISTS priority smallint;
ALTER TABLE cards ADD CONSTRAINT cards_priority_range CHECK (priority IS NULL OR priority BETWEEN 0 AND 3);

-- archived_at: nullable timestamptz. when set, the card is hidden from the board
-- and only visible in the Archive view.
ALTER TABLE cards ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Partial index to keep board-side queries (which filter to active cards) fast
CREATE INDEX IF NOT EXISTS idx_cards_active ON cards(column_id, position) WHERE archived_at IS NULL;
