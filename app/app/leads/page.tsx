import Link from "next/link";
import { Badge, Card, SearchInput } from "@/components/ui";
import { LeadAvatar } from "@/components/LeadAvatar";
import { getDashboardData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { leads } = await getDashboardData();
  return <div className="grid gap-4"><h1 className="text-3xl font-extrabold text-ink">Leads</h1><SearchInput placeholder="Search by name, company, title, campaign, status" /><Card className="overflow-x-auto p-0"><table className="min-w-[860px] w-full border-collapse"><thead><tr className="text-left text-xs uppercase text-muted"><th className="border-b border-line p-4">Name</th><th className="border-b border-line p-4">Title</th><th className="border-b border-line p-4">Campaign</th><th className="border-b border-line p-4">Status</th></tr></thead><tbody>{leads.map((lead) => <tr className="group relative cursor-pointer transition hover:bg-slate-50 hover:shadow-[inset_3px_0_0_#8aa39a]" key={lead.id}><td className="border-b border-line p-4 align-top"><div className="flex min-w-0 items-center gap-2.5"><LeadAvatar name={lead.name} size="sm" /><Link className="static font-extrabold text-accent-strong after:absolute after:inset-0 after:z-[1]" href={`/app/leads/${lead.id}`}>{lead.name}</Link></div></td><td className="border-b border-line p-4 align-top text-sm font-semibold text-muted">{lead.title} · {lead.company}</td><td className="border-b border-line p-4 align-top text-sm font-semibold text-muted">{lead.campaign}</td><td className="border-b border-line p-4 align-top"><Badge tone={lead.status === "good_fit" ? "good" : "blue"}>{lead.status}</Badge></td></tr>)}</tbody></table></Card></div>;
}
