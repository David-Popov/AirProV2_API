import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  CreditCard,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { companyService } from '@/services'
import type { Company, CreateCompanyRequest, UpdateCompanyRequest, CompanyUser } from '@/types'
import { COMPANY_TYPE_OPTIONS, SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUSES } from '@/types'

export default function CompaniesPage() {
  const { t } = useTranslation()
  
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false)
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false)
  
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([])
  
  const [formData, setFormData] = useState<CreateCompanyRequest>({
    company_name: '',
    company_type: 'LLC',
    bulstat: '',
    vat_number: '',
    is_vat_registered: false,
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    email: '',
    warranty_default_months: 24
  })
  
  const [subscriptionForm, setSubscriptionForm] = useState({
    subscription_plan: 'Basic',
    subscription_status: 'Active',
    start_date: '',
    end_date: ''
  })
  
  useEffect(() => {
    loadCompanies()
  }, [currentPage])
  
  const loadCompanies = async () => {
    try {
      setLoading(true)
      const response = await companyService.getAll(currentPage, 10)
      setCompanies(response.items)
      setTotalPages(response.totalPages)
      setTotalCount(response.totalCount)
    } catch {
      toast.error(t('companies.error_loading', 'Failed to load companies'))
    } finally {
      setLoading(false)
    }
  }
  
  // Filter companies by search
  const filteredCompanies = companies.filter(company =>
    (company.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.bulstat || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Handlers
  const handleCreate = async () => {
    try {
      await companyService.create(formData)
      toast.success(t('companies.created', 'Company created successfully'))
      setIsCreateDialogOpen(false)
      resetForm()
      loadCompanies()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('companies.error_creating', 'Failed to create company'))
    }
  }
  
  const handleUpdate = async () => {
    if (!selectedCompany) return
    try {
      await companyService.update(selectedCompany.id, formData as UpdateCompanyRequest)
      toast.success(t('companies.updated', 'Company updated successfully'))
      setIsEditDialogOpen(false)
      resetForm()
      loadCompanies()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('companies.error_updating', 'Failed to update company'))
    }
  }
  
  const handleDelete = async () => {
    if (!selectedCompany) return
    try {
      await companyService.delete(selectedCompany.id)
      toast.success(t('companies.deleted', 'Company deleted successfully'))
      setIsDeleteDialogOpen(false)
      setSelectedCompany(null)
      loadCompanies()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('companies.error_deleting', 'Failed to delete company'))
    }
  }
  
  const handleViewUsers = async (company: Company) => {
    try {
      setSelectedCompany(company)
      const users = await companyService.getUsers(company.id)
      setCompanyUsers(users)
      setIsUsersDialogOpen(true)
    } catch {
      toast.error(t('companies.error_loading_users', 'Failed to load company users'))
    }
  }
  
  const handleUpdateSubscription = async () => {
    if (!selectedCompany) return
    try {
      await companyService.updateSubscription(selectedCompany.id, {
        subscription_plan: subscriptionForm.subscription_plan,
        subscription_status: subscriptionForm.subscription_status,
        start_date: subscriptionForm.start_date || null,
        end_date: subscriptionForm.end_date || null
      })
      toast.success(t('companies.subscription_updated', 'Subscription updated successfully'))
      setIsSubscriptionDialogOpen(false)
      loadCompanies()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('companies.error_updating_subscription', 'Failed to update subscription'))
    }
  }
  
  const handleRenewSubscription = async (company: Company) => {
    try {
      await companyService.renewSubscription(company.id)
      toast.success(t('companies.subscription_renewed', 'Subscription renewed successfully'))
      loadCompanies()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('companies.error_renewing', 'Failed to renew subscription'))
    }
  }
  
  const openEditDialog = (company: Company) => {
    setSelectedCompany(company)
    setFormData({
      company_name: company.company_name,
      company_type: company.company_type,
      bulstat: company.bulstat || '',
      vat_number: company.vat_number || '',
      is_vat_registered: company.is_vat_registered,
      address: company.address || '',
      city: company.city || '',
      postal_code: company.postal_code || '',
      phone: company.phone || '',
      email: company.email || '',
      warranty_default_months: company.warranty_default_months || 24
    })
    setIsEditDialogOpen(true)
  }
  
  const openSubscriptionDialog = (company: Company) => {
    setSelectedCompany(company)
    setSubscriptionForm({
      subscription_plan: company.subscription_plan || 'Basic',
      subscription_status: company.subscription_status || 'Active',
      start_date: company.subscription_start_date || '',
      end_date: company.subscription_end_date || ''
    })
    setIsSubscriptionDialogOpen(true)
  }
  
  const resetForm = () => {
    setFormData({
      company_name: '',
      company_type: 'LLC',
      bulstat: '',
      vat_number: '',
      is_vat_registered: false,
      address: '',
      city: '',
      postal_code: '',
      phone: '',
      email: '',
      warranty_default_months: 24
    })
    setSelectedCompany(null)
  }
  
  const getStatusBadge = (status: string | null | undefined, isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">Inactive</Badge>
    }
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
      case 'Trial':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Trial</Badge>
      case 'Expired':
        return <Badge variant="destructive" className="bg-orange-500/10 text-orange-500 border-orange-500/20">Expired</Badge>
      case 'Cancelled':
        return <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">Cancelled</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }
  
  const getPlanBadge = (plan: string | null | undefined) => {
    switch (plan) {
      case 'FreeTrial':
        return <Badge variant="outline" className="border-blue-500/50 text-blue-400">Free Trial</Badge>
      case 'Basic':
        return <Badge variant="outline" className="border-green-500/50 text-green-400">Basic</Badge>
      case 'Premium':
        return <Badge variant="outline" className="border-purple-500/50 text-purple-400">Premium</Badge>
      case 'Enterprise':
        return <Badge variant="outline" className="border-amber-500/50 text-amber-400">Enterprise</Badge>
      default:
        return <Badge variant="outline">N/A</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background pt-16 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('companies.title', 'Companies')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('companies.subtitle', 'Manage companies and their subscriptions')}
          </p>
        </div>
        <Button 
          onClick={() => { resetForm(); setIsCreateDialogOpen(true) }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('companies.add_company', 'Add Company')}
        </Button>
      </div>
      
      <div className="flex flex-col lg:block">
        {/* Stats Cards - Order 2 on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 order-2 lg:order-none mt-6 lg:mt-0">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground text-sm font-medium">{t('companies.total', 'Total Companies')}</p>
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2 tracking-tight">{totalCount}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground text-sm font-medium">{t('companies.active', 'Active')}</p>
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2 tracking-tight">
              {companies.filter(c => c.is_active && c.subscription_status === 'Active').length}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground text-sm font-medium">{t('companies.trial', 'On Trial')}</p>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CreditCard className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2 tracking-tight">
              {companies.filter(c => c.subscription_plan === 'FreeTrial').length}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground text-sm font-medium">{t('companies.expired', 'Expired')}</p>
              <div className="p-2 rounded-lg bg-orange-500/10">
                <XCircle className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2 tracking-tight">
              {companies.filter(c => c.subscription_status === 'Expired').length}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Search - Order 1 on mobile */}
      <div className="mb-6 order-1 lg:order-none">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t('companies.search', 'Search companies...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50 border-border/50"
          />
        </div>
      </div>
      
      {/* Companies Table - Order 1 on mobile */}
      <Card className="glass-card order-1 lg:order-none">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {t('companies.all_companies', 'All Companies')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-sm sm:text-base text-muted-foreground">
              {t('common.loading', 'Loading...')}
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-8 text-sm sm:text-base text-muted-foreground">
              {t('companies.no_companies', 'No companies found')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      {t('companies.name', 'Name')}
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden md:table-cell">
                      {t('companies.type', 'Type')}
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium hidden md:table-cell">
                      {t('companies.city', 'City')}
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      {t('companies.plan', 'Plan')}
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      {t('companies.status', 'Status')}
                    </th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">
                      {t('common.actions', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground">{company.company_name}</p>
                          <p className="text-sm text-sm sm:text-base text-muted-foreground">{company.bulstat || 'No BULSTAT'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm sm:text-base text-muted-foreground hidden md:table-cell">
                        {COMPANY_TYPE_OPTIONS.find(t => t.value === company.company_type)?.label || company.company_type}
                      </td>
                      <td className="py-4 px-4 text-sm sm:text-base text-muted-foreground hidden md:table-cell">
                        {company.city || '-'}
                      </td>
                      <td className="py-4 px-4">
                        {getPlanBadge(company.subscription_plan)}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(company.subscription_status, company.is_active)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleViewUsers(company)}>
                                <Users className="w-4 h-4 mr-2" />
                                {t('companies.view_users', 'View Users')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openSubscriptionDialog(company)}>
                                <CreditCard className="w-4 h-4 mr-2" />
                                {t('companies.manage_subscription', 'Manage Subscription')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRenewSubscription(company)} className="text-green-500 focus:text-green-500 focus:bg-green-500/10">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {t('companies.renew', 'Renew Subscription')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(company)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                {t('common.edit', 'Edit')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => { setSelectedCompany(company); setIsDeleteDialogOpen(true) }}
                                className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('common.delete', 'Delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
              <p className="text-sm text-sm sm:text-base text-muted-foreground">
                {t('common.page_of', { current: currentPage, total: totalPages })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
      
      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditDialogOpen ? t('companies.edit_company', 'Edit Company') : t('companies.add_company', 'Add Company')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">{t('companies.name', 'Company Name')} *</label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  placeholder={t('companies.name_placeholder', 'Enter company name')}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t('companies.type', 'Company Type')} *</label>
                <Select
                  value={formData.company_type}
                  onValueChange={(value) => setFormData({...formData, company_type: value as typeof formData.company_type})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_TYPE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">{t('companies.bulstat', 'BULSTAT')}</label>
                <Input
                  value={formData.bulstat || ''}
                  onChange={(e) => setFormData({...formData, bulstat: e.target.value})}
                  placeholder="123456789"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t('companies.vat', 'VAT Number')}</label>
                <Input
                  value={formData.vat_number || ''}
                  onChange={(e) => setFormData({...formData, vat_number: e.target.value})}
                  placeholder="BG123456789"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">{t('companies.city', 'City')}</label>
                <Input
                  value={formData.city || ''}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder={t('companies.city_placeholder', 'Sofia')}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t('companies.address', 'Address')}</label>
                <Input
                  value={formData.address || ''}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder={t('companies.address_placeholder', 'Street address')}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t('companies.postal_code', 'Postal Code')}</label>
                <Input
                  value={formData.postal_code || ''}
                  onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                  placeholder="1000"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">{t('companies.phone', 'Phone')}</label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+359 888 123 456"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t('companies.email', 'Email')}</label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="company@example.com"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{t('companies.warranty_months', 'Default Warranty (months)')}</label>
              <Input
                type="number"
                value={formData.warranty_default_months || ''}
                onChange={(e) => setFormData({...formData, warranty_default_months: parseInt(e.target.value) || null})}
                placeholder="24"
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('companies.delete_confirm', 'Delete Company?')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('companies.delete_warning', 'This action cannot be undone. All users and data associated with this company will be deleted.')}
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
      
      {/* Users Dialog */}
      <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t('companies.users_for', 'Users for')} {selectedCompany?.company_name}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {companyUsers.length === 0 ? (
              <p className="text-center py-8 text-sm sm:text-base text-muted-foreground">
                {t('companies.no_users', 'No users found')}
              </p>
            ) : (
              <div className="space-y-3">
                {companyUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50">
                    <div>
                      <p className="font-medium text-foreground">{user.full_name}</p>
                      <p className="text-sm text-sm sm:text-base text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.roles && user.roles.map(role => (
                        <Badge key={role} variant="secondary">{role}</Badge>
                      ))}
                      {user.is_active ? (
                        <Badge className="bg-green-500/10 text-green-500">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUsersDialogOpen(false)}>
              {t('common.close', 'Close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Subscription Dialog */}
      <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('companies.manage_subscription', 'Manage Subscription')} - {selectedCompany?.company_name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground">{t('companies.subscription_plan', 'Plan')}</label>
              <Select
                value={subscriptionForm.subscription_plan}
                onValueChange={(value) => setSubscriptionForm({...subscriptionForm, subscription_plan: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <SelectItem key={plan.value} value={plan.value}>
                      {plan.label} - {plan.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">{t('companies.subscription_status', 'Status')}</label>
              <Select
                value={subscriptionForm.subscription_status}
                onValueChange={(value) => setSubscriptionForm({...subscriptionForm, subscription_status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">{t('companies.start_date', 'Start Date')}</label>
                <Input
                  type="date"
                  value={subscriptionForm.start_date?.split('T')[0] || ''}
                  onChange={(e) => setSubscriptionForm({...subscriptionForm, start_date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">{t('companies.end_date', 'End Date')}</label>
                <Input
                  type="date"
                  value={subscriptionForm.end_date?.split('T')[0] || ''}
                  onChange={(e) => setSubscriptionForm({...subscriptionForm, end_date: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubscriptionDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleUpdateSubscription}>
              {t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
