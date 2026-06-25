import { Button, Card } from "@/components/ui";
import styles from "../auth.module.css";

export default function LoginPage() {
  return <main className={styles.auth}><Card><h1>Login</h1><p>Use the demo account while Supabase Auth keys are not configured.</p><div className={styles.demoBox}><strong>Demo account</strong><span>demo@reachlyst.local</span><span>reachlyst-demo</span></div><Button href="/app/dashboard">Enter demo dashboard</Button><Button variant="secondary">Continue with Google</Button><form><input placeholder="Email" defaultValue="demo@reachlyst.local" /><input placeholder="Password" type="password" defaultValue="reachlyst-demo" /><Button href="/app/dashboard">Login</Button></form><a href="/signup">Create account</a></Card></main>;
}
