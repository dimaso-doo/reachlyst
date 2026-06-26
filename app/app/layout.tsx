/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { AppSidebarNav } from "@/components/AppSidebarNav";
import { getDemoSession } from "@/lib/demoSession";
import { canAccessSuperAdmin } from "@/lib/superAdmin";
import styles from "./app.module.css";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [showSuperAdmin, demo] = await Promise.all([canAccessSuperAdmin(), getDemoSession()]);

  return <div className={styles.shell}>
    <aside>
      <Link className={styles.logo} href={showSuperAdmin ? "/app/admin" : "/app/dashboard"}><img alt="Reachlyst" src="/reachlyst-logo-blue.png" /></Link>
      <nav className={styles.navGroup} aria-label="Primary">
        {showSuperAdmin ? <Link href="/app/admin">Dashboard</Link> : <AppSidebarNav />}
      </nav>
      <div className={styles.sidebarSpacer} />
      <Link className={styles.member} href="/app/settings">
        <span aria-hidden="true">{demo.isSuperAdmin ? "A" : "P"}</span>
        <div>
          <strong>{demo.name}</strong>
          <small>{demo.isSuperAdmin ? "Super admin demo" : "Workspace owner"}</small>
        </div>
      </Link>
      <Link className={styles.logoutLink} href="/api/demo-logout">Log out</Link>
    </aside>
    <main><div className={styles.contentFrame}>{children}</div></main>
  </div>;
}
