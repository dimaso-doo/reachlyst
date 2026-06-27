/* eslint-disable @next/next/no-img-element */
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { Button, Card } from "@/components/ui";
import { plans } from "@/lib/stripe";

const workflow = [
  { icon: "/chrome-icon.svg", title: "Install the Chrome extension", body: "Open Reachlyst beside your normal prospecting flow and keep the helper available while you research." },
  { icon: "/linkedin-sales-icon.svg", title: "Open Sales Navigator", body: "Browse searches and lead lists as usual while Reachlyst reads visible context and keeps everything organized." },
  { icon: "/reachlyst-logo-r-blue.png", title: "Sync to Reachlyst", body: "Searches, leads, statuses, notes, suggested invites, and message history land in one clean workspace.", brand: true },
  { icon: "/rocket-icon.svg", title: "Polish outreach", body: "Train each search, score leads, regenerate invite copy, and copy the version you actually want to send." }
];

const aiHighlights = [
  ["01", "AI fit scoring", "See who looks like a strong buyer before you open ten more tabs."],
  ["02", "AI invite drafts", "Generate short, human connection copy you can edit and paste manually."],
  ["03", "Search training", "Teach each campaign what good, maybe, and skip should mean."],
  ["04", "Reply suggestions", "Turn visible message context into cleaner follow-up ideas."]
];

const reviews = [
  ["Sofia Grant", "Founder, Pipeline North", "Reachlyst turned our Sales Navigator tabs into an actual workflow. It is much easier to see who is worth contacting.", "https://i.pravatar.cc/96?img=47"],
  ["Marcus Lee", "Growth Lead, Cloudlane", "The fit scoring and invite drafts save our team a lot of review time without changing how reps work on LinkedIn.", "https://i.pravatar.cc/96?img=12"],
  ["Elena Brooks", "Agency Owner, Signal & Co.", "I use it as my LinkedIn lead desk. Searches, notes, invite copy, and status are finally in one place.", "https://i.pravatar.cc/96?img=32"],
  ["Daniel Price", "Outbound Manager, Revstack", "The Chrome extension makes Sales Navigator feel connected to our outreach process instead of being another isolated list.", "https://i.pravatar.cc/96?img=15"],
  ["Amelia Hart", "Partner, Northstar Studio", "The dashboard gives our team a simple way to remember who was invited, who replied, and who needs a follow-up.", "https://i.pravatar.cc/96?img=5"],
  ["Noah Bennett", "Founder, Ledgerwise", "I like that the workflow stays manual but the prep work is much faster. It feels practical, not noisy.", "https://i.pravatar.cc/96?img=18"],
  ["Ava Mitchell", "Revenue Ops, Brightline", "Reachlyst helped us turn saved searches into a repeatable prospect review process.", "https://i.pravatar.cc/96?img=29"],
  ["Lucas Turner", "Sales Lead, Metricspace", "The invite suggestions are short, clean, and easy to adapt before sending.", "https://i.pravatar.cc/96?img=22"],
  ["Mia Coleman", "Founder, Driftmark", "I can scroll Sales Navigator and keep the useful context without building another spreadsheet.", "https://i.pravatar.cc/96?img=44"],
  ["Ethan Foster", "BD Manager, Canal Labs", "The status badges make it easy to avoid contacting the same person twice.", "https://i.pravatar.cc/96?img=11"],
  ["Grace Collins", "Agency Director, Blue Anchor", "It is the missing layer between Sales Navigator research and actual outreach execution.", "https://i.pravatar.cc/96?img=36"],
  ["Liam Peterson", "Founder, Stackway", "Good fit scoring helps me slow down on the right leads and skip the obvious bad matches.", "https://i.pravatar.cc/96?img=52"],
  ["Chloe Ramirez", "Growth Consultant, Marketstep", "The search-level AI context is exactly what we needed for different campaigns.", "https://i.pravatar.cc/96?img=25"],
  ["Henry Ward", "Sales Consultant, Claybridge", "I can keep messages consistent without making them feel templated.", "https://i.pravatar.cc/96?img=60"],
  ["Ella Morgan", "Founder, Acorn Growth", "Reachlyst is much cleaner than managing invite notes in a doc and lead status in a sheet.", "https://i.pravatar.cc/96?img=31"],
  ["Jack Hughes", "Outbound Lead, Northpond", "The product is lightweight enough that reps actually use it during research.", "https://i.pravatar.cc/96?img=14"],
  ["Harper Reed", "CEO, Signal Cart", "Our team finally has one place to see Sales Navigator searches and outreach progress.", "https://i.pravatar.cc/96?img=49"],
  ["Owen Fisher", "Founder, Portico Labs", "The extension makes lead review smoother without taking control away from the rep.", "https://i.pravatar.cc/96?img=7"],
  ["Lily Parker", "Marketing Founder, Clearbitten", "I use the regenerate option constantly to get a cleaner first line before I copy it.", "https://i.pravatar.cc/96?img=41"],
  ["Benjamin Scott", "Sales Manager, Ridgeflow", "Simple, focused, and easy for a small outbound team to understand quickly.", "https://i.pravatar.cc/96?img=53"],
  ["Zoe Adams", "Consultant, Demand Craft", "It gives structure to Sales Navigator without forcing us into a heavy CRM setup.", "https://i.pravatar.cc/96?img=20"]
];

const faqs = [
  ["Is Reachlyst an AI tool?", "Yes. Reachlyst is an AI-assisted Sales Navigator helper. AI is used for fit scoring, search-specific guidance, invite drafts, and reply suggestions."],
  ["Does Reachlyst send LinkedIn messages for me?", "No. Reachlyst helps you prepare, score, copy, and track outreach. You still decide what to send and when."],
  ["How does the Chrome extension work?", "It runs on Sales Navigator and LinkedIn messaging pages, reads visible information, and syncs it to your Reachlyst workspace."],
  ["Can I train AI for a specific search?", "Yes. Each search can have its own AI context, target customer notes, tone, and message direction."],
  ["Which package should I start with?", "Starter is enough for one person testing a focused Sales Navigator workflow. Growth is better for consistent weekly prospecting."],
  ["What happens when I need more volume?", "Growth and Scale include larger monthly allowances, and the product is structured for add-on packs as volume increases."],
  ["Can the dashboard replace my CRM?", "Reachlyst is designed as a Sales Navigator workflow layer. It can keep prospecting organized before leads move to your CRM."],
  ["Does Reachlyst work for agencies?", "Yes. Agencies can keep different searches, lead statuses, invite copy, and replies separated by campaign."],
  ["Why use this instead of a spreadsheet?", "Reachlyst keeps the lead, search context, AI suggestion, status, and message history together without manual spreadsheet cleanup."]
];

export default function HomePage() {
  const workflowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: workflowRef, offset: ["start center", "end center"] });
  const planeY = useTransform(scrollYProgress, [0, 1], ["0%", "86%"]);

  return (
    <main className="pageShell bg-[#050a18]">
      <Header />
      <section className="bg-[radial-gradient(circle_at_72%_12%,rgba(22,119,255,.28)_0,transparent_33%),linear-gradient(180deg,#050a18,#08111f)] px-0 py-20 text-white sm:py-28">
        <div className="container grid gap-10">
          <motion.div className="mx-auto max-w-[980px] text-center" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex text-xs font-black uppercase tracking-[.08em] text-blue-300">AI Sales Navigator helper</span>
            <h1 className="mx-auto my-5 max-w-[980px] text-5xl font-extrabold leading-[.95] tracking-normal sm:text-7xl lg:text-8xl">AI outreach assistant for LinkedIn Sales Navigator.</h1>
            <p className="mx-auto max-w-[780px] text-xl leading-relaxed text-white/70 sm:text-[22px]">Reachlyst helps you understand leads, draft better invites and replies, and keep every outreach step organized while you prospect.</p>
            <div className="mt-7 flex justify-center"><Button href="/signup">Start free</Button></div>
          </motion.div>
          <motion.div className="mx-auto w-full max-w-[1080px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,.32)]" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .15 }}>
            <div className="flex h-[42px] items-center gap-2 bg-white/10 px-3.5"><span className="h-2.5 w-2.5 rounded-full bg-white/50" /><span className="h-2.5 w-2.5 rounded-full bg-white/50" /><span className="h-2.5 w-2.5 rounded-full bg-white/50" /><strong className="ml-2 text-xs font-extrabold text-white/70">Reachlyst demo</strong></div>
            <div className="relative grid min-h-[420px] gap-3.5 bg-[linear-gradient(145deg,rgba(11,18,32,.96),rgba(15,23,42,.88))] p-5 md:min-h-[500px] md:grid-cols-[1.2fr_.8fr] md:p-7">
              <div className="absolute left-1/2 top-1/2 z-[2] flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent pl-1 text-2xl text-white shadow-[0_18px_50px_rgba(22,119,255,.45)]">▶</div>
              <Card className="self-end p-6 text-ink md:row-span-2 md:min-h-[280px]"><h3 className="text-xl font-extrabold">Agency owners</h3><strong className="mt-5 block text-5xl">62 leads</strong><p className="mt-3 font-bold text-muted">21 good fits · 16 invited · 5 replies</p></Card>
              <Card className="p-6 text-ink"><h3 className="text-xl font-extrabold">Suggested invite</h3><p className="mt-3 font-bold leading-7 text-muted">Hi Maya, noticed your work at Bright Pipeline. Thought it made sense to connect.</p></Card>
            </div>
          </motion.div>
          <motion.div className="relative mx-auto grid w-full max-w-[1080px] gap-3.5 overflow-hidden rounded-2xl border border-blue-200/20 bg-[linear-gradient(120deg,rgba(96,165,250,.16),rgba(255,255,255,.055)_38%,rgba(34,211,238,.11)),repeating-linear-gradient(90deg,rgba(255,255,255,.04)_0_1px,transparent_1px_56px)] p-3.5 shadow-[0_30px_90px_rgba(0,0,0,.24)] before:pointer-events-none before:absolute before:inset-0 before:animate-aiSweep before:bg-[linear-gradient(100deg,transparent_0%,rgba(255,255,255,.12)_42%,rgba(96,165,250,.18)_50%,transparent_64%)] md:grid-cols-4" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }}>
            {aiHighlights.map(([number, title, body], index) => <motion.div className="relative z-[1] min-h-[168px] animate-aiFloat rounded-xl border border-white/10 bg-[#050a18]/60 p-5 transition hover:-translate-y-1.5 hover:border-blue-300/50 hover:shadow-[0_18px_52px_rgba(22,119,255,.18)]" style={{ animationDelay: `${index * .8}s` }} key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .06 }}>
              <small className="mb-5 block text-xs font-black uppercase tracking-[.1em] text-blue-300">{number}</small>
              <strong className="block text-xl font-extrabold leading-tight text-white">{title}</strong>
              <p className="mt-3 text-sm font-semibold leading-6 text-white/65">{body}</p>
            </motion.div>)}
          </motion.div>
        </div>
      </section>
      <section className="border-y border-white/10 bg-[#08111f] py-24 text-white sm:py-28">
        <div className="container">
          <SectionIntro eyebrow="How it works" title="From Sales Navigator search to tracked outreach." />
          <div className="relative mt-12" ref={workflowRef}>
            <div className="absolute bottom-7 left-7 top-7 w-0.5 rounded-full bg-[linear-gradient(180deg,transparent,rgba(96,165,250,.55),rgba(96,165,250,.16),transparent)] md:left-1/2 md:-translate-x-1/2" />
            <motion.div className="absolute left-0 z-[2] flex h-14 w-14 items-center justify-center rounded-full border border-blue-300/30 bg-blue-300/10 shadow-[0_16px_46px_rgba(22,119,255,.25)] md:left-[calc(50%_-_28px)]" style={{ top: planeY }}><img className="h-8 w-8 rotate-90" alt="" src="/paper-plane.svg" /></motion.div>
            <div className="relative z-[1] grid gap-14">{workflow.map((item, index) => <motion.div className="flex justify-end md:even:justify-end md:odd:justify-start" key={item.title} initial={{ opacity: 0, y: 34, scale: .97 }} whileInView={{ opacity: 1, y: -8, scale: 1.018 }} viewport={{ once: false, margin: "-80px" }} transition={{ delay: index * .08, duration: .55 }} whileHover={{ scale: 1.018, y: -8 }}>
              <Card className="min-h-[300px] w-[calc(100%_-_72px)] !border-blue-300/20 !bg-white/10 p-8 !text-white shadow-[0_24px_90px_rgba(0,0,0,.18)] transition hover:!border-blue-300/50 hover:shadow-[0_28px_100px_rgba(22,119,255,.18)] md:w-[min(520px,calc(50%_-_54px))]">
                <div className="flex items-center justify-between"><span className={`flex h-[72px] w-[72px] items-center justify-center rounded-[18px] ${item.brand ? "border border-white/80 bg-white shadow-[0_18px_48px_rgba(22,119,255,.18)]" : "border border-blue-300/30 bg-accent/10"}`}><img className={item.brand ? "h-12 w-12 object-contain" : "max-h-11 max-w-11 object-contain"} alt="" src={item.icon} /></span><em className="not-italic font-black text-white/40">0{index + 1}</em></div>
                <h3 className="mt-10 text-3xl font-extrabold leading-tight">{item.title}</h3>
                <p className="mt-3 text-[17px] font-semibold leading-7 text-white/65">{item.body}</p>
              </Card>
            </motion.div>)}</div>
          </div>
        </div>
      </section>
      <section className="relative max-h-[780px] overflow-hidden border-b border-white/10 bg-[#08111f] py-24 text-white before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-[2] before:h-[72px] before:bg-[linear-gradient(180deg,#08111f,transparent)] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-[2] after:h-[72px] after:bg-[linear-gradient(0deg,#08111f,transparent)]">
        <div className="container">
          <h2 className="text-4xl font-extrabold leading-tight sm:text-5xl">For teams turning LinkedIn lists into pipeline</h2>
          <div className="mt-10 grid gap-6 overflow-hidden py-5 pb-24 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]" style={{ marginInline: "calc((100vw - min(1160px, calc(100vw - 40px))) / -2)" }}>
            {[reviews.slice(0, 11), reviews.slice(10).concat(reviews.slice(0, 3))].map((row, rowIndex) => <div className={`flex w-max gap-4 animate-reviewDrift ${rowIndex === 1 ? "[animation-direction:reverse] mt-3" : ""}`} key={rowIndex}>
              {[...row, ...row].map(([name, role, quote, avatar], index) => <Card className={`min-h-[230px] flex-[0_0_330px] !border-white/10 !bg-white/10 p-5 !text-white ${index % 3 === 2 ? "-translate-y-4" : ""} ${index % 4 === 3 ? "translate-y-3" : ""}`} key={`${name}-${rowIndex}-${index}`}>
                <div className="flex items-center gap-3"><img className="h-11 w-11 rounded-full object-cover" alt="" src={avatar} /><div><strong className="block font-extrabold">{name}</strong><span className="mt-0.5 block text-xs font-semibold text-white/55">{role}</span></div></div>
                <div className="my-4 text-xs font-black text-amber-300">★★★★★ <span className="ml-2 inline-flex rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[11px] text-white">Google</span></div>
                <p className="font-semibold leading-6 text-white/65">"{quote}"</p>
              </Card>)}
            </div>)}
          </div>
        </div>
      </section>
      <section className="border-b border-white/10 bg-[#08111f] py-24 text-white">
        <div className="container">
          <SectionIntro eyebrow="Pricing" title="Start free. Upgrade when your lead volume grows." />
          <div className="grid gap-4 md:grid-cols-3">{plans.map((plan) => <PlanCard key={plan.key} plan={plan} />)}</div>
        </div>
      </section>
      <section className="border-t border-white/10 bg-[#050a18] py-24 text-white sm:py-28">
        <div className="container grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="inline-flex text-xs font-black uppercase tracking-[.08em] text-blue-300">FAQ</span>
            <h2 className="my-5 text-4xl font-extrabold leading-tight sm:text-6xl">Questions before you try Reachlyst?</h2>
            <p className="max-w-md text-lg font-semibold leading-8 text-white/65">A quick pass through how the helper, extension, AI, and pricing fit together.</p>
          </div>
          <div className="grid gap-3">
            {faqs.map(([question, answer], index) => <details className="group overflow-hidden rounded-lg border border-white/10 bg-white/5 transition hover:scale-[1.01] hover:border-blue-300/40 hover:shadow-[0_18px_60px_rgba(22,119,255,.1)]" key={question} open={index === 0}>
              <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between px-5 text-lg font-extrabold [&::-webkit-details-marker]:hidden"><span>{question}</span><i className="relative h-8 w-8 rounded-full border border-blue-300/40 transition before:absolute before:left-1/2 before:top-1/2 before:h-0.5 before:w-3 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-blue-300 after:absolute after:left-1/2 after:top-1/2 after:h-3 after:w-0.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-blue-300 group-open:rotate-180 group-open:bg-blue-300/20 group-open:after:opacity-0" /></summary>
              <p className="-mt-1 px-5 pb-5 font-semibold leading-7 text-white/65">{answer}</p>
            </details>)}
          </div>
        </div>
      </section>
      <section className="bg-[radial-gradient(circle_at_50%_0,rgba(22,119,255,.32),transparent_42%),linear-gradient(180deg,#08111f,#050a18)] py-28 text-center text-white">
        <div className="container"><span className="mb-3 block text-xs font-black uppercase tracking-[.08em] text-blue-300">Ready when your next Sales Navigator search is.</span><h2 className="mx-auto mb-7 max-w-[940px] text-5xl font-extrabold leading-none sm:text-7xl">Give your LinkedIn lead workflow a real workspace.</h2><Button href="/signup">Create workspace</Button></div>
      </section>
      <Footer />
    </main>
  );
}

function Header() {
  return <nav className="sticky top-0 z-10 border-b border-white/10 bg-[#050a18]"><div className="container flex min-h-[72px] flex-col items-start gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-0"><Logo /><div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-extrabold text-white/70"><Link className="transition hover:scale-[1.025] hover:text-white" href="/features">Features</Link><Link className="transition hover:scale-[1.025] hover:text-white" href="/pricing">Pricing</Link><Link className="transition hover:scale-[1.025] hover:text-white" href="/login">Login</Link><Button href="/signup">Sign up</Button></div></div></nav>;
}

function Footer() {
  return <footer className="border-t border-white/10 bg-[#050a18] py-7 text-white/70"><div className="container flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between"><Logo /><nav className="flex flex-wrap gap-4 text-sm font-bold"><Link className="hover:text-white" href="/pricing">Pricing</Link><Link className="hover:text-white" href="/features">Features</Link><Link className="hover:text-white" href="/privacy">Privacy Policy</Link><Link className="hover:text-white" href="/terms">Terms</Link><Link className="hover:text-white" href="/blog">Blog</Link></nav></div></footer>;
}

function Logo() {
  return <Link className="inline-flex items-center" href="/"><img className="h-8 w-auto" alt="Reachlyst" src="/reachlyst-logo-blue.png" /></Link>;
}

function SectionIntro({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div className="mb-6 max-w-[720px]"><span className="mb-2 block text-xs font-black uppercase tracking-[.08em] text-blue-300">{eyebrow}</span><h2 className="m-0 text-3xl font-extrabold leading-tight sm:text-5xl">{title}</h2></div>;
}

function PlanCard({ plan }: { plan: (typeof plans)[number] }) {
  const isFeatured = plan.key === "growth";
  return <Card className={`!border-white/10 !bg-white/5 p-5 !text-white ${isFeatured ? "-translate-y-2 !border-blue-300/60 shadow-[0_24px_80px_rgba(22,119,255,.18)]" : ""}`}>
    <h3 className="text-xl font-extrabold">{plan.name}</h3>
    <strong className="my-4 block text-4xl font-extrabold">{plan.price}<span className="ml-1 text-sm text-white/55">/mo</span></strong>
    <p className="min-h-[52px] font-bold leading-6 text-white/80">{plan.summary}</p>
    <div className="mt-5 grid gap-2">
      {plan.features.map((feature) => <p className="m-0 font-semibold leading-6 text-white/65" key={feature}>✓ {feature}</p>)}
    </div>
    <div className="mt-5"><Button href="/pricing" variant={isFeatured ? "primary" : "secondary"}>{plan.cta}</Button></div>
  </Card>;
}
