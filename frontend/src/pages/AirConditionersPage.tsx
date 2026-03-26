import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Snowflake,
  Plus,
  Edit,
  Trash,
  Loader2,
  Zap,
  MoreVertical,
  Filter
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
import { PageHeader, SearchBar, Pagination, EmptyState, ConfirmDialog } from '@/components/shared'
import { AirConditionersGridSkeleton } from '@/components/skeletons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAirConditioners, useCreateAirConditioner, useUpdateAirConditioner, useDeleteAirConditioner } from '@/hooks'
import { useAuth } from '@/context'
import type { AirConditioner, CreateAirConditionerRequest } from '@/types'

export default function AirConditionersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.roles.includes('Admin')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  const [activeFilters, setActiveFilters] = useState({
    minPrice: 0,
    maxPrice: 5000,
    minKilowatts: 0,
    maxKilowatts: 15,
    brand: ''
  })
  const [tempFilters, setTempFilters] = useState(activeFilters)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentItem, setCurrentItem] = useState<Partial<CreateAirConditionerRequest> & { id?: string }>({})

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<AirConditioner | null>(null)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Build query filters
  const queryFilters = {
    searchTerm: debouncedSearch,
    brand: activeFilters.brand,
    minPrice: activeFilters.minPrice > 0 ? activeFilters.minPrice : undefined,
    maxPrice: activeFilters.maxPrice < 5000 ? activeFilters.maxPrice : undefined,
    minKilowatts: activeFilters.minKilowatts > 0 ? activeFilters.minKilowatts : undefined,
    maxKilowatts: activeFilters.maxKilowatts < 15 ? activeFilters.maxKilowatts : undefined,
  }

  const { data, isLoading } = useAirConditioners(page, 12, queryFilters)
  const items = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  const createAirConditioner = useCreateAirConditioner()
  const updateAirConditioner = useUpdateAirConditioner()
  const deleteAirConditioner = useDeleteAirConditioner()

  const handleApplyFilters = () => {
    setActiveFilters(tempFilters)
    setIsFilterOpen(false)
    setPage(1) // Reset to page 1 on filter application
  }

  const handleClearFilters = () => {
    const defaults = {
        minPrice: 0,
        maxPrice: 5000,
        minKilowatts: 0,
        maxKilowatts: 15,
        brand: ''
    };
    setTempFilters(defaults)
    setActiveFilters(defaults)
    setSearchTerm('')
    setIsFilterOpen(false)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (activeFilters.brand) count++
    if (activeFilters.minPrice > 0 || activeFilters.maxPrice < 5000) count++
    if (activeFilters.minKilowatts > 0 || activeFilters.maxKilowatts < 15) count++
    return count
  }

  const handleCreate = () => {
    setIsEditing(false)
    setCurrentItem({
      name: '',
      brand: '',
      model: '',
      kilowatts: 0,
      price: 0,
      description: '',
      image_url: '',
      pipe_size_liquid: undefined,
      pipe_size_gas: undefined,
      max_pipe_length: undefined,
      max_height_difference: undefined,
      refrigerant_type: undefined,
      factory_refrigerant_charge: undefined,
      power_supply_location: undefined,
      cable_section: undefined,
      recommended_fuse: undefined,
      indoor_dimensions: undefined,
      outdoor_dimensions: undefined,
      weight_indoor: undefined,
      weight_outdoor: undefined
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
      description: item.description,
      image_url: item.image_url,
      pipe_size_liquid: item.pipe_size_liquid,
      pipe_size_gas: item.pipe_size_gas,
      max_pipe_length: item.max_pipe_length,
      max_height_difference: item.max_height_difference,
      refrigerant_type: item.refrigerant_type,
      factory_refrigerant_charge: item.factory_refrigerant_charge,
      power_supply_location: item.power_supply_location,
      cable_section: item.cable_section,
      recommended_fuse: item.recommended_fuse,
      indoor_dimensions: item.indoor_dimensions,
      outdoor_dimensions: item.outdoor_dimensions,
      weight_indoor: item.weight_indoor,
      weight_outdoor: item.weight_outdoor
    })
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
    
    const requestData = {
      name: currentItem.name!,
      brand: currentItem.brand,
      model: currentItem.model,
      kilowatts: currentItem.kilowatts,
      price: currentItem.price,
      description: currentItem.description,
      image_url: currentItem.image_url || '',
      pipe_size_liquid: currentItem.pipe_size_liquid,
      pipe_size_gas: currentItem.pipe_size_gas,
      max_pipe_length: currentItem.max_pipe_length,
      max_height_difference: currentItem.max_height_difference,
      refrigerant_type: currentItem.refrigerant_type,
      factory_refrigerant_charge: currentItem.factory_refrigerant_charge,
      power_supply_location: currentItem.power_supply_location,
      cable_section: currentItem.cable_section,
      recommended_fuse: currentItem.recommended_fuse,
      indoor_dimensions: currentItem.indoor_dimensions,
      outdoor_dimensions: currentItem.outdoor_dimensions,
      weight_indoor: currentItem.weight_indoor,
      weight_outdoor: currentItem.weight_outdoor
    }

    try {
      if (isEditing && currentItem.id) {
        await updateAirConditioner.mutateAsync({ id: currentItem.id, data: requestData })
        toast.success(t('air_conditioners.ac_updated'))
      } else {
        await createAirConditioner.mutateAsync(requestData)
        toast.success(t('air_conditioners.ac_created'))
      }
      setIsDialogOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, item: AirConditioner) => {
    e.stopPropagation()
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    try {
      await deleteAirConditioner.mutateAsync(itemToDelete.id)
      toast.success(t('air_conditioners.ac_deleted'))
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-16 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8 transition-colors duration-300">
      <PageHeader
        title={t('air_conditioners.title')}
        subtitle={t('air_conditioners.subtitle')}
        icon={Snowflake}
        action={isAdmin ? (
          <Button onClick={handleCreate} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            {t('air_conditioners.add_ac')}
          </Button>
        ) : undefined}
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder={t('air_conditioners.search_placeholder')}
        className="mb-6"
        inputClassName="max-w-sm"
      >
        <Button
          variant="outline"
          className="hidden lg:flex relative border-border hover:bg-accent text-foreground"
          onClick={() => setIsFilterOpen(true)}
        >
          <Filter className="w-4 h-4 mr-2" />
          {t('common.filter', 'Filter')}
          {getActiveFilterCount() > 0 && (
            <span className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-[10px]">
              {getActiveFilterCount()}
            </span>
          )}
        </Button>
      </SearchBar>

      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[425px] overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{t('air_conditioners.filter_title', 'Filter Air Conditioners')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Brand Filter */}
            <div className="grid gap-2">
              <Label>{t('air_conditioners.brand')}</Label>
              <Input 
                placeholder={t('air_conditioners.brand_placeholder', 'e.g. Daikin')}
                value={tempFilters.brand}
                onChange={(e) => setTempFilters({...tempFilters, brand: e.target.value})}
                className="bg-background border-input"
              />
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>{t('air_conditioners.price_range')}</Label>
              <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    placeholder="Min"
                    value={tempFilters.minPrice}
                    onChange={(e) => setTempFilters({...tempFilters, minPrice: Number(e.target.value)})}
                    className="bg-background border-input"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input 
                    type="number"
                    placeholder="Max"
                    value={tempFilters.maxPrice}
                    onChange={(e) => setTempFilters({...tempFilters, maxPrice: Number(e.target.value)})}
                    className="bg-background border-input"
                  />
              </div>
            </div>

            {/* Power Range */}
            <div className="space-y-2">
              <Label>{t('air_conditioners.power_range')} (kW)</Label>
               <div className="flex items-center gap-2">
                  <Input 
                    type="number"
                    placeholder="Min"
                    step="0.1"
                    value={tempFilters.minKilowatts}
                    onChange={(e) => setTempFilters({...tempFilters, minKilowatts: Number(e.target.value)})}
                    className="bg-background border-input"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input 
                    type="number"
                    placeholder="Max"
                    step="0.1"
                    value={tempFilters.maxKilowatts}
                    onChange={(e) => setTempFilters({...tempFilters, maxKilowatts: Number(e.target.value)})}
                    className="bg-background border-input"
                  />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button onClick={handleApplyFilters} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {t('common.apply_filters', 'Apply Filters')}
            </Button>
            <Button variant="outline" onClick={handleClearFilters} className="w-full border-border hover:bg-accent text-foreground">
              {t('common.clear_filters', 'Clear Filters')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grid Content */}
      {isLoading ? (
        <AirConditionersGridSkeleton />
      ) : items.length === 0 ? (
        <EmptyState message={t('air_conditioners.no_acs')} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
          {items.map((item) => (
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
                    €{item.price}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        previousLabel={t('common.previous')}
        nextLabel={t('common.next')}
        pageLabel={t('common.page', { current: page, total: totalPages || 1 })}
        className="justify-center py-8"
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? t('air_conditioners.edit_ac') : t('air_conditioners.new_ac')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid gap-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded"></div>
                {t('air_conditioners.details', 'Basic Information')}
              </h3>
              <div className="grid gap-4">
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
              </div>
            </div>

            {/* Technical Specifications - Piping */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-500 rounded"></div>
                {t('air_conditioners.piping', 'Piping')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="pipe_size_liquid">{t('air_conditioners.liquid_pipe')}</Label>
                  <Input
                    id="pipe_size_liquid"
                    value={currentItem.pipe_size_liquid || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, pipe_size_liquid: e.target.value })}
                    className="bg-background border-input"
                    placeholder="6.35mm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pipe_size_gas">{t('air_conditioners.gas_pipe')}</Label>
                  <Input
                    id="pipe_size_gas"
                    value={currentItem.pipe_size_gas || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, pipe_size_gas: e.target.value })}
                    className="bg-background border-input"
                    placeholder="12.7mm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max_pipe_length">{t('air_conditioners.max_pipe_length')} (m)</Label>
                  <Input
                    id="max_pipe_length"
                    type="number"
                    value={currentItem.max_pipe_length || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, max_pipe_length: e.target.value ? Number(e.target.value) : undefined })}
                    className="bg-background border-input"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max_height_difference">{t('air_conditioners.max_height_diff')} (m)</Label>
                  <Input
                    id="max_height_difference"
                    type="number"
                    value={currentItem.max_height_difference || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, max_height_difference: e.target.value ? Number(e.target.value) : undefined })}
                    className="bg-background border-input"
                  />
                </div>
              </div>
            </div>

            {/* Technical Specifications - Refrigerant */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <div className="w-1 h-4 bg-cyan-500 rounded"></div>
                {t('air_conditioners.refrigerant', 'Refrigerant')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="refrigerant_type">{t('air_conditioners.refrigerant_type')}</Label>
                  <Input
                    id="refrigerant_type"
                    value={currentItem.refrigerant_type || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, refrigerant_type: e.target.value })}
                    className="bg-background border-input"
                    placeholder="R32, R410A"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="factory_refrigerant_charge">{t('air_conditioners.factory_charge')} (g)</Label>
                  <Input
                    id="factory_refrigerant_charge"
                    type="number"
                    value={currentItem.factory_refrigerant_charge || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, factory_refrigerant_charge: e.target.value ? Number(e.target.value) : undefined })}
                    className="bg-background border-input"
                  />
                </div>
              </div>
            </div>

            {/* Technical Specifications - Electrical */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <div className="w-1 h-4 bg-yellow-500 rounded"></div>
                {t('air_conditioners.electrical', 'Electrical')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="power_supply_location">{t('air_conditioners.power_supply')}</Label>
                  <Input
                    id="power_supply_location"
                    value={currentItem.power_supply_location || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, power_supply_location: e.target.value })}
                    className="bg-background border-input"
                    placeholder="Indoor, Outdoor"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cable_section">{t('air_conditioners.cable_section')}</Label>
                  <Input
                    id="cable_section"
                    value={currentItem.cable_section || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, cable_section: e.target.value })}
                    className="bg-background border-input"
                    placeholder="3x2.5mm²"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recommended_fuse">{t('air_conditioners.recommended_fuse')} (A)</Label>
                  <Input
                    id="recommended_fuse"
                    type="number"
                    value={currentItem.recommended_fuse || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, recommended_fuse: e.target.value ? Number(e.target.value) : undefined })}
                    className="bg-background border-input"
                  />
                </div>
              </div>
            </div>

            {/* Technical Specifications - Dimensions & Weight */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase flex items-center gap-2">
                <div className="w-1 h-4 bg-purple-500 rounded"></div>
                {t('air_conditioners.dimensions', 'Dimensions')} & {t('air_conditioners.weight', 'Weight')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="indoor_dimensions">{t('air_conditioners.indoor_unit')} - {t('air_conditioners.dimensions')}</Label>
                  <Input
                    id="indoor_dimensions"
                    value={currentItem.indoor_dimensions || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, indoor_dimensions: e.target.value })}
                    className="bg-background border-input"
                    placeholder="800x290x200mm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weight_indoor">{t('air_conditioners.indoor_unit')} - {t('air_conditioners.weight')} (kg)</Label>
                  <Input
                    id="weight_indoor"
                    type="number"
                    step="0.1"
                    value={currentItem.weight_indoor || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, weight_indoor: e.target.value ? Number(e.target.value) : undefined })}
                    className="bg-background border-input"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="outdoor_dimensions">{t('air_conditioners.outdoor_unit')} - {t('air_conditioners.dimensions')}</Label>
                  <Input
                    id="outdoor_dimensions"
                    value={currentItem.outdoor_dimensions || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, outdoor_dimensions: e.target.value })}
                    className="bg-background border-input"
                    placeholder="780x555x290mm"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="weight_outdoor">{t('air_conditioners.outdoor_unit')} - {t('air_conditioners.weight')} (kg)</Label>
                  <Input
                    id="weight_outdoor"
                    type="number"
                    step="0.1"
                    value={currentItem.weight_outdoor || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, weight_outdoor: e.target.value ? Number(e.target.value) : undefined })}
                    className="bg-background border-input"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={createAirConditioner.isPending || updateAirConditioner.isPending}>
                {(createAirConditioner.isPending || updateAirConditioner.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t('common.confirm_delete_title', 'Delete Air Conditioner')}
        description={t('air_conditioners.delete_confirmation', 'Are you sure you want to delete this air conditioner? This action cannot be undone.')}
        itemName={itemToDelete ? `${itemToDelete.brand} ${itemToDelete.name}` : undefined}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        isLoading={deleteAirConditioner.isPending}
      />

      {/* Mobile Filter FAB - Bubble */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button 
            className="h-14 w-14 rounded-full shadow-lg shadow-primary/30 bg-primary hover:bg-primary/90 text-primary-foreground p-0 flex items-center justify-center transform transition-transform hover:scale-105 active:scale-95"
            onClick={() => setIsFilterOpen(true)}
        >
            <Filter className="w-6 h-6" />
            {getActiveFilterCount() > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold">
                    {getActiveFilterCount()}
                </span>
            )}
        </Button>
      </div>
    </div>
  )
}
