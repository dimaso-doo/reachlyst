import Link from "next/link";
import { Badge, Card, SearchInput } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { SearchAiChat } from "@/components/SearchAiChat";
import { truncateMiddle } from "@/lib/format";
import { getDashboardData } from "@/lib/store";
import styles from "../table.module.css";

export const dynamic = "force-dynamic";

export default async function SearchesPage() {
  const { searches } = await getDashboardData();
  return <div><div className={styles.pageHeader}><h1>Searches</h1><Link className={styles.primaryLink} href="/app/searches?new=1">Add new search</Link></div><SearchAiChat mode="create_search" title="Create a new search with AI" intro="Tell me who you want to reach. I will ask focused questions, suggest ICP criteria, exclusions, Sales Navigator filters, and message tone." placeholder="Example: I want US marketing agency owners, 1-50 employees, for a cold outreach systems offer..." context="User is creating a new LinkedIn Sales Navigator search for manual outreach." /><SearchInput placeholder="Search campaigns" /><Card className={styles.table}><table><thead><tr><th>Search</th><th>Leads</th><th>Good fit</th><th>Invited</th><th>Replied</th><th>Last synced</th></tr></thead><tbody>{searches.map((search) => <tr className={styles.clickableRow} key={search.id}><td><Link className={styles.rowLink} href={`/app/searches/${search.id}`}>{search.name}</Link><div className={styles.urlLine}><span className={styles.urlText} title={search.url}>{truncateMiddle(search.url)}</span><CopyButton value={search.url} /></div></td><td>{search.leads}</td><td><Badge tone="good">{search.good}</Badge></td><td>{search.invited}</td><td>{search.replied}</td><td>{search.synced ?? "Not synced"}</td></tr>)}</tbody></table></Card></div>;
}
