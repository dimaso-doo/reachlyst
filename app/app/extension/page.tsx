import { Card } from "@/components/ui";
import { ExtensionTokenPanel } from "@/components/ExtensionTokenPanel";
import { getExtensionAccessState } from "@/lib/extensionTokens";

export default async function ExtensionPage() {
  const access = await getExtensionAccessState();

  return <div className="grid gap-5">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold text-ink">Chrome Extension</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">Install, paste your token, then use Start and Stop inside Sales Navigator.</p>
      </div>
      <a className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(22,119,255,.18)] transition hover:bg-accent-strong hover:text-white hover:shadow-[0_16px_34px_rgba(22,119,255,.28)]" href="/reachlyst-extension.zip" download>Download extension</a>
    </header>

    <ExtensionTokenPanel initialAccess={access} />

    <section className="grid gap-4 lg:grid-cols-3">
      <Card className="p-6"><h2 className="mb-3 text-lg font-extrabold text-ink">Install</h2><ol className="list-decimal space-y-2 pl-5 text-sm font-semibold leading-6 text-muted"><li>Download and unzip the package.</li><li>Open <strong className="text-ink">chrome://extensions</strong>.</li><li>Enable <strong className="text-ink">Developer mode</strong>.</li><li>Click <strong className="text-ink">Load unpacked</strong>.</li><li>Select the unzipped <strong className="text-ink">extension</strong> folder.</li></ol></Card>
      <Card className="p-6"><h2 className="mb-3 text-lg font-extrabold text-ink">Run</h2><ol className="list-decimal space-y-2 pl-5 text-sm font-semibold leading-6 text-muted"><li>Open a Sales Navigator search manually.</li><li>Open Reachlyst from the Chrome toolbar.</li><li>Paste the extension token and click <strong className="text-ink">Verify token</strong>.</li><li>Click <strong className="text-ink">Start</strong> to show AI chat under visible leads.</li></ol></Card>
      <Card className="grid gap-3 p-6"><h2 className="text-lg font-extrabold text-ink">Video tutorial</h2><div className="flex aspect-video items-center justify-center rounded-lg bg-slate-950 text-white"><span className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-extrabold">Video placeholder</span></div><p className="text-sm font-semibold leading-6 text-muted">A short setup walkthrough will live here.</p></Card>
    </section>
  </div>;
}
