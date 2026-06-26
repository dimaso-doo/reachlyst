import { Card } from "@/components/ui";
import { ExtensionTokenPanel } from "@/components/ExtensionTokenPanel";
import { getExtensionAccessState } from "@/lib/extensionTokens";
import styles from "../lead.module.css";

export default async function ExtensionPage() {
  const access = await getExtensionAccessState();

  return <div className={styles.page}>
    <header>
      <div>
        <h1>Chrome Extension</h1>
        <p>Install, paste your token, then use Start and Stop inside Sales Navigator.</p>
      </div>
      <a className={styles.primaryAction} href="/reachlyst-extension.zip" download>Download extension</a>
    </header>

    <ExtensionTokenPanel initialAccess={access} />

    <section className={styles.grid}>
      <Card><h2>Install</h2><ol className={styles.steps}><li>Download and unzip the package.</li><li>Open <strong>chrome://extensions</strong>.</li><li>Enable <strong>Developer mode</strong>.</li><li>Click <strong>Load unpacked</strong>.</li><li>Select the unzipped <strong>extension</strong> folder.</li></ol></Card>
      <Card><h2>Run</h2><ol className={styles.steps}><li>Open a Sales Navigator search manually.</li><li>Open Reachlyst from the Chrome toolbar.</li><li>Paste the extension token and click <strong>Verify token</strong>.</li><li>Click <strong>Start</strong> to show AI chat under visible leads.</li></ol></Card>
      <Card><h2>Testing locally</h2><code>/Users/ps/Documents/05_Reachlyst.com_v2/extension</code><p>Use this folder directly with Load unpacked while testing local changes.</p></Card>
      <Card><h2>Manual workflow</h2><p>Reachlyst reads visible lead data, writes suggestions to its own logbook, and never clicks Connect or Send for you.</p></Card>
    </section>
  </div>;
}
