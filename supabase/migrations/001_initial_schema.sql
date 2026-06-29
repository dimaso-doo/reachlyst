create extension if not exists "pgcrypto";

create type lead_status as enum ('new','good_fit','maybe','skip','message_generated','copied','invite_likely_sent','invite_sent','connected','first_message_sent','follow_up_needed','follow_up_sent','replied','not_interested');
create type activity_type as enum ('search_detected','lead_imported','ai_analyzed','message_generated','message_copied','connect_modal_detected','invite_likely_sent','invite_confirmed_if_detected','thread_found','message_thread_synced','reply_detected','follow_up_needed','skipped','note_added');
create type sender_type as enum ('user','lead','unknown');
create type message_source as enum ('linkedin_messages','sales_inbox');

create table profiles (id uuid primary key references auth.users(id) on delete cascade, email text, full_name text, avatar_url text, marketing_email_consent boolean not null default false, marketing_email_consent_at timestamptz, created_at timestamptz default now());
create table workspaces (id uuid primary key default gen_random_uuid(), name text not null, owner_id uuid references profiles(id), created_at timestamptz default now());
create table workspace_members (workspace_id uuid references workspaces(id) on delete cascade, user_id uuid references profiles(id) on delete cascade, role text not null default 'member', created_at timestamptz default now(), primary key (workspace_id, user_id));
create table subscriptions (id uuid primary key default gen_random_uuid(), workspace_id uuid references workspaces(id) on delete cascade, stripe_customer_id text, stripe_subscription_id text, plan text not null default 'starter', status text not null default 'inactive', current_period_end timestamptz, created_at timestamptz default now());
create table extension_tokens (id uuid primary key default gen_random_uuid(), workspace_id uuid references workspaces(id) on delete cascade, user_id uuid references profiles(id) on delete cascade, token_hash text not null, token_value text, name text default 'Chrome Extension', bound_device_id text, bound_device_label text, bound_user_agent text, bound_at timestamptz, revoked_at timestamptz, last_used_at timestamptz, created_at timestamptz default now());
create table search_campaigns (id uuid primary key default gen_random_uuid(), workspace_id uuid references workspaces(id) on delete cascade, name text not null, sales_navigator_url text not null, ai_use_case text default 'sales_outreach', ai_icp text, ai_offer text, ai_tone text, ai_instructions text, created_by uuid references profiles(id), last_synced_at timestamptz, created_at timestamptz default now());
create table leads (id uuid primary key default gen_random_uuid(), workspace_id uuid references workspaces(id) on delete cascade, normalized_linkedin_url text not null, linkedin_url text, sales_navigator_url text, name text not null, title text, company text, location text, status lead_status not null default 'new', created_at timestamptz default now(), updated_at timestamptz default now(), unique (workspace_id, normalized_linkedin_url));
create table lead_campaigns (lead_id uuid references leads(id) on delete cascade, search_campaign_id uuid references search_campaigns(id) on delete cascade, created_at timestamptz default now(), primary key (lead_id, search_campaign_id));
create table ai_analyses (id uuid primary key default gen_random_uuid(), workspace_id uuid references workspaces(id) on delete cascade, lead_id uuid references leads(id) on delete cascade, fit lead_status not null, reason text, confidence numeric, model text, input_tokens int default 0, output_tokens int default 0, cost_estimate numeric default 0, created_at timestamptz default now());
create table generated_messages (id uuid primary key default gen_random_uuid(), workspace_id uuid references workspaces(id) on delete cascade, lead_id uuid references leads(id) on delete cascade, message_type text not null, body text not null, copied_at timestamptz, created_at timestamptz default now());
create table linkedin_threads (id uuid primary key default gen_random_uuid(), workspace_id uuid references workspaces(id) on delete cascade, lead_id uuid references leads(id) on delete set null, thread_url text, last_synced_at timestamptz, reply_detected boolean default false, created_at timestamptz default now());
create table linkedin_messages (id uuid primary key default gen_random_uuid(), workspace_id uuid references workspaces(id) on delete cascade, lead_id uuid references leads(id) on delete set null, thread_id uuid references linkedin_threads(id) on delete cascade, sender_type sender_type not null default 'unknown', body text not null, sent_at timestamptz, source message_source not null, synced_at timestamptz default now());
create table activities (id uuid primary key default gen_random_uuid(), workspace_id uuid references workspaces(id) on delete cascade, lead_id uuid references leads(id) on delete set null, search_campaign_id uuid references search_campaigns(id) on delete set null, type activity_type not null, metadata jsonb default '{}', created_at timestamptz default now());
create table extension_events (id uuid primary key default gen_random_uuid(), workspace_id uuid references workspaces(id) on delete cascade, user_id uuid references profiles(id) on delete set null, event_type text not null, metadata jsonb default '{}', created_at timestamptz default now());
create table parser_reports (id uuid primary key default gen_random_uuid(), workspace_id uuid references workspaces(id) on delete cascade, parser_version text not null, extension_version text not null, page_type text not null, extracted_count int not null default 0, failures jsonb default '[]', url text, created_at timestamptz default now());

alter table profiles enable row level security;
alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table subscriptions enable row level security;
alter table extension_tokens enable row level security;
alter table search_campaigns enable row level security;
alter table leads enable row level security;
alter table lead_campaigns enable row level security;
alter table ai_analyses enable row level security;
alter table generated_messages enable row level security;
alter table linkedin_threads enable row level security;
alter table linkedin_messages enable row level security;
alter table activities enable row level security;
alter table extension_events enable row level security;
alter table parser_reports enable row level security;

create or replace function is_workspace_member(target_workspace uuid) returns boolean language sql stable security definer as $$
  select exists (select 1 from workspace_members where workspace_id = target_workspace and user_id = auth.uid());
$$;

create policy "Users can read own profile" on profiles for select using (id = auth.uid());
create policy "Members read workspaces" on workspaces for select using (is_workspace_member(id));
create policy "Members read membership" on workspace_members for select using (is_workspace_member(workspace_id));

create policy "Workspace isolated subscriptions" on subscriptions for all using (is_workspace_member(workspace_id));
create policy "Workspace isolated extension tokens" on extension_tokens for all using (is_workspace_member(workspace_id));
create policy "Workspace isolated searches" on search_campaigns for all using (is_workspace_member(workspace_id));
create policy "Workspace isolated leads" on leads for all using (is_workspace_member(workspace_id));
create policy "Workspace isolated analyses" on ai_analyses for all using (is_workspace_member(workspace_id));
create policy "Workspace isolated messages" on generated_messages for all using (is_workspace_member(workspace_id));
create policy "Workspace isolated threads" on linkedin_threads for all using (is_workspace_member(workspace_id));
create policy "Workspace isolated linkedin messages" on linkedin_messages for all using (is_workspace_member(workspace_id));
create policy "Workspace isolated activities" on activities for all using (is_workspace_member(workspace_id));
create policy "Workspace isolated extension events" on extension_events for all using (is_workspace_member(workspace_id));
create policy "Workspace isolated parser reports" on parser_reports for all using (is_workspace_member(workspace_id));
