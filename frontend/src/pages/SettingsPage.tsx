import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { 
  Settings, 
  User, 
  Building2, 
  CreditCard, 
  Bell,
  Shield,
  Palette,
  Globe,
  Moon,
  Sun,
  Pencil,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/context'
import { useTheme } from '@/components/theme-provider'
import { companyService } from '@/services'
import type { Company } from '@/types'
import { SubscriptionSection } from '@/components/subscription'

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()

  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'subscription' | 'preferences'>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [companyForm, setCompanyForm] = useState({
    name: '',
    bulstat: '',
    vat_number: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    warranty_default_months: 24
  })

  const [notifications, setNotifications] = useState({
    emailMontages: true,
    emailLowStock: true,
    emailSubscription: true,
    pushEnabled: false
  })

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['profile', 'company', 'subscription', 'preferences'].includes(tab)) {
      setActiveTab(tab as typeof activeTab)
    }

    const success = searchParams.get('success')
    if (success === 'true') {
      toast.success(t('subscription.payment_success'))
      refreshUser()
      searchParams.delete('success')
      setSearchParams(searchParams)
    }
  }, [searchParams, t, refreshUser])
  
  useEffect(() => {
    if (user?.company_id) {
      loadCompany()
    } else {
      setLoading(false)
    }
  }, [user])
  
  const loadCompany = async () => {
    if (!user?.company_id) return
    try {
      setLoading(true)
      const data = await companyService.getById(user.company_id)
      setCompany(data)
      // Initialize form with company data
      setCompanyForm({
        name: data.name || '',
        bulstat: data.bulstat || '',
        vat_number: data.vat_number || '',
        address: data.address || '',
        city: data.city || '',
        phone: data.phone || '',
        email: data.email || '',
        warranty_default_months: data.warranty_default_months || 24
      })
    } catch {
      console.error('Failed to load company')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCompany = async () => {
    if (!company?.id) return
    try {
      setSaving(true)
      await companyService.update(company.id, {
        name: companyForm.name,
        bulstat: companyForm.bulstat || null,
        vat_number: companyForm.vat_number || null,
        address: companyForm.address || null,
        city: companyForm.city || null,
        phone: companyForm.phone || null,
        email: companyForm.email || null,
        warranty_default_months: companyForm.warranty_default_months
      })
      toast.success(t('settings.company_updated', 'Company information updated successfully'))
      setIsEditing(false)
      loadCompany() // Reload to get fresh data
    } catch {
      toast.error(t('settings.company_update_error', 'Failed to update company information'))
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    // Reset form to original company data
    if (company) {
      setCompanyForm({
        name: company.name || '',
        bulstat: company.bulstat || '',
        vat_number: company.vat_number || '',
        address: company.address || '',
        city: company.city || '',
        phone: company.phone || '',
        email: company.email || '',
        warranty_default_months: company.warranty_default_months || 24
      })
    }
    setIsEditing(false)
  }
  
  const isAdmin = user?.roles.includes('Admin')
  const isManager = user?.roles.includes('Manager')
  
  const allTabs = [
    { id: 'profile', label: t('settings.profile', 'Profile'), icon: User },
    { id: 'company', label: t('settings.company', 'Company'), icon: Building2 },
    { id: 'subscription', label: t('settings.subscription', 'Subscription'), icon: CreditCard },
    { id: 'preferences', label: t('settings.preferences', 'Preferences'), icon: Settings }
  ] as const
  
  // Hide company tab from Admin users
  const tabs = isAdmin ? allTabs.filter(tab => tab.id !== 'company') : allTabs

  return (
    <div className="min-h-screen bg-background pt-16 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-64 lg:pt-8 transition-colors duration-300">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('settings.title', 'Settings')}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t('settings.subtitle', 'Manage your account and preferences')}
        </p>
      </div>
      
      {/* Mobile Tabs - Horizontal Scrollable */}
      <div className="lg:hidden mb-6 -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                  : 'bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-border'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6 lg:gap-8">
        {/* Desktop Sidebar Tabs */}
        <div className="hidden lg:block w-64 shrink-0">
          <Card className="glass-card sticky top-8">
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>
        
        {/* Content */}
        <div className="flex-1 max-w-full lg:max-w-3xl">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 sm:space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <User className="w-5 h-5 text-primary" />
                    {t('settings.profile_info', 'Profile Information')}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {t('settings.profile_desc', 'Your personal information')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-muted/30">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-lg sm:text-2xl font-bold text-primary">
                        {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-base sm:text-lg text-foreground truncate">{user?.full_name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{user?.email}</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                        {user?.roles.map(role => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">{t('settings.first_name', 'First Name')}</Label>
                      <Input value={user?.first_name || ''} disabled className="mt-1 bg-muted/20" />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">{t('settings.last_name', 'Last Name')}</Label>
                      <Input value={user?.last_name || ''} disabled className="mt-1 bg-muted/20" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t('settings.email', 'Email')}</Label>
                    <Input value={user?.email || ''} disabled className="mt-1 bg-muted/20" />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t('settings.phone', 'Phone')}</Label>
                    <Input value={user?.phone_number || t('settings.not_set', 'Not set')} disabled className="mt-1 bg-muted/20" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Shield className="w-5 h-5 text-primary" />
                    {t('settings.security', 'Security')}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {t('settings.security_desc', 'Manage your security settings')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => toast.info(t('settings.coming_soon', 'Coming soon!'))}>
                    {t('settings.change_password', 'Change Password')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Company Tab */}
          {activeTab === 'company' && (
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Building2 className="w-5 h-5 text-primary" />
                      {t('settings.company_info', 'Company Information')}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {t('settings.company_desc', 'Your company details')}
                    </CardDescription>
                  </div>
                  {isManager && company && !isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      {t('common.edit', 'Edit')}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-sm sm:text-base text-muted-foreground">
                    {t('common.loading', 'Loading...')}
                  </div>
                ) : company ? (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Company header - always visible */}
                    <div className="p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">{t('settings.company_name', 'Company Name')}</Label>
                          <Input 
                            value={companyForm.name} 
                            onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                            className="font-semibold"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-base sm:text-lg text-foreground">{company.name}</h3>
                          <p className="text-muted-foreground text-xs sm:text-sm">{company.city || 'No city'} • {company.company_type}</p>
                        </>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('settings.bulstat', 'BULSTAT')}</Label>
                        <Input 
                          value={isEditing ? companyForm.bulstat : (company.bulstat || '-')} 
                          onChange={(e) => setCompanyForm({...companyForm, bulstat: e.target.value})}
                          disabled={!isEditing} 
                          className={`mt-1 ${!isEditing ? 'bg-muted/20' : ''}`}
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('settings.vat', 'VAT Number')}</Label>
                        <Input 
                          value={isEditing ? companyForm.vat_number : (company.vat_number || '-')} 
                          onChange={(e) => setCompanyForm({...companyForm, vat_number: e.target.value})}
                          disabled={!isEditing} 
                          className={`mt-1 ${!isEditing ? 'bg-muted/20' : ''}`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('settings.address', 'Address')}</Label>
                        <Input 
                          value={isEditing ? companyForm.address : (company.address || '-')} 
                          onChange={(e) => setCompanyForm({...companyForm, address: e.target.value})}
                          disabled={!isEditing} 
                          className={`mt-1 ${!isEditing ? 'bg-muted/20' : ''}`}
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('settings.city', 'City')}</Label>
                        <Input 
                          value={isEditing ? companyForm.city : (company.city || '-')} 
                          onChange={(e) => setCompanyForm({...companyForm, city: e.target.value})}
                          disabled={!isEditing} 
                          className={`mt-1 ${!isEditing ? 'bg-muted/20' : ''}`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('settings.phone', 'Phone')}</Label>
                        <Input 
                          value={isEditing ? companyForm.phone : (company.phone || '-')} 
                          onChange={(e) => setCompanyForm({...companyForm, phone: e.target.value})}
                          disabled={!isEditing} 
                          className={`mt-1 ${!isEditing ? 'bg-muted/20' : ''}`}
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">{t('settings.email', 'Email')}</Label>
                        <Input 
                          value={isEditing ? companyForm.email : (company.email || '-')} 
                          onChange={(e) => setCompanyForm({...companyForm, email: e.target.value})}
                          disabled={!isEditing} 
                          className={`mt-1 ${!isEditing ? 'bg-muted/20' : ''}`}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">{t('settings.warranty', 'Default Warranty (months)')}</Label>
                      <Input 
                        type="number"
                        value={isEditing ? companyForm.warranty_default_months : (company.warranty_default_months || 24)} 
                        onChange={(e) => setCompanyForm({...companyForm, warranty_default_months: parseInt(e.target.value) || 24})}
                        disabled={!isEditing} 
                        className={`mt-1 ${!isEditing ? 'bg-muted/20' : ''} w-32`}
                      />
                    </div>
                    
                    {/* Save/Cancel buttons when editing */}
                    {isEditing && (
                      <div className="flex gap-3 pt-4 border-t border-border/50">
                        <Button onClick={handleSaveCompany} disabled={saving}>
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                          <X className="w-4 h-4 mr-2" />
                          {t('common.cancel', 'Cancel')}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm sm:text-base text-muted-foreground">
                    {t('settings.no_company', 'No company associated with your account')}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <SubscriptionSection />
          )}
          
          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Appearance */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Palette className="w-5 h-5 text-primary" />
                    {t('settings.appearance', 'Appearance')}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {t('settings.appearance_desc', 'Customize how the app looks')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-500" />}
                      <div>
                        <p className="font-medium text-foreground">{t('settings.theme', 'Theme')}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{t('settings.theme_desc', 'Choose your preferred theme')}</p>
                      </div>
                    </div>
                    <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">{t('settings.light', 'Light')}</SelectItem>
                        <SelectItem value="dark">{t('settings.dark', 'Dark')}</SelectItem>
                        <SelectItem value="system">{t('settings.system', 'System')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              {/* Language */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Globe className="w-5 h-5 text-primary" />
                    {t('settings.language', 'Language')}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {t('settings.language_desc', 'Choose your preferred language')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="bg">Български</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              {/* Notifications */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Bell className="w-5 h-5 text-primary" />
                    {t('settings.notifications', 'Notifications')}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {t('settings.notifications_desc', 'Manage your notification preferences')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{t('settings.email_montages', 'Montage updates')}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{t('settings.email_montages_desc', 'Get notified about montage status changes')}</p>
                    </div>
                    <Switch 
                      checked={notifications.emailMontages} 
                      onCheckedChange={(checked) => setNotifications({...notifications, emailMontages: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-border/50 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{t('settings.email_low_stock', 'Low stock alerts')}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{t('settings.email_low_stock_desc', 'Get notified when inventory is low')}</p>
                    </div>
                    <Switch 
                      checked={notifications.emailLowStock} 
                      onCheckedChange={(checked) => setNotifications({...notifications, emailLowStock: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-border/50 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{t('settings.email_subscription', 'Subscription reminders')}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{t('settings.email_subscription_desc', 'Get notified before subscription expires')}</p>
                    </div>
                    <Switch 
                      checked={notifications.emailSubscription} 
                      onCheckedChange={(checked) => setNotifications({...notifications, emailSubscription: checked})}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
