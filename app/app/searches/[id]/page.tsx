import Link from "next/link";
import { Card, SearchInput } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { LeadAvatar } from "@/components/LeadAvatar";
import { SearchAiChat } from "@/components/SearchAiChat";
import { truncateMiddle } from "@/lib/format";
import { getDashboardData } from "@/lib/store";

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
  if (status === "good_fit" || status === "connected" || status === "replied") return "text-emerald-700";
  if (status === "maybe" || status === "follow_up_needed") return "text-amber-700";
  if (status === "skip" || status === "not_interested") return "text-rose-700";
  if (status === "copied" || status.includes("invite")) return "text-blue-700";
  return "text-muted";
}

function StatusText({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold capitalize leading-tight ${className ?? "text-muted"}`}><span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_0_3px_rgba(102,112,133,.14)]" aria-hidden="true" />{children}</span>;
}

function leadDetails(lead: { title?: string; company?: string; location?: string; aiReason?: string; snippet?: string }) {
  const primary = [lead.title, lead.company].filter(Boolean).join(" · ");
  const secondary = lead.location;
  return { primary, secondary, about: lead.snippet || lead.aiReason };
}

function inviteState(status: string) {
  if (["invite_likely_sent", "invite_sent", "connected", "first_message_sent", "follow_up_needed", "follow_up_sent", "replied"].includes(status)) return "Invited";
  if (status === "copied" || status === "message_generated") return "Message ready";
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
  const { searches, leads, messages } = await getDashboardData();
  const search = searches.find((item) => item.id === id) ?? searches[0];
  const campaignLeads = leads.filter((lead) => lead.campaignIds?.includes(search.id) || lead.campaign === search.name);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">{search.name}</h1>
          <p className="mt-1 text-sm font-semibold text-muted">{campaignLeads.length} leads in this search</p>
          <div className="mt-2 flex min-w-0 items-center gap-2">
            <span className="inline-block max-w-[520px] overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-muted" title={search.url}>{truncateMiddle(search.url, 72)}</span>
            <CopyButton value={search.url} label="Copy Sales Nav URL" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-blue-100 bg-gradient-to-br from-white to-blue-50 shadow-reachlyst">
        <SearchAiChat
          mode="train_search"
          title="AI training for this search"
          intro="Tell me how to judge leads in this search: who is a good fit, who is maybe, who should be skipped, what you sell, and what tone the invite should use."
          placeholder="Example: Good fit is an agency owner/founder/CEO in the US with 1-50 employees. Skip freelancers, enterprise profiles, and students..."
          searchName={search.name}
          searchUrl={search.url}
          context={`This search has ${campaignLeads.length} visible/imported leads. The user wants AI scoring and invite-message rules for this specific campaign.`}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px] md:items-center">
        <SearchInput placeholder="Search leads" />
        <select className="min-h-10 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink" aria-label="Filter by fit">{fitStatuses.map((filter) => <option key={filter}>{filter}</option>)}</select>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="min-w-[1120px] w-full border-collapse">
          <thead>
            <tr className="text-left text-xs uppercase text-muted">
              <th className="border-b border-line p-4">Lead</th>
              <th className="border-b border-line p-4">Details</th>
              <th className="border-b border-line p-4">Fit</th>
              <th className="border-b border-line p-4">Invite</th>
              <th className="border-b border-line p-4">Message used</th>
              <th className="border-b border-line p-4">Messages</th>
              <th className="border-b border-line p-4">Reply</th>
            </tr>
          </thead>
          <tbody>
            {campaignLeads.map((lead) => {
              const details = leadDetails(lead);
              const syncedMessages = messages.filter((message) => message.leadId === lead.id).length;
              const invite = inviteState(lead.status);

              return (
                <tr className="group relative cursor-pointer transition hover:bg-slate-50 hover:shadow-[inset_3px_0_0_#8aa39a]" key={lead.id}>
                  <td className="border-b border-line p-4 align-top">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <LeadAvatar name={lead.name} size="sm" />
                      <div>
                        <Link className="static font-extrabold text-accent-strong after:absolute after:inset-0 after:z-[1]" href={`/app/leads/${lead.id}`}>{displayLeadName(lead.name)}</Link>
                        {lead.linkedinUrl ? <small className="mt-1 block text-xs font-semibold text-muted">{truncateMiddle(lead.linkedinUrl, 42)}</small> : null}
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-line p-4 align-top">
                    {details.primary ? <strong className="text-sm font-extrabold text-ink">{details.primary}</strong> : <span className="text-sm font-semibold text-muted">Details not captured yet</span>}
                    {details.secondary ? <small className="mt-1 block text-xs font-semibold text-muted">{details.secondary}</small> : null}
                    {details.about ? <small className="mt-1 line-clamp-3 max-w-xl text-xs font-semibold leading-5 text-muted">About: {details.about}</small> : null}
                  </td>
                  <td className="border-b border-line p-4 align-top"><StatusText className={statusClass(lead.status)}>{statusLabel(lead.status)}</StatusText></td>
                  <td className="border-b border-line p-4 align-top"><StatusText className={invite === "Invited" ? "text-blue-700" : invite === "Message ready" ? "text-emerald-700" : "text-muted"}>{invite}</StatusText></td>
                  <td className="border-b border-line p-4 align-top">
                    {lead.generatedMessage ? (
                      <div className="relative z-[2] grid max-w-sm gap-2">
                        <span className="line-clamp-3 text-sm font-semibold leading-6 text-ink">{lead.generatedMessage}</span>
                        <CopyButton value={lead.generatedMessage} />
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-muted">No generated invite yet</span>
                    )}
                  </td>
                  <td className="border-b border-line p-4 align-top"><span className="text-sm font-extrabold text-ink">{syncedMessages || messageCount(lead.status)}</span></td>
                  <td className="border-b border-line p-4 align-top">
                    <StatusText className={replyState(lead.status) === "Replied" ? "text-emerald-700" : replyState(lead.status) === "Waiting" ? "text-amber-700" : "text-muted"}>
                      {replyState(lead.status)}
                    </StatusText>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
