import Link from "next/link";
import { Badge, Card, SearchInput } from "@/components/ui";
import { LeadAvatar } from "@/components/LeadAvatar";
import { getDashboardData } from "@/lib/store";
import styles from "../table.module.css";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { leads } = await getDashboardData();
  return <div><h1>Leads</h1><SearchInput placeholder="Search by name, company, title, campaign, status" /><Card className={styles.table}><table><thead><tr><th>Name</th><th>Title</th><th>Campaign</th><th>Status</th></tr></thead><tbody>{leads.map((lead) => <tr className={styles.clickableRow} key={lead.id}><td><div className={styles.leadCell}><LeadAvatar name={lead.name} size="sm" /><Link className={styles.rowLink} href={`/app/leads/${lead.id}`}>{lead.name}</Link></div></td><td>{lead.title} · {lead.company}</td><td>{lead.campaign}</td><td><Badge tone={lead.status === "good_fit" ? "good" : "blue"}>{lead.status}</Badge></td></tr>)}</tbody></table></Card></div>;
}
