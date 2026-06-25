import { Badge, Button, Card, Timeline } from "@/components/ui";
import { getDashboardData } from "@/lib/store";
import styles from "../../lead.module.css";

export const dynamic = "force-dynamic";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { leads, activities, messages } = await getDashboardData();
  const lead = leads.find((item) => item.id === id) ?? leads[0];
  const leadMessages = messages.filter((message) => message.leadId === lead.id);
  const leadActivities = activities.filter((activity) => !activity.leadId || activity.leadId === lead.id).slice(0, 10);
  return <div className={styles.page}><header><h1>{lead.name}</h1><Badge tone={lead.status === "good_fit" ? "good" : "blue"}>{lead.status}</Badge></header><section className={styles.grid}><Card><h2>Profile</h2><p>{lead.title} {lead.company ? `at ${lead.company}` : ""}</p><p>{lead.location}</p><p>LinkedIn URL: {lead.linkedinUrl}</p><p>Sales Navigator URL: {lead.salesNavigatorUrl}</p><p>Campaign: {lead.campaign}</p></Card><Card><h2>AI fit</h2><Badge tone={lead.status === "good_fit" ? "good" : "blue"}>{lead.status}</Badge><p>{lead.aiReason ?? "No analysis yet. Open this lead in Sales Navigator with the extension active."}</p><p>Confidence: {lead.aiConfidence ? `${Math.round(lead.aiConfidence * 100)}%` : "n/a"}</p><h3>Generated invite</h3><p>{lead.generatedMessage ?? `Hi ${lead.name.split(" ")[0]}, thought it would be useful to connect.`}</p><Button variant="secondary">Copy suggested message</Button></Card><Card><h2>Read-only messages</h2>{leadMessages.length ? leadMessages.map((message) => <p key={message.id}><strong>{message.senderType}:</strong> {message.body}</p>) : <p>No visible messages synced yet.</p>}<Button variant="secondary">Generate suggested reply</Button></Card><Card><h2>Activity timeline</h2><Timeline events={leadActivities} /></Card></section></div>;
}
