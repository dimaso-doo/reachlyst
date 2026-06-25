import { Card } from "@/components/ui";
import styles from "../lead.module.css";

export default function ExtensionPage() {
  return <div><h1>Chrome Extension</h1><section className={styles.grid}><Card><h2>Status</h2><p>Manifest V3 extension ready for local loading from /extension.</p><p>Allowed pages: linkedin.com/sales/* and linkedin.com/messaging/*.</p></Card><Card><h2>Manual workflow</h2><p>Log into LinkedIn yourself, browse Sales Navigator manually, copy generated messages, and send manually. Reachlyst reads visible data only.</p></Card></section></div>;
}
