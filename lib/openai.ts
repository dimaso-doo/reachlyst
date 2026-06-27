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
  const hasExclusions = /exclude|avoid|skip|not|wrong|bad fit|student|recruiter|enterprise|small|freelancer/i.test(memory);
  const hasTone = /tone|voice|direct|friendly|professional|warm|short|concise|premium|casual|formal/i.test(memory);
  const hasMessages = /invite|message|reply|follow|connection|cta|ask|call|demo|audit|intro/i.test(memory);

  const summary = [
    "Here is the working AI Playbook so far:",
    "",
    `Offer: ${hasOffer ? "captured from your notes" : "not clear yet"}`,
    `Ideal leads: ${hasIcp ? "partly defined" : "not clear yet"}`,
    `Bad-fit leads: ${hasExclusions ? "partly defined" : "not clear yet"}`,
    `Tone: ${hasTone ? "partly defined" : "not clear yet"}`,
    `Invite/reply goal: ${hasMessages ? "partly defined" : "not clear yet"}`
  ].join("\n");

  const missing = [
    !hasOffer ? "what you sell and the concrete outcome you create" : "",
    !hasIcp ? "the exact roles, industries, company sizes, and countries you want" : "",
    !hasExclusions ? "who Reachlyst should mark as Skip" : "",
    !hasTone ? "the tone and words to avoid" : "",
    !hasMessages ? "what invites and accepted-connection replies should ask for" : ""
  ].filter(Boolean);

  if (!memory.trim()) {
    return "Let us build the Playbook properly. Start with what you sell, who buys it, who is a bad fit, and what a good first LinkedIn message should achieve.";
  }

  if (websiteContext) {
    return `${summary}\n\nI also read the website context you shared. Next question: ${missing[0] ?? "which website claims or offers should Reachlyst use as the main outreach angle, and which should it avoid mentioning?"}`;
  }

  if (lower.includes("save") || lower.includes("ready")) {
    return `${summary}\n\nBefore saving, I would tighten one thing: ${missing[0] ?? "give me 2-3 examples of leads you would definitely want and 2-3 you would skip"}.`;
  }

  return `${summary}\n\nNext question: ${missing[0] ?? "send me 2 good-fit examples and 2 bad-fit examples, and I will turn this into precise Good fit / Maybe / Skip rules plus default invite and reply styles."}`;
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
            "Focus on: offer, ICP, good-fit signals, maybe-fit signals, skip/disqualifier rules, target roles, industries, company size, geography, tone, words to avoid, connection invite rules, accepted-connection reply rules, follow-up style, CTA, and examples.",
            "Do not give generic encouragement. Each reply must either summarize concrete conclusions or ask the single most useful next question.",
            "When enough information exists, provide a compact Playbook draft with sections: Offer, Good fit, Maybe, Skip, Invite style, Reply style, Follow-up style, Default message types, Missing information.",
            "If website context is provided, use it to infer the offer, proof points, target customer, tone, and possible outreach angles. Be clear when an inference is uncertain.",
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
  const inScope = /lead|linkedin|sales|navigator|search|pretrag|poruk|invite|connect|outreach|fit|icp|kup|buyer|company|kompan|firma|industr|title|role|uloga|founder|owner|ceo|agenc|agency|tone|ton|follow|reply|odgovor|target|cilj/i.test(latest);
  const starter = isTraining
    ? "Got it. For this search, I would score good fits as decision makers in the target niche, maybe fits as relevant but unclear buyers, and skips as profiles without a clear business match."
    : "Got it. Let’s define the ICP first: role, industry, location, company size, and clear exclusions.";

  if (!latest.trim()) return starter;
  if (!inScope) {
    return "I can only help with Reachlyst workflows: Sales Navigator searches, ICP, fit scoring, manual outreach copy, lead organization, and extension setup.";
  }

  const wantsLink = /link|url|sales nav|navigator|pretrag/i.test(latest);
  const wantsMessage = /poruk|invite|connect|tone|ton/i.test(latest);

  if (wantsLink) {
    return "I can structure the Sales Navigator search around role/title filters, company headcount, geography, industry, and keywords. Tell me what you sell, the target country, company size, and 3-5 bad-fit examples to exclude.";
  }

  if (wantsMessage) {
    return "For messages, I would keep the tone short, calm, and specific without fake personalization. Example: “Hi Ana, noticed your work at Bright SEO. Thought it made sense to connect here.” Tell me the offer and audience, and I can draft 3 variants.";
  }

  return `${starter}\n\nHere is how I would frame it:\n1. Good fit: owner/founder/CEO/partner with a clear B2B buying signal.\n2. Maybe: relevant company, but weak title or unclear intent.\n3. Skip: unrelated industry, wrong company size, or profiles without business context.\n\nSend me the offer and ideal company size, and I will tighten the rules and draft invite copy.`;
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
            "You are Reachlyst AI, a practical Sales Navigator search and outreach advisor.",
            "Always answer in English, even if the user writes in another language.",
            "Have a real conversation. Ask clarifying questions, suggest ICP criteria, fit rules, exclusions, message tone, and concise invite copy.",
            "Do not claim to automate LinkedIn. Do not suggest auto-connect, auto-send, scraping, bypassing limits, or credential storage.",
            "Only answer questions related to Reachlyst's purpose: Sales Navigator searches, ICP design, lead fit scoring, outreach copy suggestions, manual LinkedIn workflow, read-only message sync, campaign organization, and Chrome extension setup.",
            "If the user asks about anything outside that scope, politely refuse in one short English sentence and bring them back to Reachlyst-related work.",
            "Keep replies concise and actionable. When useful, include Good fit, Maybe, Skip, Suggested invite, and Sales Navigator filter ideas.",
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

  if (!/message|invite|tone|short|long|friendly|direct|formal|casual|rewrite|improve|polish|personal|copy|connect|linkedin|outreach|follow|reply|conversation|thread|chat|see|poruk|poziv|odgovor|prepis|vidi|ton|krać|krac|duž|duz|toplij|direkt|formal|neformal|prepiš|prepis|poboljš|poboljs|kopir|povež|povez|analy|fit|profile|profil|research|istraž|istraz|angle|relevant|score|qualif|good fit|bad fit|intent|signal/i.test(latest)) {
    return wantsSerbian
      ? "Mogu da pomognem samo oko LinkedIn invite i outreach poruke za ovaj lead."
      : "I can only help polish LinkedIn invite and outreach copy for this lead.";
  }

  if (/short|shorter|concise|krać|krac/i.test(latest)) {
    return base.replace(/Thought it made sense to connect\.?/i, "Open to connecting?").slice(0, 180);
  }

  if (/direct|simple|direkt|jednostavn/i.test(latest)) {
    const message = `Hi ${input.lead.name.split(" ")[0]}, came across your profile${input.lead.company ? ` at ${input.lead.company}` : ""}. Thought it made sense to connect.`;
    return wantsSerbian ? `Može, direktnija verzija:\n\n${message}` : message;
  }

  return wantsSerbian
    ? `Probaj ovu verziju:\n\n${base}\n\nOstaje kratko, mirno i spremno za ručno slanje na LinkedIn-u.`
    : `Try this version:\n\n${base}\n\nIt stays specific, calm, and safe for a manual LinkedIn invite.`;
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
            "Stay strictly in scope: visible profile analysis, lead fit, outreach angles, invite copy, reply copy, follow-up copy, tone, personalization boundaries, and manual LinkedIn outreach.",
            "If lead.conversationContext is present, you can see that visible LinkedIn/Sales Navigator thread. Use it when drafting replies or follow-ups and never say you cannot see the conversation.",
            "If lead.profileContext is present, use it to assess Good fit / Maybe / Skip, explain why, suggest the strongest outreach angle, and then offer better copy.",
            "If profileContext is missing but card fields exist, answer fit/profile questions from visible card context and say when confidence is limited.",
            "If the user asks for anything else, refuse briefly in the user's language and bring them back to lead fit or LinkedIn outreach copy.",
            "Do not suggest automation, auto-connect, auto-send, scraping, or fake personalization.",
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
