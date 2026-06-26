import Link from "next/link";
import { getDemoSession } from "@/lib/demoSession";
import { canAccessSuperAdmin } from "@/lib/superAdmin";
import styles from "./app.module.css";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [showSuperAdmin, demo] = await Promise.all([canAccessSuperAdmin(), getDemoSession()]);

  return <div className={styles.shell}>
    <aside>
      <Link className={styles.logo} href="/app/dashboard">Reachlyst</Link>
      <nav className={styles.navGroup} aria-label="Primary">
        <Link href="/app/settings">Profile</Link>
        <Link href="/app/billing">Billing</Link>
        {showSuperAdmin ? <Link href="/app/admin">Super Admin</Link> : null}
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
    <main>{children}</main>
  </div>;
}
