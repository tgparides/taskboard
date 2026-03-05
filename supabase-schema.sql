-- TaskBoard Database Schema (idempotent — safe to re-run)
-- Run this in Supabase SQL Editor

-- ============================================
-- CLEANUP: Drop everything first
-- ============================================
drop policy if exists "Profiles viewable by authenticated" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Allow trigger insert" on profiles;
drop policy if exists "Board members can view" on boards;
drop policy if exists "Authenticated can create boards" on boards;
drop policy if exists "Board admins can update" on boards;
drop policy if exists "Board admins can delete" on boards;
drop policy if exists "Board members can view members" on board_members;
drop policy if exists "Board admins can manage members" on board_members;
drop policy if exists "Board admins can remove members" on board_members;
drop policy if exists "Board members can view columns" on columns;
drop policy if exists "Board members can create columns" on columns;
drop policy if exists "Board members can update columns" on columns;
drop policy if exists "Board members can delete columns" on columns;
drop policy if exists "Board members can view cards" on cards;
drop policy if exists "Board members can create cards" on cards;
drop policy if exists "Board members can update cards" on cards;
drop policy if exists "Board members can delete cards" on cards;
drop policy if exists "Board members can view labels" on labels;
drop policy if exists "Board members can create labels" on labels;
drop policy if exists "Board members can update labels" on labels;
drop policy if exists "Board members can delete labels" on labels;
drop policy if exists "Board members can view card labels" on card_labels;
drop policy if exists "Board members can manage card labels" on card_labels;
drop policy if exists "Board members can remove card labels" on card_labels;
drop policy if exists "Board members can view card members" on card_members;
drop policy if exists "Board members can manage card members" on card_members;
drop policy if exists "Board members can remove card members" on card_members;
drop policy if exists "Board members can view comments" on comments;
drop policy if exists "Board members can add comments" on comments;
drop policy if exists "Users can delete own comments" on comments;
drop policy if exists "Board members can view attachments" on attachments;
drop policy if exists "Board members can add attachments" on attachments;
drop policy if exists "Board members can delete attachments" on attachments;
drop policy if exists "Authenticated users can upload attachments" on storage.objects;
drop policy if exists "Anyone can view attachments" on storage.objects;
drop policy if exists "Users can delete own attachments" on storage.objects;

drop trigger if exists on_auth_user_created on auth.users;
drop table if exists attachments cascade;
drop table if exists comments cascade;
drop table if exists card_members cascade;
drop table if exists card_labels cascade;
drop table if exists labels cascade;
drop table if exists cards cascade;
drop table if exists columns cascade;
drop table if exists board_members cascade;
drop table if exists boards cascade;
drop table if exists profiles cascade;
drop function if exists handle_new_user cascade;
drop function if exists is_board_member cascade;
drop function if exists board_id_from_column cascade;
drop function if exists board_id_from_card cascade;

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- 2. BOARDS
-- ============================================
create table boards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  color text default '#3b82f6',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================
-- 3. BOARD MEMBERS
-- ============================================
create table board_members (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('admin', 'member')),
  created_at timestamptz default now(),
  unique (board_id, user_id)
);

-- ============================================
-- 4. COLUMNS (lists)
-- ============================================
create table columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  title text not null,
  position real not null default 65536,
  created_at timestamptz default now()
);

-- ============================================
-- 5. CARDS
-- ============================================
create table cards (
  id uuid primary key default gen_random_uuid(),
  column_id uuid references columns(id) on delete cascade not null,
  title text not null,
  description text,
  position real not null default 65536,
  due_date date,
  cover_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 6. LABELS
-- ============================================
create table labels (
  id uuid primary key default gen_random_uuid(),
  board_id uuid references boards(id) on delete cascade not null,
  name text default '',
  color text not null,
  created_at timestamptz default now()
);

-- ============================================
-- 7. CARD LABELS (many-to-many)
-- ============================================
create table card_labels (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade not null,
  label_id uuid references labels(id) on delete cascade not null,
  unique (card_id, label_id)
);

-- ============================================
-- 8. CARD MEMBERS (assignments)
-- ============================================
create table card_members (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  unique (card_id, user_id)
);

-- ============================================
-- 9. COMMENTS
-- ============================================
create table comments (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete set null,
  body text not null,
  created_at timestamptz default now()
);

-- ============================================
-- 10. ATTACHMENTS
-- ============================================
create table attachments (
  id uuid primary key default gen_random_uuid(),
  card_id uuid references cards(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete set null,
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size integer,
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_columns_board on columns(board_id, position);
create index idx_cards_column on cards(column_id, position);
create index idx_board_members_user on board_members(user_id);
create index idx_card_labels_card on card_labels(card_id);
create index idx_card_members_card on card_members(card_id);
create index idx_comments_card on comments(card_id);
create index idx_attachments_card on attachments(card_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================
create or replace function is_board_member(check_board_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from board_members
    where board_id = check_board_id
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

create or replace function board_id_from_column(col_id uuid)
returns uuid as $$
  select board_id from columns where id = col_id;
$$ language sql security definer;

create or replace function board_id_from_card(c_id uuid)
returns uuid as $$
  select c.board_id from columns c
  join cards ca on ca.column_id = c.id
  where ca.id = c_id;
$$ language sql security definer;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Profiles
alter table profiles enable row level security;
create policy "Profiles viewable by authenticated" on profiles for select to authenticated using (true);
create policy "Users can update own profile" on profiles for update to authenticated using (id = auth.uid());

-- Boards
alter table boards enable row level security;
create policy "Board members can view" on boards for select to authenticated using (is_board_member(id));
create policy "Authenticated can create boards" on boards for insert to authenticated with check (true);
create policy "Board admins can update" on boards for update to authenticated using (
  exists (select 1 from board_members where board_id = id and user_id = auth.uid() and role = 'admin')
);
create policy "Board admins can delete" on boards for delete to authenticated using (
  exists (select 1 from board_members where board_id = id and user_id = auth.uid() and role = 'admin')
);

-- Board members
alter table board_members enable row level security;
create policy "Board members can view members" on board_members for select to authenticated using (is_board_member(board_id));
create policy "Board admins can manage members" on board_members for insert to authenticated with check (
  is_board_member(board_id) or board_id in (select id from boards where created_by = auth.uid())
);
create policy "Board admins can remove members" on board_members for delete to authenticated using (
  exists (select 1 from board_members bm where bm.board_id = board_members.board_id and bm.user_id = auth.uid() and bm.role = 'admin')
  or user_id = auth.uid()
);

-- Columns
alter table columns enable row level security;
create policy "Board members can view columns" on columns for select to authenticated using (is_board_member(board_id));
create policy "Board members can create columns" on columns for insert to authenticated with check (is_board_member(board_id));
create policy "Board members can update columns" on columns for update to authenticated using (is_board_member(board_id));
create policy "Board members can delete columns" on columns for delete to authenticated using (is_board_member(board_id));

-- Cards
alter table cards enable row level security;
create policy "Board members can view cards" on cards for select to authenticated using (is_board_member(board_id_from_column(column_id)));
create policy "Board members can create cards" on cards for insert to authenticated with check (is_board_member(board_id_from_column(column_id)));
create policy "Board members can update cards" on cards for update to authenticated using (is_board_member(board_id_from_column(column_id)));
create policy "Board members can delete cards" on cards for delete to authenticated using (is_board_member(board_id_from_column(column_id)));

-- Labels
alter table labels enable row level security;
create policy "Board members can view labels" on labels for select to authenticated using (is_board_member(board_id));
create policy "Board members can create labels" on labels for insert to authenticated with check (is_board_member(board_id));
create policy "Board members can update labels" on labels for update to authenticated using (is_board_member(board_id));
create policy "Board members can delete labels" on labels for delete to authenticated using (is_board_member(board_id));

-- Card labels
alter table card_labels enable row level security;
create policy "Board members can view card labels" on card_labels for select to authenticated using (is_board_member(board_id_from_card(card_id)));
create policy "Board members can manage card labels" on card_labels for insert to authenticated with check (is_board_member(board_id_from_card(card_id)));
create policy "Board members can remove card labels" on card_labels for delete to authenticated using (is_board_member(board_id_from_card(card_id)));

-- Card members
alter table card_members enable row level security;
create policy "Board members can view card members" on card_members for select to authenticated using (is_board_member(board_id_from_card(card_id)));
create policy "Board members can manage card members" on card_members for insert to authenticated with check (is_board_member(board_id_from_card(card_id)));
create policy "Board members can remove card members" on card_members for delete to authenticated using (is_board_member(board_id_from_card(card_id)));

-- Comments
alter table comments enable row level security;
create policy "Board members can view comments" on comments for select to authenticated using (is_board_member(board_id_from_card(card_id)));
create policy "Board members can add comments" on comments for insert to authenticated with check (is_board_member(board_id_from_card(card_id)));
create policy "Users can delete own comments" on comments for delete to authenticated using (user_id = auth.uid());

-- Attachments
alter table attachments enable row level security;
create policy "Board members can view attachments" on attachments for select to authenticated using (is_board_member(board_id_from_card(card_id)));
create policy "Board members can add attachments" on attachments for insert to authenticated with check (is_board_member(board_id_from_card(card_id)));
create policy "Board members can delete attachments" on attachments for delete to authenticated using (is_board_member(board_id_from_card(card_id)));

-- ============================================
-- ENABLE REALTIME
-- ============================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'cards'
  ) then
    alter publication supabase_realtime add table cards;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'columns'
  ) then
    alter publication supabase_realtime add table columns;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'comments'
  ) then
    alter publication supabase_realtime add table comments;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'card_labels'
  ) then
    alter publication supabase_realtime add table card_labels;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'card_members'
  ) then
    alter publication supabase_realtime add table card_members;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'attachments'
  ) then
    alter publication supabase_realtime add table attachments;
  end if;
end $$;

-- ============================================
-- STORAGE BUCKET for attachments
-- ============================================
insert into storage.buckets (id, name, public) values ('attachments', 'attachments', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload attachments"
on storage.objects for insert to authenticated
with check (bucket_id = 'attachments');

create policy "Anyone can view attachments"
on storage.objects for select to authenticated
using (bucket_id = 'attachments');

create policy "Users can delete own attachments"
on storage.objects for delete to authenticated
using (bucket_id = 'attachments');
