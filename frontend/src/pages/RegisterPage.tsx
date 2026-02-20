import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { 
  Snowflake, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building2, 
  MapPin,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/context'
import { validatePasswordRules, isValidEmail } from '@/lib/validators'
import { COMPANY_TYPE_OPTIONS } from '@/types'
import { ModeToggle } from '@/components/mode-toggle'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { register, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    companyName: '',
    companyType: 'LLC',
    bulstat: '',
    vatNumber: '',
    isVatRegistered: false,
    companyCity: '',
    companyAddress: '',
    companyPostalCode: '',
    companyPhone: '',
    companyEmail: '',
    warrantyDefaultMonths: 12,
  })

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true })
  }

  const validateStep1 = (): boolean => {
    const errors: string[] = []

    if (!formData.firstName.trim()) {
      errors.push(t('validation.first_name_required'))
    }
    if (!formData.lastName.trim()) {
      errors.push(t('validation.last_name_required'))
    }
    if (!formData.email.trim()) {
      errors.push(t('validation.email_required'))
    } else if (!isValidEmail(formData.email)) {
      errors.push(t('validation.email_invalid'))
    }

    if (!formData.password) {
      errors.push(t('validation.password_required'))
    } else {
      errors.push(...validatePasswordRules(formData.password).map(key => t(key)))
    }

    if (!formData.confirmPassword) {
      errors.push(t('validation.confirm_password_required'))
    } else if (formData.password !== formData.confirmPassword) {
      errors.push(t('validation.passwords_not_match'))
    }

    if (errors.length > 0) {
      toast.error(errors.join('. '))
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      if (validateStep1()) {
        setStep(2)
      }
      return
    }
    
    if (!formData.companyName || !formData.companyType) {
      toast.error(t('auth.company_name_required'))
      return
    }
    
    setIsLoading(true)
    
    try {
      await register({
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        first_name: formData.firstName,
        middle_name: formData.middleName || null,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber || null,
        address: formData.address || null,
        company_name: formData.companyName,
        company_type: formData.companyType,
        bulstat: formData.bulstat || null,
        vat_number: formData.vatNumber || null,
        is_vat_registered: formData.isVatRegistered,
        company_address: formData.companyAddress || null,
        company_city: formData.companyCity || null,
        company_postal_code: formData.companyPostalCode || null,
        company_phone: formData.companyPhone || null,
        company_email: formData.companyEmail || null,
        warranty_default_months: formData.warrantyDefaultMonths,
      })
      
      toast.success(t('auth.registration_success'))
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('auth.registration_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-violet-400/5 rounded-full blur-3xl" />
      </div>
      
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
            <Snowflake className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-foreground">AirPro</span>
        </Link>

        <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl shadow-primary/5">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-foreground">{t('auth.create_account_title')}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {step === 1 ? t('auth.personal_info_desc') : t('auth.company_info_desc')}
            </CardDescription>
            {/* Progress indicator */}
            <div className="flex gap-3 justify-center mt-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                step >= 1
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step > 1 ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                {t('auth.step_personal')}
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                step >= 2
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20'
                  : 'bg-muted text-muted-foreground'
              }`}>
                <Building2 className="w-4 h-4" />
                {t('auth.step_company')}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-foreground font-medium">{t('auth.first_name')} *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                          className="pl-10 h-11 bg-background border-border"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-foreground font-medium">{t('auth.last_name')} *</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        className="h-11 bg-background border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName" className="text-foreground font-medium">{t('auth.middle_name')}</Label>
                    <Input
                      id="middleName"
                      placeholder="Optional"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                      className="h-11 bg-background border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground font-medium">{t('auth.email')} *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="pl-10 h-11 bg-background border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-foreground font-medium">{t('auth.phone')}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+359 888 123 456"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="pl-10 h-11 bg-background border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground font-medium">{t('auth.password')} *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="pl-10 h-11 bg-background border-border"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{t('validation.password_requirements')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground font-medium">{t('auth.confirm_password')} *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="pl-10 h-11 bg-background border-border"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-foreground font-medium">{t('auth.company_name')} *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        placeholder="ACME Corp"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                        className="pl-10 h-11 bg-background border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyType" className="text-foreground font-medium">{t('auth.company_type')} *</Label>
                    <Select
                      value={formData.companyType}
                      onValueChange={(val) => setFormData({ ...formData, companyType: val })}
                    >
                      <SelectTrigger id="companyType" className="h-11 bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                        {COMPANY_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bulstat" className="text-foreground font-medium">{t('auth.bulstat')}</Label>
                      <Input
                        id="bulstat"
                        placeholder="123456789"
                        value={formData.bulstat}
                        onChange={(e) => setFormData({ ...formData, bulstat: e.target.value })}
                        className="h-11 bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vatNumber" className="text-foreground font-medium">{t('auth.vat_number')}</Label>
                      <Input
                        id="vatNumber"
                        placeholder="BG123456789"
                        value={formData.vatNumber}
                        onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                        className="h-11 bg-background border-border"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyCity" className="text-foreground font-medium">{t('auth.city')}</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="companyCity"
                          placeholder="Sofia"
                          value={formData.companyCity}
                          onChange={(e) => setFormData({ ...formData, companyCity: e.target.value })}
                          className="pl-10 h-11 bg-background border-border"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyPostalCode" className="text-foreground font-medium">{t('auth.postal_code')}</Label>
                      <Input
                        id="companyPostalCode"
                        placeholder="1000"
                        value={formData.companyPostalCode}
                        onChange={(e) => setFormData({ ...formData, companyPostalCode: e.target.value })}
                        className="h-11 bg-background border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyAddress" className="text-foreground font-medium">{t('auth.address')}</Label>
                    <Input
                      id="companyAddress"
                      placeholder="ul. Example 123"
                      value={formData.companyAddress}
                      onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                      className="h-11 bg-background border-border"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('auth.back')}
                  </Button>
                )}
                <Button
                  type="submit"
                  className={`${step === 1 ? 'w-full' : 'flex-1'} h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 font-medium`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('auth.creating_account')}
                    </>
                  ) : step === 1 ? (
                    <>
                      {t('auth.continue')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      {t('auth.create_account_title')}
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {t('auth.already_have_account')}{' '}
                <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  {t('auth.sign_in_link')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t('auth.back_to_home')}
          </Link>
        </div>
      </div>
    </div>
  )
}
