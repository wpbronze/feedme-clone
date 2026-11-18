export const PRESETS = ["요약해줘", "한국어로 번역해줘", "쉽게 설명해줘"] as const;

export const LLM_TARGETS = {
  chatgpt: { label: "ChatGPT", url: "https://chatgpt.com/" },
  claude: { label: "Claude", url: "https://claude.ai/new" },
} as const;

export type LlmTarget = keyof typeof LLM_TARGETS;

/** 프롬프트가 있으면 `프롬프트 + 빈 줄 + Markdown`, 없으면 Markdown만. */
export function buildLlmText(prompt: string, markdown: string): string {
  const trimmed = prompt.trim();
  return trimmed ? `${trimmed}\n\n${markdown}` : markdown;
}

/** 페이지 제목에서 파일명을 만든다. 제목이 없거나 쓸 수 있는 글자가 없으면 기본 이름. */
export function markdownFilename(title: string): string {
  const base = title
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80)
    .trim();
  return `${base || "page"}.md`;
}
