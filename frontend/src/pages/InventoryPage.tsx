import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  AlertTriangle, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentItem, setCurrentItem] = useState<Partial<CreateInventoryItemRequest> & { id?: string }>({})
  const [isSaving, setIsSaving] = useState(false)

  const loadItems = async () => {
    setIsLoading(true)
    try {
      const response = searchTerm 
        ? await inventoryService.search(searchTerm, page, 10)
        : await inventoryService.getAll(page, 10)
      
      setItems(response.items)
      setTotalPages(response.total_pages)
    } catch (error) {
      toast.error(t('common.unknown_error'))
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
      toast.error(t('common.unknown_error'))
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm_delete'))) return

    try {
      await inventoryService.delete(id)
      toast.success(t('inventory.item_deleted'))
      loadItems()
    } catch (error) {
      toast.error(t('common.unknown_error'))
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 ml-64">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Package className="w-8 h-8 text-purple-500" />
            {t('inventory.title')}
          </h1>
          <p className="text-gray-400">{t('inventory.subtitle')}</p>
        </div>
        <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          {t('inventory.add_item')}
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input 
            placeholder={t('inventory.search_placeholder')} 
            className="pl-10 bg-slate-900 border-slate-800 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-slate-800 bg-slate-900/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900">
            <TableRow className="border-slate-800 hover:bg-slate-900">
              <TableHead className="text-gray-400">{t('inventory.name')}</TableHead>
              <TableHead className="text-gray-400">{t('inventory.sku')}</TableHead>
              <TableHead className="text-gray-400">{t('inventory.quantity')}</TableHead>
              <TableHead className="text-gray-400">{t('common.unit_price')}</TableHead>
              <TableHead className="text-gray-400">{t('common.location')}</TableHead>
              <TableHead className="text-gray-400">{t('common.status')}</TableHead>
              <TableHead className="text-right text-gray-400">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                  {t('inventory.no_items')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-white">{item.name}</TableCell>
                  <TableCell className="text-gray-400">{item.sku || '-'}</TableCell>
                  <TableCell className="text-gray-300">
                    {item.quantity} {item.unit_of_measure}
                  </TableCell>
                   <TableCell className="text-gray-400">
                    {item.unit_price ? `$${item.unit_price}` : '-'}
                  </TableCell>
                  <TableCell className="text-gray-400">{item.location || '-'}</TableCell>
                  <TableCell>
                    {item.is_low_stock ? (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {t('inventory.low_stock')}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                        {t('inventory.in_stock')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-gray-300">
                        <DropdownMenuItem onClick={() => handleEdit(item)} className="hover:bg-slate-800 cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" />
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-900/20 cursor-pointer">
                          <Trash className="w-4 h-4 mr-2" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
          className="border-slate-800 text-gray-400 hover:bg-slate-800 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('common.previous')}
        </Button>
        <span className="text-sm text-gray-400">
          {t('common.page', { current: page, total: totalPages || 1 })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="border-slate-800 text-gray-400 hover:bg-slate-800 hover:text-white"
        >
          {t('common.next')}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
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
                className="bg-slate-800 border-slate-700"
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
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">{t('inventory.unit')}</Label>
                <select
                  id="unit"
                  value={currentItem.unit_of_measure}
                  onChange={(e) => setCurrentItem({ ...currentItem, unit_of_measure: e.target.value as any })}
                  className="h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">{t('inventory.sku')}</Label>
                <Input
                  id="sku"
                  value={currentItem.sku || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, sku: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
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
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">{t('common.location')}</Label>
                <Input
                  id="location"
                  value={currentItem.location || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, location: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('common.save_changes')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
