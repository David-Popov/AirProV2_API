import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AlertCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  Snowflake,
  Lightbulb
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, Pagination, EmptyState, StatCard } from '@/components/shared'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { airConditionerService } from '@/services'
import { useAuth } from '@/context'
import type { ErrorCode, CreateErrorCodeRequest, AirConditioner } from '@/types'

export default function ErrorCodesPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isAdmin = user?.roles.includes('Admin')
  
  const [errorCodes, setErrorCodes] = useState<ErrorCode[]>([])
  const [airConditioners, setAirConditioners] = useState<AirConditioner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filterAcId, setFilterAcId] = useState<string>('all')
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedErrorCode, setSelectedErrorCode] = useState<ErrorCode | null>(null)
  
  const [formData, setFormData] = useState<CreateErrorCodeRequest>({
    error_code: '',
    error_name: '',
    description: '',
    air_conditioner_id: '',
    solution: '',
    severity: ''
  })
  
  useEffect(() => {
    loadData()
  }, [currentPage])
  
  useEffect(() => {
    loadAirConditioners()
  }, [])
  
  const loadData = async () => {
    try {
      setLoading(true)
      const response = await airConditionerService.getAllErrorCodes(currentPage, 10)
      if (response && response.items) {
        setErrorCodes(response.items)
        setTotalPages(response.totalPages || 1)
        setTotalCount(response.totalCount || 0)
      } else {
        setErrorCodes([])
        setTotalPages(1)
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Failed to load error codes:', error)
      setErrorCodes([])
      setTotalPages(1)
      setTotalCount(0)
      if (currentPage > 1) {
        toast.error(t('error_codes.error_loading', 'Failed to load error codes'))
      }
    } finally {
      setLoading(false)
    }
  }
  
  const loadAirConditioners = async () => {
    try {
      const response = await airConditionerService.getAll(1, 100)
      if (response && response.items) {
        setAirConditioners(response.items)
      }
    } catch (error) {
      console.error('Failed to load air conditioners:', error)
    }
  }
  
  const filteredErrorCodes = (errorCodes || []).filter(ec => {
    if (!ec) return false
    const matchesSearch = 
      (ec.error_code?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ec.error_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ec.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
    const matchesAc = filterAcId === 'all' || ec.air_conditioner_id === filterAcId
    
    return matchesSearch && matchesAc
  })

  const handleCreate = async () => {
    if (!formData.error_code || !formData.air_conditioner_id) {
      toast.error(t('error_codes.validation_error', 'Please fill in all required fields'))
      return
    }
    
    try {
      await airConditionerService.createErrorCode(formData)
      toast.success(t('error_codes.created', 'Error code created successfully'))
      setIsCreateDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('error_codes.error_creating', 'Failed to create error code'))
    }
  }
  
  const handleUpdate = async () => {
    if (!selectedErrorCode) return
    try {
      await airConditionerService.updateErrorCode(selectedErrorCode.id, {
        error_code: formData.error_code,
        error_name: formData.error_name,
        description: formData.description,
        solution: formData.solution,
        severity: formData.severity
      })
      toast.success(t('error_codes.updated', 'Error code updated successfully'))
      setIsEditDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('error_codes.error_updating', 'Failed to update error code'))
    }
  }
  
  const handleDelete = async () => {
    if (!selectedErrorCode) return
    try {
      await airConditionerService.deleteErrorCode(selectedErrorCode.id)
      toast.success(t('error_codes.deleted', 'Error code deleted successfully'))
      setIsDeleteDialogOpen(false)
      setSelectedErrorCode(null)
      loadData()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('error_codes.error_deleting', 'Failed to delete error code'))
    }
  }
  
  const openEditDialog = (errorCode: ErrorCode) => {
    setSelectedErrorCode(errorCode)
    setFormData({
      error_code: errorCode.error_code,
      error_name: errorCode.error_name || '',
      description: errorCode.description || '',
      air_conditioner_id: errorCode.air_conditioner_id,
      solution: errorCode.solution || '',
      severity: errorCode.severity || ''
    })
    setIsEditDialogOpen(true)
  }
  
  const openViewDialog = (errorCode: ErrorCode) => {
    setSelectedErrorCode(errorCode)
    setIsViewDialogOpen(true)
  }
  
  const resetForm = () => {
    setFormData({
      error_code: '',
      error_name: '',
      description: '',
      air_conditioner_id: '',
      solution: '',
      severity: ''
    })
    setSelectedErrorCode(null)
  }
  
  const getAcName = (acId: string) => {
    const ac = airConditioners.find(a => a.id === acId)
    return ac ? `${ac.brand || ''} ${ac.name}`.trim() : 'Unknown'
  }

  return (
    <div className="min-h-screen bg-background pt-14 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8 transition-colors duration-300">
      <PageHeader
        title={t('error_codes.title', 'Error Codes')}
        subtitle={t('error_codes.subtitle', 'Manage air conditioner error codes and solutions')}
        action={isAdmin ? (
          <Button
            onClick={() => { resetForm(); setIsCreateDialogOpen(true) }}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('error_codes.add_error_code', 'Add Error Code')}
          </Button>
        ) : undefined}
      />
      
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard
          icon={AlertCircle}
          iconClassName="text-red-500"
          bgClassName="bg-red-500/10"
          label={t('error_codes.total', 'Total Error Codes')}
          value={totalCount}
        />
        <StatCard
          icon={Lightbulb}
          iconClassName="text-green-500"
          bgClassName="bg-green-500/10"
          label={t('error_codes.with_solutions', 'With Solutions')}
          value={(errorCodes || []).filter(ec => ec?.solution).length}
        />
        <StatCard
          icon={Snowflake}
          iconClassName="text-blue-500"
          bgClassName="bg-blue-500/10"
          label={t('error_codes.air_conditioners', 'Air Conditioners')}
          value={new Set((errorCodes || []).map(ec => ec?.air_conditioner_id).filter(Boolean)).size}
        />
      </div>
      
      <div className="hidden md:flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t('error_codes.search', 'Search by code or description...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50 border-border/50"
          />
        </div>
        <Select value={filterAcId} onValueChange={setFilterAcId}>
          <SelectTrigger className="w-64 bg-background/50 border-border/50">
            <SelectValue placeholder={t('error_codes.filter_by_ac', 'Filter by Air Conditioner')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
            {airConditioners.map(ac => (
              <SelectItem key={ac.id} value={ac.id}>
                {ac.brand} {ac.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button 
            className="md:hidden fixed bottom-4 left-4 z-50 rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
            size="icon"
          >
            <Search className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border text-card-foreground max-w-[95vw] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('common.filters', 'Filters')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('common.search', 'Search')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('error_codes.search', 'Search by code or description...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('error_codes.filter_by_ac', 'Filter by Air Conditioner')}</Label>
              <Select value={filterAcId} onValueChange={setFilterAcId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.all', 'All')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                  {airConditioners.map(ac => (
                    <SelectItem key={ac.id} value={ac.id}>
                      {ac.brand} {ac.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            {t('error_codes.all_error_codes', 'All Error Codes')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              {t('common.loading', 'Loading...')}
            </div>
          ) : filteredErrorCodes.length === 0 ? (
            <EmptyState icon={AlertCircle} message={t('error_codes.no_error_codes', 'No error codes found')} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredErrorCodes.map((errorCode) => (
                <div 
                  key={errorCode.id}
                  className="p-4 rounded-xl border border-border/50 bg-background/50 hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => openViewDialog(errorCode)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                        <span className="font-mono text-lg font-bold text-red-500">
                          {errorCode.error_code}
                        </span>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => { e.stopPropagation(); openEditDialog(errorCode) }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); setSelectedErrorCode(errorCode); setIsDeleteDialogOpen(true) }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-foreground font-medium line-clamp-2 mb-2">
                    {errorCode.error_name || errorCode.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Snowflake className="w-3 h-3" />
                    <span className="truncate">{getAcName(errorCode.air_conditioner_id)}</span>
                  </div>
                  {errorCode.solution && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-500">
                      <Lightbulb className="w-3 h-3" />
                      <span>{t('error_codes.has_solution', 'Solution available')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {totalPages > 1 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageLabel={t('common.page_of', { current: currentPage, total: totalPages })}
              className="mt-6 pt-4 border-t border-border/50 justify-between"
            />
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? t('error_codes.edit', 'Edit Error Code') : t('error_codes.add_error_code', 'Add Error Code')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">{t('error_codes.code', 'Error Code')} *</label>
                <Input
                  value={formData.error_code}
                  onChange={(e) => setFormData({...formData, error_code: e.target.value.toUpperCase()})}
                  placeholder="E01"
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t('error_codes.air_conditioner', 'Air Conditioner')} *</label>
                <Select
                  value={formData.air_conditioner_id}
                  onValueChange={(value) => setFormData({...formData, air_conditioner_id: value})}
                  disabled={isEditDialogOpen}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('error_codes.select_ac', 'Select...')} />
                  </SelectTrigger>
                  <SelectContent>
                    {airConditioners.map(ac => (
                      <SelectItem key={ac.id} value={ac.id}>
                        {ac.brand} {ac.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{t('error_codes.error_name', 'Error Name')}</label>
              <Input
                value={formData.error_name || ''}
                onChange={(e) => setFormData({...formData, error_name: e.target.value})}
                placeholder={t('error_codes.error_name_placeholder', 'Name of the error...')}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{t('error_codes.description', 'Description')}</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder={t('error_codes.description_placeholder', 'Describe what this error means...')}
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-green-500" />
                {t('error_codes.solution', 'Solution')}
              </label>
              <Textarea
                value={formData.solution || ''}
                onChange={(e) => setFormData({...formData, solution: e.target.value})}
                placeholder={t('error_codes.solution_placeholder', 'How to fix this error...')}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false)
              setIsEditDialogOpen(false)
              resetForm()
            }}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={isEditDialogOpen ? handleUpdate : handleCreate}>
              {isEditDialogOpen ? t('common.save', 'Save') : t('common.create', 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span>{t('error_codes.error_details', 'Error Code Details')}</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {t('error_codes.code', 'Error Code')}
              </p>
              <p className="font-mono text-3xl font-bold text-red-500">
                {selectedErrorCode?.error_code}
              </p>
              <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-2">
                <Snowflake className="w-4 h-4" />
                {getAcName(selectedErrorCode?.air_conditioner_id || '')}
              </p>
            </div>

            {selectedErrorCode?.error_name && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{t('error_codes.error_name', 'Error Name')}</h4>
                <p className="text-foreground font-medium">{selectedErrorCode.error_name}</p>
              </div>
            )}

            {selectedErrorCode?.description && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">{t('error_codes.description', 'Description')}</h4>
                <p className="text-foreground">{selectedErrorCode.description}</p>
              </div>
            )}

            {selectedErrorCode?.solution && (
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                <h4 className="text-sm font-medium text-green-500 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  {t('error_codes.solution', 'Solution')}
                </h4>
                <p className="text-foreground text-sm">{selectedErrorCode.solution}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              {t('common.close', 'Close')}
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false)
              if (selectedErrorCode) openEditDialog(selectedErrorCode)
            }}>
              <Edit2 className="w-4 h-4 mr-2" />
              {t('common.edit', 'Edit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('error_codes.delete_confirm', 'Delete Error Code?')}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            {t('error_codes.delete_warning', 'This action cannot be undone. The error code will be permanently deleted.')}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('common.delete', 'Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
