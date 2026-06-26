"use client";

import { useEffect, useState } from "react";
import styles from "@/app/app/dashboard.module.css";

type UsageItem = {
  label: string;
  used: number;
  limit: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function percent(used: number, limit: number) {
  if (!limit) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function AnimatedUsageBars({ items }: { items: UsageItem[] }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const startedAt = performance.now();
    const duration = 950;

    function tick(now: number) {
      const raw = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - raw, 3);
      setProgress(eased);
      if (raw < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [items]);

  return (
    <div className={styles.usageList}>
      {items.map((item) => {
        const animatedUsed = Math.round(item.used * progress);
        const animatedPercent = Math.round(percent(item.used, item.limit) * progress);
        return (
          <div className={styles.usageRow} key={item.label}>
            <div>
              <strong>{item.label}</strong>
              <span>{formatNumber(animatedUsed)} / {formatNumber(item.limit)}</span>
            </div>
            <div className={styles.progressTrack} aria-label={`${item.label} usage`}>
              <span style={{ width: `${animatedPercent}%` }} />
            </div>
            <em>{item.limit ? `${animatedPercent}%` : "Locked"}</em>
          </div>
        );
      })}
    </div>
  );
}
