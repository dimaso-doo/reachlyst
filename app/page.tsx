/* eslint-disable @next/next/no-img-element */
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { Button, Card } from "@/components/ui";
import { plans } from "@/lib/stripe";
import styles from "./marketing.module.css";

const workflow = [
  { icon: "/chrome-icon.svg", title: "Install the Chrome extension", body: "Open Reachlyst beside your normal prospecting flow and keep the helper available while you research." },
  { icon: "/linkedin-sales-icon.svg", title: "Open Sales Navigator", body: "Browse searches and lead lists as usual while Reachlyst reads visible context and keeps everything organized." },
  { icon: "/reachlyst-r.svg", title: "Sync to Reachlyst", body: "Searches, leads, statuses, notes, suggested invites, and message history land in one clean workspace." },
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
    <main className="pageShell">
      <Header />
      <section className={styles.hero}>
        <div className="container">
          <motion.div className={styles.heroCopy} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className={styles.eyebrow}>AI Sales Navigator helper</span>
            <h1>Turn LinkedIn leads into a clean outreach workflow.</h1>
            <p className={styles.lede}>Reachlyst uses AI to qualify Sales Navigator leads, generate better invite copy, and track where every prospect stands.</p>
            <div className={styles.actions}><Button href="/signup">Start free</Button></div>
          </motion.div>
          <motion.div className={styles.videoFrame} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .15 }}>
            <div className={styles.videoTop}><span /><span /><span /><strong>Reachlyst demo</strong></div>
            <div className={styles.videoBody}>
              <div className={styles.playButton}>▶</div>
              <Card><h3>Agency owners</h3><strong>62 leads</strong><p>21 good fits · 16 invited · 5 replies</p></Card>
              <Card><h3>Suggested invite</h3><p>Hi Maya, noticed your work at Bright Pipeline. Thought it made sense to connect.</p></Card>
            </div>
          </motion.div>
          <motion.div className={styles.aiStrip} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }}>
            {aiHighlights.map(([number, title, body], index) => <motion.div className={styles.aiBox} key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .06 }}>
              <small>{number}</small>
              <strong>{title}</strong>
              <p>{body}</p>
            </motion.div>)}
          </motion.div>
        </div>
      </section>
      <section className={styles.band}>
        <div className="container">
          <div className={styles.sectionIntro}><span>How it works</span><h2>From Sales Navigator search to tracked outreach.</h2></div>
          <div className={styles.workflowWrap} ref={workflowRef}>
            <div className={styles.flightLine} />
            <motion.div className={styles.paperPlane} style={{ top: planeY }}><img alt="" src="/paper-plane.svg" /></motion.div>
            <div className={styles.workflow}>{workflow.map((item, index) => <motion.div className={styles.workflowItem} key={item.title} initial={{ opacity: 0, y: 34, scale: .97 }} whileInView={{ opacity: 1, y: -8, scale: 1.018 }} viewport={{ once: false, margin: "-80px" }} transition={{ delay: index * .08, duration: .55 }} whileHover={{ scale: 1.018, y: -8 }}>
              <Card>
                <div className={styles.flowTop}><span className={styles.flowIcon}><img alt="" src={item.icon} /></span><em>0{index + 1}</em></div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </Card>
            </motion.div>)}</div>
          </div>
        </div>
      </section>
      <section className={styles.testimonials}>
        <div className="container">
          <h2>For teams turning LinkedIn lists into pipeline</h2>
          <div className={styles.reviewMarquee}>
            {[reviews.slice(0, 11), reviews.slice(10).concat(reviews.slice(0, 3))].map((row, rowIndex) => <div className={`${styles.reviewTrack} ${rowIndex === 1 ? styles.reviewTrackReverse : ""}`} key={rowIndex}>
              {[...row, ...row].map(([name, role, quote, avatar], index) => <Card className={styles.reviewCard} key={`${name}-${rowIndex}-${index}`}>
                <div className={styles.reviewHead}><img alt="" src={avatar} /><div><strong>{name}</strong><span>{role}</span></div></div>
                <div className={styles.stars}>★★★★★ <span>Google</span></div>
                <p>“{quote}”</p>
              </Card>)}
            </div>)}
          </div>
        </div>
      </section>
      <section className={styles.pricing}>
        <div className="container">
          <div className={styles.sectionIntro}><span>Pricing</span><h2>Start free. Upgrade when your lead volume grows.</h2></div>
          <div className={styles.planGrid}>{plans.map((plan) => <Card className={plan.key === "growth" ? styles.featuredPlan : ""} key={plan.key}><h3>{plan.name}</h3><strong>{plan.price}<span>/mo</span></strong><p className={styles.planSummary}>{plan.summary}</p>{plan.features.map((feature) => <p key={feature}>✓ {feature}</p>)}<Button href="/pricing" variant={plan.key === "growth" ? "primary" : "secondary"}>{plan.cta}</Button></Card>)}</div>
        </div>
      </section>
      <section className={styles.faq}>
        <div className="container">
          <div className={styles.faqIntro}>
            <span className={styles.eyebrow}>FAQ</span>
            <h2>Questions before you try Reachlyst?</h2>
            <p>A quick pass through how the helper, extension, AI, and pricing fit together.</p>
          </div>
          <div className={styles.accordion}>
            {faqs.map(([question, answer], index) => <details key={question} open={index === 0}>
              <summary><span>{question}</span><i /></summary>
              <p>{answer}</p>
            </details>)}
          </div>
        </div>
      </section>
      <section className={styles.finalCta}><div className="container"><span>Ready when your next Sales Navigator search is.</span><h2>Give your LinkedIn lead workflow a real workspace.</h2><Button href="/signup">Create workspace</Button></div></section>
      <footer className={styles.footer}><div className="container"><Link className={styles.logo} href="/"><img alt="Reachlyst" src="/reachlyst-logo-blue.png" /></Link><nav><Link href="/pricing">Pricing</Link><Link href="/features">Features</Link><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms</Link><Link href="/blog">Blog</Link></nav></div></footer>
    </main>
  );
}

function Header() {
  return <nav className={styles.nav}><div className="container"><Link className={styles.logo} href="/"><img alt="Reachlyst" src="/reachlyst-logo-blue.png" /></Link><div><Link href="/features">Features</Link><Link href="/pricing">Pricing</Link><Link href="/login">Login</Link><Button href="/signup">Sign up</Button></div></div></nav>;
}
