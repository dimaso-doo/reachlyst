"use client";

import { useEffect, useState } from "react";

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
    <div className="mt-5 grid gap-4">
      {items.map((item) => {
        const animatedUsed = Math.round(item.used * progress);
        const finalPercent = percent(item.used, item.limit);
        const animatedPercent = Math.round(finalPercent * progress);
        const tone = finalPercent >= 90 ? "from-rose-500 to-orange-400" : finalPercent >= 70 ? "from-amber-400 to-sky-500" : "from-accent to-teal-400";
        return (
          <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)]" key={item.label}>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <strong className="block text-sm font-extrabold text-ink">{item.label}</strong>
                <span className="mt-1 block text-xs font-bold text-muted">{formatNumber(animatedUsed)} / {formatNumber(item.limit)}</span>
              </div>
              <em className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold not-italic text-ink">{item.limit ? `${animatedPercent}%` : "Locked"}</em>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200 shadow-inner" aria-label={`${item.label} usage`}>
              <span
                className={`block h-full rounded-full bg-gradient-to-r ${tone} shadow-[0_6px_16px_rgba(22,119,255,0.24)] transition-[width] duration-150 ease-out`}
                style={{ width: `${animatedPercent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
