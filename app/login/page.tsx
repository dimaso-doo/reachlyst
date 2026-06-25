import { Button, Card } from "@/components/ui";
import { GoogleIcon } from "@/components/GoogleIcon";
import styles from "../auth.module.css";

const authErrors: Record<string, string> = {
  "supabase-auth-not-configured": "Supabase auth keys are missing in the app environment.",
  "google-oauth-not-configured": "Google OAuth is not enabled in Supabase, or the Google redirect URL is missing.",
  "auth-callback-failed": "Google did not return an auth code.",
  "auth-session-failed": "Supabase could not create a session from the Google callback."
};

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ error?: string; demo?: string }> }) {
  const params = await searchParams;
  const error = params?.error ? authErrors[params.error] : null;
  const showDemo = params?.demo === "1" || process.env.SHOW_DEMO_LOGIN === "true";
  return <main className={styles.auth}><Card><div className={styles.brand}>Reachlyst</div><h1>Log in</h1><p>Continue to your Sales Navigator outreach workspace.</p>{error ? <div className={styles.authError}>{error}</div> : null}<a className={styles.googleButton} href="/api/auth/google"><GoogleIcon />Log in with Google</a><div className={styles.divider}><span>or</span></div><form><input placeholder="Email" defaultValue="" /><input placeholder="Password" type="password" defaultValue="" /><Button href="/app/dashboard">Log in with email</Button></form>{showDemo ? <div className={styles.demoBox}><strong>Private demos</strong><span>Workspace demo: demo@reachlyst.local</span><a href="/api/demo-login?role=workspace_owner">Open workspace demo</a><span>Super admin demo: admin@reachlyst.local</span><a href="/api/demo-login?role=super_admin">Open super admin demo</a></div> : null}<p className={styles.switch}>No account? <a href="/signup">Sign up</a></p></Card></main>;
}
