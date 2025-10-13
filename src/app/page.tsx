'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabase'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (!data.user || error) {
        router.push('/login')
      } else {
        setUser(data.user)
        router.push('/dashboard')
      }
    })
  }, [router])

  if (!user) return <p>Loading...</p>

  return (
    <main className="p-8">
      <p>Logged in as: {user.user_metadata?.display_name || user.email}</p>
    </main>
    
  )
}
