import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

// Shows "설정" for a verified user and "로그인" otherwise.
export async function AuthLink() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  return (
    <Link
      href={signedIn ? "/settings" : "/auth/login"}
      className="text-sm underline-offset-4 hover:underline"
    >
      {signedIn ? "설정" : "로그인"}
    </Link>
  );
}
