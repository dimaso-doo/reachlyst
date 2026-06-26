import { AccountSettingsForm } from "@/components/AccountSettingsForm";
import styles from "../lead.module.css";

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <header>
        <div>
          <h1>Profile</h1>
          <p>Basic account and workspace details. AI behavior now lives in AI Playbook.</p>
        </div>
      </header>

      <AccountSettingsForm />
    </div>
  );
}
