'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'

type Status = 'idle' | 'saving' | 'saved' | 'error'

export function ProfileForm({
  userId,
  initialDisplayName,
}: {
  userId: string
  initialDisplayName: string
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('saving')
    setError(null)

    const supabase = createClient()
    // RLS limits the update to the owner's row; .select() reveals a silent 0-row update.
    const { data, error } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', userId)
      .select('id')

    if (error || !data?.length) {
      setError(error?.message ?? '프로필을 저장하지 못했습니다.')
      setStatus('error')
      return
    }
    setStatus('saved')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="display-name">표시 이름</Label>
        <Input
          id="display-name"
          maxLength={50}
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value)
            setStatus('idle')
          }}
        />
      </div>
      {status === 'error' && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {status === 'saved' && (
        <p role="status" className="text-sm text-muted-foreground">
          저장했습니다.
        </p>
      )}
      <Button type="submit" disabled={status === 'saving'} className="self-start">
        {status === 'saving' ? '저장하는 중...' : '저장'}
      </Button>
    </form>
  )
}
