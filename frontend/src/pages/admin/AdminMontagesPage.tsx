import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Search, FileText, Trash2, Edit, Plus, ChevronLeft, ChevronRight, Filter, X, Eye, MoreVertical } from 'lucide-react'
import { adminService } from '@/services/admin'
import type { AdminMontage, AdminMontageFilter, AdminCreateMontage } from '@/types/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'

const STATUS_OPTIONS = [
  { value: '0', label: 'Planned' },
  { value: '1', label: 'In Progress' },
  { value: '2', label: 'Completed' },
  { value: '3', label: 'Canceled' },
]

const PAYMENT_STATUS_OPTIONS = [
  { value: '0', label: 'Not Paid' },
  { value: '1', label: 'Partial' },
  { value: '2', label: 'Paid' },
]

export default function AdminMontagesPage() {
  const { t } = useTranslation()
  const [montages, setMontages] = useState<AdminMontage[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState<AdminMontageFilter>({ page: 1, pageSize: 20 })
  const [selectedMontage, setSelectedMontage] = useState<AdminMontage | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCreateMode, setIsCreateMode] = useState(false)
  
  const [editForm, setEditForm] = useState<AdminCreateMontage>({
    clientName: '', installationDate: '', status: 0, paymentStatus: 0
  })

  const fetchMontages = async () => {
    setLoading(true)
    try {
      const result = await adminService.getMontages(filter)
      setMontages(result.items)
      setTotalPages(result.totalPages)
    } catch (error) {
      toast.error(t('common.error'))
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMontages() }, [filter.page])

  const handleSearch = () => { setFilter(f => ({ ...f, page: 1 })); fetchMontages() }
  const handleResetFilters = () => { setFilter({ page: 1, pageSize: 20 }); fetchMontages() }

  const openCreate = () => {
    setIsCreateMode(true)
    setSelectedMontage(null)
    setEditForm({
      clientName: '', clientPhone: '', clientEmail: '', clientAddress: '', clientCity: '',
      installationDate: new Date().toISOString().split('T')[0], status: 0, paymentStatus: 0, notes: ''
    })
    setIsEditOpen(true)
  }

  const openEdit = (montage: AdminMontage) => {
    setIsCreateMode(false)
    setSelectedMontage(montage)
    setEditForm({
      companyId: montage.companyId, userId: montage.userId, airConditionerId: montage.airConditionerId,
      clientName: montage.clientName, clientPhone: montage.clientPhone || '',
      clientEmail: montage.clientEmail || '', clientAddress: montage.clientAddress || '',
      clientCity: montage.clientCity || '', installationDate: montage.installationDate,
      completionDate: montage.completionDate || undefined,
      status: parseInt(STATUS_OPTIONS.find(s => s.label === montage.status)?.value || '0'),
      paymentStatus: parseInt(PAYMENT_STATUS_OPTIONS.find(s => s.label === montage.paymentStatus)?.value || '0'),
      totalPrice: montage.totalPrice, paidAmount: montage.paidAmount, notes: montage.notes || ''
    })
    setIsEditOpen(true)
  }

  const openView = (montage: AdminMontage) => { setSelectedMontage(montage); setIsViewOpen(true) }

  const handleSave = async () => {
    try {
      if (isCreateMode) {
        await adminService.createMontage(editForm)
        toast.success(t('admin.montage_created'))
      } else if (selectedMontage) {
        await adminService.updateMontage(selectedMontage.id, editForm)
        toast.success(t('admin.montage_updated'))
      }
      setIsEditOpen(false)
      fetchMontages()
    } catch (error) {
      toast.error(t('common.error'))
    }
  }

  const handleDelete = async () => {
    if (!selectedMontage) return
    try {
      await adminService.deleteMontage(selectedMontage.id)
      toast.success(t('admin.montage_deleted'))
      setIsDeleteOpen(false)
      fetchMontages()
    } catch (error) {
      toast.error(t('common.error'))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return <Badge variant="success">{status}</Badge>
      case 'InProgress': return <Badge variant="warning">{status}</Badge>
      case 'Canceled': return <Badge variant="destructive">{status}</Badge>
      default: return <Badge variant="info">{status}</Badge>
    }
  }

  const FilterPanel = () => (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div><Label>{t('admin.client_name')}</Label><Input placeholder={t('admin.search_by_name')} value={filter.clientName || ''} onChange={(e) => setFilter(f => ({ ...f, clientName: e.target.value }))} /></div>
        <div><Label>{t('admin.client_phone')}</Label><Input placeholder={t('admin.search_by_phone')} value={filter.clientPhone || ''} onChange={(e) => setFilter(f => ({ ...f, clientPhone: e.target.value }))} /></div>
        <div><Label>{t('admin.client_address')}</Label><Input placeholder={t('admin.search_by_address')} value={filter.clientAddress || ''} onChange={(e) => setFilter(f => ({ ...f, clientAddress: e.target.value }))} /></div>
        <div><Label>{t('admin.user_name')}</Label><Input placeholder={t('admin.search_by_user')} value={filter.userName || ''} onChange={(e) => setFilter(f => ({ ...f, userName: e.target.value }))} /></div>
        <div>
          <Label>{t('common.status')}</Label>
          <Select value={filter.status?.toString() || 'all'} onValueChange={(v) => setFilter(f => ({ ...f, status: v === 'all' ? undefined : parseInt(v) }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {STATUS_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSearch}><Search className="w-4 h-4 mr-2" />{t('common.search')}</Button>
        <Button variant="outline" onClick={handleResetFilters}><X className="w-4 h-4 mr-2" />{t('common.clear')}</Button>
      </div>
    </div>
  )

  const MobileCard = ({ montage }: { montage: AdminMontage }) => (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold">{montage.clientName}</h3>
            <p className="text-sm text-muted-foreground">{montage.companyName}</p>
            <p className="text-sm text-muted-foreground">{montage.installationDate}</p>
          </div>
          {getStatusBadge(montage.status)}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => openView(montage)}><Eye className="w-4 h-4 mr-1" />{t('common.view')}</Button>
          <Button size="sm" variant="outline" onClick={() => openEdit(montage)}><Edit className="w-4 h-4 mr-1" />{t('common.edit')}</Button>
          <Button size="sm" variant="destructive" onClick={() => { setSelectedMontage(montage); setIsDeleteOpen(true) }}><Trash2 className="w-4 h-4 mr-1" />{t('common.delete')}</Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />{t('admin.montages_management')}</CardTitle>
          <div className="flex gap-2">
            <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />{t('common.add')}</Button>
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild><Button variant="outline" className="md:hidden"><Filter className="w-4 h-4 mr-2" />{t('common.filters')}</Button></SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh]"><SheetHeader><SheetTitle>{t('common.filters')}</SheetTitle></SheetHeader><div className="mt-4"><FilterPanel /></div></SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block mb-6"><FilterPanel /></div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.client_name')}</TableHead>
                  <TableHead>{t('admin.company')}</TableHead>
                  <TableHead>{t('admin.user')}</TableHead>
                  <TableHead>{t('admin.installation_date')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('admin.payment')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">{t('common.loading')}</TableCell></TableRow>
                ) : montages.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">{t('common.no_data')}</TableCell></TableRow>
                ) : montages.map(montage => (
                  <TableRow key={montage.id}>
                    <TableCell className="font-medium">{montage.clientName}<div className="text-sm text-muted-foreground">{montage.clientPhone}</div></TableCell>
                    <TableCell>{montage.companyName || '-'}</TableCell>
                    <TableCell>{montage.userName || '-'}</TableCell>
                    <TableCell>{montage.installationDate}</TableCell>
                    <TableCell>{getStatusBadge(montage.status)}</TableCell>
                    <TableCell><Badge variant={montage.paymentStatus === 'Paid' ? 'success' : 'secondary'}>{montage.paymentStatus}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openView(montage)} className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" />
                            {t('common.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(montage)} className="cursor-pointer">
                            <Edit className="w-4 h-4 mr-2" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => { setSelectedMontage(montage); setIsDeleteOpen(true) }}
                            className="text-destructive focus:text-destructive cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden">{loading ? <div className="text-center py-8">{t('common.loading')}</div> : montages.length === 0 ? <div className="text-center py-8">{t('common.no_data')}</div> : montages.map(montage => <MobileCard key={montage.id} montage={montage} />)}</div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" disabled={filter.page === 1} onClick={() => setFilter(f => ({ ...f, page: (f.page || 1) - 1 }))}><ChevronLeft className="w-4 h-4" /></Button>
            <span>{t('common.page')} {filter.page} / {totalPages}</span>
            <Button variant="outline" disabled={filter.page === totalPages} onClick={() => setFilter(f => ({ ...f, page: (f.page || 1) + 1 }))}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{t('admin.montage_details')}</DialogTitle></DialogHeader>
          {selectedMontage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">{t('admin.client_name')}</Label><p className="font-medium">{selectedMontage.clientName}</p></div>
                <div><Label className="text-muted-foreground">{t('admin.client_phone')}</Label><p className="font-medium">{selectedMontage.clientPhone || '-'}</p></div>
                <div><Label className="text-muted-foreground">{t('admin.company')}</Label><p className="font-medium">{selectedMontage.companyName || '-'}</p></div>
                <div><Label className="text-muted-foreground">{t('admin.user')}</Label><p className="font-medium">{selectedMontage.userName || '-'}</p></div>
                <div><Label className="text-muted-foreground">{t('common.status')}</Label><p>{getStatusBadge(selectedMontage.status)}</p></div>
                <div><Label className="text-muted-foreground">{t('admin.payment')}</Label><Badge variant={selectedMontage.paymentStatus === 'Paid' ? 'success' : 'secondary'}>{selectedMontage.paymentStatus}</Badge></div>
                <div><Label className="text-muted-foreground">{t('admin.total_price')}</Label><p className="font-medium">{selectedMontage.totalPrice ? `${selectedMontage.totalPrice} лв` : '-'}</p></div>
                <div><Label className="text-muted-foreground">{t('admin.paid_amount')}</Label><p className="font-medium">{selectedMontage.paidAmount ? `${selectedMontage.paidAmount} лв` : '-'}</p></div>
              </div>
              {selectedMontage.notes && <div><Label className="text-muted-foreground">{t('admin.notes')}</Label><p>{selectedMontage.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{isCreateMode ? t('admin.create_montage') : t('admin.edit_montage')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('admin.client_name')} *</Label><Input value={editForm.clientName} onChange={(e) => setEditForm(f => ({ ...f, clientName: e.target.value }))} /></div>
              <div><Label>{t('admin.client_phone')}</Label><Input value={editForm.clientPhone || ''} onChange={(e) => setEditForm(f => ({ ...f, clientPhone: e.target.value }))} /></div>
              <div><Label>{t('admin.client_email')}</Label><Input value={editForm.clientEmail || ''} onChange={(e) => setEditForm(f => ({ ...f, clientEmail: e.target.value }))} /></div>
              <div><Label>{t('admin.client_city')}</Label><Input value={editForm.clientCity || ''} onChange={(e) => setEditForm(f => ({ ...f, clientCity: e.target.value }))} /></div>
            </div>
            <div><Label>{t('admin.client_address')}</Label><Input value={editForm.clientAddress || ''} onChange={(e) => setEditForm(f => ({ ...f, clientAddress: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('admin.installation_date')} *</Label><Input type="date" value={editForm.installationDate} onChange={(e) => setEditForm(f => ({ ...f, installationDate: e.target.value }))} /></div>
              <div><Label>{t('admin.completion_date')}</Label><Input type="date" value={editForm.completionDate || ''} onChange={(e) => setEditForm(f => ({ ...f, completionDate: e.target.value || undefined }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('common.status')}</Label>
                <Select value={editForm.status.toString()} onValueChange={(v) => setEditForm(f => ({ ...f, status: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('admin.payment_status')}</Label>
                <Select value={editForm.paymentStatus.toString()} onValueChange={(v) => setEditForm(f => ({ ...f, paymentStatus: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PAYMENT_STATUS_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('admin.total_price')}</Label><Input type="number" value={editForm.totalPrice || ''} onChange={(e) => setEditForm(f => ({ ...f, totalPrice: parseFloat(e.target.value) || undefined }))} /></div>
              <div><Label>{t('admin.paid_amount')}</Label><Input type="number" value={editForm.paidAmount || ''} onChange={(e) => setEditForm(f => ({ ...f, paidAmount: parseFloat(e.target.value) || undefined }))} /></div>
            </div>
            <div><Label>{t('admin.notes')}</Label><Textarea value={editForm.notes || ''} onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>{t('common.cancel')}</Button><Button onClick={handleSave}>{t('common.save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('admin.confirm_delete')}</DialogTitle><DialogDescription>{t('admin.delete_montage_warning')}</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t('common.cancel')}</Button><Button variant="destructive" onClick={handleDelete}>{t('common.delete')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
