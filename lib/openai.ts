import OpenAI from "openai";

export type AiLeadInput = {
  name: string;
  title?: string;
  company?: string;
  location?: string;
  snippet?: string;
  campaignContext?: string;
  tone?: string;
  useCase?: string;
  previousMessage?: string;
  instruction?: string;
  conversationContext?: string;
  profileContext?: string;
  variant?: number;
  limit?: number;
};

export type SearchAdvisorMessage = {
  role: "user" | "assistant";
  content: string;
};

export type SearchAdvisorInput = {
  mode: "create_search" | "train_search";
  searchName?: string;
  searchUrl?: string;
  context?: string;
  messages: SearchAdvisorMessage[];
};

export type AiPlaybookChatInput = {
  messages: SearchAdvisorMessage[];
  websiteContexts?: Array<{ url: string; title?: string; text: string }>;
};

export type LeadInviteChatInput = {
  lead: AiLeadInput & { currentMessage?: string; status?: string };
  messages: SearchAdvisorMessage[];
};

function fallbackAnalysis(input: AiLeadInput, reason: string) {
  const isAgency = /agency|marketing|seo|ppc|branding|pr/i.test(`${input.company ?? ""} ${input.title ?? ""} ${input.snippet ?? ""} ${input.campaignContext ?? ""}`);
  return {
    fit: isAgency ? "good_fit" : "maybe",
    reason: `${input.name} was scored from visible title/company text and the campaign playbook. ${reason}`,
    confidence: isAgency ? 0.82 : 0.58,
    suggestedConnectionMessage: fallbackInviteMessage(input),
    model: "fallback"
  };
}

function fallbackInviteMessage(input: AiLeadInput) {
  if (input.instruction && input.previousMessage) {
    if (/short|shorter|concise/i.test(input.instruction)) return input.previousMessage.replace(/Thought it made sense to connect\.?/i, "Open to connecting?").slice(0, input.limit ?? 180);
    if (/direct|simple/i.test(input.instruction)) return `Hi ${input.name.split(" ")[0]}, came across your profile${input.company ? ` at ${input.company}` : ""}. Thought it made sense to connect.`.slice(0, input.limit ?? 280);
    if (/warmer|friendly/i.test(input.instruction)) return `Hi ${input.name.split(" ")[0]}, saw your work${input.company ? ` at ${input.company}` : ""}. Thought it would be good to connect here.`.slice(0, input.limit ?? 280);
    return input.previousMessage.slice(0, input.limit ?? 280);
  }
  const first = input.name.split(" ")[0];
  const templates = [
    `Hi ${first}, noticed your work${input.company ? ` at ${input.company}` : ""}. Thought it made sense to connect.`,
    `Hi ${first}, I came across your profile${input.company ? ` and ${input.company}` : ""}. Open to connecting here?`,
    `Hi ${first}, saw your background${input.company ? ` with ${input.company}` : ""}. Thought it made sense to connect.`,
    `Hi ${first}, saw your work in marketing and wanted to connect with other operators in the space.`,
    `Hi ${first}, I work on keeping Sales Navigator outreach organized while LinkedIn stays manual. Thought it might be relevant${input.company ? ` for ${input.company}` : ""}.`
  ];
  const index = Math.max(0, ((input.variant ?? 1) - 1) % templates.length);
  return templates[index].slice(0, input.limit ?? 280);
}

function openAiErrorReason(error: unknown) {
  const details = error as { status?: number; code?: string; message?: string };
  if (details.code === "insufficient_quota" || details.status === 429) {
    return "OpenAI quota or billing is not active, so Reachlyst used fallback scoring.";
  }
  return "OpenAI was unavailable, so Reachlyst used fallback scoring.";
}

function playbookMemory(messages: SearchAdvisorMessage[]) {
  return messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join("\n\n");
}

function formatWebsiteContexts(contexts?: AiPlaybookChatInput["websiteContexts"]) {
  if (!contexts?.length) return "";
  return contexts.map((context, index) => [
    `Website ${index + 1}: ${context.url}`,
    context.title ? `Title: ${context.title}` : "",
    context.text
  ].filter(Boolean).join("\n")).join("\n\n");
}

function fallbackAiPlaybookReply(input: AiPlaybookChatInput) {
  const memory = playbookMemory(input.messages);
  const websiteContext = formatWebsiteContexts(input.websiteContexts);
  const lower = memory.toLowerCase();
  const hasOffer = /sell|offer|provide|help|we do|service|product|agency|software|consult|support|website|marketing|sales|seo|ppc|development|outreach/i.test(memory);
  const hasIcp = /target|ideal|lead|icp|founder|owner|ceo|head|director|agency|saas|b2b|industry|company|employees|location/i.test(memory);
  const hasSignals = /signal|trigger|hiring|posted|growth|funding|recent|pain|problem|intent|active|looking|need/i.test(memory);
  const hasTone = /tone|voice|direct|friendly|professional|warm|short|concise|premium|casual|formal/i.test(memory);
  const hasMessages = /invite|message|reply|follow|connection|cta|ask|call|demo|audit|intro/i.test(memory);

  const summary = [
    "Here is the working AI Playbook so far:",
    "",
    `Offer: ${hasOffer ? "captured from your notes" : "not clear yet"}`,
    `Ideal leads: ${hasIcp ? "partly defined" : "not clear yet"}`,
    `Buying signals: ${hasSignals ? "partly defined" : "not clear yet"}`,
    `Tone: ${hasTone ? "partly defined" : "not clear yet"}`,
    `Invite/reply goal: ${hasMessages ? "partly defined" : "not clear yet"}`
  ].join("\n");

  const missing = [
    !hasOffer ? "what you sell and the concrete outcome you create" : "",
    !hasIcp ? "the exact roles, industries, company sizes, and countries you want" : "",
    !hasSignals ? "the buying signals that show a lead is worth a closer look" : "",
    !hasTone ? "the tone and words to avoid" : "",
    !hasMessages ? "what invites and accepted-connection replies should ask for" : ""
  ].filter(Boolean);

  if (!memory.trim()) {
    return "Let us build the Playbook properly. Start with what you sell, who buys it, what buying signals matter, and what a good first LinkedIn message should achieve.";
  }

  if (websiteContext) {
    const context = input.websiteContexts?.[0];
    const text = context?.text ?? "";
    const title = context?.title ? `\nTitle: ${context.title}` : "";
    const likelyOffer = [
      /website support|website care|technical support/i.test(text) ? "website support and technical support" : "",
      /maintenance|security checks|performance monitoring/i.test(text) ? "ongoing website maintenance, security checks, and performance monitoring" : "",
      /web development|custom development|api integrations|payment workflows/i.test(text) ? "web development, custom features, API integrations, and payment workflows" : "",
      /web design|redesign|ux\/ui|landing pages|design systems/i.test(text) ? "web design, redesign, UX/UI improvements, landing pages, and design systems" : "",
      /technical seo|analytics|qa/i.test(text) ? "technical SEO, analytics, and QA" : ""
    ].filter(Boolean).join("; ");
    return [
      "I read the website context you shared.",
      title,
      likelyOffer ? `What it looks like you do: ${likelyOffer}.` : `Website context excerpt: ${text.slice(0, 600)}`,
      "",
      summary,
      "",
      `Next question: ${missing[0] ?? "which website claims or offers should Reachlyst use as the main outreach angle, and which should it avoid mentioning?"}`
    ].filter(Boolean).join("\n");
  }

  if (lower.includes("save") || lower.includes("ready")) {
    return `${summary}\n\nBefore saving, I would tighten one thing: ${missing[0] ?? "give me 2-3 examples of ideal leads and the message goal for each"}.`;
  }

  return `${summary}\n\nNext question: ${missing[0] ?? "send me 2-3 ideal lead examples, and I will turn this into precise ICP, buying-signal, invite, and reply rules."}`;
}

export async function chatAboutAiPlaybook(input: AiPlaybookChatInput) {
  if (!process.env.OPENAI_API_KEY) return fallbackAiPlaybookReply(input);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            "You are Reachlyst AI Playbook trainer.",
            "Reply in the user's language unless they ask for another language.",
            "Your job is to have a real discovery conversation and convert the user's business context, website content, and sales thinking into practical rules for the Reachlyst extension.",
            "You may freely discuss the user's website, offer, market, positioning, competitors, buyer psychology, sales angles, objection handling, messaging strategy, and examples as long as the conversation helps train Reachlyst.",
            "Focus on: offer, ICP, buying signals, target roles, industries, company size, geography, tone, words to avoid, connection invite rules, accepted-connection reply rules, follow-up style, CTA, and examples.",
            "Do not ask for negative-fit categories as a required Playbook item unless the user brings that topic up first.",
            "Do not give generic encouragement. Each reply must either summarize concrete conclusions or ask the single most useful next question.",
            "When enough information exists, provide a compact Playbook draft with sections: Offer, ICP, Buying signals, Invite style, Reply style, Follow-up style, Default message types, Missing information.",
            "If website context is provided, use it to infer the offer, proof points, target customer, tone, and possible outreach angles. Be clear when an inference is uncertain.",
            "Use manual-first product language: say AI-assisted invite drafting, reply suggestions, or message suggestions. Do not call Reachlyst automated invite generation, automated outreach, or automated messaging.",
            "Keep it useful and conversational. Do not suggest auto-connect, auto-send, credential storage, bypassing platform limits, or fake personalization."
          ].join(" ")
        },
        ...(input.websiteContexts?.length ? [{
          role: "user" as const,
          content: JSON.stringify({
            instruction: "Use this public website context as additional material for AI Playbook training.",
            websiteContexts: input.websiteContexts
          })
        }] : []),
        ...input.messages.map((message) => ({ role: message.role, content: message.content }))
      ]
    });
    return response.choices[0]?.message.content ?? fallbackAiPlaybookReply(input);
  } catch {
    return fallbackAiPlaybookReply(input);
  }
}

export async function analyzeLead(input: AiLeadInput) {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackAnalysis(input, "Mocked because OPENAI_API_KEY is not set.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return JSON with fit good_fit|maybe|skip, reason, confidence 0-1, suggestedConnectionMessage. The message must be one short sentence under the provided limit, ideally 90-160 characters. Style example: 'Hi Ana, saw your work at Bright SEO Agency. Thought it made sense to connect here.' Keep it calm, direct, and human. Avoid hype, flattery, emojis, exclamation marks, 'admire', 'love', 'excited', 'looking forward', 'share insights', 'exchange ideas', 'thank you', 'request', 'opportunities', 'discuss', 'learn more', 'collaboration', and 'partnership'. Do not invent personalization. Follow the provided use case, ICP, tone, and LinkedIn manual-action policy." },
        { role: "user", content: JSON.stringify(input) }
      ]
    });
    return { ...JSON.parse(response.choices[0]?.message.content ?? "{}"), model: "gpt-4o-mini" };
  } catch (error) {
    return fallbackAnalysis(input, openAiErrorReason(error));
  }
}

export async function generateInviteMessage(input: AiLeadInput) {
  if (!process.env.OPENAI_API_KEY) return fallbackInviteMessage(input);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const isReply = /reply|follow-up|conversation|accepted connection|odgovor|prepis/i.test(`${input.instruction ?? ""} ${input.conversationContext ?? ""}`);
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: isReply
          ? "Return JSON with a single field message. Write a concise LinkedIn reply or follow-up based only on the visible conversation context. Keep it calm, direct, human, and ready for manual copy/paste. Do not invent personalization. Do not imply automation. Avoid hype, flattery, emojis, and pushy sales language."
          : "Return JSON with a single field message. Write one short LinkedIn connection invite sentence under the provided character limit, ideally 90-160 characters. Style example: 'Hi Ana, saw your work at Bright SEO Agency. Thought it made sense to connect here.' Keep it calm, direct, specific, and human. Avoid hype, flattery, emojis, exclamation marks, 'admire', 'love', 'excited', 'looking forward', 'share insights', 'exchange ideas', 'thank you', 'request', 'opportunities', 'discuss', 'learn more', 'collaboration', and 'partnership'. Do not invent personalization. Do not imply automation." },
        { role: "user", content: JSON.stringify(input) }
      ]
    });
    const parsed = JSON.parse(response.choices[0]?.message.content ?? "{}") as { message?: string };
    return (parsed.message || fallbackInviteMessage(input)).slice(0, input.limit ?? 280);
  } catch {
    return fallbackInviteMessage(input);
  }
}

function fallbackSearchAdvisor(input: SearchAdvisorInput) {
  const latest = input.messages.filter((message) => message.role === "user").at(-1)?.content ?? "";
  const isTraining = input.mode === "train_search";
  const starter = isTraining
    ? "Got it. For this search, I would score good fits as decision makers in the target niche, maybe fits as relevant but unclear buyers, and skips as profiles without a clear business match."
    : "I am with you. Let’s shape this into a useful LinkedIn outreach plan: offer, ICP, buying signals, and the next message angle.";

  if (!latest.trim()) return starter;

  const wantsLink = /link|url|sales nav|navigator|pretrag/i.test(latest);
  const wantsMessage = /poruk|invite|connect|tone|ton/i.test(latest);

  if (wantsLink) {
    return "Yes. I can help turn that into a Sales Navigator search. Give me the offer, target country, ideal roles, company size, and the buying signals that matter most. Then I will suggest the cleanest search structure and outreach angle.";
  }

  if (wantsMessage) {
    return "For messages, I would keep the tone short, calm, and specific without fake personalization. Example: “Hi Ana, noticed your work at Bright SEO. Thought it made sense to connect here.” Tell me the offer and audience, and I can draft 3 variants.";
  }

  return `I can help with that. ${starter}\n\nTalk to me naturally: rough ideas are fine. I will turn them into clearer ICP, buying-signal, message, and follow-up decisions as we go.`;
}

export async function adviseOnSearch(input: SearchAdvisorInput) {
  if (!process.env.OPENAI_API_KEY) return fallbackSearchAdvisor(input);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            "You are Reachlyst Ally, a warm, sharp LinkedIn outreach partner inside the Reachlyst dashboard.",
            "Reply in the user's language unless they ask for another language.",
            "Have a free, natural conversation. Be friendly, candid, and useful, like a trusted sales partner thinking with the user.",
            "The user may ask about business, positioning, competitors, sales, websites, offers, messaging, LinkedIn, or anything else that helps them think.",
            "Do not sound like a support bot. You can say what you think, make reasonable assumptions, and then ask for the one missing detail that would improve the answer.",
            "When the conversation touches prospecting or outreach, translate useful details into Reachlyst training ideas: ICP criteria, buying signals, message tone, reply style, and concise invite copy.",
            "Do not suggest auto-connect, auto-send, credential storage, bypassing platform limits, or fake personalization.",
            "Keep replies useful and actionable. Prefer one clear recommendation plus the next best question over long checklists.",
            "When relevant, include ICP, buying signals, suggested invite angle, reply direction, and Sales Navigator filter ideas.",
            "For create_search mode, help the user design a search and optionally draft a Sales Navigator query/filter plan.",
            "For train_search mode, help the user define how this specific search should score leads and write messages."
          ].join(" ")
        },
        {
          role: "user",
          content: JSON.stringify({
            mode: input.mode,
            searchName: input.searchName,
            searchUrl: input.searchUrl,
            context: input.context
          })
        },
        ...input.messages.map((message) => ({
          role: message.role,
          content: message.content
        }))
      ]
    });

    return response.choices[0]?.message.content ?? fallbackSearchAdvisor(input);
  } catch {
    return fallbackSearchAdvisor(input);
  }
}

function fallbackLeadInviteChat(input: LeadInviteChatInput) {
  const latest = input.messages.filter((message) => message.role === "user").at(-1)?.content ?? "";
  const base = input.lead.currentMessage || fallbackInviteMessage(input.lead);
  const wantsSerbian = /[čćžšđ]|srpsk|bosansk|hrvatsk|poruk|poziv|krać|krac|toplij|direktnij|napiš|napis|može|moze|lead|osob/i.test(latest);
  if (/see|vidi|prepis|conversation|thread|chat/i.test(latest) && input.lead.conversationContext) {
    return wantsSerbian
      ? `Da, vidim poslednju vidljivu prepisku koju je ekstenzija pročitala:\n\n${input.lead.conversationContext}`
      : `Yes, I can see the latest visible conversation that the extension captured:\n\n${input.lead.conversationContext}`;
  }
  if (!latest.trim()) return wantsSerbian ? `Evo čistog početka:\n\n${base}` : `Here is a clean starting point:\n\n${base}`;

  if (/analy|fit|profile|profil|research|istraž|istraz|angle|relevant|why|zašto|zasto|score|qualif|good fit|bad fit|intent|signal/i.test(latest)) {
    const context = [
      input.lead.profileContext ? `Profile context:\n${input.lead.profileContext}` : "",
      input.lead.conversationContext ? `Conversation context:\n${input.lead.conversationContext}` : "",
      input.lead.snippet ? `Visible card: ${input.lead.snippet}` : "",
      input.lead.title || input.lead.company ? `Role/company: ${input.lead.title || "Unknown role"} at ${input.lead.company || "unknown company"}` : ""
    ].filter(Boolean).join("\n\n");
    if (!context) {
      return wantsSerbian
        ? "Mogu da analiziram fit, ali trenutno imam samo osnovne podatke. Otvori Sales Navigator profil sa uključenom ekstenzijom i pitaj me ponovo."
        : "I can analyze fit, but I only have basic data right now. Open the Sales Navigator profile with the extension running and ask me again.";
    }
    return wantsSerbian
      ? `Mogu. Na osnovu vidljivog konteksta mogu da procenim fit, razlog i bolji outreach angle. Evo šta trenutno vidim:\n\n${context.slice(0, 900)}`
      : `Yes. Based on the visible context, I can assess fit, explain why, and suggest a better outreach angle. Here is what I can see:\n\n${context.slice(0, 900)}`;
  }

  if (/short|shorter|concise|krać|krac/i.test(latest)) {
    return base.replace(/Thought it made sense to connect\.?/i, "Open to connecting?").slice(0, 180);
  }

  if (/direct|simple|direkt|jednostavn/i.test(latest)) {
    const message = `Hi ${input.lead.name.split(" ")[0]}, came across your profile${input.lead.company ? ` at ${input.lead.company}` : ""}. Thought it made sense to connect.`;
    return wantsSerbian ? `Može, direktnija verzija:\n\n${message}` : message;
  }

  return wantsSerbian
    ? `Možemo slobodno da prođemo kroz to. Za ovaj lead trenutno imam ovaj osnovni outreach početak:\n\n${base}\n\nAko želiš, mogu dalje da pričam o fit-u, uglu pristupa, tonu, follow-up poruci ili širem kontekstu oko ovog prospekta.`
    : `We can talk through that freely. For this lead, I currently have this outreach starting point:\n\n${base}\n\nI can also help with fit, positioning, tone, follow-up strategy, or broader context around this prospect.`;
}

export async function chatAboutLeadInvite(input: LeadInviteChatInput) {
  if (!process.env.OPENAI_API_KEY) return fallbackLeadInviteChat(input);

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            "You are Reachlyst AI. Help polish LinkedIn copy for one visible Sales Navigator person.",
            "Reply in the same language the user uses. If the user asks for a specific language, use that language. If the language is unclear, use concise English.",
            "Have a free, natural conversation with the user. They may ask about the lead, their business, positioning, sales strategy, websites, messaging, objections, or broader context.",
            "When relevant, connect the answer back to the selected lead, visible conversation, outreach strategy, or practical next message.",
            "If lead.conversationContext is present, you can see that visible LinkedIn/Sales Navigator thread. Use it when drafting replies or follow-ups and never say you cannot see the conversation.",
            "If lead.profileContext is present, use it to assess Good fit / Maybe / Skip, explain why, suggest the strongest outreach angle, and then offer better copy.",
            "If profileContext is missing but card fields exist, answer fit/profile questions from visible card context and say when confidence is limited.",
            "Do not suggest auto-connect, auto-send, credential storage, bypassing platform limits, hidden scraping, or fake personalization.",
            "Keep suggested invite copy under 280 characters, ideally 90-160 characters.",
            "Avoid hype, flattery, emojis, exclamation marks, and phrases like admire, love, excited, partnership, collaboration, discuss, learn more, or share insights."
          ].join(" ")
        },
        {
          role: "user",
          content: JSON.stringify({
            lead: input.lead,
            task: input.lead.profileContext
              ? "Analyze visible Sales Navigator profile context for fit, relevance, outreach angle, and better copy."
              : input.lead.conversationContext
              ? "Polish or generate a safe copyable LinkedIn reply or follow-up for this visible conversation."
              : "Help with visible card-based fit, outreach angle, or safe copyable LinkedIn invite for this lead."
          })
        },
        ...input.messages.map((message) => ({ role: message.role, content: message.content }))
      ]
    });

    return response.choices[0]?.message.content ?? fallbackLeadInviteChat(input);
  } catch {
    return fallbackLeadInviteChat(input);
  }
}
