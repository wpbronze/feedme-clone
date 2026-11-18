import { describe, expect, it, vi } from "vitest";

import { deleteArticle, saveArticle } from "./articles";

const PAGE = {
  url: "https://example.com/post",
  title: "Hello",
  author: "Jane",
  site: "example.com",
  wordCount: 3,
  markdown: "# Hello",
};

// 필요한 체인만 흉내 낸 Supabase 클라이언트.
function fakeClient(result: { error: { message: string } | null; data?: unknown }) {
  const upsert = vi.fn(async () => result);
  const select = vi.fn(async () => result);
  const eq = vi.fn(() => ({ select }));
  const del = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ upsert, delete: del }));
  return { client: { from } as never, from, upsert, eq };
}

describe("saveArticle", () => {
  it("같은 사용자·URL 기준으로 upsert 하고 프롬프트 없이 본문만 저장한다", async () => {
    const { client, from, upsert } = fakeClient({ error: null });
    const result = await saveArticle(client, PAGE);

    expect(result).toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("saved_articles");
    const [row, options] = upsert.mock.calls[0] as unknown as [
      Record<string, unknown>,
      { onConflict: string },
    ];
    expect(options.onConflict).toBe("user_id,url");
    expect(row).toMatchObject({
      url: PAGE.url,
      title: "Hello",
      author: "Jane",
      site: "example.com",
      markdown: "# Hello",
    });
    expect(typeof row.saved_at).toBe("string");
  });

  it("실패하면 이해할 수 있는 메시지를 돌려준다", async () => {
    const { client } = fakeClient({ error: { message: "boom" } });
    const result = await saveArticle(client, PAGE);
    expect(result).toEqual({
      ok: false,
      message: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    });
  });
});

describe("deleteArticle", () => {
  it("해당 id 행을 지운다", async () => {
    const { client, eq } = fakeClient({ error: null, data: [{ id: "a" }] });
    expect(await deleteArticle(client, "a")).toEqual({ ok: true });
    expect(eq).toHaveBeenCalledWith("id", "a");
  });

  it("지워진 행이 없으면(남의 글 등) 실패로 본다", async () => {
    const { client } = fakeClient({ error: null, data: [] });
    expect((await deleteArticle(client, "a")).ok).toBe(false);
  });

  it("오류가 나면 실패로 본다", async () => {
    const { client } = fakeClient({ error: { message: "x" } });
    expect((await deleteArticle(client, "a")).ok).toBe(false);
  });
});
