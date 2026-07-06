/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ReachlystBetaLogo } from "@/components/ReachlystBetaLogo";
import { Button } from "@/components/ui";

const marketingLinks = [
  ["Preview", "/#preview"],
  ["How it works", "/#how-it-works"],
  ["Pricing", "/#pricing"],
  ["FAQ", "/#faq"]
] as const;

export function MarketingNav() {
  return <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
    <div className="container flex min-h-[72px] items-center justify-between gap-3 py-3 sm:py-0">
      <MarketingLogo />
      <div className="hidden items-center gap-x-5 text-sm text-muted md:flex">
        {marketingLinks.map(([label, href]) => <Link className="transition hover:scale-[1.025] hover:text-ink" href={href} key={href}>{label}</Link>)}
        <Link className="transition hover:scale-[1.025] hover:text-ink" href="/login">Login</Link>
        <Button href="/signup">Sign up</Button>
      </div>
      <details className="group relative md:hidden">
        <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white text-ink transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden" aria-label="Open navigation">
          <span className="grid gap-1.5"><i className="block h-0.5 w-5 rounded-full bg-current" /><i className="block h-0.5 w-5 rounded-full bg-current" /><i className="block h-0.5 w-5 rounded-full bg-current" /></span>
        </summary>
        <div className="absolute right-0 mt-3 w-[min(320px,calc(100vw-32px))] rounded-xl border border-slate-200 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,.16)]">
          <nav className="grid gap-1" aria-label="Marketing mobile navigation">
            {marketingLinks.map(([label, href]) => <Link className="rounded-lg px-3 py-2.5 text-sm text-muted transition hover:bg-slate-50 hover:text-ink" href={href} key={href}>{label}</Link>)}
            <Link className="rounded-lg px-3 py-2.5 text-sm text-muted transition hover:bg-slate-50 hover:text-ink" href="/login">Login</Link>
          </nav>
          <div className="mt-3 border-t border-slate-200 pt-3"><Button href="/signup">Sign up</Button></div>
        </div>
      </details>
    </div>
  </nav>;
}

export function MarketingFooter() {
  return <footer className="border-t border-slate-200 bg-white py-8 text-muted">
    <div className="container">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <MarketingLogo />
          <p className="m-0 text-xs font-semibold text-slate-400">made by <a className="transition hover:text-slate-600" href="https://dimaso.co" rel="noreferrer" target="_blank">dimaso.co</a></p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
          <Link className="hover:text-ink" href="/#preview">Preview</Link>
          <Link className="hover:text-ink" href="/#pricing">Pricing</Link>
          <Link className="hover:text-ink" href="/#faq">FAQ</Link>
          <Link className="hover:text-ink" href="/privacy">Privacy Policy</Link>
          <Link className="hover:text-ink" href="/terms">Terms</Link>
          <Link className="hover:text-ink" href="/refund">Refund Policy</Link>
        </nav>
      </div>
    </div>
  </footer>;
}

function MarketingLogo() {
  return <Link className="inline-flex items-center" href="/"><ReachlystBetaLogo /></Link>;
}
