import { describe, expect, it } from "vitest";

import { buildLlmText, markdownFilename } from "./export";

describe("buildLlmText", () => {
  it("프롬프트 + 빈 줄 + Markdown 순서로 합친다", () => {
    expect(buildLlmText("요약해줘", "# 본문")).toBe("요약해줘\n\n# 본문");
  });

  it("프롬프트가 비어 있으면 Markdown만 돌려준다", () => {
    expect(buildLlmText("  ", "# 본문")).toBe("# 본문");
  });
});

describe("markdownFilename", () => {
  it("제목으로 파일명을 만들고 금지 문자를 걷어낸다", () => {
    expect(markdownFilename('File: over/app?')).toBe("File over app.md");
  });

  it("제목이 없으면 기본 이름을 쓴다", () => {
    expect(markdownFilename("")).toBe("page.md");
    expect(markdownFilename(" // ")).toBe("page.md");
  });
});
