import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AuthLayout } from '@/components/layout'
import { FieldMessage } from '@/components/shared'
import { useAuth } from '@/context'
import { useFieldValidation } from '@/hooks'
import {
  required, minLength, maxLength, email,
  passwordStrength, matchesField, optional,
  bulgarianPhone, bulstat, vatNumber, postalCode
} from '@/lib/validation-rules'
import { COMPANY_TYPE_OPTIONS } from '@/types'
import { authService } from '@/services/auth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { register, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [termsError, setTermsError] = useState(false)
  const emailCheckRef      = useRef<ReturnType<typeof setTimeout> | null>(null)
  const emailCheckAbortRef = useRef<AbortController | null>(null)

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

  // Validation rules for step 1
  const step1Rules = useMemo(() => ({
    firstName: [
      required('validation.first_name_required'),
      minLength(2, 'validation.first_name_min_length'),
      maxLength(60, 'validation.first_name_max_length'),
    ],
    lastName: [
      required('validation.last_name_required'),
      minLength(2, 'validation.last_name_min_length'),
      maxLength(60, 'validation.last_name_max_length'),
    ],
    email: [
      required('validation.email_required'),
      email('validation.email_invalid'),
      maxLength(50, 'validation.email_max_length'),
    ],
    phoneNumber: [
      optional(bulgarianPhone('validation.phone_invalid_bg')),
    ],
    password: [
      required('validation.password_required'),
      passwordStrength(),
    ],
    confirmPassword: [
      required('validation.confirm_password_required'),
      matchesField(() => formData.password, 'validation.passwords_not_match'),
    ],
  }), [formData.password])

  // Validation rules for step 2
  const step2Rules = useMemo(() => ({
    companyName: [
      required('validation.company_name_required'),
      minLength(3, 'validation.company_name_min_length'),
      maxLength(60, 'validation.company_name_max_length'),
    ],
    bulstat: [
      optional(bulstat('validation.bulstat_invalid')),
    ],
    vatNumber: [
      optional(vatNumber('validation.vat_number_invalid')),
    ],
    companyPostalCode: [
      optional(postalCode('validation.postal_code_invalid')),
    ],
    companyPhone: [
      optional(bulgarianPhone('validation.phone_invalid_bg')),
    ],
    companyEmail: [
      optional(email('validation.email_invalid')),
    ],
  }), [])

  const step1Validation = useFieldValidation(step1Rules)
  const step2Validation = useFieldValidation(step2Rules)

  // M-4: Cancel any in-flight email-check request and pending timer on unmount
  // to prevent setState calls on an unmounted component.
  useEffect(() => {
    return () => {
      if (emailCheckRef.current)      clearTimeout(emailCheckRef.current)
      if (emailCheckAbortRef.current) emailCheckAbortRef.current.abort()
    }
  }, [])

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true })
  }

  const handleBlur = useCallback((fieldName: string, value: string, stepNum: 1 | 2) => {
    const validation = stepNum === 1 ? step1Validation : step2Validation
    validation.validateField(fieldName, value)

    // Async email check after local validation passes
    if (fieldName === 'email' && value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      if (emailCheckRef.current)      clearTimeout(emailCheckRef.current)
      if (emailCheckAbortRef.current) emailCheckAbortRef.current.abort()

      emailCheckRef.current = setTimeout(async () => {
        // M-3: Each invocation gets a fresh AbortController so we can cancel
        // the fetch if the component unmounts or the user types again.
        const controller = new AbortController()
        emailCheckAbortRef.current = controller

        try {
          const result = await authService.checkEmail(value)
          if (!controller.signal.aborted) {
            if (!result.available) {
              step1Validation.setFieldState('email', { status: 'invalid', message: 'validation.email_taken' })
            } else {
              step1Validation.setFieldState('email', { status: 'valid', message: 'validation.email_available' })
            }
          }
        } catch {
          // If check fails or was aborted, don't block — server will catch it on submit
        }
      }, 300)
    }
  }, [step1Validation, step2Validation])

  const handleChange = useCallback((fieldName: string, value: string, stepNum: 1 | 2) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }))
    const validation = stepNum === 1 ? step1Validation : step2Validation
    const fieldState = validation.getFieldProps(fieldName)
    // Re-validate on change only if field has been touched
    if (fieldState.status !== 'idle') {
      validation.validateField(fieldName, value)
    }
  }, [step1Validation, step2Validation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      const isValid = step1Validation.validateAll(formData as Record<string, unknown>)
      if (isValid) {
        setStep(2)
      }
      return
    }

    // Step 2 validation
    const isValid = step2Validation.validateAll(formData as Record<string, unknown>)

    if (!agreedToTerms) {
      setTermsError(true)
      if (!isValid) return
      return
    }

    if (!isValid) return

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

      navigate('/login', {
        replace: true,
        state: { message: t('auth.check_email_confirm', 'Registration successful! Please check your email to confirm your account.') }
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('auth.registration_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout activePage="register">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">{t('auth.create_account_title')}</h2>
        <p className="text-muted-foreground text-sm mb-6">
          {step === 1 ? t('auth.personal_info_desc') : t('auth.company_info_desc')}
        </p>

        {/* Progress indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step > 1 ? 'bg-green-500 text-white' : step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className={`text-sm font-medium ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t('auth.step_personal')}
            </span>
          </div>
          <div className={`h-px w-8 ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
              {t('auth.step_company')}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-foreground font-medium text-sm">{t('auth.first_name')} *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value, 1)}
                    onBlur={(e) => handleBlur('firstName', e.target.value, 1)}
                    aria-invalid={step1Validation.getFieldProps('firstName').status === 'invalid'}
                    className="pl-10 h-11 bg-background border-border"
                  />
                </div>
                <FieldMessage {...step1Validation.getFieldProps('firstName')} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-foreground font-medium text-sm">{t('auth.last_name')} *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value, 1)}
                    onBlur={(e) => handleBlur('lastName', e.target.value, 1)}
                    aria-invalid={step1Validation.getFieldProps('lastName').status === 'invalid'}
                    className="pl-10 h-11 bg-background border-border"
                  />
                </div>
                <FieldMessage {...step1Validation.getFieldProps('lastName')} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="middleName" className="text-foreground font-medium text-sm">{t('auth.middle_name')}</Label>
                <Input
                  id="middleName"
                  placeholder="Optional"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="h-11 bg-background border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-foreground font-medium text-sm">{t('auth.email')} *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@airpro.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value, 1)}
                    onBlur={(e) => handleBlur('email', e.target.value, 1)}
                    aria-invalid={step1Validation.getFieldProps('email').status === 'invalid'}
                    className="pl-10 h-11 bg-background border-border"
                  />
                </div>
                <FieldMessage {...step1Validation.getFieldProps('email')} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" className="text-foreground font-medium text-sm">{t('auth.phone')}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+359 888 123 456"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value, 1)}
                    onBlur={(e) => handleBlur('phoneNumber', e.target.value, 1)}
                    aria-invalid={step1Validation.getFieldProps('phoneNumber').status === 'invalid'}
                    className="pl-10 h-11 bg-background border-border"
                  />
                </div>
                <FieldMessage {...step1Validation.getFieldProps('phoneNumber')} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-foreground font-medium text-sm">{t('auth.password')} *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value, 1)}
                    onBlur={(e) => handleBlur('password', e.target.value, 1)}
                    aria-invalid={step1Validation.getFieldProps('password').status === 'invalid'}
                    className="pl-10 h-11 bg-background border-border"
                  />
                </div>
                <FieldMessage {...step1Validation.getFieldProps('password')} />
                {step1Validation.getFieldProps('password').status === 'idle' && (
                  <p className="text-xs text-muted-foreground">{t('validation.password_requirements')}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium text-sm">{t('auth.confirm_password')} *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value, 1)}
                    onBlur={(e) => handleBlur('confirmPassword', e.target.value, 1)}
                    aria-invalid={step1Validation.getFieldProps('confirmPassword').status === 'invalid'}
                    className="pl-10 h-11 bg-background border-border"
                  />
                </div>
                <FieldMessage {...step1Validation.getFieldProps('confirmPassword')} />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-foreground font-medium text-sm">{t('auth.company_name')} *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    placeholder="AirPro Cooling Services"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value, 2)}
                    onBlur={(e) => handleBlur('companyName', e.target.value, 2)}
                    aria-invalid={step2Validation.getFieldProps('companyName').status === 'invalid'}
                    className="pl-10 h-11 bg-background border-border"
                  />
                </div>
                <FieldMessage {...step2Validation.getFieldProps('companyName')} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="companyType" className="text-foreground font-medium text-sm">{t('auth.company_type')} *</Label>
                <Select
                  value={formData.companyType}
                  onValueChange={(val) => setFormData({ ...formData, companyType: val })}
                >
                  <SelectTrigger id="companyType" className="h-11 bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bulstat" className="text-foreground font-medium text-sm">{t('auth.bulstat')}</Label>
                  <Input
                    id="bulstat"
                    placeholder="123456789"
                    value={formData.bulstat}
                    onChange={(e) => handleChange('bulstat', e.target.value, 2)}
                    onBlur={(e) => handleBlur('bulstat', e.target.value, 2)}
                    aria-invalid={step2Validation.getFieldProps('bulstat').status === 'invalid'}
                    className="h-11 bg-background border-border"
                  />
                  <FieldMessage {...step2Validation.getFieldProps('bulstat')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vatNumber" className="text-foreground font-medium text-sm">{t('auth.vat_number')}</Label>
                  <Input
                    id="vatNumber"
                    placeholder="BG123456789"
                    value={formData.vatNumber}
                    onChange={(e) => handleChange('vatNumber', e.target.value, 2)}
                    onBlur={(e) => handleBlur('vatNumber', e.target.value, 2)}
                    aria-invalid={step2Validation.getFieldProps('vatNumber').status === 'invalid'}
                    className="h-11 bg-background border-border"
                  />
                  <FieldMessage {...step2Validation.getFieldProps('vatNumber')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="companyCity" className="text-foreground font-medium text-sm">{t('auth.city')}</Label>
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
                <div className="space-y-1.5">
                  <Label htmlFor="companyPostalCode" className="text-foreground font-medium text-sm">{t('auth.postal_code')}</Label>
                  <Input
                    id="companyPostalCode"
                    placeholder="1000"
                    value={formData.companyPostalCode}
                    onChange={(e) => handleChange('companyPostalCode', e.target.value, 2)}
                    onBlur={(e) => handleBlur('companyPostalCode', e.target.value, 2)}
                    aria-invalid={step2Validation.getFieldProps('companyPostalCode').status === 'invalid'}
                    className="h-11 bg-background border-border"
                  />
                  <FieldMessage {...step2Validation.getFieldProps('companyPostalCode')} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="companyAddress" className="text-foreground font-medium text-sm">{t('auth.address')}</Label>
                <Input
                  id="companyAddress"
                  placeholder="ul. Example 123"
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                  className="h-11 bg-background border-border"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="companyPhone" className="text-foreground font-medium text-sm">Company Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="companyPhone"
                    type="tel"
                    placeholder="+359 888 123 456"
                    value={formData.companyPhone}
                    onChange={(e) => handleChange('companyPhone', e.target.value, 2)}
                    onBlur={(e) => handleBlur('companyPhone', e.target.value, 2)}
                    aria-invalid={step2Validation.getFieldProps('companyPhone').status === 'invalid'}
                    className="pl-10 h-11 bg-background border-border"
                  />
                </div>
                <FieldMessage {...step2Validation.getFieldProps('companyPhone')} />
              </div>

              {/* Terms of Service checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked)
                      if (e.target.checked) setTermsError(false)
                    }}
                    className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                  </span>
                </label>
                {termsError && (
                  <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
                    {t('validation.terms_required')}
                  </p>
                )}
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
              className={`${step === 1 ? 'w-full' : 'flex-1'} h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/25`}
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
          <p className="text-muted-foreground text-sm">
            {t('auth.already_have_account')}{' '}
            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              {t('auth.sign_in_link')}
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
