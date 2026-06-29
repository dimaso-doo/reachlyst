import { Button, Card } from "@/components/ui";
import { getDashboardData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const { messages } = await getDashboardData();
  return <div className="grid gap-4"><h1 className="text-3xl font-extrabold text-ink">Messages</h1><p className="max-w-3xl text-sm font-semibold leading-6 text-muted">Read-only LinkedIn and Sales Navigator threads synced from visible pages. Reachlyst never sends LinkedIn messages.</p><section className="grid gap-4 lg:grid-cols-2">{messages.length ? messages.slice(-12).reverse().map((message) => <Card className="p-6" key={message.id}><h2 className="mb-3 text-lg font-extrabold text-ink">{message.threadUrl ?? "Visible thread"}</h2><p className="text-sm font-semibold leading-6 text-muted"><strong className="text-ink">{message.senderType}:</strong> {message.body}</p><div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary">Generate suggested reply</Button><Button variant="ghost">Copy suggested reply</Button></div></Card>) : <Card className="p-6"><h2 className="text-lg font-extrabold text-ink">No messages synced yet</h2><p className="mt-2 text-sm font-semibold leading-6 text-muted">Open LinkedIn Messaging with the extension active to sync visible read-only threads.</p></Card>}</section></div>;
}
