import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Wand2
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useAuth } from '@/context'
import { inventoryService } from '@/services'
import type { InventoryItem, CreateInventoryItemRequest, UnitOfMeasure } from '@/types'
import { UNIT_OF_MEASURE_OPTIONS } from '@/types'

export default function InventoryPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentItem, setCurrentItem] = useState<Partial<CreateInventoryItemRequest> & { id?: string }>({})
  const [isSaving, setIsSaving] = useState(false)
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadItems = async () => {
    setIsLoading(true)
    try {
      const response = searchTerm 
        ? await inventoryService.search(searchTerm, page, 10)
        : await inventoryService.getAll(page, 10)
      
      setItems(response.items)
      setTotalPages(response.totalPages)

      // Always fetch low stock items for the alert window
      const lowStockRes = await inventoryService.getLowStock(1, 100)
      setLowStockItems(lowStockRes.items)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [page, searchTerm])

  const handleCreate = () => {
    setIsEditing(false)
    setCurrentItem({
      name: '',
      quantity: 0,
      min_quantity: 5,
      unit_of_measure: 'Pieces',
      sku: '',
      location: '',
      unit_price: 0
    })
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
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Client-side validation
    const validationErrors: string[] = []
    
    if (!currentItem.name?.trim()) {
      validationErrors.push(t('validation.name_required', 'Name is required'))
    }
    if (currentItem.quantity === undefined || currentItem.quantity < 0) {
      validationErrors.push(t('validation.quantity_invalid', 'Quantity must be 0 or greater'))
    }
    if (currentItem.min_quantity != null && currentItem.min_quantity < 0) {
      validationErrors.push(t('validation.min_quantity_invalid', 'Minimum quantity must be 0 or greater'))
    }
    if (currentItem.unit_price != null && currentItem.unit_price < 0) {
      validationErrors.push(t('validation.price_invalid', 'Price must be 0 or greater'))
    }
    
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('. '))
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
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (item: InventoryItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    
    setIsDeleting(true)
    try {
      await inventoryService.delete(itemToDelete.id)
      toast.success(t('inventory.item_deleted'))
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

  const handleStatusChange = async (item: InventoryItem, isActive: boolean) => {
    try {
      await inventoryService.updateStatus(item.id, isActive)
      setItems(items.map(i => i.id === item.id ? { ...i, is_active: isActive } : i))
      toast.success(isActive ? t('inventory.item_activated') : t('inventory.item_deactivated'))
    } catch (error) {
       const message = error instanceof Error ? error.message : t('common.unknown_error')
       toast.error(message)
    }
  }

  const generateSku = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const p1 = result.substring(0, 4)
    const p2 = result.substring(4, 8)
    const sku = `INV-${p1}-${p2}`
    
    setCurrentItem(prev => ({ ...prev, sku }))
  }

  return (
    <div className="min-h-screen bg-background pt-16 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-64 lg:pt-8 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Package className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
            {t('inventory.title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t('inventory.subtitle')}</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          {t('inventory.add_item')}
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t('inventory.search_placeholder')} 
            className="pl-10 bg-background/50 border-input text-foreground hover:bg-background/80 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Low Stock Alerts */}
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
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t('inventory.low_stock_desc', 'Items running low on stock')}
          </p>
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
                      <p className="text-xs text-muted-foreground truncate">
                        SKU: {item.sku || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-orange-500">
                    {t('inventory.remaining_stock', { count: item.quantity })}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t('inventory.min_req', { count: item.min_quantity || 0 })}
                  </div>
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

      {/* Table - Desktop */}
      <div className="hidden md:block glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-muted/30">
              <TableHead className="text-muted-foreground">{t('inventory.name')}</TableHead>
              <TableHead className="text-muted-foreground">{t('inventory.sku')}</TableHead>
              <TableHead className="text-muted-foreground">{t('inventory.quantity')}</TableHead>
              <TableHead className="text-muted-foreground">{t('common.unit_price')}</TableHead>
              <TableHead className="text-muted-foreground">{t('common.location')}</TableHead>
              <TableHead className="text-muted-foreground">{t('common.status')}</TableHead>
              <TableHead className="text-center text-muted-foreground">{t('common.actions')}</TableHead>
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
                  {t('inventory.no_items')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="border-border hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground">{item.sku || '-'}</TableCell>
                  <TableCell className="text-foreground/80">
                    {item.quantity} {item.unit_of_measure}
                  </TableCell>
                   <TableCell className="text-muted-foreground">
                    {item.unit_price ? `€${item.unit_price}` : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.location || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full"
                        disabled={!item.is_active}
                        onClick={() => handleStatusChange(item, false)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      {!item.is_active ? (
                        <Badge variant="outline" className="text-muted-foreground border-muted-foreground whitespace-nowrap">
                          Неактивен
                        </Badge>
                      ) : item.is_low_stock ? (
                        <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 whitespace-nowrap">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {t('inventory.low_stock')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-green-500/20 whitespace-nowrap">
                          {t('inventory.in_stock')}
                        </Badge>
                      )}

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full"
                        disabled={item.is_active}
                        onClick={() => handleStatusChange(item, true)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDeleteClick(item)}
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
            <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>{t('inventory.no_items')}</p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.sku || 'No SKU'}</p>
                  </div>
                  {item.is_low_stock ? (
                    <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 shrink-0">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {t('inventory.low_stock')}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 shrink-0">
                      {t('inventory.in_stock')}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>{t('inventory.quantity')}:</span>
                    <span className="text-foreground font-medium">{item.quantity} {item.unit_of_measure}</span>
                  </div>
                  {item.unit_price && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{t('common.unit_price')}:</span>
                      <span className="text-green-500 font-medium">€{item.unit_price}</span>
                    </div>
                  )}
                  {item.location && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{t('common.location')}:</span>
                      <span className="text-foreground">{item.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    {t('common.edit')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 text-red-500 border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => handleDeleteClick(item)}
                  >
                    <Trash className="w-3 h-3 mr-1" />
                    {t('common.delete')}
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
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <span className="hidden sm:inline mr-1">{t('common.next')}</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border text-card-foreground max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? t('inventory.edit_item') : t('inventory.new_item')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('inventory.name')}</Label>
              <Input
                id="name"
                value={currentItem.name || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                className="bg-background border-input"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">{t('inventory.quantity')}</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={currentItem.quantity || 0}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: Number(e.target.value) })}
                  className="bg-background border-input"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">{t('inventory.unit')}</Label>
                <select
                  id="unit"
                  value={currentItem.unit_of_measure}
                  onChange={(e) => setCurrentItem({ ...currentItem, unit_of_measure: e.target.value as any })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {UNIT_OF_MEASURE_OPTIONS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="min_quantity">{t('inventory.min_quantity')}</Label>
                <Input
                  id="min_quantity"
                  type="number"
                  value={currentItem.min_quantity || 0}
                  onChange={(e) => setCurrentItem({ ...currentItem, min_quantity: Number(e.target.value) })}
                  className="bg-background border-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">{t('inventory.sku')}</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    value={currentItem.sku || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, sku: e.target.value })}
                    className="bg-background border-input flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={generateSku}
                    title={t('inventory.generate_sku')}
                    className="bg-background shrink-0"
                  >
                    <Wand2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">{t('common.unit_price')}</Label>
                <Input
                  id="price"
                  type="number"
                  value={currentItem.unit_price || 0}
                  onChange={(e) => setCurrentItem({ ...currentItem, unit_price: Number(e.target.value) })}
                  className="bg-background border-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">{t('common.location')}</Label>
                <Input
                  id="location"
                  value={currentItem.location || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, location: e.target.value })}
                  className="bg-background border-input"
                />
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {t('common.confirm_delete_title', 'Delete Item')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {t('inventory.delete_confirmation', 'Are you sure you want to delete this item? This action cannot be undone.')}
              {itemToDelete && (
                <span className="block mt-2 font-medium text-foreground">
                  {itemToDelete.name}
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
