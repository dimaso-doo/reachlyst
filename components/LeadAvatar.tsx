import styles from "./leadAvatar.module.css";

function initials(name: string) {
  return name
    .replace(/\s+is reachable$/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "L";
}

export function LeadAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  return <span className={`${styles.avatar} ${styles[size]}`} aria-hidden="true">{initials(name)}</span>;
}
