import Link from "next/link";
import { Badge, Card, StatCard } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { truncateMiddle } from "@/lib/format";
import { getDashboardData } from "@/lib/store";
import styles from "../dashboard.module.css";
import tableStyles from "../table.module.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { searches, leads } = await getDashboardData();
  const goodFits = leads.filter((lead) => lead.status === "good_fit").length;
  const invited = leads.filter((lead) => ["invite_likely_sent", "invite_sent"].includes(lead.status)).length;
  const messagesSent = leads.filter((lead) => ["first_message_sent", "follow_up_sent"].includes(lead.status)).length;
  const replied = leads.filter((lead) => lead.status === "replied").length;
  const skipped = leads.filter((lead) => lead.status === "skip").length;
  const maxMetric = Math.max(leads.length, goodFits, invited, messagesSent, replied, skipped, 1);
  const stats = [
    [`${searches.length}`, "total searches"],
    [`${leads.length}`, "total leads"],
    [`${goodFits}`, "good fits"],
    [`${invited}`, "invites sent"],
    [`${messagesSent}`, "messages sent"]
  ];
  const chart = [
    ["Total leads", leads.length],
    ["Good fit", goodFits],
    ["Skipped", skipped],
    ["Invited", invited],
    ["Messages", messagesSent],
    ["Replies", replied]
  ] as const;

  return <div className={styles.page}><h1>Dashboard</h1><section className={styles.stats}>{stats.map(([value, label]) => <StatCard key={label} value={value} label={label} />)}</section><section className={styles.grid}><Card className={styles.panel}><h2>Pipeline</h2><div className={styles.bars}>{chart.map(([label, value]) => <div className={styles.barRow} key={label}><span>{label}</span><div><strong style={{ width: `${Math.max(4, (value / maxMetric) * 100)}%` }} /></div><em>{value}</em></div>)}</div></Card><Card className={styles.panel}><h2>Fit mix</h2><div className={styles.donut} style={{ background: `conic-gradient(#147c6c 0 ${Math.round((goodFits / maxMetric) * 360)}deg, #d99b32 ${Math.round((goodFits / maxMetric) * 360)}deg ${Math.round(((goodFits + skipped) / maxMetric) * 360)}deg, #dfe5ec 0)` }}><span>{leads.length ? Math.round((goodFits / leads.length) * 100) : 0}%</span></div><p>Good fit rate</p></Card></section><section className={styles.focus}><div className={styles.sectionHeader}><h2>Searches</h2><Link href="/app/searches">View all</Link></div><Card className={tableStyles.table}><table><thead><tr><th>Search</th><th>Leads</th><th>Good fit</th><th>Invited</th><th>Replied</th></tr></thead><tbody>{searches.slice(0, 8).map((search) => <tr className={tableStyles.clickableRow} key={search.id}><td><Link className={tableStyles.rowLink} href={`/app/searches/${search.id}`}>{search.name}</Link><div className={tableStyles.urlLine}><span className={tableStyles.urlText} title={search.url}>{truncateMiddle(search.url)}</span><CopyButton value={search.url} /></div></td><td>{search.leads}</td><td><Badge tone="good">{search.good}</Badge></td><td>{search.invited}</td><td>{search.replied}</td></tr>)}</tbody></table></Card></section></div>;
}
