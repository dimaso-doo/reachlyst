import { Button, Card } from "@/components/ui";
import { GoogleIcon } from "@/components/GoogleIcon";
import styles from "../auth.module.css";

export default function SignupPage() {
  return <main className={styles.auth}><Card><div className={styles.brand}>Reachlyst</div><h1>Create account</h1><p>Start a read-only outreach logbook for Sales Navigator.</p><a className={styles.googleButton} href="/api/auth/google"><GoogleIcon />Sign up with Google</a><div className={styles.divider}><span>or</span></div><form><input placeholder="Work email" /><input placeholder="Password" type="password" /><Button href="/app/dashboard">Create account with email</Button></form><p className={styles.switch}>Already have an account? <a href="/login">Log in</a></p></Card></main>;
}
