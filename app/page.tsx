/* eslint-disable @next/next/no-img-element */
"use client";

import { motion } from "framer-motion";
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

const aiHighlights = [
  ["01", "AI fit scoring", "See who looks like a strong buyer before you open ten more tabs.", "chart"],
  ["02", "AI invite drafts", "Generate short, human connection copy you can edit and paste manually.", "message"],
  ["03", "Search training", "Teach each campaign what good, maybe, and skip should mean.", "search"],
  ["04", "Reply suggestions", "Turn visible message context into cleaner follow-up ideas.", "reply"]
];

const heroLeads = [
  ["Maya Chen", "Founder at RevPilot", "Good fit", "Recently hired 3 SDRs"],
  ["Andre Keegan", "Owner at Serenity Marketing", "Contact next", "Shared posts about outbound systems"],
  ["Jon Bell", "Revenue Lead at Northline", "Maybe", "Needs stronger agency signal"]
];

const heroChat = [
  ["assistant", "Andre is the strongest next contact. He runs a small agency, posts about delivery bottlenecks, and your offer maps to his team size."],
  ["user", "How should I open?"],
  ["assistant", "Mention his recent post about agency systems. Keep it short and ask if improving reply quality is a priority this quarter."],
  ["assistant", "Suggested invite: Hi Andre, noticed your work around small agency delivery systems. Thought it would be useful to connect."]
];

const features = [
  ["Lead context chat", "Ask Reachlyst about the selected Sales Navigator lead and get practical fit notes, profile context, and outreach angles."],
  ["Invite generation", "Generate concise connection invites from visible Sales Navigator context, then edit and send manually."],
  ["Reply suggestions", "Use visible LinkedIn message context to draft warmer, clearer follow-ups for accepted connections."],
  ["AI Playbook", "Train Reachlyst on your offer, ICP, tone, objections, and message style so suggestions match your business."],
  ["Extension setup", "Manage a persistent extension token for your workspace and keep the Sales Navigator helper ready."],
  ["Usage controls", "Track AI messages, package limits, and extension access from the dashboard."],
  ["Search workflow support", "Work naturally inside Sales Navigator while Reachlyst helps organize lead context and outreach decisions."],
  ["Manual-first safety", "Reachlyst never sends LinkedIn messages for you. It prepares copy and context, while you stay in control."]
];

const productScreenshots = [
  {
    demo: "lead",
    useCase: "Demo video 01",
    duration: "1:12",
    client: "Web agency founder",
    title: "Maya qualifies a messy lead list before lunch",
    body: "Maya runs a five-person Webflow agency. The video follows her as she reviews agency-fit signals, keeps weak leads out, and prepares one clean manual invite.",
    scene: "Search: B2B SaaS teams hiring design support",
    outcome: "25 reviewed leads, 8 strong fits, 1 invite draft copied manually",
  },
  {
    demo: "messages",
    useCase: "Demo video 02",
    duration: "0:58",
    client: "RevOps consultant",
    title: "Jon turns a warm reply into a softer next step",
    body: "Jon sells RevOps audits to founder-led SaaS teams. The video shows him rewriting a pushy follow-up into a short, useful message he can review and send himself.",
    scene: "Thread: buyer mentioned reply-rate drop-off",
    outcome: "3 reply angles, 1 softer CTA, no fake personalization",
  },
  {
    demo: "workspace",
    useCase: "Demo video 03",
    duration: "1:26",
    client: "Small outbound team",
    title: "A two-person team plans the day without another spreadsheet",
    body: "A founder and part-time SDR review usage, campaign instructions, due follow-ups, and daily priorities before starting manual outreach.",
    scene: "Workspace: weekly campaign cleanup",
    outcome: "Clear ICP notes, due follow-ups, and message usage in one place",
  }
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
        <div className="container grid items-center gap-10 lg:min-h-[760px] lg:grid-cols-[.78fr_1.22fr]">
          <motion.div className="max-w-[720px]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex rounded-full border border-blue-100 bg-white px-3 py-2 text-xs uppercase tracking-[.08em] text-accent-strong shadow-[0_12px_32px_rgba(22,119,255,.08)]">AI Sales Navigator helper</span>
            <h1 className="my-5 max-w-[760px] text-5xl leading-[.94] tracking-normal text-ink sm:text-6xl lg:text-7xl">AI outreach assistant for LinkedIn Sales Navigator.</h1>
            <p className="max-w-[650px] text-xl leading-relaxed text-muted sm:text-[22px]">Reachlyst helps you understand leads, draft better invites and replies, and keep every outreach step organized while you prospect.</p>
            <div className="mt-7 flex flex-wrap items-center gap-3"><Button href="/signup">Create workspace</Button><Button href="#product-screenshots" variant="secondary">View product</Button></div>
            <div className="mt-10 grid max-w-[640px] gap-3 sm:grid-cols-3">
              {aiHighlights.slice(0, 3).map(([number, title, body]) => <div className="rounded-lg border border-white bg-white/78 p-4 shadow-[0_14px_40px_rgba(15,23,42,.08)]" key={title}>
                <small className="text-xs uppercase tracking-[.08em] text-accent-strong">{number}</small>
                <strong className="mt-3 block text-sm text-ink">{title}</strong>
                <p className="mt-2 text-xs leading-5 text-muted">{body}</p>
              </div>)}
            </div>
          </motion.div>
          <motion.div className="relative min-h-[600px]" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .15 }}>
            <div className="absolute right-0 top-0 w-[min(820px,100%)] overflow-hidden rounded-[30px] border border-white bg-white shadow-[0_34px_120px_rgba(15,23,42,.18)]">
              <div className="flex h-[50px] items-center gap-2 border-b border-slate-100 bg-slate-50 px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <strong className="ml-2 text-xs text-muted">Sales Navigator with Reachlyst AI</strong>
                <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-xs text-accent-strong">Auto-playing</span>
              </div>
              <div className="relative grid min-h-[520px] overflow-hidden bg-[#f8fbff] p-5 lg:grid-cols-[minmax(360px,1fr)_330px]">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_18px_56px_rgba(15,23,42,.08)]">
                  <div className="border-b border-slate-100 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <small className="text-xs text-muted">LinkedIn Sales Navigator</small>
                        <h3 className="mt-1 text-lg leading-tight text-ink">Agency founders in Europe</h3>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">Live search</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted">
                      <span className="rounded-lg bg-slate-50 px-3 py-2">Founder</span>
                      <span className="rounded-lg bg-slate-50 px-3 py-2">11-50 employees</span>
                      <span className="rounded-lg bg-slate-50 px-3 py-2">Marketing agency</span>
                    </div>
                  </div>
                  <div className="grid gap-3 p-4">
                    {heroLeads.map(([name, role, status, signal], index) => (
                      <div className={`reachlyst-demo-lead grid grid-cols-[auto_1fr] gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[auto_1fr_auto] ${index === 1 ? "reachlyst-demo-lead-active" : ""}`} key={name}>
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-sm text-accent-strong">{name.split(" ").map((part) => part[0]).join("")}</span>
                        <span>
                          <strong className="block text-sm text-ink">{name}</strong>
                          <span className="mt-1 block text-xs leading-5 text-muted">{role}</span>
                          <span className="mt-2 block text-xs leading-5 text-muted">{signal}</span>
                        </span>
                        <span className={`col-span-2 self-start rounded-full px-3 py-1 text-xs sm:col-span-1 ${index === 1 ? "bg-blue-50 text-accent-strong" : "bg-slate-50 text-muted"}`}>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="reachlyst-demo-chat relative mt-5 self-start overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_24px_70px_rgba(22,119,255,.14)] lg:ml-[-22px] lg:mt-12">
                  <div className="flex items-center gap-3 border-b border-blue-50 bg-white p-4">
                    <img className="h-9 w-9 rounded-xl border border-blue-100 bg-blue-50 p-1.5" alt="" src="/reachlyst-mark.svg" />
                    <div>
                      <strong className="block text-sm text-ink">Reachlyst AI</strong>
                      <span className="text-xs text-muted">Lead context chat</span>
                    </div>
                  </div>
                  <div className="grid gap-3 p-4">
                    {heroChat.map(([role, message], index) => (
                      <p className={`reachlyst-demo-message m-0 rounded-xl border p-3 text-xs leading-5 ${role === "user" ? "justify-self-end border-blue-200 bg-blue-50 text-ink" : "border-slate-200 bg-white text-muted"}`} key={`${role}-${index}`}>
                        {message}
                      </p>
                    ))}
                  </div>
                  <div className="border-t border-blue-50 p-4">
                    <div className="reachlyst-demo-typing rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-muted">Ask who to contact next...</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="bg-white py-20 text-ink sm:py-24">
        <div className="container grid gap-10 lg:grid-cols-[.82fr_1.18fr] lg:items-end">
          <SectionIntro eyebrow="Features" title="Everything you need to turn Sales Navigator context into better outreach." />
          <div className="grid gap-3 sm:grid-cols-2">
            {aiHighlights.map(([number, title, body, icon]) => <div className="feature-card relative isolate grid min-h-[236px] overflow-hidden rounded-2xl border border-slate-200 bg-[#f8fbff] p-5 shadow-[0_14px_40px_rgba(15,23,42,.06)]" key={title}>
              <span className="feature-card-dots" aria-hidden="true" />
              <div className="relative z-[1] mb-8 flex items-center justify-between gap-4">
                <FeatureStaticIcon type={icon} />
                <small className="rounded-full border border-blue-100 bg-white/70 px-2.5 py-1 text-xs uppercase tracking-[.08em] text-accent-strong">{number}</small>
              </div>
              <strong className="relative z-[1] block text-2xl leading-[1.18] text-ink">{title}</strong>
              <p className="relative z-[1] mt-3 text-sm leading-6 text-muted">{body}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section id="product-screenshots" className="bg-[#f5f7fb] py-24 text-ink sm:py-28">
        <div className="container">
          <SectionIntro eyebrow="Demo videos" title="More realistic walkthroughs with a buyer, a goal, and a specific outreach moment." />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {productScreenshots.map((shot, index) => <motion.figure className="product-use-case overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_24px_76px_rgba(15,23,42,.1)]" key={shot.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08, duration: .5 }}>
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  <span className="ml-auto rounded-full bg-blue-50 px-3 py-1 text-[11px] text-accent-strong">{shot.useCase}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-muted">{shot.duration}</span>
                </div>
              </div>
              <div className="relative">
                <ProductDemoCard type={shot.demo} />
                <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/70 bg-white/92 p-4 shadow-[0_18px_50px_rgba(15,23,42,.16)] backdrop-blur">
                  <span className="text-[11px] font-extrabold uppercase tracking-[.08em] text-accent-strong">{shot.client}</span>
                  <p className="mt-1 text-sm font-extrabold leading-5 text-ink">{shot.scene}</p>
                </div>
              </div>
              <figcaption className="min-h-[270px] border-t border-slate-100 bg-white p-5">
                <strong className="text-xl leading-[1.2] text-ink">{shot.title}</strong>
                <p className="mt-3 leading-7 text-muted">{shot.body}</p>
                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                  <span className="block text-[11px] font-extrabold uppercase tracking-[.08em] text-accent-strong">What the viewer sees</span>
                  <p className="mt-1 text-sm font-bold leading-6 text-ink">{shot.outcome}</p>
                </div>
              </figcaption>
            </motion.figure>)}
          </div>
        </div>
      </section>

      <section className="bg-white py-24 text-ink sm:py-28">
        <div className="container">
          <SectionIntro eyebrow="Create. Engage. Organize." title="Search workflow support without changing how you work in Sales Navigator." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map(([title, body], index) => <Card className="feature-tile grid grid-rows-[auto_auto_1fr] overflow-hidden p-5 transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,.12)]" key={title}>
              <FeatureMiniDemo index={index} />
              <div className="mt-5 flex items-start justify-between gap-3">
                <h3 className="text-xl leading-tight text-ink">{title}</h3>
                <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs text-accent-strong">0{index + 1}</span>
              </div>
              <p className="mt-3 leading-7 text-muted">{body}</p>
            </Card>)}
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

function FeatureStaticIcon({ type }: { type: string }) {
  const common = "h-11 w-11 text-accent-strong";
  if (type === "chart") return <span className="feature-icon"><svg className={common} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M10 37h28M14 33V20M24 33V12M34 33V24" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    <path d="M13 25c8-9 15-10 24-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg></span>;
  if (type === "message") return <span className="feature-icon"><svg className={common} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M12 14h24a6 6 0 016 6v10a6 6 0 01-6 6H25l-9 6v-6h-4a6 6 0 01-6-6V20a6 6 0 016-6Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    <path d="M16 23h16M16 29h10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg></span>;
  if (type === "search") return <span className="feature-icon"><svg className={common} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <circle cx="22" cy="22" r="10" stroke="currentColor" strokeWidth="1.9" />
    <path d="M30 30l8 8M17 21h10M17 26h6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg></span>;
  return <span className="feature-icon"><svg className={common} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M12 13h24a5 5 0 015 5v11a5 5 0 01-5 5H24l-8 6v-6h-4a5 5 0 01-5-5V18a5 5 0 015-5Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
    <path d="M17 22h16M17 28h9M33 36l5 5 5-11" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg></span>;
}

function ProductDemoCard({ type }: { type: string }) {
  if (type === "messages") {
    return <div className="product-demo product-demo-messages" aria-label="Animated Reachlyst message suggestion preview">
      <div className="product-demo-sidebar">
        <span />
        <span />
        <span />
      </div>
      <div className="product-demo-main">
        <div className="product-demo-thread">
          <p className="product-demo-bubble product-demo-bubble-muted">Thanks for connecting. We are improving outbound quality this quarter.</p>
          <p className="product-demo-bubble product-demo-bubble-user">Worth asking about reply rates?</p>
          <p className="product-demo-bubble product-demo-bubble-ai">Yes. Keep it practical and mention the visible goal, not a pitch.</p>
        </div>
        <div className="product-demo-suggestion">
          <span>Suggested follow-up</span>
          <strong>Would it be useful to compare what is causing the drop-off?</strong>
        </div>
      </div>
    </div>;
  }

  if (type === "workspace") {
    return <div className="product-demo product-demo-workspace" aria-label="Animated Reachlyst dashboard and AI Playbook preview">
      <div className="product-demo-nav">
        <span className="is-active" />
        <span />
        <span />
      </div>
      <div className="product-demo-main">
        <div className="product-demo-meter"><span /></div>
        <div className="product-demo-playbook">
          <strong>AI Playbook</strong>
          <p>Offer, ICP, buying signals, tone, CTA</p>
          <div><span /><span /><span /></div>
        </div>
        <div className="product-demo-usage">
          <span>AI messages</span>
          <strong>184 / 3,000</strong>
        </div>
      </div>
    </div>;
  }

  return <div className="product-demo product-demo-lead" aria-label="Animated Sales Navigator lead and Reachlyst invite preview">
    <div className="product-demo-list">
      {heroLeads.map(([name, role, status], index) => <div className={`product-demo-row ${index === 1 ? "is-active" : ""}`} key={name}>
        <span>{name.split(" ").map((part) => part[0]).join("")}</span>
        <div><strong>{name}</strong><small>{role}</small></div>
        <em>{status}</em>
      </div>)}
    </div>
    <div className="product-demo-panel">
      <span>Reachlyst AI</span>
      <strong>Contact Andre next</strong>
      <p>Strong agency signal. Open with the recent systems post and keep the invite under 180 characters.</p>
    </div>
  </div>;
}

function FeatureMiniDemo({ index }: { index: number }) {
  const type = index % 8;
  if (type === 0) return <div className="feature-mini feature-mini-chat"><span /><span /><span /></div>;
  if (type === 1) return <div className="feature-mini feature-mini-invite"><span /><strong>Hi Andre...</strong><em /></div>;
  if (type === 2) return <div className="feature-mini feature-mini-reply"><span /><span /><strong /></div>;
  if (type === 3) return <div className="feature-mini feature-mini-playbook"><strong /><span /><span /><span /></div>;
  if (type === 4) return <div className="feature-mini feature-mini-token"><span /><i /><i /><i /></div>;
  if (type === 5) return <div className="feature-mini feature-mini-usage"><strong /><span /><em /></div>;
  if (type === 6) return <div className="feature-mini feature-mini-search"><span /><span /><span /></div>;
  return <div className="feature-mini feature-mini-safe"><span /><strong /><em /></div>;
}

function PlanCard({ plan }: { plan: (typeof plans)[number] }) {
  const isFeatured = plan.key === "growth";
  return <Card className={`grid h-full grid-rows-[auto_auto_auto_auto_auto_1fr_auto] gap-5 p-6 ${isFeatured ? "-translate-y-2 border-blue-200 shadow-[0_24px_80px_rgba(22,119,255,.14)]" : ""}`}>
    <h3 className="min-h-7 text-xl text-ink">{plan.name}</h3>
    <strong className="block text-4xl text-ink">{plan.price}<span className="ml-1 text-sm text-muted">/mo</span></strong>
    <p className="min-h-[72px] leading-6 text-muted">{plan.summary}</p>
    <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-4">
      <span className="block text-xs uppercase tracking-[.08em] text-accent-strong">AI messages this month</span>
      <strong className="mt-1 block text-3xl text-ink">0 / {formatLimit(plan.limits.monthlyAiSuggestions)}</strong>
      <div className="mt-3 grid gap-1 border-t border-blue-100 pt-3 leading-6 text-muted"><b className="text-ink">Unlimited</b><span>Sales Navigator context</span></div>
    </div>
    <div className="grid min-h-[104px] gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
      {plan.guidance.map((line) => <p className="m-0 text-sm leading-6 text-muted" key={line}>{line}</p>)}
    </div>
    <div className="grid content-start gap-2">
      {plan.features.map((feature) => <p className="m-0 leading-6 text-muted" key={feature}>✓ {feature}</p>)}
    </div>
    <form action="/signup" method="get">
      <input name="plan" type="hidden" value={plan.key} />
      <Button type="submit" variant={isFeatured ? "primary" : "secondary"}>{plan.cta}</Button>
    </form>
  </Card>;
}
