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
  X,
  AlertTriangle,
  Trash,
  Loader2,
  KeyRound,
  Mail
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
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
import { companyService, employeeService, authService } from '@/services'
import type { Company } from '@/types'
import { SubscriptionSection } from '@/components/subscription'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

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
    company_name: '',
    company_type: '' as string,
    bulstat: '',
    vat_number: '',
    address: '',
    city: '',
    phone: '',
    email: '',
  })

  const [notifications, setNotifications] = useState({
    emailMontages: true,
    emailLowStock: true,
    emailSubscription: true,
    pushEnabled: false
  })

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  // Security section state
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' })
  const [newEmailValue, setNewEmailValue] = useState('')
  const [savingSecurity, setSavingSecurity] = useState(false)
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone_number: ''
  })

  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  const handleDeleteAccountAndCompany = async () => {
    setIsDeletingAccount(true)
    try {
      await employeeService.deleteAccountAndCompany()
      toast.success(t('settings.account_deleted', 'Account and company deleted successfully'))
      // Log out and redirect
      const { authService } = await import('@/services/auth')
      authService.logout()
      window.location.href = '/login'
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('common.unknown_error'))
    } finally {
      setIsDeletingAccount(false)
    }
  }

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
    if (!user) {
      setLoading(false)
      return
    }
    // Initialize profile form from user data
    setProfileForm({
      first_name: user.first_name || '',
      middle_name: user.middle_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      phone_number: user.phone_number || ''
    })
    // Load company data if available
    if (user.company_id) {
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
        company_name: data.company_name || '',
        company_type: data.company_type || '',
        bulstat: data.bulstat || '',
        vat_number: data.vat_number || '',
        address: data.address || '',
        city: data.city || '',
        phone: data.phone || '',
        email: data.email || '',
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
        company_name: companyForm.company_name,
        company_type: companyForm.company_type as any,
        bulstat: companyForm.bulstat || null,
        vat_number: companyForm.vat_number || null,
        address: companyForm.address || null,
        city: companyForm.city || null,
        phone: companyForm.phone || null,
        email: companyForm.email || null,
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
        company_name: company.company_name || '',
        company_type: company.company_type || '',
        bulstat: company.bulstat || '',
        vat_number: company.vat_number || '',
        address: company.address || '',
        city: company.city || '',
        phone: company.phone || '',
        email: company.email || '',
      })
    }
    setIsEditing(false)
  }

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true)
      const { authService } = await import('@/services/auth')
      await authService.updateProfile(profileForm)
      toast.success(t('settings.profile_updated', 'Profile updated successfully'))
      setIsEditingProfile(false)
      refreshUser()
    } catch {
      toast.error(t('settings.profile_update_error', 'Failed to update profile'))
    } finally {
      setSavingProfile(false)
    }
  }

  const handleCancelProfileEdit = () => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        middle_name: user.middle_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || ''
      })
    }
    setIsEditingProfile(false)
  }
  
  const isAdmin = user?.roles.includes('Admin')
  const isManager = user?.roles.includes('Manager')
  
  const allTabs = [
    { id: 'profile', label: t('settings.profile', 'Profile'), icon: User },
    { id: 'company', label: t('settings.company', 'Company'), icon: Building2 },
    { id: 'subscription', label: t('settings.subscription', 'Subscription'), icon: CreditCard },
    { id: 'preferences', label: t('settings.preferences', 'Preferences'), icon: Settings }
  ] as const
  
  // Hide company and subscription tabs from Admin users
  const tabs = isAdmin 
    ? allTabs.filter(tab => tab.id !== 'company' && tab.id !== 'subscription') 
    : allTabs

  return (
    <div className="min-h-screen bg-background pt-14 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8 transition-colors duration-300">
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
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all duration-200 border ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground border-border'
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
        <div className="hidden lg:block w-56 shrink-0">
          <Card className="glass-card sticky top-8">
            <CardContent className="p-2">
              <nav className="space-y-0.5">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left ${
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary border-l-2 border-primary pl-[10px]'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border-l-2 border-transparent pl-[10px]'
                    }`}
                  >
                    <tab.icon className="w-4 h-4 shrink-0" />
                    <span className="font-medium text-sm">{tab.label}</span>
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
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <User className="w-5 h-5 text-primary" />
                        {t('settings.profile_info', 'Profile Information')}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {t('settings.profile_desc', 'Your personal information')}
                      </CardDescription>
                    </div>
                    {!isEditingProfile && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        {t('common.edit', 'Edit')}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-muted/30">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-lg sm:text-2xl font-bold text-primary">
                        {(isEditingProfile ? profileForm.first_name : user?.first_name)?.charAt(0)}{(isEditingProfile ? profileForm.last_name : user?.last_name)?.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-base sm:text-lg text-foreground truncate">
                        {isEditingProfile ? `${profileForm.first_name} ${profileForm.last_name}` : user?.full_name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {isEditingProfile ? profileForm.email : user?.email}
                      </p>
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
                      <Input 
                        value={isEditingProfile ? profileForm.first_name : (user?.first_name || '')} 
                        onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                        disabled={!isEditingProfile} 
                        className={`mt-1 ${!isEditingProfile ? 'bg-muted/20' : ''}`}
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">{t('settings.middle_name', 'Middle Name')}</Label>
                      <Input 
                        value={isEditingProfile ? profileForm.middle_name : (user?.middle_name || '')} 
                        onChange={(e) => setProfileForm({...profileForm, middle_name: e.target.value})}
                        disabled={!isEditingProfile} 
                        className={`mt-1 ${!isEditingProfile ? 'bg-muted/20' : ''}`}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t('settings.last_name', 'Last Name')}</Label>
                    <Input 
                      value={isEditingProfile ? profileForm.last_name : (user?.last_name || '')} 
                      onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                      disabled={!isEditingProfile} 
                      className={`mt-1 ${!isEditingProfile ? 'bg-muted/20' : ''}`}
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t('settings.email', 'Email')}</Label>
                    <Input
                      value={user?.email || ''}
                      disabled
                      className="mt-1 bg-muted/20"
                    />
                    {isEditingProfile && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('settings.email_change_hint', 'Use Change Email in the Security section below to update your email.')}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">{t('settings.phone', 'Phone')}</Label>
                    <Input 
                      value={isEditingProfile ? profileForm.phone_number : (user?.phone_number || '')} 
                      onChange={(e) => setProfileForm({...profileForm, phone_number: e.target.value})}
                      disabled={!isEditingProfile} 
                      placeholder={!isEditingProfile ? t('settings.not_set', 'Not set') : ''}
                      className={`mt-1 ${!isEditingProfile ? 'bg-muted/20' : ''}`}
                    />
                  </div>

                  {isEditingProfile && (
                    <div className="flex gap-3 pt-4 border-t border-border/50">
                      <Button onClick={handleSaveProfile} disabled={savingProfile}>
                        <Save className="w-4 h-4 mr-2" />
                        {savingProfile ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
                      </Button>
                      <Button variant="outline" onClick={handleCancelProfileEdit} disabled={savingProfile}>
                        <X className="w-4 h-4 mr-2" />
                        {t('common.cancel', 'Cancel')}
                      </Button>
                    </div>
                  )}
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
                <CardContent className="space-y-6">
                  {/* Change Password */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{t('settings.change_password', 'Change Password')}</span>
                      </div>
                      {!isChangingPassword && (
                        <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}>
                          {t('common.change', 'Change')}
                        </Button>
                      )}
                    </div>
                    {isChangingPassword && (
                      <div className="space-y-3 pl-6">
                        <div>
                          <Label className="text-sm">{t('auth.new_password', 'New Password')}</Label>
                          <PasswordInput
                            placeholder={t('auth.new_password_placeholder', 'Enter new password')}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="mt-1"
                            containerClassName="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">{t('auth.confirm_password', 'Confirm Password')}</Label>
                          <PasswordInput
                            placeholder={t('auth.confirm_password_placeholder', 'Confirm new password')}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="mt-1"
                            containerClassName="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={savingSecurity}
                            onClick={async () => {
                              if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                                toast.error(t('auth.passwords_dont_match', 'Passwords do not match.'))
                                return
                              }
                              if (passwordForm.newPassword.length < 6) {
                                toast.error(t('auth.password_too_short', 'Password must be at least 6 characters.'))
                                return
                              }
                              setSavingSecurity(true)
                              try {
                                await authService.changePassword(passwordForm.newPassword, passwordForm.confirmPassword)
                                toast.success(t('settings.password_changed', 'Password changed successfully!'))
                                setIsChangingPassword(false)
                                setPasswordForm({ newPassword: '', confirmPassword: '' })
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : t('settings.password_change_failed', 'Failed to change password.'))
                              } finally {
                                setSavingSecurity(false)
                              }
                            }}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            {t('common.save', 'Save')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsChangingPassword(false)
                              setPasswordForm({ newPassword: '', confirmPassword: '' })
                            }}
                          >
                            {t('common.cancel', 'Cancel')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border" />

                  {/* Change Email */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium text-sm">{t('settings.change_email', 'Change Email')}</span>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      {!isChangingEmail && (
                        <Button variant="outline" size="sm" onClick={() => setIsChangingEmail(true)}>
                          {t('common.change', 'Change')}
                        </Button>
                      )}
                    </div>
                    {isChangingEmail && (
                      <div className="space-y-3 pl-6">
                        <div>
                          <Label className="text-sm">{t('settings.new_email', 'New Email')}</Label>
                          <Input
                            type="email"
                            placeholder={t('settings.new_email_placeholder', 'Enter new email')}
                            value={newEmailValue}
                            onChange={(e) => setNewEmailValue(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={savingSecurity}
                            onClick={async () => {
                              if (!newEmailValue) {
                                toast.error(t('settings.email_required', 'Email is required.'))
                                return
                              }
                              setSavingSecurity(true)
                              try {
                                await authService.requestEmailChange(newEmailValue)
                                toast.success(t('settings.email_change_sent', 'Confirmation link sent to your new email. Check your inbox.'))
                                setIsChangingEmail(false)
                                setNewEmailValue('')
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : t('settings.email_change_failed', 'Failed to request email change.'))
                              } finally {
                                setSavingSecurity(false)
                              }
                            }}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            {t('settings.send_confirmation', 'Send Confirmation')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIsChangingEmail(false)
                              setNewEmailValue('')
                            }}
                          >
                            {t('common.cancel', 'Cancel')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Company Tab */}
          {activeTab === 'company' && (
            <div className="space-y-4 sm:space-y-6">
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
                            value={companyForm.company_name} 
                            onChange={(e) => setCompanyForm({...companyForm, company_name: e.target.value})}
                            className="font-semibold"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="font-semibold text-base sm:text-lg text-foreground">{company.company_name}</h3>
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

            {/* Danger Zone — only for Managers */}
            {isManager && company && (
              <Card className="glass-card border-red-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                    {t('settings.danger_zone', 'Danger Zone')}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {t('settings.danger_zone_desc', 'Irreversible actions that affect your entire account')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{t('settings.delete_account_title', 'Delete account and company')}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t('settings.delete_account_desc', 'Permanently delete your account, company, all employees, montages, inventory, and associated data. This action cannot be undone.')}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      className="shrink-0"
                      onClick={() => { setDeleteConfirmText(''); setDeleteAccountDialogOpen(true) }}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      {t('settings.delete_account', 'Delete Account')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Delete Account Confirmation Dialog */}
            <Dialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
              <DialogContent className="bg-card border-border text-card-foreground sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                    {t('settings.delete_account_confirm_title', 'Are you absolutely sure?')}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground pt-2">
                    {t('settings.delete_account_confirm_desc', 'This will permanently delete your account, the company "{companyName}", all employees, montages, inventory items, and all associated data. This action is irreversible.', { companyName: company?.company_name })}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3">
                  <Label className="text-sm text-muted-foreground">
                    {t('settings.delete_account_type_confirm', 'Type "{companyName}" to confirm:', { companyName: company?.company_name })}
                  </Label>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={company?.company_name || ''}
                    className="bg-background border-input"
                  />
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setDeleteAccountDialogOpen(false)} disabled={isDeletingAccount}>
                    {t('common.cancel', 'Cancel')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccountAndCompany}
                    disabled={deleteConfirmText !== company?.company_name || isDeletingAccount}
                  >
                    {isDeletingAccount && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {t('settings.delete_everything', 'Delete Everything')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
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
                      <SelectItem value="bg">Български</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              {/* Notifications - Hidden from Admin. M4: marked Coming Soon — all switches
                  disabled, body dimmed + pointer-events-none so the toggles can't be clicked. */}
              {!isAdmin && (
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <Bell className="w-5 h-5 text-primary" />
                        {t('settings.notifications', 'Notifications')}
                      </CardTitle>
                      <Badge variant="secondary">
                        {t('settings.notifications_coming_soon', 'Coming Soon')}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {t('settings.notifications_desc', 'Manage your notification preferences')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent
                    className="space-y-4 opacity-60 pointer-events-none select-none"
                    aria-disabled="true"
                  >
                    <div className="flex items-center justify-between py-2 gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{t('settings.email_montages', 'Montage updates')}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">{t('settings.email_montages_desc', 'Get notified about montage status changes')}</p>
                      </div>
                      <Switch
                        disabled
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
                        disabled
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
                        disabled
                        checked={notifications.emailSubscription}
                        onCheckedChange={(checked) => setNotifications({...notifications, emailSubscription: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
