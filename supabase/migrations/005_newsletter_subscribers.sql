create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'under_construction',
  user_agent text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table newsletter_subscribers enable row level security;

drop policy if exists "Service role manages newsletter subscribers" on newsletter_subscribers;
create policy "Service role manages newsletter subscribers" on newsletter_subscribers
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
