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
  const sizes = {
    sm: "h-7 w-7 text-[11px]",
    md: "h-9 w-9 text-[13px]",
    lg: "h-[52px] w-[52px] text-lg"
  };
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-full border border-blue-100 bg-gradient-to-br from-blue-50 to-emerald-50 font-extrabold text-accent-strong ${sizes[size]}`} aria-hidden="true">{initials(name)}</span>;
}
