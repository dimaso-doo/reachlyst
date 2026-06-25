import Link from "next/link";
import { Card, SearchInput } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { LeadAvatar } from "@/components/LeadAvatar";
import { SearchAiChat } from "@/components/SearchAiChat";
import { truncateMiddle } from "@/lib/format";
import { getDashboardData } from "@/lib/store";
import styles from "../../table.module.css";

const fitStatuses = ["All", "New", "Good fit", "Maybe", "Skip", "Copied", "Invited", "Connected", "Replied", "Follow-up needed"];
export const dynamic = "force-dynamic";

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function displayLeadName(name: string) {
  return name
    .replace(/\s+is reachable$/i, "")
    .replace(/\s+View\s+.+?profile.*$/i, "")
    .trim();
}

function statusClass(status: string) {
  if (status === "good_fit" || status === "connected" || status === "replied") return styles.statusGood;
  if (status === "maybe" || status === "follow_up_needed") return styles.statusWarn;
  if (status === "skip" || status === "not_interested") return styles.statusDanger;
  if (status === "copied" || status.includes("invite")) return styles.statusBlue;
  return styles.statusNeutral;
}

function StatusText({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={`${styles.statusText} ${className ?? ""}`}><span aria-hidden="true" />{children}</span>;
}

function leadDetails(lead: { title?: string; company?: string; location?: string; aiReason?: string }) {
  const primary = [lead.title, lead.company].filter(Boolean).join(" · ");
  const secondary = lead.location;
  return { primary, secondary, about: lead.aiReason };
}

function inviteState(status: string) {
  if (["invite_likely_sent", "invite_sent", "connected", "first_message_sent", "follow_up_needed", "follow_up_sent", "replied"].includes(status)) return "Invited";
  return "Not invited";
}

function messageCount(status: string) {
  if (status === "follow_up_sent") return 2;
  if (["first_message_sent", "follow_up_needed", "replied"].includes(status)) return 1;
  return 0;
}

function replyState(status: string) {
  if (status === "replied") return "Replied";
  if (["invite_sent", "connected", "first_message_sent", "follow_up_needed", "follow_up_sent"].includes(status)) return "Waiting";
  return "Not started";
}

export default async function SearchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searches, leads } = await getDashboardData();
  const search = searches.find((item) => item.id === id) ?? searches[0];
  const campaignLeads = leads.filter((lead) => lead.campaignIds?.includes(search.id) || lead.campaign === search.name);
  return <div><div className={styles.pageHeader}><div><h1>{search.name}</h1><div className={styles.urlLine}><span className={styles.urlText} title={search.url}>{truncateMiddle(search.url, 72)}</span><CopyButton value={search.url} label="Copy Sales Nav URL" /></div></div><Link className={styles.primaryLink} href="/app/searches?new=1">Add new search</Link></div><SearchAiChat mode="train_search" title="Train AI for this search" intro="Tell me how to judge leads in this search: who is a good fit, who is maybe, who should be skipped, what you sell, and what tone the invite should use." placeholder="Example: Good fit is an agency owner/founder/CEO in the US with 1-50 employees. Skip freelancers, enterprise profiles, and students..." searchName={search.name} searchUrl={search.url} context={`This search has ${campaignLeads.length} visible/imported leads. The user wants AI scoring and invite-message rules for this specific campaign.`} /><div className={styles.controlBar}><SearchInput placeholder="Search leads" /><select aria-label="Filter by fit">{fitStatuses.map((filter) => <option key={filter}>{filter}</option>)}</select></div><Card className={styles.table}><table><thead><tr><th>Lead</th><th>Details</th><th>Fit</th><th>Invite</th><th>Messages</th><th>Reply</th></tr></thead><tbody>{campaignLeads.map((lead) => { const details = leadDetails(lead); return <tr className={styles.clickableRow} key={lead.id}><td><div className={styles.leadCell}><LeadAvatar name={lead.name} size="sm" /><div><Link className={styles.rowLink} href={`/app/leads/${lead.id}`}>{displayLeadName(lead.name)}</Link>{lead.linkedinUrl ? <small>{truncateMiddle(lead.linkedinUrl, 42)}</small> : null}</div></div></td><td>{details.primary ? <strong>{details.primary}</strong> : <span className={styles.mutedDetail}>Details not captured yet</span>}{details.secondary ? <small>{details.secondary}</small> : null}{details.about ? <small>About: {details.about}</small> : null}</td><td><StatusText className={statusClass(lead.status)}>{statusLabel(lead.status)}</StatusText></td><td><StatusText className={inviteState(lead.status) === "Invited" ? styles.statusBlue : styles.statusNeutral}>{inviteState(lead.status)}</StatusText></td><td><span className={styles.metricText}>{messageCount(lead.status)}</span></td><td><StatusText className={replyState(lead.status) === "Replied" ? styles.statusGood : replyState(lead.status) === "Waiting" ? styles.statusWarn : styles.statusNeutral}>{replyState(lead.status)}</StatusText></td></tr>; })}</tbody></table></Card></div>;
}
