alter table profiles add column if not exists marketing_email_consent boolean not null default false;
alter table profiles add column if not exists marketing_email_consent_at timestamptz;
