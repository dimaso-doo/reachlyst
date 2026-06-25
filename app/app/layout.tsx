import Link from "next/link";
import styles from "./app.module.css";

const nav = [
  ["Dashboard", "/app/dashboard"],
  ["Searches", "/app/searches"],
  ["Leads", "/app/leads"],
  ["Messages", "/app/messages"],
  ["Settings", "/app/settings"],
  ["Billing", "/app/billing"],
  ["Extension", "/app/extension"]
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.shell}><aside><Link className={styles.brand} href="/app/dashboard">Reachlyst</Link>{nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}<button>Logout</button></aside><main>{children}</main></div>;
}
