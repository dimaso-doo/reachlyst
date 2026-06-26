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

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function customerAge(value?: string) {
  if (!value) return "Unknown";
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  if (days < 1) return "Today";
  if (days < 60) return `${days} days`;
  const months = Math.floor(days / 30);
  if (months < 24) return `${months} months`;
  return `${Math.floor(months / 12)} years`;
}

export default async function SuperAdminPage() {
  if (!(await canAccessSuperAdmin())) redirect("/app/dashboard");

  const snapshot = await getAdminSnapshot();

  return <div className={styles.page}>
    <header className={styles.header}>
      <div>
        <span>Super Admin</span>
        <h1>Users</h1>
      </div>
    </header>

    <Card className={styles.table}>
      <div className={styles.tableHeader}>
        <h2>All users</h2>
        <span>{snapshot.users.length} total</span>
      </div>
      <table>
        <thead><tr><th>User</th><th>Plan</th><th>Customer age</th><th>Money spent</th><th>Resources</th><th>Last active</th></tr></thead>
        <tbody>
          {snapshot.users.map((user) => <tr key={user.id}>
            <td><strong>{user.name}</strong><small>{user.email}</small><small>{user.workspace ?? "No workspace"} · {user.role ?? "member"}</small></td>
            <td><Badge tone={user.status === "active" ? "good" : user.status === "local" ? "blue" : "neutral"}>{user.plan ?? "free"} · {user.status ?? "inactive"}</Badge>{user.currentPeriodEnd ? <small>Renews {formatDate(user.currentPeriodEnd)}</small> : null}</td>
            <td><strong>{customerAge(user.createdAt)}</strong><small>Since {formatDate(user.createdAt)}</small></td>
            <td><strong>{formatMoney(user.moneySpentCents)}</strong></td>
            <td>
              <div className={styles.resourceList}>
                <span>{formatNumber(user.searches)} searches</span>
                <span>{formatNumber(user.leads)} leads</span>
                <span>{formatNumber(user.aiSuggestions)} AI suggestions</span>
                <span>{formatNumber(user.messagesSynced)} synced messages</span>
                <span>{formatNumber(user.aiTokens)} AI tokens</span>
                <span>{formatNumber(user.extensionTokens)} extension sessions</span>
              </div>
            </td>
            <td>{formatDate(user.lastSignInAt ?? user.createdAt)}</td>
          </tr>)}
        </tbody>
      </table>
    </Card>
  </div>;
}
