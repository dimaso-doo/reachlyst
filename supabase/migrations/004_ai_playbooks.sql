create table if not exists ai_playbooks (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  status text not null default 'not_trained',
  raw_notes text not null default '',
  offer text,
  icp text,
  exclusions text,
  tone text,
  cta text,
  default_message_types jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table ai_playbooks enable row level security;

drop policy if exists "Workspace isolated ai playbooks" on ai_playbooks;
create policy "Workspace isolated ai playbooks" on ai_playbooks for all using (is_workspace_member(workspace_id));
