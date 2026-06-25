import Link from "next/link";
import { Badge, Card, SearchInput } from "@/components/ui";
import { getDashboardData } from "@/lib/store";
import styles from "../../table.module.css";

const filters = ["New", "Good fit", "Maybe", "Skip", "Copied", "Invited", "Connected", "Replied", "Follow-up needed"];
export const dynamic = "force-dynamic";

export default async function SearchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searches, leads } = await getDashboardData();
  const search = searches.find((item) => item.id === id) ?? searches[0];
  const campaignLeads = leads.filter((lead) => lead.campaignIds?.includes(search.id) || lead.campaign === search.name);
  return <div><h1>{search.name}</h1><p>{search.url}</p><Card className={styles.aiPanel}><h2>AI playbook for this search</h2><div><label>Use case<input defaultValue={search.aiUseCase} /></label><label>ICP / category<textarea defaultValue={search.aiIcp} /></label><label>Offer / reason to connect<textarea defaultValue={search.aiOffer} /></label><label>Tone<input defaultValue={search.aiTone} /></label><label>Rules<textarea defaultValue={search.aiInstructions} /></label></div><p>Extension uses this playbook when it recognizes this Sales Navigator search. Local dev storage is active until Supabase keys are configured.</p></Card><div className={styles.filters}>{filters.map((filter) => <button key={filter}>{filter}</button>)}</div><SearchInput placeholder="Search leads in campaign" /><Card className={styles.table}><table><thead><tr><th>Name</th><th>Title</th><th>Company</th><th>Status</th><th>Location</th></tr></thead><tbody>{campaignLeads.map((lead) => <tr key={lead.id}><td><Link href={`/app/leads/${lead.id}`}>{lead.name}</Link></td><td>{lead.title}</td><td>{lead.company}</td><td><Badge tone={lead.status === "good_fit" ? "good" : lead.status === "replied" ? "warn" : "blue"}>{lead.status}</Badge></td><td>{lead.location}</td></tr>)}</tbody></table></Card></div>;
}
