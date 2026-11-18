"use client";

import { useRef, useState } from "react";
import { AlertCircleIcon, XIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";

import type { ConvertedPage } from "./convert";
import {
  buildLlmText,
  LLM_TARGETS,
  type LlmTarget,
  markdownFilename,
  PRESETS,
} from "./export";
import { MarkdownView } from "./markdown-view";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; page: ConvertedPage };

const CUSTOM = "custom";
const COPY_FAILED =
  "클립보드에 복사하지 못했습니다. 브라우저의 클립보드 권한을 확인해 주세요.";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function Converter() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [selected, setSelected] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [notice, setNotice] = useState("");
  const requestId = useRef(0);

  const page = status.kind === "done" ? status.page : null;
  const prompt = selected === CUSTOM ? customPrompt.trim() : (selected ?? "");

  async function convert() {
    const id = ++requestId.current;
    setNotice("");
    const value = url.trim();
    if (!value) {
      return setStatus({ kind: "error", message: "URL을 입력해 주세요." });
    }
    if (!/^https?:\/\//i.test(value)) {
      return setStatus({
        kind: "error",
        message: "http 또는 https로 시작하는 주소만 변환할 수 있습니다.",
      });
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const data = await res.json();
      if (id !== requestId.current) return;
      setStatus(
        res.ok
          ? { kind: "done", page: data }
          : { kind: "error", message: data.error ?? "변환하지 못했습니다." },
      );
    } catch {
      if (id !== requestId.current) return;
      setStatus({
        kind: "error",
        message: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      });
    }
  }

  function clear() {
    requestId.current++;
    setUrl("");
    setStatus({ kind: "idle" });
    setSelected(null);
    setCustomPrompt("");
    setNotice("");
  }

  async function copyMarkdown() {
    if (!page) return;
    const ok = await copyText(page.markdown);
    setNotice(
      ok ? "Markdown을 복사했습니다. (프롬프트는 포함하지 않습니다)" : COPY_FAILED,
    );
  }

  function download() {
    if (!page) return;
    const name = markdownFilename(page.title);
    const href = URL.createObjectURL(
      new Blob([page.markdown], { type: "text/markdown;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    a.click();
    URL.revokeObjectURL(href);
    setNotice(`${name} 파일을 내려받았습니다.`);
  }

  async function openInLlm(target: LlmTarget) {
    if (!page) return;
    const { label, url: targetUrl } = LLM_TARGETS[target];
    // 새 탭으로 포커스가 넘어가기 전에 클립보드 쓰기를 먼저 시작한다.
    const copied = copyText(buildLlmText(prompt, page.markdown));
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    const ok = await copied;
    setNotice(
      ok
        ? `클립보드에 복사했습니다${prompt ? ` (프롬프트 "${prompt}" 포함)` : ""}. 열린 ${label} 탭에서 붙여넣기(Ctrl+V) 하세요.`
        : COPY_FAILED,
    );
  }

  const noResult = !page;

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void convert();
        }}
      >
        <div className="relative flex min-w-64 flex-1">
          <Input
            aria-label="변환할 URL"
            placeholder="https://example.com/article"
            autoComplete="off"
            className="h-10 pr-10"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          {(url || status.kind !== "idle") && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="지우기"
              title="지우기"
              className="absolute top-1 right-1 text-muted-foreground"
              onClick={clear}
            >
              <XIcon />
            </Button>
          )}
        </div>
        <Button type="submit" size="lg" disabled={status.kind === "loading"}>
          변환
        </Button>
      </form>

      <div className="flex flex-col gap-5">
        <Card size="sm">
          <CardContent className="flex flex-wrap gap-x-6 gap-y-5">
            <div className="flex min-w-64 flex-1 flex-col gap-2">
              <h2 className="text-sm font-semibold">
                프롬프트{" "}
                <span className="font-normal text-muted-foreground">(선택)</span>
              </h2>
              <div
                role="group"
                aria-label="프롬프트"
                className="flex flex-wrap gap-1.5"
              >
                {PRESETS.map((preset) => (
                  <PromptToggle
                    key={preset}
                    pressed={selected === preset}
                    onPressedChange={(p) => setSelected(p ? preset : null)}
                  >
                    {preset}
                  </PromptToggle>
                ))}
                <PromptToggle
                  pressed={selected === CUSTOM}
                  onPressedChange={(p) => setSelected(p ? CUSTOM : null)}
                >
                  직접 입력
                </PromptToggle>
              </div>
              {selected === CUSTOM && (
                <Textarea
                  aria-label="직접 입력한 프롬프트"
                  placeholder="예: 핵심 주장 3가지만 뽑아줘"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
              )}
              <p className="text-xs text-muted-foreground">
                LLM으로 열 때만 본문 앞에 붙습니다. 저장되지 않습니다.
              </p>
            </div>
            <div className="flex min-w-64 flex-1 flex-col gap-2">
              <h2 className="text-sm font-semibold">내보내기</h2>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  disabled={noResult}
                  onClick={() => void copyMarkdown()}
                >
                  복사하기
                </Button>
                <Button variant="outline" disabled={noResult} onClick={download}>
                  .md 다운로드
                </Button>
                <Button
                  disabled={noResult}
                  onClick={() => void openInLlm("chatgpt")}
                >
                  ChatGPT로 열기
                </Button>
                <Button
                  disabled={noResult}
                  onClick={() => void openInLlm("claude")}
                >
                  Claude로 열기
                </Button>
              </div>
              {notice && (
                <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm">
                  {notice}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {status.kind === "idle" && (
          <div className="rounded-xl border border-dashed px-5 py-12 text-center text-muted-foreground">
            <strong className="mb-1 block text-foreground">
              아직 변환한 페이지가 없습니다
            </strong>
            주소를 붙여넣고 변환을 누르면 본문이 여기에 나타납니다.
          </div>
        )}

        {status.kind === "loading" && (
          <Card aria-busy="true" aria-label="변환 중">
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="mb-4 h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </CardContent>
          </Card>
        )}

        {status.kind === "error" && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>변환하지 못했습니다</AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        {page && (
          <Card className="gap-0 py-0">
            <CardHeader className="border-b py-5">
              <CardTitle className="text-2xl leading-snug text-balance">
                {page.title || page.site}
              </CardTitle>
              <div className="flex flex-wrap gap-x-3 text-sm text-muted-foreground">
                {page.author && <span>{page.author}</span>}
                {page.site !== page.author && <span>{page.site}</span>}
                {page.wordCount > 0 && <span>{page.wordCount}단어</span>}
              </div>
            </CardHeader>
            <MarkdownView markdown={page.markdown} />
          </Card>
        )}
      </div>
    </div>
  );
}

function PromptToggle(props: React.ComponentProps<typeof Toggle>) {
  return (
    <Toggle
      variant="outline"
      className="h-8 rounded-full px-3 aria-pressed:bg-primary aria-pressed:text-primary-foreground"
      {...props}
    />
  );
}
