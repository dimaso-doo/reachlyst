import Link from "next/link";
import { Badge, Card, SearchInput } from "@/components/ui";
import { leads, searches } from "@/data/mock";
import styles from "../../table.module.css";

const filters = ["New", "Good fit", "Maybe", "Skip", "Copied", "Invited", "Connected", "Replied", "Follow-up needed"];

export default async function SearchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const search = searches.find((item) => item.id === id) ?? searches[0];
  return <div><h1>{search.name}</h1><p>{search.url}</p><div className={styles.filters}>{filters.map((filter) => <button key={filter}>{filter}</button>)}</div><SearchInput placeholder="Search leads in campaign" /><Card className={styles.table}><table><thead><tr><th>Name</th><th>Title</th><th>Company</th><th>Status</th><th>Location</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id}><td><Link href={`/app/leads/${lead.id}`}>{lead.name}</Link></td><td>{lead.title}</td><td>{lead.company}</td><td><Badge tone={lead.status === "good_fit" ? "good" : lead.status === "replied" ? "warn" : "blue"}>{lead.status}</Badge></td><td>{lead.location}</td></tr>)}</tbody></table></Card></div>;
}
