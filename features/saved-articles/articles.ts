import type { SupabaseClient } from "@supabase/supabase-js";

import type { ConvertedPage } from "@/features/url-to-markdown/convert";

export type SavedArticle = {
  id: string;
  url: string;
  title: string;
  author: string;
  site: string;
  markdown: string;
  saved_at: string;
};

export type ActionResult = { ok: true } | { ok: false; message: string };

const SAVE_FAILED = "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";
const DELETE_FAILED = "삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.";

// 같은 (사용자, URL)이면 기존 행을 최신 내용으로 갱신한다. user_id는 DB가 auth.uid()로 채운다.
export async function saveArticle(
  supabase: SupabaseClient,
  page: Pick<ConvertedPage, "url" | "title" | "author" | "site" | "markdown">,
): Promise<ActionResult> {
  const { error } = await supabase.from("saved_articles").upsert(
    {
      url: page.url,
      title: page.title,
      author: page.author,
      site: page.site,
      markdown: page.markdown,
      saved_at: new Date().toISOString(),
    },
    { onConflict: "user_id,url" },
  );
  return error ? { ok: false, message: SAVE_FAILED } : { ok: true };
}

export async function deleteArticle(
  supabase: SupabaseClient,
  id: string,
): Promise<ActionResult> {
  // RLS가 남의 행을 조용히 0건으로 만들기 때문에 지워진 행 수까지 확인한다.
  const { data, error } = await supabase
    .from("saved_articles")
    .delete()
    .eq("id", id)
    .select("id");
  return error || !data?.length
    ? { ok: false, message: DELETE_FAILED }
    : { ok: true };
}

export function formatSavedAt(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
