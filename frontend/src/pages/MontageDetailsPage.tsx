import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  ChevronLeft, 
  Loader2,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Barcode,
  ClipboardList
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { montageService } from '@/services'
import { type Montage, MONTAGE_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '@/types'

export default function MontageDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [montage, setMontage] = useState<Montage | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      setIsLoading(true)
      try {
        const data = await montageService.getById(id)
        setMontage(data)
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

  if (!montage) {
    return (
      <div className="min-h-screen bg-background p-8 ml-64 text-foreground">
        Montage not found
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    'Planned': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'InProgress': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    'Completed': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    'Canceled': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    'Overdue': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  }

  const getStatusLabel = (val?: string | null) => {
    if (!val) return 'Planned'
    return MONTAGE_STATUS_OPTIONS.find(o => o.value === val)?.label || val
  }
  
  const getPaymentStatusLabel = (val?: string | null) => {
    if (!val) return 'Not Paid'
    return PAYMENT_STATUS_OPTIONS.find(o => o.value === val)?.label || val
  }

  return (
    <div className="min-h-screen bg-background p-8 ml-64 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/montages')}
          className="text-muted-foreground hover:text-foreground mb-4 pl-0"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          {t('montages.title')}
        </Button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-foreground">{montage.client_name}</h1>
            <Badge variant="outline" className={statusColors[montage.status || 'Planned']}>
              {getStatusLabel(montage.status)}
            </Badge>
          </div>
          {/* We could add Edit button here if needed */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Client Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {t('montages.client_info')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">{t('montages.client_name')}</p>
                <p className="text-foreground">{montage.client_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">{t('auth.phone')}</p>
                <div className="flex items-center gap-2 text-foreground">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    {montage.client_phone || '-'}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">{t('auth.email')}</p>
                 <div className="flex items-center gap-2 text-foreground">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    {montage.client_email || '-'}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">{t('montages.client_city')}</p>
                <div className="flex items-center gap-2 text-foreground">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    {montage.client_city || '-'}
                </div>
              </div>
               <div className="col-span-2">
                <p className="text-muted-foreground text-sm mb-1">{t('montages.client_address')}</p>
                <p className="text-foreground">{montage.client_address || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Installation Info */}
        <Card className="glass-card">
          <CardHeader>
             <CardTitle className="text-foreground flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              {t('montages.installation_info')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">{t('common.date')}</p>
                <div className="flex items-center gap-2 text-foreground">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    {new Date(montage.installation_date).toLocaleDateString()}
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">{t('montages.completion_date')}</p>
                <p className="text-foreground">
                   {montage.completion_date ? new Date(montage.completion_date).toLocaleDateString() : '-'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground text-sm mb-1">{t('montages.ac_unit')}</p>
                <p className="text-foreground font-medium">
                  {montage.air_conditioner ? (
                    `${montage.air_conditioner.brand || ''} ${montage.air_conditioner.model || ''} - ${montage.air_conditioner.name}`
                  ) : (
                    '-'
                  )}
                </p>
              </div>
               <div>
                <p className="text-muted-foreground text-sm mb-1">{t('montages.indoor_serial')}</p>
                <div className="flex items-center gap-2 text-foreground font-mono text-sm">
                    <Barcode className="w-3 h-3 text-muted-foreground" />
                    {montage.indoor_unit_serial || '-'}
                </div>
              </div>
               <div>
                <p className="text-muted-foreground text-sm mb-1">{t('montages.outdoor_serial')}</p>
                <div className="flex items-center gap-2 text-foreground font-mono text-sm">
                    <Barcode className="w-3 h-3 text-muted-foreground" />
                    {montage.outdoor_unit_serial || '-'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financials */}
         <Card className="glass-card h-fit">
          <CardHeader>
             <CardTitle className="text-foreground flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-500" />
              {t('montages.financials')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                <p className="text-muted-foreground text-sm mb-1">{t('montages.total_price')}</p>
                <p className="text-foreground text-xl font-bold">${montage.total_price || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">{t('montages.paid_amount')}</p>
                <p className="text-xl font-bold text-green-500">${montage.paid_amount || 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">{t('montages.payment_status')}</p>
                <Badge variant={montage.payment_status === 'Paid' ? 'default' : 'secondary'} 
                  className={montage.payment_status === 'Paid' ? 'bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/30' : ''}>
                  {getPaymentStatusLabel(montage.payment_status)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

         {/* Notes */}
         <Card className="glass-card h-fit">
          <CardHeader>
             <CardTitle className="text-foreground">{t('common.notes')}</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground leading-relaxed italic">
               {montage.notes || 'No notes.'}
             </p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
