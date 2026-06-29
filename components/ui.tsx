import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
};

export function Button({ children, href, variant = "primary", type = "button" }: ButtonProps) {
  const variants = {
    primary: "border-blue-200 bg-accent text-white shadow-[0_8px_18px_rgba(22,119,255,.18)] hover:bg-accent-strong hover:text-white hover:shadow-[0_16px_34px_rgba(22,119,255,.28)]",
    secondary: "border-blue-200 bg-white text-ink hover:border-blue-300 hover:text-accent-strong hover:shadow-[0_14px_34px_rgba(15,23,42,.12)]",
    ghost: "border-transparent bg-transparent text-accent-strong hover:bg-blue-50"
  };
  const className = `relative inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-6 font-extrabold no-underline transition hover:scale-[1.025] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`;
  if (href) return <Link className={className} href={href}>{children}</Link>;
  return <button className={className} type={type}>{children}</button>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-line bg-white shadow-[0_6px_18px_rgba(15,23,42,.04)] ${className}`}>{children}</section>;
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "danger" | "blue" }) {
  const tones = {
    neutral: "bg-slate-100 text-slate-700",
    good: "bg-emerald-100 text-emerald-800",
    warn: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
    blue: "bg-blue-50 text-accent-strong"
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1.5 text-xs font-extrabold ${tones[tone]}`}>{children}</span>;
}

export function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="rounded-lg border border-line bg-white p-5"><strong className="block text-3xl font-extrabold text-ink">{value}</strong><span className="mt-1 block text-sm font-semibold text-muted">{label}</span>{detail ? <small className="mt-2 block text-sm font-bold text-accent-strong">{detail}</small> : null}</div>;
}

export function SearchInput({ placeholder = "Search" }: { placeholder?: string }) {
  return <input className="min-h-11 w-full rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100" placeholder={placeholder} aria-label={placeholder} />;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="rounded-lg border border-dashed border-line p-8 text-center"><h3 className="text-lg font-extrabold text-ink">{title}</h3><p className="mt-2 text-sm font-semibold leading-6 text-muted">{body}</p></div>;
}

export function Timeline({ events }: { events: { label: string; time: string }[] }) {
  return <ol className="m-0 list-none p-0">{events.map((event) => <li className="grid grid-cols-[12px_1fr] gap-3 py-3" key={`${event.label}-${event.time}`}><span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-accent" /> <div><strong className="block text-sm font-extrabold text-ink">{event.label}</strong><small className="mt-1 block text-xs font-semibold text-muted">{event.time}</small></div></li>)}</ol>;
}
