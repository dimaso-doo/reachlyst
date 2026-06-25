import Link from "next/link";
import { Badge, Card, SearchInput } from "@/components/ui";
import { getDashboardData } from "@/lib/store";
import styles from "../table.module.css";

export const dynamic = "force-dynamic";

export default async function SearchesPage() {
  const { searches } = await getDashboardData();
  return <div><h1>Search Campaigns</h1><SearchInput placeholder="Search campaigns" /><Card className={styles.table}><table><thead><tr><th>Name</th><th>Leads</th><th>Good fit</th><th>Invited</th><th>Replied</th><th>Last synced</th></tr></thead><tbody>{searches.map((search) => <tr key={search.id}><td><Link href={`/app/searches/${search.id}`}>{search.name}</Link><small>{search.url}</small></td><td>{search.leads}</td><td><Badge tone="good">{search.good}</Badge></td><td>{search.invited}</td><td>{search.replied}</td><td>{search.synced}</td></tr>)}</tbody></table></Card></div>;
}
