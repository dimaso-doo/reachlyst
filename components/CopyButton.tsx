"use client";

import { useState } from "react";
import styles from "./ui.module.css";

export function CopyButton({ value, label = "Copy" }: { value?: string | null; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return <button className={`${styles.button} ${styles.tiny}`} disabled={!value} onClick={copy} type="button">{copied ? "Copied" : label}</button>;
}
