import { Button, Card } from "@/components/ui";
import styles from "../lead.module.css";

export default function SettingsPage() {
  return <div><h1>Settings</h1><section className={styles.grid}><Card><h2>Profile</h2><p>Email: user@example.com</p><p>Google account: connected@example.com</p><Button variant="secondary">Change password</Button></Card><Card><h2>Extension</h2><p>Chrome extension access is handled automatically. Open the extension and click Start or Stop.</p></Card><Card><h2>Subscription</h2><p>Plan: Growth</p><p>Status: active</p></Card></section></div>;
}
