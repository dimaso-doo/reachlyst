/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import styles from "../marketing.module.css";

export default function TermsPage() {
  return <main className={styles.simplePage}><Link className={styles.logo} href="/"><img alt="Reachlyst" src="/reachlyst-logo-blue.png" /></Link><h1>Terms</h1><p>Reachlyst is provided as a Sales Navigator workflow helper and outreach logbook. Users are responsible for their own LinkedIn activity.</p></main>;
}
