"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

import { deleteArticle } from "./articles";

// 확인을 거쳐 삭제한다. redirectTo가 있으면 그 주소로 이동하고, 없으면 현재 화면을 새로 고친다.
export function DeleteButton({
  id,
  title,
  redirectTo,
}: {
  id: string;
  title: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setBusy(true);
    setError("");
    const result = await deleteArticle(createClient(), id);
    setBusy(false);
    if (!result.ok) return setError(result.message);
    setOpen(false);
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setError("");
      }}
    >
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm" aria-label={`${title} 삭제`}>
            <Trash2Icon />
            삭제
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>저장한 글을 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{title}&rdquo;이(가) 저장 목록에서 사라지며 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>취소</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={() => void remove()}
          >
            {busy ? "삭제하는 중..." : "삭제"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
