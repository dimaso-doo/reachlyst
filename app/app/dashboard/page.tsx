import { Badge, Card, StatCard, Timeline } from "@/components/ui";
import { getDashboardData } from "@/lib/store";
import styles from "../dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { searches, leads, activities } = await getDashboardData();
  const stats = [
    [`${searches.length}`, "total searches"],
    [`${leads.length}`, "total leads"],
    [`${leads.filter((lead) => lead.status === "good_fit").length}`, "good fits"],
    [`${leads.filter((lead) => lead.status === "skip").length}`, "skipped"],
    [`${leads.filter((lead) => ["invite_likely_sent", "invite_sent"].includes(lead.status)).length}`, "invites sent"],
    [`${leads.filter((lead) => lead.status === "replied").length}`, "replies detected"],
    [`${leads.filter((lead) => lead.status === "follow_up_needed").length}`, "follow-ups needed"]
  ];
  return <div className={styles.page}><header><h1>Dashboard</h1><p>Your control center for manual Sales Navigator outreach.</p></header><section className={styles.stats}>{stats.map(([value, label]) => <StatCard key={label} value={value} label={label} />)}</section><h2>Search Campaigns</h2><div className={styles.grid}>{searches.map((search) => <Card key={search.id} className={styles.searchCard}><h3>{search.name}</h3><p>{search.url}</p><div><Badge tone="good">{search.good} good fits</Badge><Badge tone="blue">{search.invited} invited</Badge><Badge tone="warn">{search.replied} replies</Badge></div></Card>)}</div><h2>Recent activity</h2><Card className={styles.panel}><Timeline events={activities.slice(0, 10)} /></Card></div>;
}
