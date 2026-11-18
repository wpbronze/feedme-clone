import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LogoutButton } from '@/features/auth/logout-button'
import { ProfileForm } from '@/features/profile/profile-form'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()

  // Authorize from server-verified claims, not from client state.
  const { data: claimsData } = await supabase.auth.getClaims()
  const claims = claimsData?.claims
  if (!claims) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', claims.sub)
    .single()

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-xl font-semibold tracking-tight">설정</h1>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm underline-offset-4 hover:underline">
            홈
          </Link>
          <LogoutButton />
        </div>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>프로필</CardTitle>
          <CardDescription>{claims.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            userId={claims.sub}
            initialDisplayName={profile?.display_name ?? ''}
          />
        </CardContent>
      </Card>
    </main>
  )
}
