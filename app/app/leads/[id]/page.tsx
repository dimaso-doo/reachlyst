import { Card } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { LeadAvatar } from "@/components/LeadAvatar";
import { LeadInviteChat } from "@/components/LeadInviteChat";
import { truncateMiddle } from "@/lib/format";
import { getDashboardData } from "@/lib/store";
import styles from "../../lead.module.css";

export const dynamic = "force-dynamic";

const stages = [
  { key: "new", label: "New", statuses: ["new", "good_fit", "maybe", "skip"] },
  { key: "copied", label: "Message copied", statuses: ["copied", "message_generated"] },
  { key: "invited", label: "Invited", statuses: ["invite_likely_sent", "invite_sent", "connected", "first_message_sent", "follow_up_needed", "follow_up_sent", "replied"] },
  { key: "messages", label: "Messages", statuses: ["first_message_sent", "follow_up_needed", "follow_up_sent", "replied"] },
  { key: "reply", label: "Reply", statuses: ["replied"] }
];

function displayLeadName(name: string) {
  return name
    .replace(/\s+is reachable$/i, "")
    .replace(/\s+View\s+.+?profile.*$/i, "")
    .trim();
}

function leadSummary(lead: { title?: string; company?: string; location?: string; aiReason?: string }) {
  const line = [lead.title, lead.company].filter(Boolean).join(" at ");
  const location = lead.location ? ` · ${lead.location}` : "";
  return line ? `${line}${location}` : lead.aiReason ?? "Lead details will appear after the extension captures the visible Sales Navigator card again.";
}

function stageState(status: string, stage: (typeof stages)[number]) {
  if (stage.statuses.includes(status)) return "done";
  if (status === "skip" && stage.key !== "new") return "muted";
  const activeIndex = stages.findIndex((item) => item.statuses.includes(status));
  const stageIndex = stages.findIndex((item) => item.key === stage.key);
  return activeIndex > stageIndex ? "done" : activeIndex === stageIndex ? "active" : "pending";
}

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { leads, messages } = await getDashboardData();
  const lead = leads.find((item) => item.id === id) ?? leads[0];
  const leadMessages = messages.filter((message) => message.leadId === lead.id);
  const profileUrl = lead.salesNavigatorUrl || lead.linkedinUrl;
  const inviteMessage = lead.generatedMessage ?? `Hi ${displayLeadName(lead.name).split(" ")[0]}, thought it would be useful to connect.`;
  const about = lead.snippet || lead.aiReason || "No about text captured yet. Open the lead in Sales Navigator with Reachlyst running to capture visible profile context.";

  return <div className={styles.page}><section className={styles.leadHero}><LeadAvatar name={lead.name} size="lg" /><div><h1>{displayLeadName(lead.name)}</h1><p>{leadSummary(lead)}</p>{profileUrl ? <div className={styles.profileLink}><a href={profileUrl} target="_blank" rel="noreferrer">{truncateMiddle(profileUrl, 58)}</a><CopyButton value={profileUrl} label="Copy" /></div> : null}</div><span className={styles.statusPill}>{lead.status.replaceAll("_", " ")}</span></section><Card className={styles.pipeline}><h2>Outreach stage</h2><div className={styles.kanban}>{stages.map((stage) => <div className={`${styles.stage} ${styles[stageState(lead.status, stage)]}`} key={stage.key}><span /> <strong>{stage.label}</strong></div>)}</div></Card><section className={styles.contentGrid}><Card><h2>About</h2><p>{about}</p></Card><Card><h2>AI fit</h2><p>{lead.aiReason ?? "No analysis yet. Open this lead in Sales Navigator with the extension active."}</p><p>Confidence: {lead.aiConfidence ? `${Math.round(lead.aiConfidence * 100)}%` : "n/a"}</p></Card><Card><h2>Suggested invite</h2><LeadInviteChat initialMessage={inviteMessage} lead={{ name: displayLeadName(lead.name), title: lead.title, company: lead.company, location: lead.location, campaignContext: lead.campaign, currentMessage: inviteMessage, status: lead.status }} /></Card><Card><h2>Read-only messages</h2>{leadMessages.length ? leadMessages.map((message) => <p key={message.id}><strong>{message.senderType}:</strong> {message.body}</p>) : <p>No visible messages synced yet.</p>}</Card><Card><h2>Search</h2><p>{lead.campaign ?? "Campaign not captured yet."}</p><p>{lead.updatedAt ? `Last updated ${new Date(lead.updatedAt).toLocaleDateString("en-US")}` : null}</p></Card></section></div>;
}
