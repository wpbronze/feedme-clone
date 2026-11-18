import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
      <h1 className="font-heading text-xl font-semibold">글을 찾을 수 없습니다</h1>
      <p className="text-sm text-muted-foreground">
        삭제되었거나 내가 저장한 글이 아닙니다.
      </p>
      <Link href="/saved" className="text-sm underline underline-offset-4">
        저장 목록으로
      </Link>
    </main>
  );
}
