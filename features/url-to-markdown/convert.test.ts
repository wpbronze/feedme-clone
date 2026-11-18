import { afterEach, describe, expect, it, vi } from "vitest";

import { ConvertError, convertUrl, parseTargetUrl } from "./convert";

const ARTICLE = `<html><head><title>Hello World</title>
<meta name="author" content="Jane Doe"></head><body>
<article><h1>Hello World</h1>
<p>${"This is a long paragraph about files and apps. ".repeat(30)}</p>
<p>Second paragraph with <strong>bold</strong> text.</p></article></body></html>`;

function mockFetch(html: string, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(html, { status })),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("parseTargetUrl", () => {
  it.each([
    ["", "empty"],
    ["   ", "empty"],
    ["ftp://example.com", "protocol"],
    ["not a url", "protocol"],
  ])("%j 는 %s 오류", (input, code) => {
    expect(() => parseTargetUrl(input)).toThrowError(
      expect.objectContaining({ code }),
    );
  });

  it("https 주소는 통과한다", () => {
    expect(parseTargetUrl(" https://example.com/a ").hostname).toBe(
      "example.com",
    );
  });
});

describe("convertUrl", () => {
  it("제목, 저자, Markdown 본문을 돌려준다", async () => {
    mockFetch(ARTICLE);
    const page = await convertUrl("https://example.com/post");
    expect(page.title).toBe("Hello World");
    expect(page.author).toBe("Jane Doe");
    expect(page.markdown).toContain("**bold**");
  });

  it("저장에 쓸 원본 주소를 함께 돌려준다", async () => {
    mockFetch(ARTICLE);
    const page = await convertUrl(" https://example.com/post ");
    expect(page.url).toBe("https://example.com/post");
  });

  it("저자가 없으면 빈 문자열이다", async () => {
    mockFetch(ARTICLE.replace(/<meta name="author"[^>]*>/, ""));
    expect((await convertUrl("https://example.com/post")).author).toBe("");
  });

  it("접속 실패는 fetch 오류다", async () => {
    mockFetch("nope", 404);
    await expect(convertUrl("https://example.com/x")).rejects.toMatchObject({
      code: "fetch",
    });
  });

  it("본문이 없으면 extract 오류다", async () => {
    mockFetch("<html><body></body></html>");
    await expect(convertUrl("https://example.com/x")).rejects.toBeInstanceOf(
      ConvertError,
    );
    await expect(convertUrl("https://example.com/x")).rejects.toMatchObject({
      code: "extract",
    });
  });
});
