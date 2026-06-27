import { Button, Card } from "@/components/ui";
import { getDashboardData } from "@/lib/store";
import styles from "../lead.module.css";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const { messages } = await getDashboardData();
  return <div><h1>Messages</h1><p>Read-only LinkedIn and Sales Navigator threads synced from visible pages. Reachlyst never sends LinkedIn messages.</p><section className={styles.contentGrid}>{messages.length ? messages.slice(-12).reverse().map((message) => <Card key={message.id}><h2>{message.threadUrl ?? "Visible thread"}</h2><p><strong>{message.senderType}:</strong> {message.body}</p><Button variant="secondary">Generate suggested reply</Button><Button variant="ghost">Copy suggested reply</Button></Card>) : <Card><h2>No messages synced yet</h2><p>Open LinkedIn Messaging with the extension active to sync visible read-only threads.</p></Card>}</section></div>;
}
