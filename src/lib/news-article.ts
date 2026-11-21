import type { LocalizedText } from "@/lib/json-field";

// News post bodies are stored in the `body` JSON column. Older posts hold
// only { en, km } plain text and render with the original "classic" layout.
// Posts built with the old admin article builder add `layout: "press"` and an
// ordered list of content blocks. Posts created from the news template add
// `layout: "template"` and a fixed set of fields (see NewsTemplate). In both
// cases `en`/`km` hold a plain-text copy so excerpts and reading-time
// estimates keep working. Classic and press posts still render as before,
// but are switched to the template the next time they are edited and saved.

export type ArticleBlock =
  | { type: "heading"; text: string }
  | { type: "text"; text: string }
  | { type: "quote"; text: string }
  | { type: "image"; url: string; caption: string };

// Every templated article has the same sections, in this order. Only the
// summary and story are required; empty optional sections are skipped.
export type NewsTemplate = {
  eventDate: string | null; // "YYYY-MM-DD"
  location: string;
  summary: string; // opening paragraph, shown after the dateline
  story: string; // paragraphs separated by a blank line
  quote: { text: string; name: string; role: string } | null;
  highlights: string[];
  closing: string; // thanks to partners, sponsors, volunteers...
};

type StoredNewsBody = LocalizedText & {
  layout?: "press" | "template";
  blocks?: ArticleBlock[];
  template?: unknown;
};

export type NewsBody = {
  text: LocalizedText;
  layout: "classic" | "press" | "template";
  blocks: ArticleBlock[];
  template: NewsTemplate | null;
};

export function parseNewsBody(raw: string): NewsBody {
  const stored = JSON.parse(raw) as StoredNewsBody;
  const template = stored.layout === "template" ? sanitizeTemplate(stored.template) : null;
  return {
    text: { en: stored.en, km: stored.km },
    layout: template ? "template" : stored.layout === "press" ? "press" : "classic",
    blocks: sanitizeBlocks(stored.blocks ?? []),
    template,
  };
}

export function serializeTemplateBody(template: NewsTemplate): string {
  const plainText = [template.summary, template.story, template.quote?.text ?? "", template.closing]
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n");
  const stored: StoredNewsBody = { en: plainText, km: plainText, layout: "template", template };
  return JSON.stringify(stored);
}

export function sanitizeTemplate(input: unknown): NewsTemplate | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

  const summary = str(raw.summary);
  const story = str(raw.story);
  if (!summary || !story) return null;

  const eventDate = str(raw.eventDate);
  const quoteRaw = (raw.quote && typeof raw.quote === "object" ? raw.quote : {}) as Record<string, unknown>;
  const quoteText = str(quoteRaw.text);

  return {
    eventDate: /^\d{4}-\d{2}-\d{2}$/.test(eventDate) ? eventDate : null,
    location: str(raw.location),
    summary,
    story,
    quote: quoteText ? { text: quoteText, name: str(quoteRaw.name), role: str(quoteRaw.role) } : null,
    highlights: Array.isArray(raw.highlights) ? raw.highlights.map(str).filter(Boolean) : [],
    closing: str(raw.closing),
  };
}

// Pre-fills the template form for posts written before the template existed,
// so they can be edited — and re-saved — in the template layout. The first
// paragraph becomes the opening summary and the rest the main story. Press
// image blocks have no template field; updateNewsPost moves them into the
// gallery on save. The result may have an empty summary or story for the
// editor to fill in.
export function toTemplateDraft(body: NewsBody): NewsTemplate {
  if (body.template) return body.template;

  const empty: NewsTemplate = {
    eventDate: null,
    location: "",
    summary: "",
    story: "",
    quote: null,
    highlights: [],
    closing: "",
  };

  if (body.layout === "classic") {
    const [summary = "", ...rest] = splitParagraphs(body.text.en ?? "");
    return { ...empty, summary, story: rest.join("\n\n") };
  }

  // Press: the first quote fills the Quote section; any others stay in the
  // story in double quotes, which the template renders as bold italic.
  const firstQuote = body.blocks.find((block) => block.type === "quote");
  const paragraphs = body.blocks.flatMap((block) => {
    if (block.type === "image" || block === firstQuote) return [];
    return [block.type === "quote" ? `“${block.text}”` : block.text];
  });
  const firstText = body.blocks.find((block) => block.type === "text");
  const summary = firstText && firstText.type === "text" ? firstText.text : "";
  return {
    ...empty,
    summary,
    story: paragraphs.filter((text) => text !== summary).join("\n\n"),
    quote: firstQuote && firstQuote.type === "quote" ? { text: firstQuote.text, name: "", role: "" } : null,
  };
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

// Only uploaded files (site-relative) or http(s) URLs are allowed as images.
export function isSafeImageUrl(url: string): boolean {
  return /^(https?:\/\/|\/(?!\/))/i.test(url);
}

export function sanitizeBlocks(input: unknown): ArticleBlock[] {
  if (!Array.isArray(input)) return [];
  const blocks: ArticleBlock[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const block = raw as Record<string, unknown>;
    const text = typeof block.text === "string" ? block.text.trim() : "";
    switch (block.type) {
      case "heading":
      case "text":
      case "quote":
        if (text) blocks.push({ type: block.type, text });
        break;
      case "image": {
        const url = typeof block.url === "string" ? block.url : "";
        const caption = typeof block.caption === "string" ? block.caption.trim() : "";
        if (url && isSafeImageUrl(url)) blocks.push({ type: "image", url, caption });
        break;
      }
    }
  }
  return blocks;
}
