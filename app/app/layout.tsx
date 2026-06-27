/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { AppSidebarNav } from "@/components/AppSidebarNav";
import { getDemoSession } from "@/lib/demoSession";
import { canAccessSuperAdmin } from "@/lib/superAdmin";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [showSuperAdmin, demo] = await Promise.all([canAccessSuperAdmin(), getDemoSession()]);

  return <div className="min-h-screen bg-paper">
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-[252px] flex-col gap-1 border-r border-slate-950 bg-slate-950 px-4 py-5 text-white max-[820px]:static max-[820px]:h-auto max-[820px]:w-auto max-[820px]:px-4 max-[820px]:py-3">
      <Link className="mb-5 inline-flex w-fit items-center p-0" href={showSuperAdmin ? "/app/admin" : "/app/dashboard"}><img alt="Reachlyst" className="h-8 w-auto" src="/reachlyst-logo-blue.png" /></Link>
      <nav className="grid gap-1" aria-label="Primary">
        {showSuperAdmin ? <Link className="rounded-lg px-3 py-2.5 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white" href="/app/admin">Dashboard</Link> : <AppSidebarNav />}
      </nav>
      <div className="flex-1" />
      <Link className="mt-3 flex items-center gap-2.5 border-t border-white/10 pt-3 text-white transition hover:bg-white/10" href="/app/settings">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-white" aria-hidden="true">{demo.isSuperAdmin ? "A" : "P"}</span>
        <div>
          <strong className="block text-sm font-extrabold leading-tight">{demo.name}</strong>
          <small className="block text-xs font-semibold leading-tight text-white/60">{demo.isSuperAdmin ? "Super admin demo" : "Workspace owner"}</small>
        </div>
      </Link>
      <Link className="mt-1 rounded-lg px-3 py-2 text-sm font-bold text-white/55 transition hover:bg-white/10 hover:text-white" href="/api/demo-logout">Log out</Link>
    </aside>
    <main className="ml-[252px] flex min-h-screen justify-center overflow-auto px-8 py-7 max-[820px]:ml-0 max-[820px]:px-4 max-[820px]:py-5"><div className="w-full max-w-[1180px]">{children}</div></main>
  </div>;
}
