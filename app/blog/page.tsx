/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import styles from "../marketing.module.css";

export default function BlogPage() {
  return <main className={styles.simplePage}><Link className={styles.logo} href="/"><img alt="Reachlyst" src="/reachlyst-logo-blue.png" /></Link><h1>Blog</h1><p>Guides for better Sales Navigator lead review, invite copy, and outbound workflow design are coming soon.</p></main>;
}
