import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Loader2,
  Zap,
  AlertTriangle,
  Snowflake,
  Info
} from 'lucide-react'
import { BackButton } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const [selectedErrorCode, setSelectedErrorCode] = useState<ErrorCode | null>(null)

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
      <div className="min-h-screen bg-background pt-16 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-64 lg:pt-8 text-foreground">
        Item not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-64 lg:pt-8 transition-colors duration-300">
      {/* Back Button */}
      <BackButton onClick={() => navigate('/air-conditioners')} />

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{ac.name}</h1>
          <Badge variant="secondary" className="text-base sm:text-lg px-3 py-1">
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

      {/* Technical Specifications Section */}
      {(ac.pipe_size_liquid || ac.pipe_size_gas || ac.max_pipe_length || ac.max_height_difference ||
        ac.refrigerant_type || ac.factory_refrigerant_charge || ac.power_supply_location || 
        ac.cable_section || ac.recommended_fuse || ac.indoor_dimensions || ac.outdoor_dimensions ||
        ac.weight_indoor || ac.weight_outdoor) && (
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              {t('air_conditioners.technical_specs', 'Technical Specifications')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Piping Section */}
              {(ac.pipe_size_liquid || ac.pipe_size_gas || ac.max_pipe_length || ac.max_height_difference) && (
                <div className="p-4 rounded-xl bg-background/50 border border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded"></div>
                    {t('air_conditioners.piping', 'Piping')}
                  </h3>
                  <div className="space-y-3">
                    {ac.pipe_size_liquid && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t('air_conditioners.liquid_pipe', 'Liquid Pipe')}</p>
                        <p className="text-foreground font-medium">{ac.pipe_size_liquid}</p>
                      </div>
                    )}
                    {ac.pipe_size_gas && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t('air_conditioners.gas_pipe', 'Gas Pipe')}</p>
                        <p className="text-foreground font-medium">{ac.pipe_size_gas}</p>
                      </div>
                    )}
                    {ac.max_pipe_length && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t('air_conditioners.max_pipe_length', 'Max Pipe Length')}</p>
                        <p className="text-foreground font-medium">{ac.max_pipe_length}m</p>
                      </div>
                    )}
                    {ac.max_height_difference && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t('air_conditioners.max_height_diff', 'Max Height Difference')}</p>
                        <p className="text-foreground font-medium">{ac.max_height_difference}m</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Refrigerant Section */}
              {(ac.refrigerant_type || ac.factory_refrigerant_charge) && (
                <div className="p-4 rounded-xl bg-background/50 border border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-blue-500 rounded"></div>
                    {t('air_conditioners.refrigerant', 'Refrigerant')}
                  </h3>
                  <div className="space-y-3">
                    {ac.refrigerant_type && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t('air_conditioners.refrigerant_type', 'Type')}</p>
                        <p className="text-foreground font-medium">{ac.refrigerant_type}</p>
                      </div>
                    )}
                    {ac.factory_refrigerant_charge && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t('air_conditioners.factory_charge', 'Factory Charge')}</p>
                        <p className="text-foreground font-medium">{ac.factory_refrigerant_charge}g</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Electrical Section */}
              {(ac.power_supply_location || ac.cable_section || ac.recommended_fuse) && (
                <div className="p-4 rounded-xl bg-background/50 border border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-yellow-500 rounded"></div>
                    {t('air_conditioners.electrical', 'Electrical')}
                  </h3>
                  <div className="space-y-3">
                    {ac.power_supply_location && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t('air_conditioners.power_supply', 'Power Supply')}</p>
                        <p className="text-foreground font-medium">{ac.power_supply_location}</p>
                      </div>
                    )}
                    {ac.cable_section && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t('air_conditioners.cable_section', 'Cable Section')}</p>
                        <p className="text-foreground font-medium">{ac.cable_section}</p>
                      </div>
                    )}
                    {ac.recommended_fuse && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t('air_conditioners.recommended_fuse', 'Recommended Fuse')}</p>
                        <p className="text-foreground font-medium">{ac.recommended_fuse}A</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Indoor Unit Dimensions & Weight */}
              {(ac.indoor_dimensions || ac.weight_indoor) && (
                <div className="p-4 rounded-xl bg-background/50 border border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-green-500 rounded"></div>
                    {t('air_conditioners.indoor_unit', 'Indoor Unit')}
                  </h3>
                  <div className="space-y-3">
                    {ac.indoor_dimensions && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t('air_conditioners.dimensions', 'Dimensions')}</p>
                        <p className="text-foreground font-medium">{ac.indoor_dimensions}</p>
                      </div>
                    )}
                    {ac.weight_indoor && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t('air_conditioners.weight', 'Weight')}</p>
                        <p className="text-foreground font-medium">{ac.weight_indoor}kg</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Outdoor Unit Dimensions & Weight */}
              {(ac.outdoor_dimensions || ac.weight_outdoor) && (
                <div className="p-4 rounded-xl bg-background/50 border border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 bg-orange-500 rounded"></div>
                    {t('air_conditioners.outdoor_unit', 'Outdoor Unit')}
                  </h3>
                  <div className="space-y-3">
                    {ac.outdoor_dimensions && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t('air_conditioners.dimensions', 'Dimensions')}</p>
                        <p className="text-foreground font-medium">{ac.outdoor_dimensions}</p>
                      </div>
                    )}
                    {ac.weight_outdoor && (
                      <div>
                        <p className="text-xs text-muted-foreground">{t('air_conditioners.weight', 'Weight')}</p>
                        <p className="text-foreground font-medium">{ac.weight_outdoor}kg</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Codes Section */}
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
                <div 
                  key={code.id} 
                  className="p-4 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden"
                  onClick={() => setSelectedErrorCode(code)}
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Info className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xl font-bold text-destructive">{code.error_code}</span>
                    {code.severity && (
                      <Badge variant={code.severity === 'Critical' ? 'destructive' : 'outline'} className="text-xs">
                        {code.severity}
                      </Badge>
                    )}
                  </div>
                  <p className="text-foreground/80 text-sm line-clamp-2">{code.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Code Details Dialog */}
      <Dialog open={!!selectedErrorCode} onOpenChange={(open) => !open && setSelectedErrorCode(null)}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-2xl font-bold text-destructive">
                {selectedErrorCode?.error_code}
              </span>
              {selectedErrorCode?.severity && (
                <Badge variant={selectedErrorCode.severity === 'Critical' ? 'destructive' : 'outline'}>
                  {selectedErrorCode.severity}
                </Badge>
              )}
            </div>
            <DialogTitle className="text-xl">
              {selectedErrorCode?.error_name || t('air_conditioners.error_details', 'Error Details')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                {t('air_conditioners.description', 'Description')}
              </h4>
              <p className="text-foreground">
                {selectedErrorCode?.description || t('common.no_description', 'No description available')}
              </p>
            </div>

            {selectedErrorCode?.solution && (
              <div className="space-y-2 bg-green-500/10 p-4 rounded-lg border border-green-500/20">
                <h4 className="font-semibold text-sm text-green-600 dark:text-green-400 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {t('air_conditioners.solution', 'Solution')}
                </h4>
                <p className="text-foreground font-medium">
                  {selectedErrorCode.solution}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
