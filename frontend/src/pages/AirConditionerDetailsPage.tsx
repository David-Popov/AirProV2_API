import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  ChevronLeft, 
  Loader2,
  Zap,
  AlertTriangle,
  Snowflake
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { airConditionerService } from '@/services'
import type { AirConditioner, ErrorCode } from '@/types'

export default function AirConditionerDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [ac, setAc] = useState<AirConditioner | null>(null)
  const [errorCodes, setErrorCodes] = useState<ErrorCode[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const [acData, errorsData] = await Promise.all([
          airConditionerService.getById(id),
          airConditionerService.getErrorCodes(id, 1, 100) // Fetch up to 100 codes
        ])
        setAc(acData)
        setErrorCodes(errorsData.items)
      } catch (error) {
        toast.error(t('common.unknown_error'))
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center ml-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!ac) {
    return (
      <div className="min-h-screen bg-background p-8 ml-64 text-foreground">
        Item not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8 ml-64 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/air-conditioners')}
          className="text-muted-foreground hover:text-foreground mb-4 pl-0"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('air_conditioners.title')}
        </Button>
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-foreground">{ac.name}</h1>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {ac.brand}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Image Section */}
        <div className="bg-muted/30 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center border border-border">
           {ac.image_url ? (
             <img src={ac.image_url} alt={ac.name} className="w-full h-full object-cover" />
           ) : (
             <div className="text-muted-foreground/50 flex flex-col items-center">
               <Snowflake className="w-24 h-24 mb-4 opacity-50" />
               <span className="text-sm">No Image Available</span>
             </div>
           )}
        </div>

        {/* Info Section */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-foreground">{t('air_conditioners.details')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">{t('air_conditioners.model')}</p>
                  <p className="text-foreground font-medium text-lg">{ac.model || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">{t('air_conditioners.price')}</p>
                  <p className="text-green-500 font-bold text-lg">${ac.price}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">{t('air_conditioners.kilowatts')}</p>
                  <div className="flex items-center gap-2 text-foreground font-medium text-lg">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    {ac.kilowatts} kW
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-muted-foreground text-sm mb-2">{t('common.notes')}</p>
                <p className="text-foreground/80 leading-relaxed">
                  {ac.description || 'No description available for this unit.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Codes Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            {t('air_conditioners.error_codes')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errorCodes.length === 0 ? (
            <p className="text-muted-foreground italic">No error codes registered for this unit.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {errorCodes.map((code) => (
                <div key={code.id} className="p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xl font-bold text-destructive">{code.code}</span>
                  </div>
                  <p className="text-foreground/80 text-sm">{code.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
