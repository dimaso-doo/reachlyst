/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { AppSidebarNav } from "@/components/AppSidebarNav";
import { ReachlystBetaLogo } from "@/components/ReachlystBetaLogo";
import { getDemoSession } from "@/lib/demoSession";
import { canAccessSuperAdmin } from "@/lib/superAdmin";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false
    }
  }
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [showSuperAdmin, demo] = await Promise.all([canAccessSuperAdmin(), getDemoSession()]);
  const homeHref = showSuperAdmin ? "/app/admin" : "/app/dashboard";

  return <div className="min-h-screen bg-[#f6f8fc]">
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/92 px-4 py-3 text-ink shadow-[0_12px_32px_rgba(15,23,42,.06)] backdrop-blur-xl min-[821px]:hidden">
      <div className="flex items-center justify-between gap-3">
        <Link className="inline-flex items-center rounded-lg bg-white px-2.5 py-1.5" href={homeHref}><ReachlystBetaLogo imageClassName="h-7 w-auto" badgeClassName="-right-2.5 -top-1" /></Link>
        <details className="group relative">
          <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white text-ink transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden" aria-label="Open navigation">
            <span className="grid gap-1.5"><i className="block h-0.5 w-5 rounded-full bg-current" /><i className="block h-0.5 w-5 rounded-full bg-current" /><i className="block h-0.5 w-5 rounded-full bg-current" /></span>
          </summary>
          <div className="absolute right-0 mt-3 w-[min(320px,calc(100vw-32px))] rounded-xl border border-slate-200 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,.16)]">
            <nav className="grid gap-1" aria-label="Mobile primary">
              {showSuperAdmin ? <Link className="rounded-lg px-3 py-2.5 text-sm font-normal text-muted transition hover:bg-blue-50 hover:text-ink" href="/app/admin">Dashboard</Link> : <AppSidebarNav />}
            </nav>
            <Link className="mt-3 flex items-center gap-2.5 rounded-lg border-t border-slate-200 px-3 pt-3 text-ink transition hover:bg-blue-50" href="/app/settings">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-white" aria-hidden="true">{demo.isSuperAdmin ? "A" : "P"}</span>
              <div>
                <strong className="block text-sm font-semibold leading-tight">{demo.name}</strong>
                <small className="block text-xs font-normal leading-tight text-muted">{demo.isSuperAdmin ? "Super admin demo" : "Workspace owner"}</small>
              </div>
            </Link>
            <Link className="mt-1 block rounded-lg px-3 py-2 text-sm font-normal text-muted transition hover:bg-blue-50 hover:text-ink" href="/api/demo-logout">Log out</Link>
          </div>
        </details>
      </div>
    </header>
    <aside className="fixed left-0 top-0 z-20 flex h-screen w-[252px] flex-col gap-1 border-r border-slate-200 bg-white px-4 py-5 text-ink shadow-[8px_0_34px_rgba(15,23,42,.04)] max-[820px]:hidden">
      <Link className="mb-5 inline-flex w-fit items-center rounded-lg bg-white px-2.5 py-1.5" href={homeHref}><ReachlystBetaLogo imageClassName="h-7 w-auto" badgeClassName="-right-2.5 -top-1" /></Link>
      <nav className="grid gap-1" aria-label="Primary">
        {showSuperAdmin ? <Link className="rounded-lg px-3 py-2.5 text-sm font-normal text-muted transition hover:bg-blue-50 hover:text-ink" href="/app/admin">Dashboard</Link> : <AppSidebarNav />}
      </nav>
      <div className="flex-1" />
      <Link className="mt-3 flex items-center gap-2.5 border-t border-slate-200 pt-3 text-ink transition hover:bg-blue-50" href="/app/settings">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-white" aria-hidden="true">{demo.isSuperAdmin ? "A" : "P"}</span>
        <div>
          <strong className="block text-sm font-semibold leading-tight">{demo.name}</strong>
          <small className="block text-xs font-normal leading-tight text-muted">{demo.isSuperAdmin ? "Super admin demo" : "Workspace owner"}</small>
        </div>
      </Link>
      <Link className="mt-1 rounded-lg px-3 py-2 text-sm font-normal text-muted transition hover:bg-blue-50 hover:text-ink" href="/api/demo-logout">Log out</Link>
    </aside>
    <main className="ml-[252px] flex min-h-screen justify-center overflow-auto px-8 py-7 max-[820px]:ml-0 max-[820px]:min-h-[calc(100vh-65px)] max-[820px]:px-4 max-[820px]:py-5"><div className="w-full max-w-[1440px]">{children}</div></main>
  </div>;
}
