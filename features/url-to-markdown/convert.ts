import { Defuddle } from "defuddle/node";
import { parseHTML } from "linkedom";

export type ConvertedPage = {
  title: string;
  author: string;
  site: string;
  wordCount: number;
  markdown: string;
};

export type ConvertErrorCode = "empty" | "protocol" | "fetch" | "extract";

const MESSAGES: Record<ConvertErrorCode, string> = {
  empty: "URL을 입력해 주세요.",
  protocol: "http 또는 https로 시작하는 주소만 변환할 수 있습니다.",
  fetch: "페이지에 접속할 수 없습니다. 주소를 다시 확인해 주세요.",
  extract:
    "본문을 추출하지 못했습니다. 로그인이 필요하거나 자바스크립트로만 그려지는 페이지일 수 있습니다.",
};

export class ConvertError extends Error {
  constructor(readonly code: ConvertErrorCode) {
    super(MESSAGES[code]);
  }
}

export function parseTargetUrl(input: string): URL {
  const value = input.trim();
  if (!value) throw new ConvertError("empty");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ConvertError("protocol");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ConvertError("protocol");
  }
  return url;
}

async function fetchHtml(url: URL): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; url-to-markdown)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return await res.text();
  } catch {
    throw new ConvertError("fetch");
  }
}

export async function convertUrl(input: string): Promise<ConvertedPage> {
  const url = parseTargetUrl(input);
  const html = await fetchHtml(url);

  let result;
  try {
    const { document } = parseHTML(html);
    result = await Defuddle(document as unknown as Document, url.href, {
      markdown: true,
    });
  } catch {
    throw new ConvertError("extract");
  }

  const markdown = result.content?.trim() ?? "";
  if (!markdown) throw new ConvertError("extract");

  return {
    title: result.title?.trim() ?? "",
    author: result.author?.trim() ?? "",
    site: result.site?.trim() || url.hostname,
    wordCount: result.wordCount ?? 0,
    markdown,
  };
}
