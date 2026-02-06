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
  Snowflake,
  AlertTriangle,
  Phone,
  Wrench,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { montageService, type MontageFilters } from '@/services/montages'
import { 
  type Montage, 
  type CreateMontageRequest,
  type UpdateMontageRequest,
  MONTAGE_STATUS_OPTIONS
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
  const [maintenanceReminders, setMaintenanceReminders] = useState<{
    montage: Montage
    maintenanceDate: Date
    daysUntil: number
    isOverdue: boolean
  }[]>([])

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
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<MontageFilters>({})
  const [tempFilters, setTempFilters] = useState<MontageFilters>({})

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, activeFilters])

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Montage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const statusColors: Record<string, string> = {
    'Planned': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'InProgress': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    'Completed': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    'Canceled': 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    'Overdue': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  }

  const loadMaintenanceReminders = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const allMontagesResponse = await montageService.getAll(1, 100)
      const allMontages = allMontagesResponse.items

      const reminders = allMontages
        .filter(m => m.status === 'Completed' || m.payment_status === 'Paid')
        .map(m => {
          const installDate = new Date(m.completion_date || m.installation_date)
          const maintenanceDate = new Date(installDate)
          maintenanceDate.setFullYear(maintenanceDate.getFullYear() + 1)

          const timeDiff = maintenanceDate.getTime() - today.getTime()
          const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

          return {
            montage: m,
            maintenanceDate,
            daysUntil,
            isOverdue: daysUntil < 0
          }
        })
        .filter(r => r.daysUntil <= 60)
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 5)

      setMaintenanceReminders(reminders)
    } catch (error) {
      console.error('Failed to load maintenance reminders:', error)
    }
  }

  const loadItems = async () => {
    setIsLoading(true)
    try {
      const response = await montageService.getAll(page, 10, {
        ...activeFilters,
        clientName: searchTerm
      })
      setItems(response.items)
      setTotalPages(response.totalPages)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadMaintenanceReminders()
  }, [])

  useEffect(() => {
    loadItems()
  }, [page, activeFilters, searchTerm])

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
    
    const validationErrors: string[] = []
    
    if (!formData.client_name?.trim()) {
      validationErrors.push(t('validation.client_name_required', 'Client name is required'))
    }
    if (!formData.installation_date) {
      validationErrors.push(t('validation.date_required', 'Installation date is required'))
    }
    if (formData.total_price != null && formData.total_price < 0) {
      validationErrors.push(t('validation.price_invalid', 'Price must be 0 or greater'))
    }
    
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('. '))
      return
    }
    
    setIsSaving(true)
    try {
      if (isEditing && formData.id) {
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
        toast.success(t('montages.updated_success', 'Montage updated successfully')) 
      } else {
        await montageService.create(formData)
        toast.success(t('montages.created_success', 'Montage created successfully'))
      }
      setIsDialogOpen(false)
      loadItems()
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, item: Montage) => {
    e.stopPropagation()
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    
    setIsDeleting(true)
    try {
      await montageService.delete(itemToDelete.id)
      toast.success(t('montages.deleted_success', 'Montage deleted successfully'))
      loadItems()
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const getStatusLabel = (val?: string | null) => {
    if (!val) return t('montages.status_planned', 'Planned')
    const statusMap: Record<string, string> = {
      'Planned': t('montages.status_planned', 'Planned'),
      'InProgress': t('montages.status_in_progress', 'In Progress'),
      'Completed': t('montages.status_completed', 'Completed'),
      'Canceled': t('montages.status_canceled', 'Cancelled'),
      'Overdue': t('montages.status_overdue', 'Overdue')
    }
    return statusMap[val] || val
  }
  
  const getPaymentStatusLabel = (val?: string | null) => {
    if (!val) return t('montages.payment_not_paid', 'Not Paid')
    const paymentStatusMap: Record<string, string> = {
      'NotPaid': t('montages.payment_not_paid', 'Not Paid'),
      'PartiallyPaid': t('montages.payment_partially_paid', 'Partially Paid'),
      'Paid': t('montages.payment_paid', 'Paid'),
      'Overdue': t('montages.payment_overdue', 'Overdue')
    }
    return paymentStatusMap[val] || val
  }

  return (
    <div className="min-h-screen bg-background pt-16 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-64 lg:pt-8 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
            {t('montages.title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t('montages.subtitle')}</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          {t('montages.new_montage')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t('montages.search_placeholder', 'Search by client name...')}
            className="pl-10 bg-background/50 border-input text-foreground hover:bg-background/80 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
            variant="outline" 
            className="relative border-border hover:bg-accent text-foreground"
            onClick={() => {
              setTempFilters(activeFilters)
              setIsFilterOpen(true)
            }}
        >
          <Filter className="w-4 h-4 mr-2" />
          {t('common.filter', 'Filter')}
          {Object.keys(activeFilters).length > 0 && (
            <span className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-[10px]">
              {Object.keys(activeFilters).length}
            </span>
          )}
        </Button>
      </div>

      {/* Maintenance Reminders */}
      <Card className="glass-card mb-4 sm:mb-6 border-orange-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center gap-2 text-base sm:text-lg flex-wrap">
            <Wrench className="w-5 h-5 text-orange-400" />
            {t('dashboard.maintenance_reminders', 'Maintenance Reminders')}
            {maintenanceReminders.length > 0 && (
              <Badge variant="outline" className="ml-2 bg-orange-500/10 text-orange-500 border-orange-500/20">
                {maintenanceReminders.length}
              </Badge>
            )}
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t('dashboard.maintenance_reminders_desc', 'Clients due for annual AC maintenance service')}
          </p>
        </CardHeader>
        <CardContent>
          {maintenanceReminders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
              {maintenanceReminders.map(({ montage, maintenanceDate, daysUntil, isOverdue }) => (
                <div 
                  key={montage.id} 
                  onClick={() => navigate(`/montages/${montage.id}`)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isOverdue 
                      ? 'border-red-500/50 bg-red-500/5 hover:border-red-500' 
                      : daysUntil <= 14 
                        ? 'border-orange-500/50 bg-orange-500/5 hover:border-orange-500'
                        : 'border-border bg-background/50 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-full ${
                      isOverdue ? 'bg-red-500/10' : daysUntil <= 14 ? 'bg-orange-500/10' : 'bg-primary/10'
                    }`}>
                      <Phone className={`w-4 h-4 ${
                        isOverdue ? 'text-red-500' : daysUntil <= 14 ? 'text-orange-500' : 'text-primary'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{montage.client_name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {montage.client_phone || t('common.no_phone', 'No phone')}
                      </p>
                    </div>
                  </div>
                  <div className={`text-xs font-medium ${
                    isOverdue ? 'text-red-500' : daysUntil <= 14 ? 'text-orange-500' : 'text-muted-foreground'
                  }`}>
                    {isOverdue 
                      ? t('dashboard.overdue_days', '{{days}} days overdue', { days: Math.abs(daysUntil) })
                      : daysUntil === 0 
                        ? t('dashboard.due_today', 'Due today')
                        : t('dashboard.due_in_days', 'In {{days}} days', { days: daysUntil })
                    }
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {maintenanceDate.toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Wrench className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p>{t('dashboard.no_maintenance_due', 'No maintenance due in the next 60 days')}</p>
              <p className="text-sm mt-1">{t('dashboard.maintenance_auto_calc', 'Maintenance is calculated 1 year after installation')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table - Desktop */}
      <div className="hidden md:block glass-card rounded-xl overflow-hidden">
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
                  <TableCell className="text-muted-foreground w-[220px]">
                    <div className="flex items-center gap-2 max-w-[200px]">
                      <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="truncate" title={`${item.client_city}, ${item.client_address}`}>
                        {item.client_city}, {item.client_address}
                      </span>
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
                    <div className="flex items-center gap-1">
                      {/* Previous Status Arrow */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-muted"
                        onClick={async (e) => {
                          e.stopPropagation()
                          const currentIndex = MONTAGE_STATUS_OPTIONS.findIndex(opt => opt.value === (item.status || 'Planned'))
                          if (currentIndex > 0) {
                            const newStatus = MONTAGE_STATUS_OPTIONS[currentIndex - 1].value
                            try {
                              await montageService.updateStatus(item.id, newStatus)
                              toast.success(t('montages.status_updated', 'Status updated'))
                              loadItems()
                            } catch (error) {
                              console.error('Status update error:', error)
                              toast.error(t('common.unknown_error'))
                            }
                          }
                        }}
                        disabled={MONTAGE_STATUS_OPTIONS.findIndex(opt => opt.value === (item.status || 'Planned')) === 0}
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </Button>

                      {/* Status Badge */}
                      <Badge variant="outline" className={statusColors[item.status || 'Planned'] || statusColors['Planned']}>
                        {getStatusLabel(item.status)}
                      </Badge>

                      {/* Next Status Arrow */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-muted"
                        onClick={async (e) => {
                          e.stopPropagation()
                          const currentIndex = MONTAGE_STATUS_OPTIONS.findIndex(opt => opt.value === (item.status || 'Planned'))
                          if (currentIndex >= 0 && currentIndex < MONTAGE_STATUS_OPTIONS.length - 1) {
                            const newStatus = MONTAGE_STATUS_OPTIONS[currentIndex + 1].value
                            try {
                              await montageService.updateStatus(item.id, newStatus)
                              toast.success(t('montages.status_updated', 'Status updated'))
                              loadItems()
                            } catch (error) {
                              console.error('Status update error:', error)
                              toast.error(t('common.unknown_error'))
                            }
                          }
                        }}
                        disabled={MONTAGE_STATUS_OPTIONS.findIndex(opt => opt.value === (item.status || 'Planned')) === MONTAGE_STATUS_OPTIONS.length - 1}
                      >
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
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
                        onClick={(e) => handleDeleteClick(e, item)}
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>{t('montages.no_montages')}</p>
          </div>
        ) : (
          items.map((item) => (
            <Card 
              key={item.id} 
              className="glass-card cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => navigate(`/montages/${item.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{item.client_name}</h3>
                    <p className="text-xs text-muted-foreground">{item.client_phone}</p>
                  </div>
                  <Badge variant="outline" className={statusColors[item.status || 'Planned'] || statusColors['Planned']}>
                    {getStatusLabel(item.status)}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span className="truncate">{new Date(item.installation_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.client_city}, {item.client_address}</span>
                  </div>
                  {item.air_conditioner && (
                    <div className="flex items-center gap-2 text-foreground">
                      <Snowflake className="w-3 h-3 shrink-0 text-primary" />
                      <span className="truncate">{item.air_conditioner.brand} {item.air_conditioner.model}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <CreditCard className="w-3 h-3 shrink-0 text-green-500" />
                    <span>${item.total_price || 0}</span>
                    <span className={`text-xs ml-auto ${item.payment_status === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                      {getPaymentStatusLabel(item.payment_status)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={(e) => handleEditClick(e, item)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    {t('common.edit', 'Edit')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 text-xs text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={(e) => handleDeleteClick(e, item)}
                  >
                    <Trash className="w-3 h-3 mr-1" />
                    {t('common.delete', 'Delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

     {/* Pagination */}
      <div className="flex items-center justify-center sm:justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">{t('common.previous')}</span>
        </Button>
        <span className="text-xs sm:text-sm text-muted-foreground px-2">
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
          <span className="hidden sm:inline mr-1">{t('common.next')}</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('common.filter', 'Filter Montages')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            {/* Status Filter */}
            <div className="grid gap-2">
              <Label>{t('common.status', 'Status')}</Label>
              <Select 
                value={tempFilters.status || 'All'} 
                onValueChange={(val) => setTempFilters({...tempFilters, status: val === 'All' ? undefined : val})}
              >
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder={t('common.all', 'All')} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="All">{t('common.all', 'All')}</SelectItem>
                  <SelectItem value="Planned">{t('montages.status_planned', 'Planned')}</SelectItem>
                  <SelectItem value="InProgress">{t('montages.status_in_progress', 'In Progress')}</SelectItem>
                  <SelectItem value="Completed">{t('montages.status_completed', 'Completed')}</SelectItem>
                  <SelectItem value="Canceled">{t('montages.status_canceled', 'Cancelled')}</SelectItem>
                  <SelectItem value="Overdue">{t('montages.status_overdue', 'Overdue')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Client Phone */}
            <div className="grid gap-2">
              <Label>{t('auth.phone', 'Phone')}</Label>
              <Input 
                placeholder={t('montages.search_phone', 'Search by phone...')}
                value={tempFilters.clientPhone || ''}
                onChange={(e) => setTempFilters({...tempFilters, clientPhone: e.target.value})}
                className="bg-background border-input"
              />
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>{t('common.date_range', 'Date Range')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">{t('common.from', 'From')}</Label>
                    <Input 
                        type="date"
                        value={tempFilters.startDate || ''}
                        onChange={(e) => setTempFilters({...tempFilters, startDate: e.target.value})}
                        className="bg-background border-input"
                    />
                </div>
                <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">{t('common.to', 'To')}</Label>
                    <Input 
                        type="date"
                        value={tempFilters.endDate || ''}
                        onChange={(e) => setTempFilters({...tempFilters, endDate: e.target.value})}
                        className="bg-background border-input"
                    />
                </div>
              </div>
            </div>

          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button 
                onClick={() => {
                    setActiveFilters(tempFilters)
                    setIsFilterOpen(false)
                }} 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t('common.apply_filters', 'Apply Filters')}
            </Button>
            <Button 
                variant="outline" 
                onClick={() => {
                    setTempFilters({})
                    setActiveFilters({})
                    setIsFilterOpen(false)
                }} 
                className="w-full border-border hover:bg-accent text-foreground"
            >
              {t('common.clear_filters', 'Clear Filters')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border text-card-foreground max-w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{isEditing ? t('montages.edit_details') : t('montages.new_montage')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid gap-4 sm:gap-6 py-4">
            
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
                        <SelectItem value="Planned" className="cursor-pointer">{t('montages.status_planned', 'Planned')}</SelectItem>
                        <SelectItem value="InProgress" className="cursor-pointer">{t('montages.status_in_progress', 'In Progress')}</SelectItem>
                        <SelectItem value="Completed" className="cursor-pointer">{t('montages.status_completed', 'Completed')}</SelectItem>
                        <SelectItem value="Canceled" className="cursor-pointer">{t('montages.status_canceled', 'Cancelled')}</SelectItem>
                        <SelectItem value="Overdue" className="cursor-pointer">{t('montages.status_overdue', 'Overdue')}</SelectItem>
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
                        <SelectItem value="NotPaid" className="cursor-pointer">{t('montages.payment_not_paid', 'Not Paid')}</SelectItem>
                        <SelectItem value="PartiallyPaid" className="cursor-pointer">{t('montages.payment_partially_paid', 'Partially Paid')}</SelectItem>
                        <SelectItem value="Paid" className="cursor-pointer">{t('montages.payment_paid', 'Paid')}</SelectItem>
                        <SelectItem value="Overdue" className="cursor-pointer">{t('montages.payment_overdue', 'Overdue')}</SelectItem>
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {t('common.confirm_delete_title', 'Delete Montage')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {t('montages.delete_confirmation', 'Are you sure you want to delete this montage? This action cannot be undone.')}
              {itemToDelete && (
                <span className="block mt-2 font-medium text-foreground">
                  {itemToDelete.client_name} - {new Date(itemToDelete.installation_date).toLocaleDateString()}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
