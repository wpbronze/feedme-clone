import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

// Shows "설정" for a verified user and "로그인" otherwise.
export async function AuthLink() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  const linkClass = "text-sm underline-offset-4 hover:underline";

  return (
    <>
      {signedIn && (
        <Link href="/saved" className={linkClass}>
          저장 목록
        </Link>
      )}
      <Link href={signedIn ? "/settings" : "/auth/login"} className={linkClass}>
        {signedIn ? "설정" : "로그인"}
      </Link>
    </>
  );
}
