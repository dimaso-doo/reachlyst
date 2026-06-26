import { redirect } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { getAdminSnapshot } from "@/lib/admin";
import { canAccessSuperAdmin } from "@/lib/superAdmin";
import styles from "./superAdmin.module.css";

function formatDate(value?: string) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);
}

export default async function SuperAdminPage() {
  if (!(await canAccessSuperAdmin())) redirect("/app/dashboard");

  const snapshot = await getAdminSnapshot();

  return <div className={styles.page}>
    <header className={styles.header}>
      <div>
        <span>Super Admin</span>
        <h1>Dashboard</h1>
      </div>
    </header>

    <section className={styles.statsGrid}>
      <Card>
        <span>Monthly revenue</span>
        <strong>{formatMoney(snapshot.stats.monthlyRevenueCents)}</strong>
      </Card>
      <Card>
        <span>Monthly costs</span>
        <strong>{formatMoney(snapshot.stats.monthlyCostsCents)}</strong>
      </Card>
      <Card>
        <span>Monthly profit</span>
        <strong>{formatMoney(snapshot.stats.monthlyProfitCents)}</strong>
      </Card>
    </section>

    <Card className={styles.topSubscribers}>
      <div className={styles.tableHeader}>
        <h2>Top subscribers</h2>
        <span>{snapshot.stats.users} users total</span>
      </div>
      <div className={styles.subscriberList}>
        {snapshot.topSubscribers.map((user) => <div key={user.id}>
          <div><strong>{user.name}</strong><small>{user.email}</small></div>
          <Badge tone={user.status === "active" || user.status === "trialing" ? "good" : user.status === "local" ? "blue" : "neutral"}>{user.plan ?? "free"}</Badge>
          <span>{formatMoney(user.paidSoFarCents)} paid</span>
        </div>)}
      </div>
    </Card>

    <Card className={styles.table}>
      <div className={styles.tableHeader}>
        <h2>All users</h2>
        <span>{snapshot.users.length} total</span>
      </div>
      <table>
        <thead><tr><th>User</th><th>Workspace</th><th>Current plan</th><th>Status</th><th>Paid so far</th><th>Package until</th></tr></thead>
        <tbody>
          {snapshot.users.map((user) => <tr key={user.id}>
            <td><strong>{user.name}</strong><small>{user.email}</small></td>
            <td>{user.workspace ?? "No workspace"}</td>
            <td><Badge tone={user.status === "active" || user.status === "trialing" ? "good" : user.status === "local" ? "blue" : "neutral"}>{user.plan ?? "free"}</Badge></td>
            <td>{user.status ?? "inactive"}</td>
            <td><strong>{formatMoney(user.paidSoFarCents)}</strong></td>
            <td>{formatDate(user.currentPeriodEnd)}</td>
          </tr>)}
        </tbody>
      </table>
    </Card>
  </div>;
}
