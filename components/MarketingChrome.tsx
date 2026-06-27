/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Button } from "@/components/ui";

const marketingLinks = [
  ["Features", "/#features"],
  ["Product", "/#product-screenshots"],
  ["How it works", "/#how-it-works"],
  ["Pricing", "/#pricing"],
  ["FAQ", "/#faq"]
] as const;

export function MarketingNav() {
  return <nav className="sticky top-0 z-10 border-b border-white/10 bg-[#050a18]">
    <div className="container flex min-h-[72px] items-center justify-between gap-3 py-3 sm:py-0">
      <MarketingLogo />
      <div className="hidden items-center gap-x-5 text-sm font-extrabold text-white/70 md:flex">
        {marketingLinks.map(([label, href]) => <Link className="transition hover:scale-[1.025] hover:text-white" href={href} key={href}>{label}</Link>)}
        <Link className="transition hover:scale-[1.025] hover:text-white" href="/login">Login</Link>
        <Button href="/signup">Sign up</Button>
      </div>
      <details className="group relative md:hidden">
        <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10 [&::-webkit-details-marker]:hidden" aria-label="Open navigation">
          <span className="grid gap-1.5"><i className="block h-0.5 w-5 rounded-full bg-current" /><i className="block h-0.5 w-5 rounded-full bg-current" /><i className="block h-0.5 w-5 rounded-full bg-current" /></span>
        </summary>
        <div className="absolute right-0 mt-3 w-[min(320px,calc(100vw-32px))] rounded-xl border border-white/10 bg-slate-950 p-3 shadow-[0_24px_70px_rgba(0,0,0,.35)]">
          <nav className="grid gap-1" aria-label="Marketing mobile navigation">
            {marketingLinks.map(([label, href]) => <Link className="rounded-lg px-3 py-2.5 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white" href={href} key={href}>{label}</Link>)}
            <Link className="rounded-lg px-3 py-2.5 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white" href="/login">Login</Link>
          </nav>
          <div className="mt-3 border-t border-white/10 pt-3"><Button href="/signup">Sign up</Button></div>
        </div>
      </details>
    </div>
  </nav>;
}

export function MarketingFooter() {
  return <footer className="border-t border-white/10 bg-[#050a18] py-8 text-white/70">
    <div className="container flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
      <MarketingLogo />
      <nav className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold">
        <Link className="hover:text-white" href="/#features">Features</Link>
        <Link className="hover:text-white" href="/#product-screenshots">Product</Link>
        <Link className="hover:text-white" href="/#pricing">Pricing</Link>
        <Link className="hover:text-white" href="/#faq">FAQ</Link>
        <Link className="hover:text-white" href="/privacy">Privacy Policy</Link>
        <Link className="hover:text-white" href="/terms">Terms</Link>
        <Link className="hover:text-white" href="/refund">Refund Policy</Link>
        <Link className="hover:text-white" href="/blog">Blog</Link>
      </nav>
    </div>
  </footer>;
}

function MarketingLogo() {
  return <Link className="inline-flex items-center" href="/"><img className="h-8 w-auto" alt="Reachlyst" src="/reachlyst-logo-blue.png" /></Link>;
}
