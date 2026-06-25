import { Button, Card } from "@/components/ui";
import styles from "../lead.module.css";

export default function MessagesPage() {
  return <div><h1>Messages</h1><p>Read-only LinkedIn and Sales Navigator threads synced from visible pages. Reachlyst never sends LinkedIn messages.</p><section className={styles.grid}><Card><h2>Maya Novak</h2><p><strong>Lead:</strong> Sounds interesting, tell me more.</p><p><strong>You:</strong> Thanks Maya, will send a short note.</p><Button variant="secondary">Generate suggested reply</Button><Button variant="ghost">Copy suggested reply</Button></Card><Card><h2>Jon Bell</h2><p><strong>You:</strong> Hi Jon, noticed your RevOps work at Arc Systems.</p><p>No reply detected yet.</p></Card></section></div>;
}
