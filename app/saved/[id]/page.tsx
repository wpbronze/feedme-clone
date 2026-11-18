import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatSavedAt } from "@/features/saved-articles/articles";
import { DeleteButton } from "@/features/saved-articles/delete-button";
import { MarkdownView } from "@/features/url-to-markdown/markdown-view";
import { ThemeToggle } from "@/features/url-to-markdown/theme-toggle";
import { createClient } from "@/lib/supabase/server";

export default async function SavedArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  // RLS 때문에 남의 글, 없는 글, 형식이 잘못된 id는 모두 같은 결과(없음)가 된다.
  const { data: article } = await supabase
    .from("saved_articles")
    .select("id, url, title, author, site, markdown, saved_at")
    .eq("id", id)
    .maybeSingle();
  if (!article) notFound();

  const title = article.title || article.site;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-3">
        <Link
          href="/saved"
          className="text-sm underline-offset-4 hover:underline"
        >
          ← 저장 목록
        </Link>
        <div className="flex items-center gap-3">
          <DeleteButton id={article.id} title={title} redirectTo="/saved" />
          <ThemeToggle />
        </div>
      </header>
      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-5">
          <CardTitle className="text-2xl leading-snug text-balance">
            {title}
          </CardTitle>
          <div className="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
            {article.author && <span>{article.author}</span>}
            {article.site !== article.author && <span>{article.site}</span>}
            <span>{formatSavedAt(article.saved_at)} 저장</span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              원문 보기
            </a>
          </div>
        </CardHeader>
        <MarkdownView markdown={article.markdown} />
      </Card>
    </main>
  );
}
