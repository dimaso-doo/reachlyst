/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import styles from "../marketing.module.css";

export default function PrivacyPage() {
  return <main className={styles.simplePage}><Link className={styles.logo} href="/"><img alt="Reachlyst" src="/reachlyst-logo-blue.png" /></Link><h1>Privacy Policy</h1><p>Reachlyst stores workspace, lead, search, and outreach log data needed to run the product. LinkedIn credentials are not collected.</p></main>;
}
