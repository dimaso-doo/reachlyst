import { Button, Card } from "@/components/ui";
import styles from "../lead.module.css";

export default function SettingsPage() {
  return <div><h1>Settings</h1><section className={styles.grid}><Card><h2>Profile</h2><p>Email: user@example.com</p><p>Google account: connected@example.com</p><Button variant="secondary">Change password</Button></Card><Card><h2>Extension token</h2><p>rly_live_mock_token_••••••••</p><Button>Regenerate extension token</Button></Card><Card><h2>Subscription</h2><p>Plan: Pro</p><p>Status: active</p></Card></section></div>;
}
