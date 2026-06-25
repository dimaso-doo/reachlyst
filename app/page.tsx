"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge, Button, Card } from "@/components/ui";
import { plans } from "@/lib/stripe";
import { testimonials } from "@/data/mock";
import styles from "./marketing.module.css";

const sections = [
  ["Sales Navigator assistant", "Reads visible Sales Navigator pages and adds helpful status badges while you browse manually."],
  ["AI fit scoring", "Analyze visible leads with concise reasons, confidence, and a suggested connection angle."],
  ["Message generation", "Generate copyable LinkedIn invite and follow-up suggestions without auto-pasting or sending."],
  ["Outreach tracking", "Keep a timeline of copied messages, manual invites, replies, skips, and notes."],
  ["Read-only inbox sync", "When you open visible threads yourself, Reachlyst stores read-only message history."],
  ["Dashboard preview", "Review searches, leads, statuses, and activity from a professional control center."]
];

export default function HomePage() {
  return (
    <main className="pageShell">
      <Header />
      <section className={styles.hero}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge tone="good">Read-only by design</Badge>
            <h1>Reachlyst</h1>
            <p className={styles.lede}>A LinkedIn Sales Navigator assistant and outreach logbook for teams that want speed without automation risk.</p>
            <p className={styles.principle}>Reachlyst does not automate LinkedIn. It helps you work faster while you stay in control.</p>
            <div className={styles.actions}><Button href="/signup">Start free</Button><Button href="/features" variant="secondary">See features</Button></div>
          </motion.div>
          <motion.div className={styles.mockup} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .15 }}>
            <div className={styles.browserBar}><span /><span /><span /></div>
            <div className={styles.mockGrid}>
              <Card><h3>SaaS founders EU</h3><strong>48 leads</strong><p>19 good fits · 11 invited · 3 replies</p></Card>
              <Card><h3>Maya Novak</h3><p>Founder at Northstar CRM</p><Badge tone="good">Good fit</Badge></Card>
              <Card><h3>Suggested invite</h3><p>Hi Maya, noticed your work at Northstar CRM. Thought it would be useful to connect.</p></Card>
            </div>
          </motion.div>
        </div>
      </section>
      <section className={styles.band}>
        <div className="container">
          <h2>How it works</h2>
          <div className={styles.steps}>{["Browse manually", "Read visible leads", "Copy suggestions", "Log outreach"].map((step, index) => <Card key={step}><span>0{index + 1}</span><h3>{step}</h3></Card>)}</div>
        </div>
      </section>
      <section className={styles.sections}>
        <div className="container">
          {sections.map(([title, body], index) => <motion.div key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .04 }}><h2>{title}</h2><p>{body}</p></motion.div>)}
        </div>
      </section>
      <section className={styles.testimonials}>
        <div className="container">
          <h2>Built for manual outbound teams</h2>
          <div className={styles.carousel}>{testimonials.map((quote) => <Card key={quote}><p>“{quote}”</p><strong>Placeholder customer</strong></Card>)}</div>
        </div>
      </section>
      <section className={styles.pricing}>
        <div className="container">
          <h2>Pricing</h2>
          <div className={styles.planGrid}>{plans.map((plan) => <Card key={plan.key}><h3>{plan.name}</h3><strong>{plan.price}</strong>{plan.features.map((feature) => <p key={feature}>{feature}</p>)}<Button href="/signup" variant={plan.key === "pro" ? "primary" : "secondary"}>Choose {plan.name}</Button></Card>)}</div>
        </div>
      </section>
      <section className={styles.faq}>
        <div className="container">
          <h2>FAQ</h2>
          <Card><h3>Does Reachlyst send LinkedIn invites?</h3><p>No. Users manually click, paste, and send inside LinkedIn.</p></Card>
          <Card><h3>Do you store LinkedIn passwords?</h3><p>No. Reachlyst never asks for LinkedIn credentials.</p></Card>
          <Card><h3>Can the extension scrape in the background?</h3><p>No. It reads visible pages opened by the logged-in user.</p></Card>
        </div>
      </section>
      <section className={styles.finalCta}><div className="container"><h2>Make manual Sales Navigator work easier to remember.</h2><Button href="/signup">Create workspace</Button></div></section>
    </main>
  );
}

function Header() {
  return <nav className={styles.nav}><div className="container"><Link className={styles.logo} href="/">Reachlyst</Link><div><Link href="/features">Features</Link><Link href="/pricing">Pricing</Link><Link href="/login">Login</Link><Button href="/signup">Sign up</Button></div></div></nav>;
}
