import Link from "next/link";
import { Badge, Card, SearchInput } from "@/components/ui";
import { leads } from "@/data/mock";
import styles from "../table.module.css";

export default function LeadsPage() {
  return <div><h1>Leads</h1><SearchInput placeholder="Search by name, company, title, campaign, status" /><Card className={styles.table}><table><thead><tr><th>Name</th><th>Title</th><th>Campaign</th><th>Status</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id}><td><Link href={`/app/leads/${lead.id}`}>{lead.name}</Link></td><td>{lead.title} · {lead.company}</td><td>{lead.campaign}</td><td><Badge tone={lead.status === "good_fit" ? "good" : "blue"}>{lead.status}</Badge></td></tr>)}</tbody></table></Card></div>;
}
