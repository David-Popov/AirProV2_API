import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import confetti from 'canvas-confetti'

export default function SubscriptionSuccessPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    // Celebrate with confetti
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="max-w-md w-full glass-card text-center">
        <CardContent className="pt-12 pb-8 px-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t('subscription.success_title')}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            {t('subscription.success_message')}
          </p>
          
          <div className="space-y-3">
            <Button 
              className="w-full"
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              {t('subscription.go_to_dashboard')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => navigate('/subscription')}
            >
              {t('subscription.view_plans')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
