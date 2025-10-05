import Sparkles from '@/components/ui/other/background/Sparkles'
import DiagonalStripe from '@/components/ui/other/background/DiagonalStripe'

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">


      {/* Blue gradient background */}
<div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-100 to-blue-300 dark:from-blue-950 dark:via-blue-900 dark:to-blue-800" />      {/* Sparkles layer */}
      <Sparkles />
      {/* Diagonal stripe layer */}
      <DiagonalStripe />
      
    </div>
  )
}