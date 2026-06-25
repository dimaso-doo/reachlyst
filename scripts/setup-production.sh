#!/usr/bin/env bash
set -euo pipefail

required_vars=(
  SUPABASE_ACCESS_TOKEN
  SUPABASE_PROJECT_REF
  SUPABASE_DB_PASSWORD
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
)

missing=()
for var_name in "${required_vars[@]}"; do
  if [[ -z "${!var_name:-}" ]]; then
    missing+=("$var_name")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "Missing required environment variables:"
  printf ' - %s\n' "${missing[@]}"
  echo
  echo "Export them in your shell, then rerun:"
  echo "  ./scripts/setup-production.sh"
  exit 1
fi

VERCEL_BIN="${VERCEL_BIN:-pnpm dlx vercel}"

echo "Logging in to Supabase CLI..."
supabase login --token "$SUPABASE_ACCESS_TOKEN" --output-format text

echo "Linking Supabase project $SUPABASE_PROJECT_REF..."
supabase link --project-ref "$SUPABASE_PROJECT_REF" --password "$SUPABASE_DB_PASSWORD" --output-format text

echo "Pushing Supabase migrations..."
supabase db push --linked --password "$SUPABASE_DB_PASSWORD" --output-format text

set_vercel_env() {
  local name="$1"
  local value="$2"
  local target="$3"

  echo "Setting Vercel env $name for $target..."
  $VERCEL_BIN env add "$name" "$target" --value "$value" --yes --force >/dev/null
}

for target in production preview development; do
  set_vercel_env NEXT_PUBLIC_SUPABASE_URL "$NEXT_PUBLIC_SUPABASE_URL" "$target"
  set_vercel_env NEXT_PUBLIC_SUPABASE_ANON_KEY "$NEXT_PUBLIC_SUPABASE_ANON_KEY" "$target"
  set_vercel_env SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE_ROLE_KEY" "$target"

  if [[ -n "${OPENAI_API_KEY:-}" ]]; then
    set_vercel_env OPENAI_API_KEY "$OPENAI_API_KEY" "$target"
  fi

  if [[ -n "${EXTENSION_TOKEN_PEPPER:-}" ]]; then
    set_vercel_env EXTENSION_TOKEN_PEPPER "$EXTENSION_TOKEN_PEPPER" "$target"
  fi

  if [[ -n "${STRIPE_SECRET_KEY:-}" ]]; then
    set_vercel_env STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY" "$target"
  fi

  if [[ -n "${STRIPE_WEBHOOK_SECRET:-}" ]]; then
    set_vercel_env STRIPE_WEBHOOK_SECRET "$STRIPE_WEBHOOK_SECRET" "$target"
  fi
done

echo "Redeploying Vercel production..."
$VERCEL_BIN --prod --yes

echo "Production setup complete."
