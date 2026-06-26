import { AccountSettingsForm } from "@/components/AccountSettingsForm";
import styles from "../lead.module.css";

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <header>
        <div>
          <h1>Account settings</h1>
          <p>Profile, workspace, extension, and outreach defaults.</p>
        </div>
      </header>

      <AccountSettingsForm />
    </div>
  );
}
