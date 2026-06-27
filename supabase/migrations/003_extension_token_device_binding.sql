alter table extension_tokens add column if not exists token_value text;
alter table extension_tokens add column if not exists bound_device_id text;
alter table extension_tokens add column if not exists bound_device_label text;
alter table extension_tokens add column if not exists bound_user_agent text;
alter table extension_tokens add column if not exists bound_at timestamptz;
