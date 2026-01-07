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
  ClipboardList,
  Package,
  Plus,
  Trash2,
  Search
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { montageService, inventoryService, montageInventoryService } from '@/services'
import { type Montage, type InventoryItem, MONTAGE_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '@/types'

export default function MontageDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [montage, setMontage] = useState<Montage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Materials state
  const [isAddingMaterial, setIsAddingMaterial] = useState(false)
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const [isSubmittingMaterial, setIsSubmittingMaterial] = useState(false)
  const [materialSearch, setMaterialSearch] = useState('')

  // Filter items based on search term
  const filteredItems = availableItems.filter(item => {
    if (!materialSearch.trim()) return true
    const search = materialSearch.toLowerCase()
    return (
      item.name.toLowerCase().includes(search) ||
      (item.sku && item.sku.toLowerCase().includes(search))
    )
  })

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

  // Load available inventory items when dialog opens
  useEffect(() => {
    if (isAddingMaterial && availableItems.length === 0) {
      const fetchItems = async () => {
        try {
          // Get all items (pagination might be needed later if list is huge)
          const result = await inventoryService.getAll(1, 100)
          setAvailableItems(result.items.filter(i => (i.quantity ?? 0) > 0))
        } catch (error) {
          console.error('Failed to load inventory', error)
          toast.error('Failed to load inventory items')
        }
      }
      fetchItems()
    }
  }, [isAddingMaterial])

  const handleAddMaterial = async () => {
    if (!montage?.id || !selectedItemId) return

    setIsSubmittingMaterial(true)
    try {
      await montageInventoryService.addMaterials(montage.id, [{
        inventory_item_id: selectedItemId,
        quantity_used: quantity,
        notes: notes
      }])
      
      toast.success(t('montages.material_added', 'Material added successfully'))
      setIsAddingMaterial(false)
      
      // Reset form
      setSelectedItemId('')
      setQuantity(1)
      setNotes('')
      setMaterialSearch('')
      
      // Refresh montage data to show new material
      const updatedMontage = await montageService.getById(montage.id)
      setMontage(updatedMontage)
    } catch (error: any) {
      console.error(error)
      const msg = error.message || t('common.error')
      if (msg.includes('Insufficient stock')) {
        toast.error(t('montages.insufficient_stock', 'Insufficient stock'))
      } else {
        toast.error(msg)
      }
    } finally {
      setIsSubmittingMaterial(false)
    }
  }

  const handleRemoveMaterial = async (materialId: string) => {
    if (!montage?.id || !confirm(t('common.confirm_delete'))) return
    
    try {
      await montageInventoryService.removeMaterial(materialId)
      toast.success(t('montages.material_removed', 'Material removed successfully'))
      
      // Refresh montage data
      const updatedMontage = await montageService.getById(montage.id)
      setMontage(updatedMontage)
    } catch (error) {
      console.error(error)
      toast.error(t('common.error'))
    }
  }

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

        {/* Materials Used */}
        <Card className="glass-card h-fit lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              {t('montages.materials')}
            </CardTitle>
            <Dialog open={isAddingMaterial} onOpenChange={setIsAddingMaterial}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t('montages.add_materials')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('montages.add_materials')}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="item">{t('montages.select_materials')}</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={t('common.search', 'Search...')}
                        value={materialSearch}
                        onChange={(e) => setMaterialSearch(e.target.value)}
                        className="pl-9 mb-2"
                      />
                    </div>
                    <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('montages.select_materials')} />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {filteredItems.length === 0 ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            {t('common.no_results', 'No items found')}
                          </div>
                        ) : (
                          filteredItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.sku}) - {item.quantity} {item.unit_of_measure} available
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">{t('montages.quantity_used')}</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">{t('common.notes')}</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('common.notes')}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                   <Button variant="outline" onClick={() => setIsAddingMaterial(false)}>{t('common.cancel')}</Button>
                   <Button onClick={handleAddMaterial} disabled={isSubmittingMaterial || !selectedItemId}>
                     {isSubmittingMaterial && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                     {t('common.save')}
                   </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
             {montage.used_materials && montage.used_materials.length > 0 ? (
               <div className="space-y-4">
                 {montage.used_materials.map((item) => (
                   <div key={item.id} className="flex justify-between items-start border-b border-border pb-3 last:border-0 last:pb-0">
                     <div>
                       <p className="font-medium text-foreground">{item.item_name || 'Unknown Item'}</p>
                       <p className="text-sm text-muted-foreground">{item.item_sku}</p>
                       {item.notes && <p className="text-sm italic text-muted-foreground mt-1">"{item.notes}"</p>}
                     </div>
                     <div className="flex items-center gap-4">
                       <div className="text-right">
                         <p className="font-bold text-foreground">{item.quantity_used} {item.unit_of_measure}</p>
                         <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                       </div>
                       <Button
                         variant="ghost"
                         size="icon"
                         className="text-muted-foreground hover:text-destructive"
                         onClick={() => handleRemoveMaterial(item.id)}
                       >
                         <Trash2 className="w-4 h-4" />
                       </Button>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-6 text-muted-foreground">
                 <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                 <p>{t('montages.no_materials')}</p>
               </div>
             )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
