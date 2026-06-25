import { redirect } from "next/navigation";
import { Badge, Button, Card, StatCard } from "@/components/ui";
import { getAdminSnapshot } from "@/lib/admin";
import { canAccessSuperAdmin } from "@/lib/superAdmin";
import styles from "./superAdmin.module.css";

function formatDate(value?: string) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default async function SuperAdminPage() {
  if (!(await canAccessSuperAdmin())) redirect("/app/dashboard");

  const snapshot = await getAdminSnapshot();

  return <div className={styles.page}>
    <header className={styles.header}>
      <div>
        <span>Super Admin</span>
        <h1>Users and early access</h1>
      </div>
      <Button href="/app/dashboard" variant="secondary">Back to workspace</Button>
    </header>

    <section className={styles.stats}>
      <StatCard label="Users" value={String(snapshot.stats.users)} />
      <StatCard label="Workspaces" value={String(snapshot.stats.workspaces)} />
      <StatCard label="Searches" value={String(snapshot.stats.searches)} />
      <StatCard label="Leads" value={String(snapshot.stats.leads)} />
      <StatCard label="Active subscriptions" value={String(snapshot.stats.activeSubscriptions)} />
    </section>

    <section className={styles.grid}>
      <Card className={styles.couponCard}>
        <span>Early adopters</span>
        <h2>{snapshot.earlyAdopter.code}</h2>
        <p>Use this code for early users when you decide to give free access. Stripe will apply it automatically only when the coupon ID is configured.</p>
        <div className={styles.couponMeta}>
          <Badge tone={snapshot.earlyAdopter.enabled ? "good" : "warn"}>{snapshot.earlyAdopter.enabled ? "Enabled" : "Disabled"}</Badge>
          <Badge tone={snapshot.earlyAdopter.stripeCouponConfigured ? "good" : "warn"}>{snapshot.earlyAdopter.stripeCouponConfigured ? "Stripe coupon configured" : "Missing Stripe coupon ID"}</Badge>
        </div>
        <form action="/api/stripe/checkout" method="post">
          <input name="plan" type="hidden" value="growth" />
          <input name="coupon" type="hidden" value={snapshot.earlyAdopter.code} />
          <Button type="submit">Test Growth checkout with coupon</Button>
        </form>
      </Card>

      <Card className={styles.notesCard}>
        <h2>Coupon setup</h2>
        <p>Create a 100% off coupon in Stripe, then add its ID to <code>STRIPE_EARLY_ADOPTER_COUPON_ID</code>. Toggle automatic use with <code>EARLY_ADOPTER_COUPON_ENABLED=true</code>.</p>
      </Card>
    </section>

    <Card className={styles.table}>
      <div className={styles.tableHeader}>
        <h2>All users</h2>
        <span>{snapshot.users.length} total</span>
      </div>
      <table>
        <thead><tr><th>User</th><th>Workspace</th><th>Plan</th><th>Usage</th><th>Extension</th><th>Last sign in</th></tr></thead>
        <tbody>
          {snapshot.users.map((user) => <tr key={user.id}>
            <td><strong>{user.name}</strong><small>{user.email}</small></td>
            <td><strong>{user.workspace ?? "No workspace"}</strong><small>{user.role ?? "member"}</small></td>
            <td><Badge tone={user.status === "active" ? "good" : user.status === "local" ? "blue" : "neutral"}>{user.plan ?? "free"} · {user.status ?? "inactive"}</Badge></td>
            <td><span>{user.searches} searches</span><small>{user.leads} leads</small></td>
            <td>{user.extensionTokens} active token{user.extensionTokens === 1 ? "" : "s"}</td>
            <td>{formatDate(user.lastSignInAt ?? user.createdAt)}</td>
          </tr>)}
        </tbody>
      </table>
    </Card>
  </div>;
}
