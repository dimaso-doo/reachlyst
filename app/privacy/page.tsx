/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const sections = [
  ["Information we collect", "We collect account information such as name, email address, workspace details, subscription status, extension connection status, usage counts, AI Playbook notes you provide, and product activity needed to operate Reachlyst."],
  ["LinkedIn and Sales Navigator data", "Reachlyst works with visible page context from your browser extension session. This can include visible lead names, titles, companies, profile snippets, Sales Navigator URLs, visible message thread text, generated suggestions, and manual action logs. Reachlyst does not ask for or store your LinkedIn password."],
  ["Authentication", "When you log in with Google, authentication is handled through Google's OAuth flow and our auth provider. We receive a session confirmation and basic account information, not your Google password. Your browser may keep you signed in with secure session cookies or tokens."],
  ["Payments", "Paid subscriptions are processed by Stripe. Reachlyst does not store full card numbers. Stripe may process billing details, payment method identifiers, invoices, tax information, fraud checks, and payment status."],
  ["How we use information", "We use information to provide the dashboard, extension access, AI suggestions, plan limits, usage tracking, billing, support, fraud prevention, product security, and service improvement."],
  ["AI processing", "Text you submit or visible context sent through the extension may be processed by AI providers to generate lead analysis, invite drafts, reply suggestions, and AI Playbook guidance. Do not submit sensitive personal information that is not needed for outreach preparation."],
  ["Marketing communication", "If you give marketing consent, we may send product updates, offers, onboarding emails, and educational content. You can unsubscribe from marketing emails at any time."],
  ["Sharing", "We use trusted service providers such as hosting, database, analytics, payment, authentication, email, and AI infrastructure providers. We do not sell your personal information."],
  ["Retention", "We keep account, billing, workspace, extension, and usage data for as long as needed to provide the service, comply with legal obligations, resolve disputes, prevent abuse, and maintain business records."],
  ["Security", "We use reasonable technical and organizational measures to protect data. No internet service can guarantee absolute security, so users should avoid sending unnecessary sensitive information."],
  ["Your choices", "You may request access, correction, deletion, or export of personal information by contacting us. Some data may need to be retained for legal, billing, security, or legitimate business reasons."],
  ["Contact", "For privacy questions, contact Reachlyst support through the email address or support channel listed in the product."]
] as const;

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" intro="This Privacy Policy explains how Reachlyst collects, uses, and protects information when you use our website, dashboard, billing flow, and Chrome extension." sections={sections} />;
}

function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: readonly (readonly [string, string])[] }) {
  return <main className="min-h-screen bg-[#050a18] px-5 py-8 text-white sm:px-10 lg:px-[min(7vw,88px)]">
    <Link className="inline-flex items-center" href="/"><img className="h-8 w-auto" alt="Reachlyst" src="/reachlyst-logo-blue.png" /></Link>
    <article className="mx-auto mt-16 max-w-4xl rounded-2xl border border-white/10 bg-white/[.04] p-6 shadow-[0_28px_90px_rgba(0,0,0,.24)] sm:p-10">
      <p className="text-xs font-black uppercase tracking-[.08em] text-blue-300">Last updated: June 27, 2026</p>
      <h1 className="mb-5 mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">{title}</h1>
      <p className="max-w-3xl text-lg font-semibold leading-8 text-white/70">{intro}</p>
      <div className="mt-10 grid gap-7">
        {sections.map(([heading, body]) => <section className="border-t border-white/10 pt-6" key={heading}>
          <h2 className="text-xl font-extrabold">{heading}</h2>
          <p className="mt-3 font-semibold leading-7 text-white/68">{body}</p>
        </section>)}
      </div>
      <p className="mt-10 rounded-xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm font-semibold leading-6 text-white/72">This page is provided for product transparency and should be reviewed by counsel before relying on it as legal advice.</p>
    </article>
  </main>;
}
