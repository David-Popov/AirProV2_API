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
import { SubscriptionSection } from '@/components/subscription'

export default function SettingsPage() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  
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
  
  // Handle URL params for tab switching
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['profile', 'company', 'subscription', 'preferences'].includes(tab)) {
      setActiveTab(tab as typeof activeTab)
    }
    
    // Show success message if coming from Stripe
    const success = searchParams.get('success')
    if (success === 'true') {
      toast.success(t('subscription.payment_success'))
      // Clean up URL
      searchParams.delete('success')
      setSearchParams(searchParams)
    }
  }, [searchParams, t])
  
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
            <SubscriptionSection />
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
