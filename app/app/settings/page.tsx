import { AccountSettingsForm } from "@/components/AccountSettingsForm";

export default function SettingsPage() {
  return (
    <div className="grid gap-5">
      <header>
        <div>
          <h1 className="text-3xl font-extrabold text-ink">Profile</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">Basic account and workspace details. AI behavior now lives in AI Playbook.</p>
        </div>
      </header>

      <AccountSettingsForm />
    </div>
  );
}
