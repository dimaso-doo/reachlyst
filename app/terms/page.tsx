/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Review the terms for using Reachlyst, including the dashboard, Chrome extension, AI suggestions, acceptable use, billing, and subscriptions.",
  alternates: {
    canonical: "/terms"
  },
  openGraph: {
    title: "Reachlyst Terms and Conditions",
    description: "Terms for the Reachlyst website, dashboard, Chrome extension, AI suggestions, and paid subscriptions.",
    url: "/terms"
  }
};

const sections = [
  ["Service", "Reachlyst is an AI outreach assistant for LinkedIn Sales Navigator workflows. It helps users evaluate visible lead context, train an AI Playbook, draft connection invites, draft replies, and manage extension access and usage."],
  ["Manual-first use", "Reachlyst does not auto-connect, auto-send messages, bypass LinkedIn limits, or ask for LinkedIn credentials. Users remain responsible for reviewing, editing, copying, pasting, and sending any LinkedIn activity manually."],
  ["Accounts", "You are responsible for maintaining access to your account, keeping your workspace secure, and ensuring that users or devices connected to your workspace are authorized."],
  ["Acceptable use", "You may not use Reachlyst for spam, unlawful outreach, harassment, deceptive activity, credential collection, scraping outside visible authorized pages, platform abuse, or any activity that violates applicable laws or third-party terms."],
  ["AI output", "AI suggestions may be inaccurate, incomplete, or unsuitable. You are responsible for reviewing all generated lead analysis, invites, replies, and recommendations before using them."],
  ["Free and paid plans", "The Free plan includes the core workflow with a limited monthly AI message allowance. Paid plans are billed through Stripe according to the selected package and billing interval. Plan features, usage limits, extension access, and pricing may vary by package and may change over time."],
  ["Cancellation", "You can cancel a paid subscription according to the billing controls available in the product or Stripe customer portal."],
  ["Refunds", "Refund handling is described in the Refund Policy. Unless required by law or expressly stated, subscriptions are billed in advance and access remains available until the end of the paid billing period after cancellation."],
  ["Third-party services", "Reachlyst relies on services such as Supabase, Stripe, OpenAI, Vercel, Google authentication, Chrome, LinkedIn, and Sales Navigator. We are not responsible for third-party service availability, policy changes, or account actions."],
  ["Intellectual property", "Reachlyst, its design, software, branding, and product experience are owned by Reachlyst or its licensors. You retain responsibility for your own workspace content and data you submit."],
  ["Limitation of liability", "To the maximum extent allowed by law, Reachlyst is provided as-is and we are not liable for indirect, incidental, consequential, special, or lost-profit damages arising from use of the service."],
  ["Changes", "We may update these Terms as the product evolves. Continued use after changes means you accept the updated Terms."]
] as const;

export default function TermsPage() {
  return <LegalPage title="Terms and Conditions" intro="These Terms govern your use of Reachlyst, including the website, dashboard, Chrome extension, AI suggestions, and paid subscriptions." sections={sections} />;
}

function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: readonly (readonly [string, string])[] }) {
  return <main className="min-h-screen bg-[#050a18] px-5 py-8 text-white sm:px-10 lg:px-[min(7vw,88px)]">
    <Link className="inline-flex items-center" href="/"><img className="h-9 w-auto" alt="Reachlyst" src="/reachlyst-logo-white.svg" /></Link>
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
      <p className="mt-10 rounded-xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm font-semibold leading-6 text-white/72">This page is a practical product terms draft and should be reviewed by counsel before relying on it as legal advice.</p>
    </article>
  </main>;
}
