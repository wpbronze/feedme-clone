import Link from "next/link";
import { Converter } from "@/features/url-to-markdown/converter";
import { ThemeToggle } from "@/features/url-to-markdown/theme-toggle";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            URL → Markdown
          </h1>
          <p className="text-sm text-muted-foreground">
            웹 페이지 본문을 Markdown으로 뽑아 바로 LLM에 넘깁니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="text-sm underline-offset-4 hover:underline"
          >
            설정
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <Converter />
    </main>
  );
}
