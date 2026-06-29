/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-[#050a18] px-5 py-12 text-white">
    <section className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[.04] p-8 text-center shadow-[0_28px_90px_rgba(0,0,0,.24)] sm:p-12">
      <Link className="mb-10 inline-flex items-center justify-center" href="/"><img className="h-9 w-auto" alt="Reachlyst" src="/reachlyst-logo-white.svg" /></Link>
      <p className="text-xs font-black uppercase tracking-[.08em] text-blue-300">404</p>
      <h1 className="mb-4 mt-3 text-4xl font-extrabold leading-tight sm:text-6xl">Page not found</h1>
      <p className="mx-auto mb-8 max-w-lg text-lg font-semibold leading-8 text-white/68">This page is not available. Go back to the Reachlyst homepage or open your dashboard.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button href="/">Homepage</Button>
        <Button href="/app/dashboard" variant="secondary">Dashboard</Button>
      </div>
    </section>
  </main>;
}
