import { Badge, Button, Card, Timeline } from "@/components/ui";
import { activities, leads } from "@/data/mock";
import styles from "../../lead.module.css";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = leads.find((item) => item.id === id) ?? leads[0];
  return <div className={styles.page}><header><h1>{lead.name}</h1><Badge tone="good">{lead.status}</Badge></header><section className={styles.grid}><Card><h2>Profile</h2><p>{lead.title} at {lead.company}</p><p>{lead.location}</p><p>LinkedIn URL: https://www.linkedin.com/in/{lead.name.toLowerCase().replaceAll(" ", "-")}</p><p>Sales Navigator URL: https://www.linkedin.com/sales/lead/mock</p><p>Campaign: {lead.campaign}</p></Card><Card><h2>AI fit</h2><Badge tone="good">Good fit</Badge><p>Relevant seniority and company context match this campaign. Confidence 74%.</p><h3>Generated invite</h3><p>Hi {lead.name.split(" ")[0]}, noticed your work at {lead.company}. Thought it would be useful to connect.</p><Button variant="secondary">Copy suggested message</Button></Card><Card><h2>Read-only messages</h2><p><strong>Lead:</strong> Thanks, happy to connect.</p><p><strong>You:</strong> Appreciate it. Sharing a short note here.</p><Button variant="secondary">Generate suggested reply</Button></Card><Card><h2>Activity timeline</h2><Timeline events={activities} /></Card></section></div>;
}
