import { Card } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { LeadAvatar } from "@/components/LeadAvatar";
import { LeadInviteChat } from "@/components/LeadInviteChat";
import { truncateMiddle } from "@/lib/format";
import { getDashboardData } from "@/lib/store";

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

function stageClasses(state: string) {
  if (state === "done") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (state === "active") return "border-blue-200 bg-blue-50 text-blue-700";
  if (state === "muted") return "border-slate-200 bg-slate-50 text-slate-400 opacity-60";
  return "border-slate-200 bg-slate-50 text-slate-500";
}

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { leads, messages } = await getDashboardData();
  const lead = leads.find((item) => item.id === id) ?? leads[0];
  const leadMessages = messages.filter((message) => message.leadId === lead.id);
  const profileUrl = lead.salesNavigatorUrl || lead.linkedinUrl;
  const inviteMessage = lead.generatedMessage ?? `Hi ${displayLeadName(lead.name).split(" ")[0]}, thought it would be useful to connect.`;
  const about = lead.snippet || lead.aiReason || "No about text captured yet. Open the lead in Sales Navigator with Reachlyst running to capture visible profile context.";

  return <div className="grid gap-4"><section className="grid gap-4 rounded-lg border border-line bg-white p-6 md:grid-cols-[auto_1fr_auto] md:items-start"><LeadAvatar name={lead.name} size="lg" /><div><h1 className="text-3xl font-extrabold text-ink">{displayLeadName(lead.name)}</h1><p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-muted">{leadSummary(lead)}</p>{profileUrl ? <div className="mt-3 flex flex-wrap items-center gap-2"><a className="font-mono text-xs font-bold text-accent-strong" href={profileUrl} target="_blank" rel="noreferrer">{truncateMiddle(profileUrl, 58)}</a><CopyButton value={profileUrl} label="Copy" /></div> : null}</div><span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-extrabold capitalize text-accent-strong before:h-2 before:w-2 before:rounded-full before:bg-current">{lead.status.replaceAll("_", " ")}</span></section><Card className="p-5"><h2 className="mb-4 text-lg font-extrabold text-ink">Outreach stage</h2><div className="grid gap-3 lg:grid-cols-5">{stages.map((stage) => { const state = stageState(lead.status, stage); return <div className={`grid min-h-20 gap-2 rounded-lg border p-3 ${stageClasses(state)}`} key={stage.key}><span className="h-1.5 w-10 rounded-full bg-current opacity-50" /> <strong className="text-sm font-extrabold">{stage.label}</strong></div>; })}</div></Card><section className="grid gap-4 lg:grid-cols-2"><Card className="p-6"><h2 className="mb-3 text-lg font-extrabold text-ink">About</h2><p className="text-sm font-semibold leading-6 text-muted">{about}</p></Card><Card className="p-6"><h2 className="mb-3 text-lg font-extrabold text-ink">AI fit</h2><p className="text-sm font-semibold leading-6 text-muted">{lead.aiReason ?? "No analysis yet. Open this lead in Sales Navigator with the extension active."}</p><p className="mt-2 text-sm font-semibold leading-6 text-muted">Confidence: {lead.aiConfidence ? `${Math.round(lead.aiConfidence * 100)}%` : "n/a"}</p></Card><Card className="p-6"><h2 className="mb-3 text-lg font-extrabold text-ink">Suggested invite</h2><LeadInviteChat initialMessage={inviteMessage} lead={{ name: displayLeadName(lead.name), title: lead.title, company: lead.company, location: lead.location, campaignContext: lead.campaign, currentMessage: inviteMessage, status: lead.status }} /></Card><Card className="p-6"><h2 className="mb-3 text-lg font-extrabold text-ink">Read-only messages</h2>{leadMessages.length ? leadMessages.map((message) => <p className="text-sm font-semibold leading-6 text-muted" key={message.id}><strong className="text-ink">{message.senderType}:</strong> {message.body}</p>) : <p className="text-sm font-semibold leading-6 text-muted">No visible messages synced yet.</p>}</Card><Card className="p-6"><h2 className="mb-3 text-lg font-extrabold text-ink">Search</h2><p className="text-sm font-semibold leading-6 text-muted">{lead.campaign ?? "Campaign not captured yet."}</p><p className="mt-2 text-sm font-semibold leading-6 text-muted">{lead.updatedAt ? `Last updated ${new Date(lead.updatedAt).toLocaleDateString("en-US")}` : null}</p></Card></section></div>;
}
