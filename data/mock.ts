import type { LeadStatus } from "@/types/domain";

export const testimonials = [
  "Reachlyst keeps my Sales Navigator workflow calm and organized.",
  "The read-only approach was exactly what our security team needed.",
  "It feels like a smart logbook beside LinkedIn, not a risky bot.",
  "Our reps finally remember who they invited and why.",
  "The copy suggestions are useful without sounding fake.",
  "A clean control center for manual outbound teams."
];

export const searches = [
  { id: "saas-founders", name: "SaaS founders EU", url: "https://www.linkedin.com/sales/search/people?query=saas", created: "2026-06-10", synced: "2026-06-25", leads: 48, good: 19, invited: 11, replied: 3, aiUseCase: "sales_outreach", aiIcp: "B2B SaaS founders in Europe, seed to Series B, responsible for revenue or GTM.", aiOffer: "A practical workflow for tracking manual LinkedIn outreach without automation risk.", aiTone: "Founder-to-founder, concise, useful, no hype", aiInstructions: "Prioritize founders/operators. Mention the company only if visible. Do not claim shared context that is not visible." },
  { id: "revops", name: "RevOps leaders", url: "https://www.linkedin.com/sales/search/people?query=revops", created: "2026-06-12", synced: "2026-06-24", leads: 36, good: 14, invited: 8, replied: 2, aiUseCase: "sales_outreach", aiIcp: "RevOps, sales operations, and revenue leaders at B2B companies.", aiOffer: "A clean logbook for reps using Sales Navigator manually.", aiTone: "Operational, direct, professional", aiInstructions: "Focus on process clarity and reducing manual tracking mistakes." },
  { id: "agency", name: "Agency owners", url: "https://www.linkedin.com/sales/search/people?query=agency", created: "2026-06-17", synced: "2026-06-23", leads: 62, good: 21, invited: 16, replied: 5, aiUseCase: "sales_outreach", aiIcp: "US marketing agency owners, founders, CEOs, partners, and managing directors at 1-50 person agencies.", aiOffer: "A simple way to keep Sales Navigator outreach organized while everything on LinkedIn stays manual.", aiTone: "Warm, concise, operator-to-operator, not salesy", aiInstructions: "Good fit if they appear to own or lead a marketing, SEO, PPC, branding, PR, or digital agency. Avoid fake personalization. Keep invites under 220 characters." }
];

export const leads = [
  { id: "1", name: "Maya Novak", title: "Founder", company: "Northstar CRM", location: "Berlin", status: "good_fit" as LeadStatus, campaign: "SaaS founders EU" },
  { id: "2", name: "Jon Bell", title: "VP Revenue", company: "Arc Systems", location: "London", status: "copied" as LeadStatus, campaign: "RevOps leaders" },
  { id: "3", name: "Elena Petrova", title: "Agency Owner", company: "Bright Pipeline", location: "Prague", status: "replied" as LeadStatus, campaign: "Agency owners" }
];

export const activities = [
  { label: "Reply detected from Elena Petrova", time: "Today 09:42" },
  { label: "Invite message copied for Jon Bell", time: "Yesterday 16:10" },
  { label: "Sales Navigator search synced", time: "Yesterday 14:01" },
  { label: "AI analyzed 12 visible leads", time: "Jun 23, 2026" }
];
