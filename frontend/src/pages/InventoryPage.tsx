import { formatCurrency } from '@/lib/formatters'
import { logger } from '@/lib/logger'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Plus,
  AlertTriangle,
  Loader2,
  Wand2,
  MoreVertical,
  History,
  Edit,
  Archive,
  Trash
} from 'lucide-react'
import { toast } from 'sonner'
import { notifyApiError } from '@/lib/apiErrors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader, SearchBar, Pagination, EmptyState, ConfirmDialog, FieldMessage } from '@/components/shared'
import { useFieldValidation } from '@/hooks'
import { required, minLength } from '@/lib/validation-rules'
import { SkeletonTableRows, SkeletonMobileCards } from '@/components/skeletons'
import { useAuth } from '@/context'
import { inventoryService } from '@/services'
import type { InventoryItem, CreateInventoryItemRequest, UnitOfMeasure } from '@/types'
import { UNIT_OF_MEASURE_OPTIONS } from '@/types'
import { generateSKU } from '@/lib/generators'
import { usePageTitle } from '@/hooks/usePageTitle'

type StatusFilter = 'all' | 'in_stock' | 'low_stock' | 'inactive'

function getStockLevel(item: InventoryItem): number {
  if (!item.is_active) return 0
  const max = Math.max((item.min_quantity ?? 0) * 3, 1)
  return Math.min(Math.round((item.quantity / max) * 100), 100)
}

function getStockIndicatorClass(item: InventoryItem): string {
  if (!item.is_active || item.quantity === 0) return 'bg-red-500'
  if (item.is_low_stock) return 'bg-orange-500'
  return 'bg-green-500'
}

function StockStatusBadge({ item }: { item: InventoryItem }) {
  const { t } = useTranslation()
  if (!item.is_active) {
    return (
      <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 border-l-2 border-l-muted-foreground/40 whitespace-nowrap">
        {t('common.inactive', 'Inactive')}
      </Badge>
    )
  }
  if (item.quantity === 0) {
    return (
      <Badge className="bg-red-500/10 text-red-500 border-red-500/20 border-l-2 border-l-red-500 whitespace-nowrap">
        {t('inventory.out_of_stock', 'Out of Stock')}
      </Badge>
    )
  }
  if (item.is_low_stock) {
    return (
      <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 border-l-2 border-l-orange-500/60 whitespace-nowrap">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {t('inventory.low_stock', 'Low Stock')}
      </Badge>
    )
  }
  return (
    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 border-l-2 border-l-green-500/60 whitespace-nowrap">
      {t('inventory.in_stock', 'In Stock')}
    </Badge>
  )
}

export default function InventoryPage() {
  usePageTitle('Inventory')
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentItem, setCurrentItem] = useState<Partial<CreateInventoryItemRequest> & { id?: string }>({})
  const [isSaving, setIsSaving] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const inventoryValidationRules = useMemo(() => ({
    name: [
      required('validation.inventory_name_required'),
      minLength(3, 'validation.inventory_name_min_length'),
    ],
  }), [])

  const inventoryValidation = useFieldValidation(inventoryValidationRules)

  const handleInventoryFieldChange = useCallback((fieldName: string, value: string) => {
    setCurrentItem(prev => ({ ...prev, [fieldName]: value }))
    const fieldState = inventoryValidation.getFieldProps(fieldName)
    if (fieldState.status !== 'idle') {
      inventoryValidation.validateField(fieldName, value)
    }
  }, [inventoryValidation])

  const handleInventoryFieldBlur = useCallback((fieldName: string, value: string) => {
    inventoryValidation.validateField(fieldName, value)
  }, [inventoryValidation])

  const PAGE_SIZE = 10

  const loadItems = async () => {
    setIsLoading(true)
    try {
      const response = searchTerm
        ? await inventoryService.search(searchTerm, page, PAGE_SIZE)
        : await inventoryService.getAll(page, PAGE_SIZE)

      setItems(response.items)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)

      const lowStockRes = await inventoryService.getLowStock(1, 100)
      setLowStockItems(lowStockRes.items)
    } catch (error) {
      notifyApiError(error, t)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [page, searchTerm])

  const filteredItems = items.filter(item => {
    if (statusFilter === 'in_stock') return item.is_active && !item.is_low_stock && item.quantity > 0
    if (statusFilter === 'low_stock') return item.is_active && item.is_low_stock
    if (statusFilter === 'inactive') return !item.is_active
    return true
  })

  const handleCreate = () => {
    setIsEditing(false)
    setCurrentItem({ name: '', quantity: 0, min_quantity: 5, unit_of_measure: 'Pieces', sku: '', location: '', unit_price: 0 })
    inventoryValidation.resetAll()
    setIsDialogOpen(true)
  }

  const handleEdit = (item: InventoryItem) => {
    setIsEditing(true)
    setCurrentItem({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      min_quantity: item.min_quantity,
      unit_of_measure: item.unit_of_measure as UnitOfMeasure,
      sku: item.sku || '',
      location: item.location || '',
      unit_price: item.unit_price || 0
    })
    inventoryValidation.resetAll()
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = inventoryValidation.validateAll(currentItem as unknown as Record<string, unknown>)

    const extraErrors: string[] = []
    if (currentItem.quantity === undefined || currentItem.quantity < 0) extraErrors.push(t('validation.quantity_invalid', 'Quantity must be 0 or greater'))
    if (currentItem.min_quantity != null && currentItem.min_quantity < 0) extraErrors.push(t('validation.min_quantity_invalid', 'Min quantity must be 0 or greater'))
    if (currentItem.unit_price != null && currentItem.unit_price < 0) extraErrors.push(t('validation.price_invalid', 'Price must be 0 or greater'))

    if (!isValid || extraErrors.length > 0) {
      if (extraErrors.length > 0) toast.error(extraErrors.join('. '))
      return
    }

    setIsSaving(true)
    try {
      if (isEditing && currentItem.id) {
        await inventoryService.update(currentItem.id, {
          name: currentItem.name!,
          quantity: currentItem.quantity!,
          min_quantity: currentItem.min_quantity!,
          unit_of_measure: currentItem.unit_of_measure as UnitOfMeasure,
          sku: currentItem.sku,
          location: currentItem.location,
          unit_price: currentItem.unit_price,
          description: '',
          supplier: '',
          notes: '',
          is_active: true
        })
        toast.success(t('inventory.item_updated'))
      } else {
        await inventoryService.create({
          company_id: user?.company_id || '',
          name: currentItem.name!,
          quantity: currentItem.quantity!,
          min_quantity: currentItem.min_quantity!,
          unit_of_measure: currentItem.unit_of_measure as UnitOfMeasure,
          sku: currentItem.sku,
          location: currentItem.location,
          unit_price: currentItem.unit_price,
          description: '',
          supplier: '',
          notes: ''
        })
        toast.success(t('inventory.item_created'))
      }
      setIsDialogOpen(false)
      loadItems()
    } catch (error) {
      notifyApiError(error, t)
      logger.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (item: InventoryItem) => { setItemToDelete(item); setDeleteDialogOpen(true) }
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      await inventoryService.delete(itemToDelete.id)
      toast.success(t('inventory.item_deleted'))
      loadItems()
    } catch (error) {
      notifyApiError(error, t)
    } finally {
      setIsDeleting(false); setDeleteDialogOpen(false); setItemToDelete(null)
    }
  }

  const handleStatusChange = async (item: InventoryItem, isActive: boolean) => {
    try {
      await inventoryService.updateStatus(item.id, isActive)
      setItems(items.map(i => i.id === item.id ? { ...i, is_active: isActive } : i))
      toast.success(isActive ? t('inventory.item_activated') : t('inventory.item_deactivated'))
    } catch (error) {
      notifyApiError(error, t)
    }
  }

  const generateSku = () => setCurrentItem(prev => ({ ...prev, sku: generateSKU() }))

  const startItem = (page - 1) * PAGE_SIZE + 1
  const endItem = Math.min(page * PAGE_SIZE, totalCount)

  return (
    <div className="min-h-screen bg-background pt-14 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8 transition-colors duration-300 animate-fade-in">
      <PageHeader
        title={t('inventory.title')}
        subtitle={t('inventory.subtitle')}
        icon={Package}
        action={
          <Button onClick={handleCreate} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            {t('inventory.add_item')}
          </Button>
        }
      />

      <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder={t('inventory.search_placeholder')} />

      <Card className="glass-card mb-4 sm:mb-6 border-orange-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center gap-2 text-base sm:text-lg flex-wrap">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            {t('inventory.low_stock_alerts', 'Low Stock Alerts')}
            {lowStockItems.length > 0 && (
              <Badge variant="outline" className="ml-2 bg-orange-500/10 text-orange-500 border-orange-500/20">
                {lowStockItems.length}
              </Badge>
            )}
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">{t('inventory.low_stock_desc', 'Items running low on stock')}</p>
        </CardHeader>
        <CardContent>
          {lowStockItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleEdit(item)}
                  className="p-4 rounded-xl border border-orange-500/50 bg-orange-500/5 hover:border-orange-500 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-full bg-orange-500/10">
                      <Package className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">SKU: {item.sku || '-'}</p>
                    </div>
                  </div>
                  <Progress value={getStockLevel(item)} indicatorClassName={getStockIndicatorClass(item)} className="h-1.5 mb-1.5" />
                  <div className="text-xs font-medium text-orange-500">{t('inventory.remaining_stock', { count: item.quantity })}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t('inventory.min_req', { count: item.min_quantity || 0 })}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p>{t('inventory.no_low_stock', 'No items running low')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">{t('common.status')}:</span>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="h-8 w-36 text-xs bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
              <SelectItem value="in_stock">{t('inventory.in_stock', 'In Stock')}</SelectItem>
              <SelectItem value="low_stock">{t('inventory.low_stock', 'Low Stock')}</SelectItem>
              <SelectItem value="inactive">{t('common.inactive', 'Inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {totalCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {t('inventory.showing_count', { start: startItem, end: endItem, total: totalCount, defaultValue: 'Showing {{start}}–{{end}} of {{total}} items' })}
          </span>
        )}
      </div>

      <div className="hidden md:block glass-card rounded-xl overflow-hidden mb-4">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-muted/30">
              <TableHead className="text-muted-foreground">{t('inventory.name')}</TableHead>
              <TableHead className="text-muted-foreground">{t('inventory.sku')}</TableHead>
              <TableHead className="text-muted-foreground">{t('inventory.stock_level', 'Stock Level')}</TableHead>
              <TableHead className="text-muted-foreground">{t('common.unit_price')}</TableHead>
              <TableHead className="text-muted-foreground">{t('common.location')}</TableHead>
              <TableHead className="text-muted-foreground">{t('common.status')}</TableHead>
              <TableHead className="text-center text-muted-foreground">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonTableRows columns={7} />
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  {t('inventory.no_items')}
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => {
                const stockPct = getStockLevel(item)
                const indicatorCls = getStockIndicatorClass(item)
                return (
                  <TableRow key={item.id} className="border-border table-row-interactive animate-fade-in">
                    <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{item.sku || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-25">
                        <Progress value={stockPct} indicatorClassName={indicatorCls} className="h-1.5 w-20" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {item.quantity} {t(`inventory.units.${item.unit_of_measure.toLowerCase()}`, item.unit_of_measure)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.unit_price ? formatCurrency(item.unit_price) : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.location || '—'}</TableCell>
                    <TableCell>
                      <StockStatusBadge item={item} />
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={t('common.actions')} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => navigate(`/inventory/${item.id}/history`)}>
                            <History className="w-4 h-4 mr-2" />
                            {t('inventory.history', 'History')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          {item.is_active ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(item, false)}>
                              <Archive className="w-4 h-4 mr-2 text-orange-500" />
                              <span className="text-orange-500">{t('common.deactivate', 'Deactivate')}</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusChange(item, true)}>
                              <Archive className="w-4 h-4 mr-2 text-green-500" />
                              <span className="text-green-500">{t('common.activate', 'Activate')}</span>
                            </DropdownMenuItem>
                          )}
                          {user?.roles.includes('Manager') && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                                <Trash className="w-4 h-4 mr-2" />
                                {t('common.delete')}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3">
        {isLoading ? (
          <SkeletonMobileCards rows={4} />
        ) : filteredItems.length === 0 ? (
          <EmptyState icon={Package} message={t('inventory.no_items')} />
        ) : (
          filteredItems.map((item, index) => {
            const stockPct = getStockLevel(item)
            const indicatorCls = getStockIndicatorClass(item)
            return (
              <Card key={item.id} className={`glass-card animate-slide-up stagger-${Math.min(index + 1, 8)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{item.sku || t('inventory.no_sku', 'No SKU')}</p>
                    </div>
                    <StockStatusBadge item={item} />
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{t('inventory.stock_level', 'Stock Level')}</span>
                      <span>{item.quantity} {t(`inventory.units.${item.unit_of_measure.toLowerCase()}`, item.unit_of_measure)}</span>
                    </div>
                    <Progress value={stockPct} indicatorClassName={indicatorCls} className="h-1.5" />
                  </div>

                  <div className="space-y-1.5 text-sm mb-3">
                    {item.unit_price && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>{t('common.unit_price')}:</span>
                        <span className="text-green-500 font-medium">{formatCurrency(item.unit_price || 0)}</span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>{t('common.location')}:</span>
                        <span className="text-foreground">{item.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/inventory/${item.id}/history`)}>
                      <History className="w-3 h-3 mr-1" />
                      {t('inventory.history', 'History')}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(item)}>
                      <Edit className="w-3 h-3 mr-1" />
                      {t('common.edit')}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" aria-label={t('common.actions')} className="h-8 w-8 shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {item.is_active ? (
                          <DropdownMenuItem onClick={() => handleStatusChange(item, false)}>
                            <Archive className="w-4 h-4 mr-2 text-orange-500" />
                            <span className="text-orange-500">{t('common.deactivate', 'Deactivate')}</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleStatusChange(item, true)}>
                            <Archive className="w-4 h-4 mr-2 text-green-500" />
                            <span className="text-green-500">{t('common.activate', 'Activate')}</span>
                          </DropdownMenuItem>
                        )}
                        {user?.roles.includes('Manager') && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                              <Trash className="w-4 h-4 mr-2" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        previousLabel={t('common.previous')}
        nextLabel={t('common.next')}
        pageLabel={t('common.page', { current: page, total: totalPages || 1 })}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border text-card-foreground max-w-[95vw] sm:max-w-106.25 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? t('inventory.edit_item') : t('inventory.new_item')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">{t('inventory.name')} *</Label>
              <Input
                id="name"
                value={currentItem.name || ''}
                onChange={(e) => handleInventoryFieldChange('name', e.target.value)}
                onBlur={(e) => handleInventoryFieldBlur('name', e.target.value)}
                aria-invalid={inventoryValidation.getFieldProps('name').status === 'invalid'}
                className="bg-background border-input"
              />
              <FieldMessage {...inventoryValidation.getFieldProps('name')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">{t('inventory.quantity')}</Label>
                <Input id="quantity" type="number" min="0" value={currentItem.quantity || ''} onFocus={() => { if (currentItem.quantity === 0) setCurrentItem({ ...currentItem, quantity: '' as unknown as number }) }} onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value === '' ? 0 : Number(e.target.value) })} className="bg-background border-input" placeholder="0" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">{t('inventory.unit')}</Label>
                <Select value={currentItem.unit_of_measure} onValueChange={(val) => setCurrentItem({ ...currentItem, unit_of_measure: val as UnitOfMeasure })}>
                  <SelectTrigger id="unit" className="bg-background border-input">
                    <SelectValue placeholder={t('inventory.unit')} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {UNIT_OF_MEASURE_OPTIONS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{t(`inventory.units.${u.value.toLowerCase()}`, u.label)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="min_quantity">{t('inventory.min_quantity')}</Label>
                <Input id="min_quantity" type="number" min="0" value={currentItem.min_quantity || ''} onFocus={() => { if (currentItem.min_quantity === 0) setCurrentItem({ ...currentItem, min_quantity: '' as unknown as number }) }} onChange={(e) => setCurrentItem({ ...currentItem, min_quantity: e.target.value === '' ? 0 : Number(e.target.value) })} className="bg-background border-input" placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">{t('inventory.sku')}</Label>
                <div className="flex gap-2">
                  <Input id="sku" value={currentItem.sku || ''} onChange={(e) => setCurrentItem({ ...currentItem, sku: e.target.value })} className="bg-background border-input flex-1" />
                  <Button type="button" variant="outline" size="icon" onClick={generateSku} title={t('inventory.generate_sku')} className="bg-background shrink-0">
                    <Wand2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">{t('common.unit_price')}</Label>
                <Input id="price" type="number" min="0" value={currentItem.unit_price || ''} onFocus={() => { if (currentItem.unit_price === 0) setCurrentItem({ ...currentItem, unit_price: '' as unknown as number }) }} onChange={(e) => setCurrentItem({ ...currentItem, unit_price: e.target.value === '' ? 0 : Number(e.target.value) })} className="bg-background border-input" placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">{t('common.location')}</Label>
                <Input id="location" value={currentItem.location || ''} onChange={(e) => setCurrentItem({ ...currentItem, location: e.target.value })} className="bg-background border-input" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('common.save_changes')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t('common.confirm_delete_title', 'Delete Item')}
        description={t('inventory.delete_confirmation', 'Are you sure you want to delete this item? This action cannot be undone.')}
        itemName={itemToDelete?.name}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        isLoading={isDeleting}
        icon={Trash}
      />

    </div>
  )
}
