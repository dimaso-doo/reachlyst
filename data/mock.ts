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
  { id: "saas-founders", name: "SaaS founders EU", url: "https://www.linkedin.com/sales/search/people?query=saas", created: "2026-06-10", synced: "2026-06-25", leads: 48, good: 19, invited: 11, replied: 3 },
  { id: "revops", name: "RevOps leaders", url: "https://www.linkedin.com/sales/search/people?query=revops", created: "2026-06-12", synced: "2026-06-24", leads: 36, good: 14, invited: 8, replied: 2 },
  { id: "agency", name: "Agency owners", url: "https://www.linkedin.com/sales/search/people?query=agency", created: "2026-06-17", synced: "2026-06-23", leads: 62, good: 21, invited: 16, replied: 5 }
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
