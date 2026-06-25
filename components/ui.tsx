import Link from "next/link";
import styles from "./ui.module.css";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
};

export function Button({ children, href, variant = "primary", type = "button" }: ButtonProps) {
  const className = `${styles.button} ${styles[variant]}`;
  if (href) return <Link className={className} href={href}>{children}</Link>;
  return <button className={className} type={type}>{children}</button>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`${styles.card} ${className}`}>{children}</section>;
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "danger" | "blue" }) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}

export function StatCard({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className={styles.stat}><strong>{value}</strong><span>{label}</span>{detail ? <small>{detail}</small> : null}</div>;
}

export function SearchInput({ placeholder = "Search" }: { placeholder?: string }) {
  return <input className={styles.search} placeholder={placeholder} aria-label={placeholder} />;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className={styles.empty}><h3>{title}</h3><p>{body}</p></div>;
}

export function Timeline({ events }: { events: { label: string; time: string }[] }) {
  return <ol className={styles.timeline}>{events.map((event) => <li key={`${event.label}-${event.time}`}><span /> <div><strong>{event.label}</strong><small>{event.time}</small></div></li>)}</ol>;
}

