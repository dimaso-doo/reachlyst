import { Card } from "@/components/ui";
import { ExtensionTokenPanel } from "@/components/ExtensionTokenPanel";
import { getExtensionAccessState } from "@/lib/extensionTokens";

export default async function ExtensionPage() {
  const access = await getExtensionAccessState();
  const extensionConnected = Boolean(access.boundAt || access.lastTokenUsedAt);

  return <div className="grid gap-5">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold text-ink">Chrome Extension</h1>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">{extensionConnected ? "Your Chrome extension is connected to this workspace." : "Install, paste your token, then use Start and Stop inside Sales Navigator."}</p>
      </div>
      {extensionConnected ? null : <a className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(22,119,255,.18)] transition hover:bg-accent-strong hover:text-white hover:shadow-[0_16px_34px_rgba(22,119,255,.28)]" href="/reachlyst-extension.zip" download>Download extension</a>}
    </header>

    <ExtensionTokenPanel initialAccess={access} />

    {extensionConnected ? null : <>
      <Card className="overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="install-demo-stage min-h-[360px] bg-[#f7fbff] p-5">
            <div className="install-demo-browser">
              <div className="flex h-10 items-center gap-2 border-b border-slate-200 bg-white px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <span className="ml-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-muted">chrome://extensions</span>
              </div>
              <div className="grid gap-4 p-5">
                <div className="flex items-center justify-between">
                  <strong className="text-lg font-extrabold text-ink">Extensions</strong>
                  <span className="install-demo-toggle"><span /></span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-accent-strong">Step 1</span>
                    <strong className="mt-2 block text-sm font-extrabold text-ink">Download Reachlyst</strong>
                    <div className="mt-3 h-2 rounded-full bg-blue-100"><span className="install-demo-progress block h-2 rounded-full bg-blue-600" /></div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-muted">Step 2</span>
                    <strong className="mt-2 block text-sm font-extrabold text-ink">Load unpacked</strong>
                    <div className="mt-3 rounded-lg border border-dashed border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-accent-strong">extension folder selected</div>
                  </div>
                </div>
                <div className="install-demo-extension rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,.10)]">
                  <div className="flex items-center gap-3">
                    <img alt="" className="h-9 w-9" src="/reachlyst-mark.svg" />
                    <div><strong className="block text-sm font-extrabold text-ink">Reachlyst</strong><span className="text-xs font-semibold text-muted">Verified extension</span></div>
                    <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-700">On</span>
                  </div>
                  <div className="mt-4 grid gap-2 rounded-lg bg-slate-50 p-3">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-muted">Connection key</span>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-muted"><span className="h-2 w-2 rounded-full bg-blue-500" />rly_live_workspace_key</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid content-center gap-4 border-t border-line bg-white p-6 lg:border-l lg:border-t-0">
            <span className="text-xs font-extrabold uppercase tracking-wide text-accent-strong">Generated install walkthrough</span>
            <h2 className="text-2xl font-extrabold leading-tight text-ink">Install the extension in under a minute.</h2>
            <p className="text-sm font-semibold leading-6 text-muted">Download the package, enable Developer mode, load the unzipped extension folder, then paste your workspace key. Free users can run the same workflow until their monthly AI messages are used.</p>
            <a className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg bg-accent px-4 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(22,119,255,.18)] transition hover:bg-accent-strong hover:text-white hover:shadow-[0_16px_34px_rgba(22,119,255,.28)]" href="/reachlyst-extension.zip" download>Download extension</a>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6"><h2 className="mb-3 text-lg font-extrabold text-ink">Install</h2><ol className="list-decimal space-y-2 pl-5 text-sm font-semibold leading-6 text-muted"><li>Download and unzip the package.</li><li>Open <strong className="text-ink">chrome://extensions</strong>.</li><li>Enable <strong className="text-ink">Developer mode</strong>.</li><li>Click <strong className="text-ink">Load unpacked</strong>.</li><li>Select the unzipped <strong className="text-ink">extension</strong> folder.</li></ol></Card>
        <Card className="p-6"><h2 className="mb-3 text-lg font-extrabold text-ink">Run</h2><ol className="list-decimal space-y-2 pl-5 text-sm font-semibold leading-6 text-muted"><li>Open a Sales Navigator search manually.</li><li>Open Reachlyst from the Chrome toolbar.</li><li>Paste the extension token and click <strong className="text-ink">Verify token</strong>.</li><li>Click <strong className="text-ink">Start</strong> to show AI chat under visible leads.</li></ol></Card>
      </section>
    </>}
  </div>;
}
