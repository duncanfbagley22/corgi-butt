"use client"

import GeometricBackground from "@/components/ui/other/background/Background"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/shadcn/card"
import { Button } from "@/components/ui/shadcn/button"
import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-400">Logging in...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-gray-400">
          You must be logged in to view this page.
        </p>
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-center h-screen">
      <GeometricBackground />

      <Card className="w-full max-w-md shadow-lg z-10">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Corgi Butt</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-xl">
            Welcome, {user.full_name || user.email}!
          </p>
          <Button
            className="w-full"
            onClick={() => router.push("/floorplan")}
          >
            Go to Floorplan
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
