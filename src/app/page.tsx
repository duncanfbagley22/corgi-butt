'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabase'
import { useRouter } from 'next/navigation'
import { theme } from '../../config/theme'

import Loader from '@/components/v2/other/Loader'
import MainBackground from '@/components/v2/other/MainBackground'
import PageTitle from '@/components/v2/headings/PageTitle'
import LandingImage from '@/components/v2/images/LandingImage'
import PrimaryButton from '@/components/v2/ui/buttons/PrimaryButton'
import { ArrowRight } from 'lucide-react'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user)  {
        router.push('/dashboard2')
      }
      setLoading(false)
    })
  }, [router])

  useEffect(() => {
  // Disable scrolling
  document.body.style.overflow = 'hidden'

  return () => {
    // Re-enable scrolling when component unmounts
    document.body.style.overflow = ''
  }
}, [])
  // Show loader while loading
  return (
    <MainBackground color={theme.colors.background}>
      {loading ? (
        <Loader 
          primaryColor={theme.colors.secondary}
          secondaryColor={theme.colors.accent}
        />
      ) : (
        <div className="flex flex-col items-center justify-start min-h-screen pt-2 sm:pt-10">
          <PageTitle text="Corgi Butt" />
          <LandingImage
            src="/images/Corgi-Butt-Landing.png"
            alt="Corgi Butt Landing"
            maxWidth='max-w-[300]'
          />
          <PrimaryButton
            text="Get Started"
            color={theme.colors.secondary}
            className="mt-6 px-10"
            icon={true}
            iconComponent={<ArrowRight size={24} />}
            onClick={() => router.push('/login2')}
            />
        </div>
      )}
    </MainBackground>
  )
}
