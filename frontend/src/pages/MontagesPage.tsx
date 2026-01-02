import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Calendar,
  MapPin,
  CreditCard,
  Snowflake
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { montageService } from '@/services'
import { 
  type Montage, 
  type CreateMontageRequest,
  type UpdateMontageRequest,
  MONTAGE_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS
} from '@/types'

// Extended type for form state
interface MontageFormState extends CreateMontageRequest {
  id?: string;
  indoor_unit_serial?: string;
  outdoor_unit_serial?: string;
  paid_amount?: number;
  payment_status?: string;
}

export default function MontagesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [items, setItems] = useState<Montage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const initialFormState: MontageFormState = {
    client_name: '',
    client_phone: '',
    client_email: '',
    client_address: '',
    client_city: '',
    installation_date: new Date().toISOString().split('T')[0],
    status: 'Planned',
    notes: '',
    total_price: 0,
    paid_amount: 0,
    payment_status: 'NotPaid',
    indoor_unit_serial: '',
    outdoor_unit_serial: ''
  }

  const [formData, setFormData] = useState<MontageFormState>(initialFormState)

  // Status Colors (Adaptive for Light/Dark)
  const statusColors: Record<string, string> = {
    'Planned': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'InProgress': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    'Completed': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    'Canceled': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    'Overdue': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  }

  const loadItems = async () => {
    setIsLoading(true)
    try {
      const response = await montageService.getAll(page, 10)
      setItems(response.items)
      setTotalPages(response.totalPages) 
    } catch (error) {
      toast.error(t('common.unknown_error'))
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [page])

  const handleCreate = () => {
    setIsEditing(false)
    setFormData(initialFormState)
    setIsDialogOpen(true)
  }

  const handleEditClick = (e: React.MouseEvent, item: Montage) => {
    e.stopPropagation()
    setIsEditing(true)
    setFormData({
      id: item.id,
      client_name: item.client_name,
      client_phone: item.client_phone || '',
      client_email: item.client_email || '',
      client_address: item.client_address || '',
      client_city: item.client_city || '',
      installation_date: item.installation_date,
      status: item.status || 'Planned',
      notes: item.notes || '',
      total_price: item.total_price || 0,
      paid_amount: item.paid_amount || 0,
      payment_status: item.payment_status || 'NotPaid',
      indoor_unit_serial: item.indoor_unit_serial || '',
      outdoor_unit_serial: item.outdoor_unit_serial || ''
    })
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (isEditing && formData.id) {
        // Update
        const updatePayload: UpdateMontageRequest = {
          client_name: formData.client_name,
          client_phone: formData.client_phone,
          client_email: formData.client_email,
          client_address: formData.client_address,
          client_city: formData.client_city,
          installation_date: formData.installation_date,
          status: formData.status,
          notes: formData.notes,
          total_price: formData.total_price,
          paid_amount: formData.paid_amount,
          payment_status: formData.payment_status,
          indoor_unit_serial: formData.indoor_unit_serial,
          outdoor_unit_serial: formData.outdoor_unit_serial
        }
        await montageService.update(formData.id, updatePayload)
        toast.success(t('common.save')) 
      } else {
        // Create
        await montageService.create(formData)
        toast.success(t('common.save'))
      }
      setIsDialogOpen(false)
      loadItems()
    } catch (error) {
      toast.error(t('common.unknown_error'))
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm(t('common.confirm_delete'))) return

    try {
      await montageService.delete(id)
      toast.success(t('common.delete'))
      loadItems()
    } catch (error) {
      toast.error(t('common.unknown_error'))
    }
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-primary" />
            {t('montages.title')}
          </h1>
          <p className="text-muted-foreground">{t('montages.subtitle')}</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          {t('montages.new_montage')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t('montages.search_placeholder')}
            className="pl-10 bg-background/50 border-input text-foreground hover:bg-background/80 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-muted/30">
              <TableHead className="text-muted-foreground font-medium">{t('montages.client')}</TableHead>
              <TableHead className="text-muted-foreground font-medium">{t('common.date')}</TableHead>
              <TableHead className="text-muted-foreground font-medium">{t('common.location')}</TableHead>
              <TableHead className="text-muted-foreground font-medium">{t('montages.ac_unit')}</TableHead>
              <TableHead className="text-muted-foreground font-medium">{t('common.status')}</TableHead>
              <TableHead className="text-muted-foreground font-medium">{t('montages.financials')}</TableHead>
              <TableHead className="text-center text-muted-foreground font-medium">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  {t('montages.no_montages')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow 
                  key={item.id} 
                  className="border-border hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/montages/${item.id}`)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium">{item.client_name}</span>
                      <span className="text-xs text-muted-foreground">{item.client_phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground/80">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-3 h-3 text-muted-foreground" />
                       {new Date(item.installation_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {item.client_city}, {item.client_address}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground/80">
                    {item.air_conditioner ? (
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <Snowflake className="w-4 h-4 text-primary" />
                          <span className="font-medium">{item.air_conditioner.brand}</span> {item.air_conditioner.model}
                        </span>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[item.status || 'Planned'] || statusColors['Planned']}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-foreground font-medium">
                        <CreditCard className="w-3 h-3 text-green-500" />
                        ${item.total_price || 0}
                      </div>
                        <span className={`text-xs ${item.payment_status === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                        {getPaymentStatusLabel(item.payment_status)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                       <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={(e) => handleEditClick(e, item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={(e) => handleDelete(e, item.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

     {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('common.previous')}
        </Button>
        <span className="text-sm text-muted-foreground">
          {t('common.page', { current: page, total: totalPages || 1 })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
             if (page < totalPages) setPage(p => p + 1)
          }}
          disabled={page >= totalPages}
          className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {t('common.next')}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[700px] max-h-[90vh] overflow-y-auto shadow-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? t('montages.edit_details') : t('montages.new_montage')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid gap-6 py-4">
            
            {/* Client Info */}
            <div className="space-y-4">
               <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">{t('montages.client_info')}</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="clientName">{t('montages.client_name')}</Label>
                    <Input id="clientName" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} className="bg-background border-input" required />
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="clientPhone">{t('auth.phone')}</Label>
                    <Input id="clientPhone" value={formData.client_phone || ''} onChange={(e) => setFormData({...formData, client_phone: e.target.value})} className="bg-background border-input" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="clientEmail">{t('auth.email')}</Label>
                    <Input id="clientEmail" value={formData.client_email || ''} onChange={(e) => setFormData({...formData, client_email: e.target.value})} className="bg-background border-input" />
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="clientCity">{t('montages.client_city')}</Label>
                    <Input id="clientCity" value={formData.client_city || ''} onChange={(e) => setFormData({...formData, client_city: e.target.value})} className="bg-background border-input" />
                  </div>
                  <div className="col-span-2 grid gap-2">
                    <Label htmlFor="clientAddress">{t('montages.client_address')}</Label>
                    <Input id="clientAddress" value={formData.client_address || ''} onChange={(e) => setFormData({...formData, client_address: e.target.value})} className="bg-background border-input" />
                  </div>
               </div>
            </div>

            {/* Installation Details */}
            <div className="space-y-4">
               <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">{t('montages.installation_info')}</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">{t('common.date')}</Label>
                    <Input id="date" type="date" value={formData.installation_date} onChange={(e) => setFormData({...formData, installation_date: e.target.value})} className="bg-background border-input" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">{t('common.status')}</Label>
                    <Select value={formData.status || 'Planned'} onValueChange={(val: string) => setFormData({...formData, status: val})}>
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        {MONTAGE_STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="indoorSerial">{t('montages.indoor_serial')}</Label>
                    <Input id="indoorSerial" value={formData.indoor_unit_serial || ''} onChange={(e) => setFormData({...formData, indoor_unit_serial: e.target.value})} className="bg-background border-input" />
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="outdoorSerial">{t('montages.outdoor_serial')}</Label>
                    <Input id="outdoorSerial" value={formData.outdoor_unit_serial || ''} onChange={(e) => setFormData({...formData, outdoor_unit_serial: e.target.value})} className="bg-background border-input" />
                  </div>
               </div>
            </div>

             {/* Financials */}
            <div className="space-y-4">
               <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">{t('montages.financials')}</h3>
               <div className="grid grid-cols-3 gap-4">
                   <div className="grid gap-2">
                    <Label htmlFor="price">{t('montages.total_price')}</Label>
                    <Input id="price" type="number" value={formData.total_price || 0} onChange={(e) => setFormData({...formData, total_price: Number(e.target.value)})} className="bg-background border-input" />
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="paid">{t('montages.paid_amount')}</Label>
                    <Input id="paid" type="number" value={formData.paid_amount || 0} onChange={(e) => setFormData({...formData, paid_amount: Number(e.target.value)})} className="bg-background border-input" />
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="paymentStatus">{t('montages.payment_status')}</Label>
                     <Select value={formData.payment_status || 'NotPaid'} onValueChange={(val: string) => setFormData({...formData, payment_status: val})}>
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        {PAYMENT_STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value} className="cursor-pointer">{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
               </div>
            </div>

             <div className="grid gap-2">
              <Label htmlFor="notes">{t('common.notes')}</Label>
              <Input
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-background border-input"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
