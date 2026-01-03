import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  Crown,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Moon,
  Sun
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

export default function SettingsPage() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'subscription' | 'preferences'>('profile')
  
  // Notification preferences (local state for demo)
  const [notifications, setNotifications] = useState({
    emailMontages: true,
    emailLowStock: true,
    emailSubscription: true,
    pushEnabled: false
  })
  
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
    } catch {
      console.error('Failed to load company')
    } finally {
      setLoading(false)
    }
  }
  
  const getSubscriptionDaysRemaining = () => {
    if (!company?.subscription_end_date) return null
    const end = new Date(company.subscription_end_date)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }
  
  const daysRemaining = getSubscriptionDaysRemaining()
  
  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case 'Active': return 'text-green-500'
      case 'Trial': return 'text-blue-500'
      case 'Expired': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }
  
  const tabs = [
    { id: 'profile', label: t('settings.profile', 'Profile'), icon: User },
    { id: 'company', label: t('settings.company', 'Company'), icon: Building2 },
    { id: 'subscription', label: t('settings.subscription', 'Subscription'), icon: CreditCard },
    { id: 'preferences', label: t('settings.preferences', 'Preferences'), icon: Settings }
  ] as const

  return (
    <div className="min-h-screen bg-background p-8 ml-64 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('settings.title', 'Settings')}</h1>
        <p className="text-muted-foreground">
          {t('settings.subtitle', 'Manage your account and preferences')}
        </p>
      </div>
      
      <div className="flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-64 shrink-0">
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
        <div className="flex-1 max-w-3xl">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    {t('settings.profile_info', 'Profile Information')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.profile_desc', 'Your personal information')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-foreground">{user?.full_name}</p>
                      <p className="text-muted-foreground">{user?.email}</p>
                      <div className="flex gap-2 mt-2">
                        {user?.roles.map(role => (
                          <Badge key={role} variant="secondary" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">{t('settings.first_name', 'First Name')}</Label>
                      <Input value={user?.first_name || ''} disabled className="mt-1 bg-muted/20" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t('settings.last_name', 'Last Name')}</Label>
                      <Input value={user?.last_name || ''} disabled className="mt-1 bg-muted/20" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('settings.email', 'Email')}</Label>
                    <Input value={user?.email || ''} disabled className="mt-1 bg-muted/20" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground">{t('settings.phone', 'Phone')}</Label>
                    <Input value={user?.phone_number || t('settings.not_set', 'Not set')} disabled className="mt-1 bg-muted/20" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    {t('settings.security', 'Security')}
                  </CardTitle>
                  <CardDescription>
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
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  {t('settings.company_info', 'Company Information')}
                </CardTitle>
                <CardDescription>
                  {t('settings.company_desc', 'Your company details')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('common.loading', 'Loading...')}
                  </div>
                ) : company ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <h3 className="font-semibold text-lg text-foreground">{company.name}</h3>
                      <p className="text-muted-foreground text-sm">{company.city || 'No city'} • {company.company_type}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">{t('settings.bulstat', 'BULSTAT')}</Label>
                        <Input value={company.bulstat || '-'} disabled className="mt-1 bg-muted/20" />
                      </div>
                      <div>
                        <Label className="text-muted-foreground">{t('settings.vat', 'VAT Number')}</Label>
                        <Input value={company.vat_number || '-'} disabled className="mt-1 bg-muted/20" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t('settings.address', 'Address')}</Label>
                      <Input value={company.address || '-'} disabled className="mt-1 bg-muted/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">{t('settings.phone', 'Phone')}</Label>
                        <Input value={company.phone || '-'} disabled className="mt-1 bg-muted/20" />
                      </div>
                      <div>
                        <Label className="text-muted-foreground">{t('settings.email', 'Email')}</Label>
                        <Input value={company.email || '-'} disabled className="mt-1 bg-muted/20" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">{t('settings.warranty', 'Default Warranty (months)')}</Label>
                      <Input value={company.warranty_default_months?.toString() || '24'} disabled className="mt-1 bg-muted/20" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('settings.no_company', 'No company associated with your account')}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    {t('settings.current_plan', 'Current Plan')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {t('common.loading', 'Loading...')}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Plan Card */}
                      <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-lg py-1 px-4 mb-2">
                              {company?.subscription_plan || user?.subscription_plan || 'Free Trial'}
                            </Badge>
                            <p className={`text-sm font-medium ${getStatusColor(company?.subscription_status || user?.subscription_status)}`}>
                              {company?.subscription_status || user?.subscription_status || 'Trial'}
                            </p>
                          </div>
                          <div className="text-right">
                            {daysRemaining !== null && (
                              <div className={`text-3xl font-bold ${daysRemaining <= 7 ? 'text-red-500' : 'text-foreground'}`}>
                                {daysRemaining}
                                <span className="text-sm font-normal text-muted-foreground ml-1">
                                  {t('settings.days_left', 'days left')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        {daysRemaining !== null && company?.subscription_start_date && company?.subscription_end_date && (
                          <div className="mb-4">
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${daysRemaining <= 7 ? 'bg-red-500' : 'bg-primary'}`}
                                style={{ 
                                  width: `${Math.max(0, Math.min(100, (daysRemaining / 30) * 100))}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{t('settings.start_date', 'Start')}: {company?.subscription_start_date ? new Date(company.subscription_start_date).toLocaleDateString() : '-'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{t('settings.end_date', 'End')}: {company?.subscription_end_date ? new Date(company.subscription_end_date).toLocaleDateString() : '-'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Warning for expiring soon */}
                      {daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
                        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-4">
                          <div className="p-2 bg-orange-500/20 rounded-full">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{t('settings.expiring_soon', 'Your subscription is expiring soon')}</p>
                            <p className="text-sm text-muted-foreground">
                              {t('settings.expiring_desc', 'Renew now to avoid service interruption')}
                            </p>
                          </div>
                          <Button className="bg-orange-500 hover:bg-orange-600">
                            {t('settings.renew_now', 'Renew Now')}
                          </Button>
                        </div>
                      )}
                      
                      {/* Plan Features */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-foreground">{t('settings.plan_includes', 'Your plan includes:')}</h4>
                        <ul className="space-y-2">
                          {[
                            t('settings.feature_montages', 'Unlimited montages'),
                            t('settings.feature_inventory', 'Inventory management'),
                            t('settings.feature_employees', 'Employee management'),
                            t('settings.feature_ac', 'Air conditioner database'),
                            t('settings.feature_reports', 'Basic reports')
                          ].map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button variant="outline" className="w-full" onClick={() => toast.info(t('settings.coming_soon', 'Coming soon!'))}>
                        {t('settings.upgrade_plan', 'Upgrade Plan')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Appearance */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    {t('settings.appearance', 'Appearance')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.appearance_desc', 'Customize how the app looks')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-amber-500" />}
                      <div>
                        <p className="font-medium text-foreground">{t('settings.theme', 'Theme')}</p>
                        <p className="text-sm text-muted-foreground">{t('settings.theme_desc', 'Choose your preferred theme')}</p>
                      </div>
                    </div>
                    <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}>
                      <SelectTrigger className="w-32">
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
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    {t('settings.language', 'Language')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.language_desc', 'Choose your preferred language')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
                    <SelectTrigger className="w-48">
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
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    {t('settings.notifications', 'Notifications')}
                  </CardTitle>
                  <CardDescription>
                    {t('settings.notifications_desc', 'Manage your notification preferences')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-foreground">{t('settings.email_montages', 'Montage updates')}</p>
                      <p className="text-sm text-muted-foreground">{t('settings.email_montages_desc', 'Get notified about montage status changes')}</p>
                    </div>
                    <Switch 
                      checked={notifications.emailMontages} 
                      onCheckedChange={(checked) => setNotifications({...notifications, emailMontages: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-border/50">
                    <div>
                      <p className="font-medium text-foreground">{t('settings.email_low_stock', 'Low stock alerts')}</p>
                      <p className="text-sm text-muted-foreground">{t('settings.email_low_stock_desc', 'Get notified when inventory is low')}</p>
                    </div>
                    <Switch 
                      checked={notifications.emailLowStock} 
                      onCheckedChange={(checked) => setNotifications({...notifications, emailLowStock: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between py-2 border-t border-border/50">
                    <div>
                      <p className="font-medium text-foreground">{t('settings.email_subscription', 'Subscription reminders')}</p>
                      <p className="text-sm text-muted-foreground">{t('settings.email_subscription_desc', 'Get notified before subscription expires')}</p>
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
