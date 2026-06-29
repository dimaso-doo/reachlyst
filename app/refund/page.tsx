/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const sections = [
  ["Subscription billing", "Reachlyst subscriptions are billed in advance through Stripe. Your plan gives access to the package features, usage limits, seats, and extension access shown at checkout or in the billing area."],
  ["Cancellation", "You can cancel future renewals through the billing portal or by contacting support. After cancellation, paid access normally remains available until the end of the current billing period."],
  ["Refund window", "If you believe a charge was made in error, contact support within 7 days of the charge. We will review the request and may issue a full or partial refund when the situation is reasonable and usage is limited."],
  ["Non-refundable cases", "Refunds are generally not provided for heavy usage during the billing period, violation of acceptable use rules, failure to cancel before renewal, third-party platform issues outside Reachlyst control, or accounts suspended for abuse."],
  ["Trials", "If a free trial is offered, paid access may require selecting a plan. Trial terms shown at signup or checkout control the trial length and conversion rules."],
  ["Stripe processing", "Approved refunds are processed through Stripe and may take several business days to appear on the original payment method depending on the bank or card issuer."],
  ["How to request a refund", "Send the account email, charge date, plan name, and reason for the request through the product support channel. Do not send full payment card details."]
] as const;

export default function RefundPage() {
  return <main className="min-h-screen bg-[#050a18] px-5 py-8 text-white sm:px-10 lg:px-[min(7vw,88px)]">
    <Link className="inline-flex items-center" href="/"><img className="h-8 w-auto" alt="Reachlyst" src="/reachlyst-logo-blue.png" /></Link>
    <article className="mx-auto mt-16 max-w-4xl rounded-2xl border border-white/10 bg-white/[.04] p-6 shadow-[0_28px_90px_rgba(0,0,0,.24)] sm:p-10">
      <p className="text-xs font-black uppercase tracking-[.08em] text-blue-300">Last updated: June 27, 2026</p>
      <h1 className="mb-5 mt-4 text-4xl font-extrabold leading-tight sm:text-6xl">Refund Policy</h1>
      <p className="max-w-3xl text-lg font-semibold leading-8 text-white/70">This policy explains how Reachlyst handles subscription cancellations, billing questions, and refund requests for paid plans processed through Stripe.</p>
      <div className="mt-10 grid gap-7">
        {sections.map(([heading, body]) => <section className="border-t border-white/10 pt-6" key={heading}>
          <h2 className="text-xl font-extrabold">{heading}</h2>
          <p className="mt-3 font-semibold leading-7 text-white/68">{body}</p>
        </section>)}
      </div>
      <p className="mt-10 rounded-xl border border-blue-300/20 bg-blue-300/10 p-4 text-sm font-semibold leading-6 text-white/72">This refund policy draft should be reviewed by counsel and adjusted to match the final checkout, tax, support, and jurisdiction requirements.</p>
    </article>
  </main>;
}
