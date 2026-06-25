import { Button, Card } from "@/components/ui";
import styles from "../auth.module.css";

export default function LoginPage() {
  return <main className={styles.auth}><Card><h1>Login</h1><p>Use Google OAuth or email/password through Supabase Auth.</p><Button>Continue with Google</Button><form><input placeholder="Email" /><input placeholder="Password" type="password" /><Button type="submit">Login</Button></form><a href="/signup">Create account</a></Card></main>;
}
