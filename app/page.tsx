/* eslint-disable @next/next/no-img-element */
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MarketingFooter, MarketingNav } from "@/components/MarketingChrome";
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

const features = [
  ["Lead context chat", "Ask Reachlyst about the selected Sales Navigator lead and get practical fit notes, profile context, and outreach angles."],
  ["Invite generation", "Generate concise connection invites from visible Sales Navigator context, then edit and send manually."],
  ["Reply suggestions", "Use visible LinkedIn message context to draft warmer, clearer follow-ups for accepted connections."],
  ["AI Playbook", "Train Reachlyst on your offer, ICP, tone, objections, and message style so suggestions match your business."],
  ["Extension setup", "Manage a persistent extension token for your workspace and keep the Sales Navigator helper ready."],
  ["Usage controls", "Track lead scans, AI replies, trial status, package limits, and seats from the dashboard."],
  ["Search workflow support", "Work naturally inside Sales Navigator while Reachlyst helps organize lead context and outreach decisions."],
  ["Manual-first safety", "Reachlyst never sends LinkedIn messages for you. It prepares copy and context, while you stay in control."]
];

const productScreenshots = [
  {
    image: "/product-screenshots/lead.png",
    title: "Lead research and invite generation",
    body: "Open a Sales Navigator lead, ask Reachlyst for context, and generate a short connection invite without leaving the page."
  },
  {
    image: "/product-screenshots/messages.png",
    title: "Reply suggestions for accepted connections",
    body: "On message threads, Reachlyst uses the visible conversation to suggest cleaner follow-ups you can copy, edit, and send manually."
  },
  {
    image: "/product-screenshots/dashboard.png",
    title: "Dashboard, AI Playbook, and extension setup",
    body: "Train the AI Playbook, track usage, manage extension access, and keep the workspace ready for your team."
  }
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
  ["What does Reachlyst do?", "Reachlyst is an AI outreach assistant for Sales Navigator. It helps you understand visible lead context, draft connection invites, and write better replies while you stay in control."],
  ["Does Reachlyst send LinkedIn messages automatically?", "No. Reachlyst suggests copy only. You review, edit, copy, and send manually inside LinkedIn or Sales Navigator."],
  ["How does the Chrome extension work?", "The extension appears on supported Sales Navigator and messaging pages, reads visible context from the page, and opens a small AI chat for the selected lead or conversation."],
  ["What is the AI Playbook?", "AI Playbook is where you teach Reachlyst what you sell, which leads matter, what tone you prefer, and what kinds of outreach it should generate."],
  ["What are lead scans?", "A lead scan is counted when the extension reads visible Sales Navigator lead context so Reachlyst can help evaluate the person or prepare outreach."],
  ["What are AI replies?", "AI replies are invite drafts, follow-up drafts, conversation suggestions, or lead analysis responses generated by Reachlyst AI."],
  ["Which package should I start with?", "Starter is best for one person testing a focused workflow. Growth is for consistent weekly prospecting. Scale is for heavier usage or small teams."],
  ["Can I add more usage later?", "Yes. The packages are designed around monthly lead scans, AI replies, and seats. Add-on packs can be introduced when volume grows."],
  ["Do I need a CRM?", "No. Reachlyst is not trying to replace your CRM. It gives you a focused workspace for Sales Navigator research, AI outreach help, and usage tracking before anything moves elsewhere."]
];

export default function HomePage() {
  const workflowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: workflowRef, offset: ["start center", "end center"] });
  const planeY = useTransform(scrollYProgress, [0, 1], ["0%", "86%"]);

  return (
    <main className="pageShell bg-[#050a18]">
      <MarketingNav />
      <section id="hero" className="bg-[radial-gradient(circle_at_72%_12%,rgba(22,119,255,.28)_0,transparent_33%),linear-gradient(180deg,#050a18,#08111f)] px-0 py-20 text-white sm:py-28">
        <div className="container grid gap-10">
          <motion.div className="mx-auto max-w-[980px] text-center" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex text-xs font-black uppercase tracking-[.08em] text-blue-300">AI Sales Navigator helper</span>
            <h1 className="mx-auto my-5 max-w-[980px] text-5xl font-extrabold leading-[.95] tracking-normal sm:text-7xl lg:text-8xl">AI outreach assistant for LinkedIn Sales Navigator.</h1>
            <p className="mx-auto max-w-[780px] text-xl leading-relaxed text-white/70 sm:text-[22px]">Reachlyst helps you understand leads, draft better invites and replies, and keep every outreach step organized while you prospect.</p>
            <div className="mt-7 flex justify-center"><Button href="/signup">Start free</Button></div>
          </motion.div>
          <motion.div className="mx-auto w-full max-w-[1120px] overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_30px_90px_rgba(0,0,0,.32)]" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .15 }}>
            <div className="flex h-[42px] items-center gap-2 bg-white/10 px-3.5"><span className="h-2.5 w-2.5 rounded-full bg-white/50" /><span className="h-2.5 w-2.5 rounded-full bg-white/50" /><span className="h-2.5 w-2.5 rounded-full bg-white/50" /><strong className="ml-2 text-xs font-extrabold text-white/70">Reachlyst in Sales Navigator</strong></div>
            <img className="block aspect-[16/10] w-full object-cover object-center" src="/product-screenshots/lead.png" alt="Reachlyst lead chat generating a Sales Navigator connection invite" />
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
      <section id="features" className="border-y border-white/10 bg-[#050a18] py-24 text-white sm:py-28">
        <div className="container">
          <SectionIntro eyebrow="Features" title="Everything you need to turn Sales Navigator context into better outreach." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map(([title, body], index) => <Card className="!border-white/10 !bg-white/5 p-5 !text-white transition hover:!border-blue-300/50 hover:shadow-[0_20px_70px_rgba(22,119,255,.14)]" key={title}>
              <span className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-300/20 bg-[#14233d] text-sm font-black text-blue-200">0{index + 1}</span>
              <h3 className="text-xl font-extrabold leading-tight">{title}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-white/65">{body}</p>
            </Card>)}
          </div>
        </div>
      </section>
      <section id="product-screenshots" className="border-b border-white/10 bg-[#08111f] py-24 text-white sm:py-28">
        <div className="container">
          <SectionIntro eyebrow="Product screenshots" title="See the extension and workspace in the moments where buyers actually need help." />
          <div className="mt-10 grid gap-5">
            <motion.figure className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_28px_90px_rgba(0,0,0,.24)]" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }}>
              <img className="block w-full" src={productScreenshots[0].image} alt={productScreenshots[0].title} />
              <figcaption className="grid gap-2 border-t border-white/10 p-5 sm:grid-cols-[.38fr_1fr] sm:items-center">
                <strong className="text-xl font-extrabold">{productScreenshots[0].title}</strong>
                <span className="font-semibold leading-7 text-white/65">{productScreenshots[0].body}</span>
              </figcaption>
            </motion.figure>
            <div className="grid gap-5 lg:grid-cols-2">
              {productScreenshots.slice(1).map((shot, index) => <motion.figure className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_24px_70px_rgba(0,0,0,.18)]" key={shot.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08, duration: .5 }}>
                <img className="block aspect-[16/10] w-full object-cover object-left-top" src={shot.image} alt={shot.title} />
                <figcaption className="min-h-[156px] border-t border-white/10 p-5">
                  <strong className="text-xl font-extrabold">{shot.title}</strong>
                  <p className="mt-3 font-semibold leading-7 text-white/65">{shot.body}</p>
                </figcaption>
              </motion.figure>)}
            </div>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="border-y border-white/10 bg-[#08111f] py-24 text-white sm:py-28">
        <div className="container">
          <SectionIntro eyebrow="How it works" title="From Sales Navigator search to tracked outreach." />
          <div className="relative mt-12" ref={workflowRef}>
            <div className="absolute bottom-7 left-7 top-7 w-0.5 rounded-full bg-[linear-gradient(180deg,transparent,rgba(96,165,250,.55),rgba(96,165,250,.16),transparent)] md:left-1/2 md:-translate-x-1/2" />
            <motion.div className="absolute left-0 z-[2] flex h-14 w-14 items-center justify-center rounded-full border border-blue-300/30 bg-blue-300/10 shadow-[0_16px_46px_rgba(22,119,255,.25)] md:left-[calc(50%_-_28px)]" style={{ top: planeY }}><img className="h-8 w-8 rotate-90" alt="" src="/paper-plane.svg" /></motion.div>
            <div className="relative z-[1] grid gap-14">{workflow.map((item, index) => <motion.div className="flex justify-end md:even:justify-end md:odd:justify-start" key={item.title} initial={{ opacity: 0, y: 34, scale: .97 }} whileInView={{ opacity: 1, y: -8, scale: 1.018 }} viewport={{ once: false, margin: "-80px" }} transition={{ delay: index * .08, duration: .55 }} whileHover={{ scale: 1.018, y: -8 }}>
              <Card className="min-h-[300px] w-[calc(100%_-_72px)] !border-blue-300/20 !bg-white/10 p-8 !text-white shadow-[0_24px_90px_rgba(0,0,0,.18)] transition hover:!border-blue-300/50 hover:shadow-[0_28px_100px_rgba(22,119,255,.18)] md:w-[min(520px,calc(50%_-_54px))]">
                <div className="flex items-center justify-between"><span className={`flex h-[72px] w-[72px] items-center justify-center rounded-[18px] ${item.brand ? "border border-blue-300/20 bg-[#14233d] shadow-[0_18px_48px_rgba(22,119,255,.18)]" : "border border-blue-300/30 bg-accent/10"}`}><img className={item.brand ? "h-11 w-11 object-contain brightness-0 invert" : "max-h-11 max-w-11 object-contain"} alt="" src={item.icon} /></span><em className="not-italic font-black text-white/40">0{index + 1}</em></div>
                <h3 className="mt-10 text-3xl font-extrabold leading-tight">{item.title}</h3>
                <p className="mt-3 text-[17px] font-semibold leading-7 text-white/65">{item.body}</p>
              </Card>
            </motion.div>)}</div>
          </div>
        </div>
      </section>
      <section id="testimonials" className="relative max-h-[780px] overflow-hidden border-b border-white/10 bg-[#08111f] py-24 text-white before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-[2] before:h-[72px] before:bg-[linear-gradient(180deg,#08111f,transparent)] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-[2] after:h-[72px] after:bg-[linear-gradient(0deg,#08111f,transparent)]">
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
      <section id="pricing" className="border-b border-white/10 bg-[#08111f] py-24 text-white">
        <div className="container">
          <SectionIntro eyebrow="Pricing" title="Start free. Upgrade when your lead volume grows." />
          <div className="grid gap-4 md:grid-cols-3">{plans.map((plan) => <PlanCard key={plan.key} plan={plan} />)}</div>
        </div>
      </section>
      <section id="faq" className="border-t border-white/10 bg-[#050a18] py-24 text-white sm:py-28">
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
      <section id="start" className="bg-[radial-gradient(circle_at_50%_0,rgba(22,119,255,.32),transparent_42%),linear-gradient(180deg,#08111f,#050a18)] py-28 text-center text-white">
        <div className="container"><span className="mb-3 block text-xs font-black uppercase tracking-[.08em] text-blue-300">Ready when your next Sales Navigator search is.</span><h2 className="mx-auto mb-7 max-w-[940px] text-5xl font-extrabold leading-none sm:text-7xl">Give your LinkedIn lead workflow a real workspace.</h2><Button href="/signup">Create workspace</Button></div>
      </section>
      <MarketingFooter />
    </main>
  );
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
    <form className="mt-5" action="/api/stripe/checkout" method="post">
      <input name="plan" type="hidden" value={plan.key} />
      <Button type="submit" variant={isFeatured ? "primary" : "secondary"}>{plan.cta}</Button>
    </form>
  </Card>;
}
