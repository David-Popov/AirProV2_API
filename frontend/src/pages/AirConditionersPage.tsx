import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Snowflake, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Zap,
  MoreVertical,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { airConditionerService } from '@/services'
import { useAuth } from '@/context'
import type { AirConditioner, CreateAirConditionerRequest } from '@/types'

export default function AirConditionersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.roles.includes('Admin')
  const [items, setItems] = useState<AirConditioner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentItem, setCurrentItem] = useState<Partial<CreateAirConditionerRequest> & { id?: string }>({})
  const [isSaving, setIsSaving] = useState(false)
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<AirConditioner | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadItems = async () => {
    setIsLoading(true)
    try {
      // Use 12 items per page for cleaner grid (3 or 4 columns)
      const response = await airConditionerService.getAll(page, 12)
      setItems(response.items)
      // Ensure backend returns correct total_pages based on pageSize=12
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
    loadItems()
  }, [page])

  const handleCreate = () => {
    setIsEditing(false)
    setCurrentItem({
      name: '',
      brand: '',
      model: '',
      kilowatts: 0,
      price: 0,
      description: ''
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (e: React.MouseEvent, item: AirConditioner) => {
    e.stopPropagation() // Prevent navigation
    setIsEditing(true)
    setCurrentItem({
      id: item.id,
      name: item.name,
      brand: item.brand,
      model: item.model,
      kilowatts: item.kilowatts,
      price: item.price,
      description: item.description
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
    if (currentItem.kilowatts != null && currentItem.kilowatts < 0) {
      validationErrors.push(t('validation.kilowatts_invalid', 'Kilowatts must be 0 or greater'))
    }
    if (currentItem.price != null && currentItem.price < 0) {
      validationErrors.push(t('validation.price_invalid', 'Price must be 0 or greater'))
    }
    
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('. '))
      return
    }
    
    setIsSaving(true)
    try {
      if (isEditing && currentItem.id) {
        await airConditionerService.update(currentItem.id, {
          name: currentItem.name!,
          brand: currentItem.brand,
          model: currentItem.model,
          kilowatts: currentItem.kilowatts,
          price: currentItem.price,
          description: currentItem.description,
          image_url: '' 
        })
        toast.success(t('air_conditioners.ac_updated'))
      } else {
        await airConditionerService.create({
          name: currentItem.name!,
          brand: currentItem.brand,
          model: currentItem.model,
          kilowatts: currentItem.kilowatts,
          price: currentItem.price,
          description: currentItem.description,
          image_url: ''
        })
        toast.success(t('air_conditioners.ac_created'))
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

  const handleDeleteClick = (e: React.MouseEvent, item: AirConditioner) => {
    e.stopPropagation()
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return
    
    setIsDeleting(true)
    try {
      await airConditionerService.delete(itemToDelete.id)
      toast.success(t('air_conditioners.ac_deleted'))
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

  const renderItems = searchTerm 
    ? items.filter(i => 
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        i.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.model?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items

  return (
    <div className="min-h-screen bg-background pt-16 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-64 lg:pt-8 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Snowflake className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
            {t('air_conditioners.title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t('air_conditioners.subtitle')}</p>
        </div>
        {isAdmin && (
          <Button onClick={handleCreate} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            {t('air_conditioners.add_ac')}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t('air_conditioners.search_placeholder')}
            className="pl-10 bg-background/50 border-input text-foreground hover:bg-background/80 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : renderItems.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          {t('air_conditioners.no_acs')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {renderItems.map((item) => (
            <Card 
              key={item.id} 
              className="glass-card overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group"
              onClick={() => navigate(`/air-conditioners/${item.id}`)}
            >
              {/* Image Placeholder */}
              <div className="aspect-[4/3] bg-muted/30 relative flex items-center justify-center">
                 {item.image_url ? (
                   <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                 ) : (
                   <Snowflake className="w-12 h-12 text-muted-foreground/50" />
                 )}
                 
                 {/* Actions Overlay - Admin Only */}
                 {isAdmin && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="secondary" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white border-0">
                           <MoreVertical className="w-4 h-4" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
                         <DropdownMenuItem onClick={(e) => handleEdit(e, item)} className="cursor-pointer">
                           <Edit className="w-4 h-4 mr-2" />
                           {t('common.edit')}
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={(e) => handleDeleteClick(e, item)} className="text-destructive focus:text-destructive cursor-pointer">
                           <Trash className="w-4 h-4 mr-2" />
                           {t('common.delete')}
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                  </div>
                 )}
              </div>

              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-primary font-medium mb-1">{item.brand}</p>
                    <h3 className="text-foreground font-semibold truncate pr-2" title={item.name}>{item.name}</h3>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Zap className="w-3 h-3 mr-1 text-yellow-500" />
                    {item.kilowatts || '-'} kW
                  </div>
                  <span className="text-green-500 font-bold">
                    ${item.price}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

     {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-8">
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
        <span className="text-sm text-sm sm:text-base text-muted-foreground">
          {t('common.page', { current: page, total: totalPages || 1 })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (page < totalPages) {
              setPage(p => p + 1)
            }
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
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? t('air_conditioners.edit_ac') : t('air_conditioners.new_ac')}</DialogTitle>
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
                <Label htmlFor="brand">{t('air_conditioners.brand')}</Label>
                <Input
                  id="brand"
                  value={currentItem.brand || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, brand: e.target.value })}
                  className="bg-background border-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="model">{t('air_conditioners.model')}</Label>
                <Input
                  id="model"
                  value={currentItem.model || ''}
                  onChange={(e) => setCurrentItem({ ...currentItem, model: e.target.value })}
                  className="bg-background border-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="kilowatts">{t('air_conditioners.kilowatts')}</Label>
                <Input
                  id="kilowatts"
                  type="number"
                  step="0.1"
                  value={currentItem.kilowatts || 0}
                  onChange={(e) => setCurrentItem({ ...currentItem, kilowatts: Number(e.target.value) })}
                  className="bg-background border-input"
                />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="price">{t('air_conditioners.price')}</Label>
                <Input
                  id="price"
                  type="number"
                  value={currentItem.price || 0}
                  onChange={(e) => setCurrentItem({ ...currentItem, price: Number(e.target.value) })}
                  className="bg-background border-input"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">{t('common.notes')}</Label>
              <Input
                id="description"
                value={currentItem.description || ''}
                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
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
              {t('common.confirm_delete_title', 'Delete Air Conditioner')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base text-muted-foreground">
              {t('air_conditioners.delete_confirmation', 'Are you sure you want to delete this air conditioner? This action cannot be undone.')}
              {itemToDelete && (
                <span className="block mt-2 font-medium text-foreground">
                  {itemToDelete.brand} {itemToDelete.name}
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
