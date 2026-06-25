import { Card } from "@/components/ui";
import styles from "../lead.module.css";

export default function ExtensionPage() {
  return <div className={styles.page}><header><h1>Chrome Extension</h1><a className={styles.primaryAction} href="/reachlyst-extension.zip" download>Download extension</a></header><section className={styles.grid}><Card><h2>Install</h2><ol className={styles.steps}><li>Download and unzip the package.</li><li>Open <strong>chrome://extensions</strong>.</li><li>Enable <strong>Developer mode</strong>.</li><li>Click <strong>Load unpacked</strong>.</li><li>Select the unzipped <strong>extension</strong> folder.</li></ol></Card><Card><h2>Local folder</h2><code>/Users/ps/Documents/05_Reachlyst.com_v2/extension</code><p>Use this folder directly while testing locally.</p></Card><Card><h2>Connect</h2><ol className={styles.steps}><li>Open the extension popup.</li><li>Paste your Reachlyst extension token.</li><li>Open Sales Navigator manually.</li><li>Visible leads and messages sync to Reachlyst.</li></ol></Card><Card><h2>Read-only</h2><p>No LinkedIn login storage. No auto-connect. No auto-send. No background scraping.</p></Card></section></div>;
}
