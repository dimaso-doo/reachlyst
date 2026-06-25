import { Badge, Card, StatCard, Timeline } from "@/components/ui";
import { activities, searches } from "@/data/mock";
import styles from "../dashboard.module.css";

export default function DashboardPage() {
  return <div className={styles.page}><header><h1>Dashboard</h1><p>Your control center for manual Sales Navigator outreach.</p></header><section className={styles.stats}>{["3 total searches", "146 total leads", "54 good fits", "9 skipped", "35 invites sent", "10 replies detected", "7 follow-ups needed"].map((item) => { const [value, ...label] = item.split(" "); return <StatCard key={item} value={value} label={label.join(" ")} />; })}</section><h2>Search Campaigns</h2><div className={styles.grid}>{searches.map((search) => <Card key={search.id} className={styles.searchCard}><h3>{search.name}</h3><p>{search.url}</p><div><Badge tone="good">{search.good} good fits</Badge><Badge tone="blue">{search.invited} invited</Badge><Badge tone="warn">{search.replied} replies</Badge></div></Card>)}</div><h2>Recent activity</h2><Card className={styles.panel}><Timeline events={activities} /></Card></div>;
}
