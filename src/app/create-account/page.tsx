'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/supabase'
import { useRouter } from 'next/navigation'

import { theme } from '../../../config/theme'

import Input from '@/components/v2/ui/inputs/Input'
import Loader from '@/components/v2/other/Loader'
import PageTitle from '@/components/v2/headings/PageTitle'
import PrimaryButton from '@/components/v2/ui/buttons/PrimaryButton'
import MainBackground from '@/components/v2/other/MainBackground'

import { Mail, LockKeyhole, User } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Account created successfully! Redirecting to login...')
      setTimeout(() => {
        router.push('/login2')
      }, 2500)
    }
  }

  return (
    <MainBackground color={theme.colors.background}>
      {loading ? (
        <Loader 
          primaryColor={theme.colors.secondary}
          secondaryColor={theme.colors.accent}
        />
      ) : (
        <div className="flex flex-col items-center justify-start min-h-screen pt-20 px-4 sm:px-0">
          <PageTitle text="Create Account" />
          
          <form onSubmit={handleSignup} className="w-full max-w-md">
            <div className="space-y-6">
              {success && (
                <p className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md animate-fade-in">
                  {success}
                </p>
              )}

              <Input
                id="firstName"
                type="text"
                placeholder="Corgi"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                icon
                iconComponent={<User size={20} />}
                label="First Name"
                required
                focusRingColor={theme.colors.secondary}
                className="w-full sm:w-auto"
              />

              <Input
                id="lastName"
                type="text"
                placeholder="Butt"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                icon
                iconComponent={<User size={20} />}
                label="Last Name"
                required
                focusRingColor={theme.colors.secondary}
                className="w-full sm:w-auto"
              />
              
              <Input
                id="email"
                type="email"
                placeholder="corgi-butt@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon
                iconComponent={<Mail size={20} />}
                label="Email"
                required
                focusRingColor={theme.colors.secondary}
                className="w-full sm:w-auto"
              />
              
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon
                iconComponent={<LockKeyhole size={20} />}
                label="Password"
                required
                focusRingColor={theme.colors.secondary}
                className="w-full sm:w-auto"
              />

              <PrimaryButton
                text="Create Account"
                type="submit"
                color={theme.colors.secondary}
                className="mt-12 w-full sm:w-auto px-10 mx-auto"
              />

              <PrimaryButton
                text="Back to Sign In"
                type="button"
                color={theme.colors.accent}
                className="mt-4 w-full sm:w-auto px-12 mx-auto"
                onClick={() => router.push('/login2')}
              />

              {error && (
                <p className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                  {error}
                </p>
              )}
            </div>
          </form>
        </div>
      )}
    </MainBackground>
  )
}
