import { Button, Card } from "@/components/ui";
import styles from "../auth.module.css";

export default function SignupPage() {
  return <main className={styles.auth}><Card><h1>Signup</h1><p>Create your Reachlyst workspace. Supabase Auth wiring is ready for project keys.</p><Button>Continue with Google</Button><form><input placeholder="Email" /><input placeholder="Password" type="password" /><Button type="submit">Create account</Button></form><a href="/login">Already have an account?</a></Card></main>;
}
