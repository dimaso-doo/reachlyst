import { Button, Card } from "@/components/ui";
import styles from "../dashboard.module.css";

export default function DashboardPage() {
  return (
    <div className={styles.accountHub}>
      <header>
        <h1>Account</h1>
        <p>Reachlyst runs from the Chrome extension. Use the web app only for profile and billing.</p>
      </header>

      <section className={styles.accountCards}>
        <Card className={styles.accountCard}>
          <h2>Profile</h2>
          <p>Update your workspace, contact details, and outreach defaults.</p>
          <Button href="/app/settings">Open profile</Button>
        </Card>

        <Card className={styles.accountCard}>
          <h2>Billing</h2>
          <p>Manage subscription access, extension token, and the Chrome extension download.</p>
          <Button href="/app/billing">Open billing</Button>
        </Card>
      </section>
    </div>
  );
}
