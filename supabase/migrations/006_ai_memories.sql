create table if not exists ai_memories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  category text not null default 'general',
  content text not null,
  source text not null default 'manual',
  content_hash text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (workspace_id, content_hash)
);

create index if not exists ai_memories_workspace_updated_idx on ai_memories(workspace_id, updated_at desc);
create index if not exists ai_memories_workspace_category_idx on ai_memories(workspace_id, category);

alter table ai_memories enable row level security;

drop policy if exists "Workspace isolated ai memories" on ai_memories;
create policy "Workspace isolated ai memories" on ai_memories for all using (is_workspace_member(workspace_id));
