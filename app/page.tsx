/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { MarketingFooter, MarketingNav } from "@/components/MarketingChrome";
import { Button, Card } from "@/components/ui";
import { formatLimit } from "@/lib/planLimits";
import { plans } from "@/lib/stripe";

const workflow = [
  { icon: "extension", title: "Install the Chrome extension", body: "Open Reachlyst beside your normal prospecting flow and keep the helper available while you research." },
  { icon: "navigator", title: "Open Sales Navigator", body: "Browse searches and lead lists as usual while Reachlyst reads visible context and keeps everything organized." },
  { icon: "reachlyst", title: "Sync to Reachlyst", body: "Searches, leads, statuses, notes, suggested invites, and message history land in one clean workspace.", brand: true },
  { icon: "outreach", title: "Polish outreach", body: "Train each search, score leads, regenerate invite copy, and copy the version you actually want to send." }
];

const reviews = [
  ["Sofia Grant", "Founder, Pipeline North", "Reachlyst turned our Sales Navigator tabs into an actual workflow. It is much easier to see who is worth contacting.", "https://i.pravatar.cc/96?img=47"],
  ["Marcus Lee", "Growth Lead, Cloudlane", "The fit scoring and invite drafts save our team a lot of review time without changing how reps work on LinkedIn.", "https://i.pravatar.cc/96?img=12"],
  ["Elena Brooks", "Agency Owner, Signal & Co.", "I use it as my LinkedIn lead desk. Searches, notes, invite copy, and status are finally in one place.", "https://i.pravatar.cc/96?img=32"],
  ["Daniel Price", "Outbound Manager, Revstack", "The Chrome extension makes Sales Navigator feel connected to our outreach process instead of being another isolated list.", "https://i.pravatar.cc/96?img=15"],
  ["Amelia Hart", "Partner, Northstar Studio", "The dashboard gives our team a simple way to remember who was invited, who replied, and who needs a follow-up.", "https://i.pravatar.cc/96?img=5"],
  ["Noah Bennett", "Founder, Ledgerwise", "I like that the workflow stays manual but the prep work is much faster. It feels practical, not noisy.", "https://i.pravatar.cc/96?img=18"],
  ["Ava Mitchell", "Revenue Ops, Brightline", "Reachlyst helped us turn Sales Navigator lead review into a repeatable prospecting process.", "https://i.pravatar.cc/96?img=29"],
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
  ["What counts toward my monthly usage?", "Only AI messages count toward your monthly package: invite drafts, follow-up drafts, conversation suggestions, lead chat answers, and AI analysis responses."],
  ["Which package should I start with?", "Starter is best for one person testing a focused workflow. Growth is for consistent weekly prospecting. If you need more volume, contact us for a custom allowance."],
  ["Can I add more usage later?", "Yes. The packages are designed around monthly AI messages. Extra AI message packs can be added when volume grows."],
  ["Do I need a CRM?", "No. Reachlyst is not trying to replace your CRM. It gives you a focused workspace for Sales Navigator research, AI outreach help, and usage tracking before anything moves elsewhere."]
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Reachlyst",
    url: "https://reachlyst.com",
    logo: "https://reachlyst.com/reachlyst-logo-blue.png"
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Reachlyst",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, Chrome",
    url: "https://reachlyst.com",
    description: "AI outreach assistant for Sales Navigator and manual B2B outreach workflows.",
    offers: plans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: plan.price.replace("$", ""),
      priceCurrency: "USD",
      url: "https://reachlyst.com/pricing"
    }))
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer
      }
    }))
  }
];

export default function HomePage() {
  return (
    <main className="pageShell bg-[#f5f7fb]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MarketingNav />
      <section id="hero" className="hero-aurora overflow-hidden bg-[radial-gradient(circle_at_82%_16%,rgba(22,119,255,.18)_0,transparent_30%),linear-gradient(180deg,#f8fbff,#eef4ff)] py-14 text-ink sm:py-16">
        <div className="container grid grid-cols-1 items-center gap-10 lg:min-h-[760px] lg:grid-cols-[.78fr_1.22fr]">
          <motion.div className="min-w-0 max-w-[720px]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex rounded-full border border-blue-100 bg-white px-3 py-2 text-xs uppercase tracking-[.08em] text-accent-strong shadow-[0_12px_32px_rgba(22,119,255,.08)]">AI Sales Navigator helper</span>
            <h1 className="my-5 max-w-full text-[44px] leading-[.96] tracking-normal text-ink sm:text-6xl lg:text-7xl">AI outreach assistant for LinkedIn Sales Navigator.</h1>
            <p className="max-w-full text-xl leading-relaxed text-muted sm:max-w-[650px] sm:text-[22px]">Reachlyst helps you understand leads, draft better invites and replies, and keep every outreach step organized while you prospect.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3"><Button href="/signup">Create workspace</Button></div>
          </motion.div>
          <motion.div className="relative min-h-0 sm:min-h-[560px] lg:min-h-[650px]" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .15 }}>
            <div className="product-hero-shot absolute right-0 top-0 w-[min(980px,100%)] overflow-hidden rounded-[30px] border border-white bg-white shadow-[0_34px_120px_rgba(15,23,42,.18)]">
              <ScreenshotChrome label="Reachlyst chat over Sales Navigator" badge="AI panel">
                <div className="product-chat-hero relative aspect-[1.54/1] overflow-hidden bg-slate-100">
                  <SyntheticNavigatorBackdrop />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,251,255,.5),rgba(248,251,255,.08)_34%,rgba(248,251,255,.18))]" />
                  <div className="product-chat-focus absolute bottom-5 right-8 w-[min(440px,54%)] overflow-hidden rounded-[24px] border border-blue-100 bg-white shadow-[0_28px_90px_rgba(22,119,255,.2)]">
                    <HeroChatPanel />
                  </div>
                  <div className="absolute bottom-5 left-5 max-w-[300px] rounded-2xl border border-white/70 bg-white/92 p-4 shadow-[0_18px_50px_rgba(15,23,42,.16)] backdrop-blur">
                    <span className="text-[11px] uppercase tracking-[.08em] text-accent-strong">Reachlyst is the focus</span>
                    <p className="mt-2 text-sm leading-6 text-ink">The lead list becomes context. The chat panel is where fit, angle, and invite decisions happen.</p>
                  </div>
                </div>
              </ScreenshotChrome>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="preview" className="bg-white py-20 text-ink sm:py-24">
        <div className="container grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
          <SectionIntro eyebrow="Preview" title="Watch the Reachlyst chat flow happen in context." />
          <div className="video-preview-frame overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-[0_30px_100px_rgba(15,23,42,.12)]">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              <strong className="ml-2 truncate text-xs text-muted">Reachlyst preview</strong>
              <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-[11px] text-accent-strong">1.5x</span>
            </div>
            <video
              className="block aspect-[1188/1280] max-h-[720px] w-full bg-slate-100 object-contain"
              autoPlay
              controls
              loop
              muted
              playsInline
              preload="metadata"
              onLoadedMetadata={(event) => {
                event.currentTarget.defaultPlaybackRate = 1.5;
                event.currentTarget.playbackRate = 1.5;
              }}
            >
              <source src="/product-videos/reachlyst-chat-preview.m4v" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#f8fbff] pb-8 pt-16 text-ink sm:pb-10 sm:pt-20">
        <div className="container grid gap-12 lg:grid-cols-[.82fr_1.18fr] lg:gap-16">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <SectionIntro eyebrow="How it works" title="From Sales Navigator search to tracked outreach." />
          </div>
          <div className="relative lg:min-h-[980px]">
            {workflow.map((item, index) => <motion.div
              className="lg:sticky lg:top-20"
              key={item.title}
              style={{ zIndex: index + 1, marginTop: index === 0 ? 0 : "88px" }}
              initial={{ opacity: 0, y: 44, scale: .96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: .42 }}
              transition={{ duration: .55, ease: "easeOut" }}
            >
              <Card className="min-h-[230px] overflow-hidden border-blue-100 bg-white p-0 text-ink shadow-[0_30px_100px_rgba(15,23,42,.1)] transition hover:border-blue-200 hover:shadow-[0_34px_110px_rgba(22,119,255,.14)]">
                <div className="grid min-h-[230px] gap-6 p-6 sm:grid-cols-[auto_1fr] sm:p-7">
                  <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${item.brand ? "border border-blue-100 bg-blue-50 shadow-[0_18px_48px_rgba(22,119,255,.12)]" : "border border-blue-100 bg-blue-50"}`}>
                    <WorkflowIcon type={item.icon} />
                  </span>
                  <div className="flex min-h-full flex-col justify-between">
                    <em className="not-italic text-4xl leading-none text-blue-100">0{index + 1}</em>
                    <div>
                      <h3 className="mt-9 text-2xl font-extrabold leading-tight sm:text-3xl">{item.title}</h3>
                      <p className="mt-3 max-w-[520px] text-base leading-7 text-muted">{item.body}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>)}
          </div>
        </div>
      </section>
      <section id="testimonials" className="relative max-h-[780px] overflow-hidden bg-white py-24 text-ink before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-[2] before:h-[72px] before:bg-[linear-gradient(180deg,#fff,transparent)] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:z-[2] after:h-[72px] after:bg-[linear-gradient(0deg,#fff,transparent)]">
        <div className="container">
          <h2 className="text-4xl font-extrabold leading-[1.16] sm:text-5xl">For teams turning LinkedIn lists into pipeline</h2>
          <div className="mt-10 grid gap-6 overflow-hidden py-5 pb-24 [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]" style={{ marginInline: "calc((100vw - min(1920px, calc(100vw - clamp(16px, 2.5vw, 40px)))) / -2)" }}>
            {[reviews.slice(0, 11), reviews.slice(10).concat(reviews.slice(0, 3))].map((row, rowIndex) => <div className={`flex w-max gap-4 animate-reviewDrift ${rowIndex === 1 ? "[animation-direction:reverse] mt-3" : ""}`} key={rowIndex}>
              {[...row, ...row].map(([name, role, quote, avatar], index) => <Card className={`min-h-[230px] flex-[0_0_330px] border-slate-200 bg-white p-5 text-ink shadow-[0_14px_44px_rgba(15,23,42,.08)] ${index % 3 === 2 ? "-translate-y-4" : ""} ${index % 4 === 3 ? "translate-y-3" : ""}`} key={`${name}-${rowIndex}-${index}`}>
                <div className="flex items-center gap-3"><img className="h-11 w-11 rounded-full object-cover" alt="" src={avatar} /><div><strong className="block font-extrabold">{name}</strong><span className="mt-0.5 block text-xs text-muted">{role}</span></div></div>
                <div className="my-4 text-xs text-amber-500">★★★★★ <span className="ml-2 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-muted">Google</span></div>
                <p className="leading-6 text-muted">&ldquo;{quote}&rdquo;</p>
              </Card>)}
            </div>)}
          </div>
        </div>
      </section>
      <section id="pricing" className="bg-[#f5f7fb] py-24 text-ink">
        <div className="container">
          <SectionIntro eyebrow="Pricing" title="Choose a package. Upgrade when your lead volume grows." />
          <div className="grid gap-4 md:grid-cols-3">{plans.map((plan) => <PlanCard key={plan.key} plan={plan} />)}</div>
          <Card className="mt-5 grid gap-4 border-blue-100 bg-white p-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div>
              <h3 className="text-xl text-ink">Need more than Growth?</h3>
              <p className="mt-2 max-w-2xl leading-6 text-muted">Contact us for a custom monthly AI message allowance when your Sales Navigator workflow needs more volume.</p>
            </div>
            <Button href="mailto:hello@reachlyst.com?subject=Reachlyst%20custom%20AI%20messages" variant="secondary">Contact us</Button>
          </Card>
        </div>
      </section>
      <section id="faq" className="bg-white py-24 text-ink sm:py-28">
        <div className="container grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <SectionIntro eyebrow="FAQ" title="Questions before you try Reachlyst?" />
            <p className="max-w-md text-lg leading-8 text-muted">A quick pass through how the helper, extension, AI, and pricing fit together.</p>
          </div>
          <div className="grid gap-3">
            {faqs.map(([question, answer], index) => <details className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:scale-[1.01] hover:border-blue-200 hover:shadow-[0_18px_60px_rgba(15,23,42,.08)]" key={question} open={index === 0}>
              <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between px-5 text-lg [&::-webkit-details-marker]:hidden"><span>{question}</span><i className="relative h-8 w-8 rounded-full border border-blue-200 transition before:absolute before:left-1/2 before:top-1/2 before:h-0.5 before:w-3 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:bg-accent after:absolute after:left-1/2 after:top-1/2 after:h-3 after:w-0.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-accent group-open:rotate-180 group-open:bg-blue-50 group-open:after:opacity-0" /></summary>
              <p className="-mt-1 px-5 pb-5 leading-7 text-muted">{answer}</p>
            </details>)}
          </div>
        </div>
      </section>
      <section id="start" className="bg-[radial-gradient(circle_at_50%_0,rgba(22,119,255,.18),transparent_42%),linear-gradient(180deg,#fff,#eef4ff)] py-28 text-center text-ink">
        <div className="container"><span className="mb-3 block text-xs uppercase tracking-[.08em] text-accent-strong">Ready when your next Sales Navigator search is.</span><h2 className="mx-auto mb-7 max-w-[940px] text-5xl leading-[1.08] sm:text-7xl">Give your LinkedIn lead workflow a real workspace.</h2><Button href="/signup">Create workspace</Button></div>
      </section>
      <MarketingFooter />
    </main>
  );
}

function SectionIntro({ eyebrow, title, tone = "light" }: { eyebrow: string; title: string; tone?: "light" | "dark" }) {
  const isDark = tone === "dark";
  return <div className="mb-6 max-w-[760px]">
    <span className={`mb-2 block text-xs uppercase tracking-[.08em] ${isDark ? "text-blue-300" : "text-accent-strong"}`}>{eyebrow}</span>
    <h2 className={`m-0 text-3xl leading-[1.16] sm:text-5xl ${isDark ? "text-white" : "text-ink"}`}>{title}</h2>
  </div>;
}

function ScreenshotChrome({ children, label, badge, compact = false }: { children: ReactNode; label: string; badge?: string; compact?: boolean }) {
  return <div className="overflow-hidden bg-white">
    <div className={`flex items-center gap-2 border-b border-slate-100 bg-slate-50 ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}>
      <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
      <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
      <strong className="ml-2 min-w-0 truncate text-xs text-muted">{label}</strong>
      {badge ? <span className="ml-auto shrink-0 rounded-full bg-blue-50 px-3 py-1 text-[11px] text-accent-strong">{badge}</span> : null}
    </div>
    {children}
  </div>;
}

function HeroChatPanel() {
  return <div className="hero-chat-panel flex h-full min-h-0 flex-col bg-white text-ink">
    <div className="flex items-center gap-3 border-b border-blue-100 bg-blue-50/55 p-4">
      <img className="h-9 w-9 rounded-xl border border-blue-100 bg-white p-1.5" alt="" src="/reachlyst-mark.svg" />
      <div className="min-w-0">
        <strong className="block truncate text-sm">Predrag Stojanovic</strong>
        <span className="block truncate text-xs text-muted">dimaso.co</span>
      </div>
      <span className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-white text-lg leading-none text-ink">-</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-white text-lg leading-none text-ink">×</span>
    </div>
    <div className="grid min-h-0 flex-1 content-start gap-3 overflow-hidden p-4">
      <p className="m-0 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-sm leading-5 text-ink">Selected Predrag. Click Generate invite or tell me how to shape the message.</p>
      <p className="m-0 justify-self-end rounded-xl bg-accent px-4 py-3 text-sm leading-5 text-white">Is Predrag a good fit for invitation?</p>
      <p className="m-0 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-sm leading-5 text-ink">Predrag Stojanovic at dimaso.co looks aligned with a website and outreach workflow conversation. His company context suggests a practical angle around improving visibility, lead quality, and follow-up consistency.</p>
      <p className="m-0 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-sm leading-5 text-ink">A concise invite should mention dimaso.co naturally and ask whether improving outbound research is a current priority.</p>
    </div>
    <div className="border-t border-blue-100 p-4">
      <div className="min-h-20 rounded-xl border border-blue-100 bg-white p-3 text-sm leading-5 text-muted">Write naturally. Ask about fit, angle, invite, follow-up, or paste a rough idea...</div>
      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-lg bg-accent px-4 py-2 text-sm text-white">Generate message</span>
        <span className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-ink">Send</span>
      </div>
    </div>
  </div>;
}

function SyntheticNavigatorBackdrop() {
  const rows = [
    ["Predrag Stojanovic", "Founder at dimaso.co", "Website and outbound workflow"],
    ["Ana Markovic", "Growth lead", "Recently reviewed lead quality"],
    ["Milan Petrovic", "Agency owner", "Looking at better follow-up systems"],
    ["Jelena Ilic", "Marketing director", "Strong ICP signal"],
    ["Stefan Nikolic", "Operations lead", "Manual outreach context"]
  ];

  return <div className="synthetic-navigator absolute inset-0 bg-white">
    <div className="flex h-11 items-center gap-3 border-b border-slate-200 px-4 text-[11px] text-muted">
      <span className="rounded bg-[#0a66c2] px-1.5 py-1 text-white">in</span>
      <span>Sales Navigator</span>
      <span className="ml-5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-slate-500">marketing agency OR website services</span>
      <span className="ml-auto rounded-full bg-slate-100 px-3 py-1">Fetched: 25/25</span>
    </div>
    <div className="grid h-[calc(100%-44px)] grid-cols-[180px_1fr]">
      <div className="border-r border-slate-200 bg-slate-50/80 p-3">
        {["Company", "Role", "Geography", "Industry"].map((label) => <div className="mb-4" key={label}>
          <span className="block text-[10px] uppercase tracking-[.08em] text-slate-400">{label}</span>
          <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[11px] text-emerald-800">Selected</span>
        </div>)}
      </div>
      <div className="divide-y divide-slate-200 bg-white">
        {rows.map(([name, title, note]) => <div className="grid grid-cols-[42px_1fr_auto] items-center gap-3 px-4 py-3" key={name}>
          <span className="h-9 w-9 rounded-full bg-slate-200" />
          <span className="min-w-0">
            <strong className="block truncate text-sm text-[#0a66c2]">{name}</strong>
            <span className="block truncate text-xs text-slate-700">{title}</span>
            <span className="mt-1 block truncate text-xs text-slate-500">{note}</span>
          </span>
          <span className="rounded-full border border-blue-200 px-3 py-1 text-xs text-accent-strong">Save</span>
        </div>)}
      </div>
    </div>
  </div>;
}

function WorkflowIcon({ type }: { type: string }) {
  if (type === "reachlyst") return <img className="h-10 w-10 object-contain" alt="" src="/reachlyst-mark.svg" />;

  const common = "h-9 w-9 text-accent-strong";
  if (type === "extension") {
    return <svg className={common} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="8" y="10" width="32" height="28" rx="7" stroke="currentColor" strokeWidth="2.2" />
      <path d="M16 18h16M16 25h10M34 30v5M29 35h10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>;
  }
  if (type === "navigator") {
    return <svg className={common} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="9" y="8" width="30" height="32" rx="6" stroke="currentColor" strokeWidth="2.2" />
      <path d="M16 17h16M16 24h16M16 31h8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="33" cy="32" r="3" stroke="currentColor" strokeWidth="2.2" />
    </svg>;
  }
  return <svg className={common} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M13 31c7-1 14-8 18-18 4 4 5 11 3 17 3 1 5 4 6 8-5-1-8-3-9-6-5 2-12 2-18-1Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    <path d="M17 35l-5 5M24 34l-3 6M33 15l-8 8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>;
}

function PlanCard({ plan }: { plan: (typeof plans)[number] }) {
  const isFeatured = plan.key === "growth";
  return <Card className={`grid h-full grid-rows-[auto_auto_auto_auto_1fr_auto_auto] gap-5 p-6 ${isFeatured ? "-translate-y-2 border-blue-200 shadow-[0_24px_80px_rgba(22,119,255,.14)]" : ""}`}>
    <h3 className="min-h-7 text-xl text-ink">{plan.name}</h3>
    <strong className="block text-4xl text-ink">{plan.price}<span className="ml-1 text-sm text-muted">/mo</span></strong>
    <p className="min-h-[72px] leading-6 text-muted">{plan.summary}</p>
    <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
      <span className="block text-xs uppercase tracking-[.08em] text-accent-strong">AI messages this month</span>
      <strong className="mt-1 block text-3xl text-ink">0 / {formatLimit(plan.limits.monthlyAiSuggestions)}</strong>
      <div className="mt-3 grid gap-1 border-t border-blue-100 pt-3 leading-6 text-muted"><b className="text-ink">Unlimited</b><span>Sales Navigator context</span></div>
    </div>
    <div className="grid content-start gap-2">
      {plan.features.map((feature) => <p className="m-0 leading-6 text-muted" key={feature}>✓ {feature}</p>)}
    </div>
    <form action="/signup" method="get">
      <input name="plan" type="hidden" value={plan.key} />
      <Button type="submit" variant={isFeatured ? "primary" : "secondary"}>{plan.cta}</Button>
    </form>
    <p className="m-0 border-t border-slate-100 pt-3 text-sm leading-6 text-muted">{plan.guidance[0]}</p>
  </Card>;
}
