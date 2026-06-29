import { AiPlaybookTrainer } from "@/components/AiPlaybookTrainer";
import { getPlanSnapshot } from "@/lib/entitlements";

export default async function AiPlaybookPage() {
  const snapshot = await getPlanSnapshot();
  return <AiPlaybookTrainer initialAiUsage={{
    used: snapshot.usage.monthlyAiSuggestions,
    limit: snapshot.config.limits.monthlyAiSuggestions
  }} />;
}
