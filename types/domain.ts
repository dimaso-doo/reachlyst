export type LeadStatus =
  | "new"
  | "good_fit"
  | "maybe"
  | "skip"
  | "message_generated"
  | "copied"
  | "invite_likely_sent"
  | "invite_sent"
  | "connected"
  | "first_message_sent"
  | "follow_up_needed"
  | "follow_up_sent"
  | "replied"
  | "not_interested";

export type ExtensionLead = {
  name: string;
  title?: string;
  company?: string;
  location?: string;
  linkedinUrl?: string;
  salesNavigatorUrl?: string;
  about?: string;
  snippet?: string;
};
