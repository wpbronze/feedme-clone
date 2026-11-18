import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { formatSavedAt } from "@/features/saved-articles/articles";
import { DeleteButton } from "@/features/saved-articles/delete-button";
import { ThemeToggle } from "@/features/url-to-markdown/theme-toggle";
import { createClient } from "@/lib/supabase/server";

export default async function SavedListPage() {
  const supabase = await createClient();

  // 서버가 검증한 claims로 로그인 여부를 판단한다.
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  // RLS가 본인 행만 돌려준다.
  const { data: articles, error } = await supabase
    .from("saved_articles")
    .select("id, title, author, site, url, saved_at")
    .order("saved_at", { ascending: false });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          저장 목록
        </h1>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm underline-offset-4 hover:underline">
            홈
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>목록을 불러오지 못했습니다</AlertTitle>
          <AlertDescription>
            잠시 후 새로고침해 다시 시도해 주세요.
          </AlertDescription>
        </Alert>
      )}

      {!error && articles?.length === 0 && (
        <div className="rounded-xl border border-dashed px-5 py-12 text-center text-muted-foreground">
          <strong className="mb-1 block text-foreground">
            아직 저장한 글이 없습니다
          </strong>
          홈에서 변환한 글의 저장 버튼을 누르면 여기에 모입니다.
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {articles?.map((a) => {
          const title = a.title || a.site;
          return (
            <li key={a.id}>
              <Card size="sm">
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Link
                      href={`/saved/${a.id}`}
                      className="font-medium wrap-anywhere underline-offset-4 hover:underline"
                    >
                      {title}
                    </Link>
                    <div className="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                      {a.author && <span>{a.author}</span>}
                      {a.site !== a.author && <span>{a.site}</span>}
                      <span>{formatSavedAt(a.saved_at)}</span>
                    </div>
                  </div>
                  <DeleteButton id={a.id} title={title} />
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
