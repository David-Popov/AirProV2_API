import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Search, Building2, RotateCcw, Trash2, Edit, Users, FileText, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import { adminService } from '@/services/admin'
import type { AdminCompany, AdminCompanyFilter, AdminUpdateSubscription } from '@/types/admin'
import { SUBSCRIPTION_STATUS_OPTIONS, SUBSCRIPTION_PLAN_OPTIONS } from '@/types/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export default function AdminCompaniesPage() {
  const { t } = useTranslation()
  const [companies, setCompanies] = useState<AdminCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState<AdminCompanyFilter>({ page: 1, pageSize: 20 })
  const [selectedCompany, setSelectedCompany] = useState<AdminCompany | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [subscriptionForm, setSubscriptionForm] = useState<AdminUpdateSubscription>({
    subscriptionPlan: '',
    subscriptionStatus: '',
    isSubscriptionActive: true
  })

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const result = await adminService.getCompanies(filter)
      setCompanies(result.items)
      setTotalPages(result.totalPages)
    } catch (error) {
      toast.error(t('common.error'))
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [filter.page])

  const handleSearch = () => {
    setFilter(f => ({ ...f, page: 1 }))
    fetchCompanies()
  }

  const handleResetFilters = () => {
    setFilter({ page: 1, pageSize: 20 })
    fetchCompanies()
  }

  const openEdit = (company: AdminCompany) => {
    setSelectedCompany(company)
    setSubscriptionForm({
      subscriptionPlan: company.subscriptionPlan,
      subscriptionStatus: company.subscriptionStatus,
      isSubscriptionActive: company.isSubscriptionActive ?? true
    })
    setIsEditOpen(true)
  }

  const handleUpdateSubscription = async () => {
    if (!selectedCompany) return
    try {
      await adminService.updateCompanySubscription(selectedCompany.id, subscriptionForm)
      toast.success(t('admin.company_updated'))
      setIsEditOpen(false)
      fetchCompanies()
    } catch (error) {
      toast.error(t('common.error'))
      console.error(error)
    }
  }

  const handleDelete = async () => {
    if (!selectedCompany) return
    try {
      await adminService.deleteCompany(selectedCompany.id)
      toast.success(t('admin.company_deleted'))
      setIsDeleteOpen(false)
      fetchCompanies()
    } catch (error) {
      toast.error(t('common.error'))
      console.error(error)
    }
  }

  const handleRestore = async (company: AdminCompany) => {
    try {
      await adminService.restoreCompany(company.id)
      toast.success(t('admin.company_restored'))
      fetchCompanies()
    } catch (error) {
      toast.error(t('common.error'))
      console.error(error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge variant="success">{status}</Badge>
      case 'Trial': return <Badge variant="info">{status}</Badge>
      case 'Expired': case 'Cancelled': return <Badge variant="destructive">{status}</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  const FilterPanel = () => (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div>
          <Label>{t('admin.company_name')}</Label>
          <Input
            placeholder={t('admin.search_by_name')}
            value={filter.name || ''}
            onChange={(e) => setFilter(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <Label>{t('admin.owner_email')}</Label>
          <Input
            placeholder={t('admin.search_by_email')}
            value={filter.ownerEmail || ''}
            onChange={(e) => setFilter(f => ({ ...f, ownerEmail: e.target.value }))}
          />
        </div>
        <div>
          <Label>{t('admin.owner_phone')}</Label>
          <Input
            placeholder={t('admin.search_by_phone')}
            value={filter.ownerPhone || ''}
            onChange={(e) => setFilter(f => ({ ...f, ownerPhone: e.target.value }))}
          />
        </div>
        <div>
          <Label>{t('admin.subscription_status')}</Label>
          <Select 
            value={filter.subscriptionStatus || 'all'} 
            onValueChange={(v) => setFilter(f => ({ ...f, subscriptionStatus: v === 'all' ? undefined : v }))}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              {SUBSCRIPTION_STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={filter.isActive ?? true}
            onCheckedChange={(checked) => setFilter(f => ({ ...f, isActive: checked }))}
          />
          <Label>{t('admin.active_only')}</Label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSearch}><Search className="w-4 h-4 mr-2" />{t('common.search')}</Button>
        <Button variant="outline" onClick={handleResetFilters}><X className="w-4 h-4 mr-2" />{t('common.clear')}</Button>
      </div>
    </div>
  )

  const MobileCard = ({ company }: { company: AdminCompany }) => (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{company.companyName}</h3>
            <p className="text-sm text-muted-foreground">{company.ownerEmail}</p>
          </div>
          {getStatusBadge(company.subscriptionStatus)}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="flex items-center gap-1"><Users className="w-4 h-4" />{company.userCount} {t('admin.users')}</div>
          <div className="flex items-center gap-1"><FileText className="w-4 h-4" />{company.montageCount} {t('admin.montages')}</div>
          <div>{t('admin.plan')}: {company.subscriptionPlan}</div>
          <div>{company.isActive ? <Badge variant="success">{t('common.active')}</Badge> : <Badge variant="destructive">{t('common.inactive')}</Badge>}</div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openEdit(company)} className="flex-1">
            <Edit className="w-4 h-4 mr-1" />{t('common.edit')}
          </Button>
          {company.isActive ? (
            <Button size="sm" variant="destructive" onClick={() => { setSelectedCompany(company); setIsDeleteOpen(true) }} className="flex-1">
              <Trash2 className="w-4 h-4 mr-1" />{t('common.delete')}
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => handleRestore(company)} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-1" />{t('common.restore')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            {t('admin.companies_management')}
          </CardTitle>
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <Filter className="w-4 h-4 mr-2" />{t('common.filters')}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader><SheetTitle>{t('common.filters')}</SheetTitle></SheetHeader>
              <div className="mt-4"><FilterPanel /></div>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block mb-6"><FilterPanel /></div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.company_name')}</TableHead>
                  <TableHead>{t('admin.owner')}</TableHead>
                  <TableHead>{t('admin.subscription')}</TableHead>
                  <TableHead>{t('admin.users')}</TableHead>
                  <TableHead>{t('admin.montages')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">{t('common.loading')}</TableCell></TableRow>
                ) : companies.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">{t('common.no_data')}</TableCell></TableRow>
                ) : companies.map(company => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.companyName}</TableCell>
                    <TableCell>
                      <div>{company.ownerName}</div>
                      <div className="text-sm text-muted-foreground">{company.ownerEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div>{getStatusBadge(company.subscriptionStatus)}</div>
                      <div className="text-xs text-muted-foreground mt-1">{company.subscriptionPlan}</div>
                    </TableCell>
                    <TableCell>{company.userCount}</TableCell>
                    <TableCell>{company.montageCount}</TableCell>
                    <TableCell>
                      {company.isActive ? <Badge variant="success">{t('common.active')}</Badge> : <Badge variant="destructive">{t('common.inactive')}</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(company)}><Edit className="w-4 h-4" /></Button>
                        {company.isActive ? (
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedCompany(company); setIsDeleteOpen(true) }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => handleRestore(company)}><RotateCcw className="w-4 h-4" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden">
            {loading ? <div className="text-center py-8">{t('common.loading')}</div> :
              companies.length === 0 ? <div className="text-center py-8">{t('common.no_data')}</div> :
              companies.map(company => <MobileCard key={company.id} company={company} />)}
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" disabled={filter.page === 1} onClick={() => setFilter(f => ({ ...f, page: (f.page || 1) - 1 }))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span>{t('common.page')} {filter.page} / {totalPages}</span>
            <Button variant="outline" disabled={filter.page === totalPages} onClick={() => setFilter(f => ({ ...f, page: (f.page || 1) + 1 }))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.edit_subscription')}</DialogTitle>
            <DialogDescription>{selectedCompany?.companyName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('admin.subscription_plan')}</Label>
              <Select value={subscriptionForm.subscriptionPlan} onValueChange={(v) => setSubscriptionForm(f => ({ ...f, subscriptionPlan: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_PLAN_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('admin.subscription_status')}</Label>
              <Select value={subscriptionForm.subscriptionStatus} onValueChange={(v) => setSubscriptionForm(f => ({ ...f, subscriptionStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={subscriptionForm.isSubscriptionActive ?? true} onCheckedChange={(checked) => setSubscriptionForm(f => ({ ...f, isSubscriptionActive: checked }))} />
              <Label>{t('admin.subscription_active')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleUpdateSubscription}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.confirm_delete')}</DialogTitle>
            <DialogDescription>{t('admin.delete_company_warning', { name: selectedCompany?.companyName })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t('common.delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
