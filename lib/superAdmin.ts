import { getDemoSession } from "@/lib/demoSession";
import { getSupabaseAuthClient } from "@/lib/supabaseAuth";

export async function canAccessSuperAdmin() {
  const demo = await getDemoSession();
  if (demo.isSuperAdmin) return true;

  const allowedEmails = (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!allowedEmails.length) return false;

  const supabase = await getSupabaseAuthClient();
  if (!supabase) return false;

  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  return Boolean(email && allowedEmails.includes(email));
}
