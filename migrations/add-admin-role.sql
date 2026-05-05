-- Adds an admin role that bypasses board-membership RLS, giving full SELECT /
-- INSERT / UPDATE / DELETE access to every board on the system.
--
-- Implementation: we extend the existing is_board_member() helper to return TRUE
-- for any user whose profile has is_admin = true. Since every relevant policy
-- (boards, columns, cards, labels, card_labels, card_members, comments,
-- attachments, board_members) routes through is_board_member(), this single
-- change cascades to all of them — no per-table policy edits needed.
--
-- Run this in the taskboard Supabase SQL Editor (project bssxdwgwztngjrduhano).

-- 1. Add is_admin flag to profiles (default false)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- 2. Mark Thomas as admin
UPDATE profiles SET is_admin = true WHERE email = 'tgparides@gmail.com';

-- 3. Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT coalesce((SELECT is_admin FROM profiles WHERE id = auth.uid()), false);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 4. Make is_board_member() also return true for admins, so every existing policy
--    that checks membership automatically grants admins access.
CREATE OR REPLACE FUNCTION is_board_member(check_board_id uuid)
RETURNS boolean AS $$
BEGIN
  IF is_admin() THEN
    RETURN true;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM board_members
    WHERE board_id = check_board_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 5. The boards UPDATE / DELETE policies don't go through is_board_member() —
--    they require board_members.role = 'admin'. Add an admin bypass.
DROP POLICY IF EXISTS "Board admins can update" ON boards;
CREATE POLICY "Board admins can update" ON boards
  FOR UPDATE TO authenticated
  USING (
    is_admin()
    OR EXISTS (SELECT 1 FROM board_members WHERE board_id = id AND user_id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Board admins can delete" ON boards;
CREATE POLICY "Board admins can delete" ON boards
  FOR DELETE TO authenticated
  USING (
    is_admin()
    OR EXISTS (SELECT 1 FROM board_members WHERE board_id = id AND user_id = auth.uid() AND role = 'admin')
  );

-- 6. The "Board admins can remove members" policy also has its own check.
DROP POLICY IF EXISTS "Board admins can remove members" ON board_members;
CREATE POLICY "Board admins can remove members" ON board_members
  FOR DELETE TO authenticated
  USING (
    is_admin()
    OR EXISTS (SELECT 1 FROM board_members bm WHERE bm.board_id = board_members.board_id AND bm.user_id = auth.uid() AND bm.role = 'admin')
    OR user_id = auth.uid()
  );

-- 7. Verification query — run this after the migration to confirm:
--    SELECT email, is_admin FROM profiles WHERE is_admin = true;
