/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function BlogPage() {
  return <main className="min-h-screen bg-[#050a18] px-[min(7vw,88px)] py-12 text-white"><Link className="inline-flex items-center" href="/"><img className="h-8 w-auto" alt="Reachlyst" src="/reachlyst-logo-blue.png" /></Link><h1 className="mb-5 mt-20 text-5xl font-extrabold leading-none sm:text-7xl">Blog</h1><p className="max-w-[760px] text-xl font-semibold leading-8 text-white/70">Guides for better Sales Navigator lead review, invite copy, and outbound workflow design are coming soon.</p></main>;
}
