import { redirect } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { getAdminSnapshot } from "@/lib/admin";
import { canAccessSuperAdmin } from "@/lib/superAdmin";

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

  return <div className="grid gap-5">
    <header className="flex items-end justify-between gap-4">
      <div>
        <span className="text-xs font-extrabold uppercase tracking-widest text-accent-strong">Super Admin</span>
        <h1 className="mt-2 text-4xl font-extrabold leading-none text-ink">Dashboard</h1>
      </div>
    </header>

    <section className="grid gap-4 xl:grid-cols-3">
      <Card className="p-6">
        <span className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-muted">Monthly revenue</span>
        <strong className="block text-4xl font-extrabold leading-none text-ink">{formatMoney(snapshot.stats.monthlyRevenueCents)}</strong>
      </Card>
      <Card className="p-6">
        <span className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-muted">Monthly costs</span>
        <strong className="block text-4xl font-extrabold leading-none text-ink">{formatMoney(snapshot.stats.monthlyCostsCents)}</strong>
      </Card>
      <Card className="p-6">
        <span className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-muted">Monthly profit</span>
        <strong className="block text-4xl font-extrabold leading-none text-ink">{formatMoney(snapshot.stats.monthlyProfitCents)}</strong>
      </Card>
    </section>

    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-5">
        <h2 className="text-lg font-extrabold text-ink">Top subscribers</h2>
        <span className="text-sm font-extrabold text-muted">{snapshot.stats.users} users total</span>
      </div>
      <div className="grid">
        {snapshot.topSubscribers.map((user) => <div className="grid items-center gap-4 border-t border-line px-6 py-4 md:grid-cols-[minmax(0,1fr)_auto_auto]" key={user.id}>
          <div><strong className="block font-extrabold text-ink">{user.name}</strong><small className="mt-1 block text-xs font-semibold text-muted">{user.email}</small></div>
          <Badge tone={user.status === "active" || user.status === "trialing" ? "good" : user.status === "local" ? "blue" : "neutral"}>{user.plan ?? "free"}</Badge>
          <span className="font-extrabold text-ink">{formatMoney(user.paidSoFarCents)} paid</span>
        </div>)}
      </div>
    </Card>

    <Card className="overflow-x-auto p-0">
      <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-5">
        <h2 className="text-lg font-extrabold text-ink">All users</h2>
        <span className="text-sm font-extrabold text-muted">{snapshot.users.length} total</span>
      </div>
      <table className="min-w-[920px] w-full border-collapse">
        <thead><tr className="bg-blue-50 text-left text-xs uppercase tracking-wide text-muted"><th className="p-4">User</th><th className="p-4">Workspace</th><th className="p-4">Current plan</th><th className="p-4">Status</th><th className="p-4">Paid so far</th><th className="p-4">Package until</th></tr></thead>
        <tbody>
          {snapshot.users.map((user) => <tr key={user.id}>
            <td className="border-t border-line p-4 align-top"><strong className="block font-extrabold text-ink">{user.name}</strong><small className="mt-1 block text-xs font-semibold text-muted">{user.email}</small></td>
            <td className="border-t border-line p-4 align-top text-sm font-semibold text-muted">{user.workspace ?? "No workspace"}</td>
            <td className="border-t border-line p-4 align-top"><Badge tone={user.status === "active" || user.status === "trialing" ? "good" : user.status === "local" ? "blue" : "neutral"}>{user.plan ?? "free"}</Badge></td>
            <td className="border-t border-line p-4 align-top text-sm font-semibold text-muted">{user.status ?? "inactive"}</td>
            <td className="border-t border-line p-4 align-top"><strong className="block font-extrabold text-ink">{formatMoney(user.paidSoFarCents)}</strong></td>
            <td className="border-t border-line p-4 align-top text-sm font-semibold text-muted">{formatDate(user.currentPeriodEnd)}</td>
          </tr>)}
        </tbody>
      </table>
    </Card>
  </div>;
}
