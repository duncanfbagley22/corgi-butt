// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/supabase'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  email: string
  full_name: string
  display_name?: string
  avatar_url: string
  created_at: string
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser()
    

      if (authError || !authData?.user) {
        router.push('/auth/login')
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, display_name, avatar_url, created_at')
        .eq('id', authData.user.id)
        .single()

      if (userError || !userData) {
        console.error('Error fetching user:', userError)
        router.push('/auth/login')
        return
      }

      setUser(userData)
      setLoading(false)
    }

    fetchUser()
  }, [router])

  return { user, loading }
}