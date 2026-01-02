import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context'
import { COMPANY_TYPE_OPTIONS } from '@/types'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // User info
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    // Company info
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

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true })
  }

  const validateStep1 = (): boolean => {
    if (!formData.email || !formData.password || !formData.confirmPassword || 
        !formData.firstName || !formData.lastName) {
      toast.error('Please fill in all required fields')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
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
      toast.error('Please fill in company name and type')
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
      
      toast.success('Registration successful! Welcome to AirPro!')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <Snowflake className="w-6 h-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">AirPro</span>
        </Link>

        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Create Account</CardTitle>
            <CardDescription className="text-gray-400">
              {step === 1 ? 'Enter your personal information' : 'Enter your company information'}
            </CardDescription>
            {/* Progress indicator */}
            <div className="flex gap-2 justify-center mt-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                step >= 1 ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-gray-500'
              }`}>
                <User className="w-4 h-4" />
                Personal
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                step >= 2 ? 'bg-purple-500/20 text-purple-400' : 'bg-white/10 text-gray-500'
              }`}>
                <Building2 className="w-4 h-4" />
                Company
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">First Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName" className="text-white">Middle Name</Label>
                    <Input
                      id="middleName"
                      placeholder="Optional"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-white">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+359 888 123 456"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Min 6 chars, 1 uppercase, 1 lowercase, 1 digit</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 pl-10"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-white">Company Name *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        id="companyName"
                        placeholder="ACME Corp"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyType" className="text-white">Company Type *</Label>
                    <select
                      id="companyType"
                      value={formData.companyType}
                      onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                      className="w-full h-10 px-3 rounded-md bg-white/10 border border-white/20 text-white"
                    >
                      {COMPANY_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="bg-slate-900">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bulstat" className="text-white">Bulstat (EIK)</Label>
                      <Input
                        id="bulstat"
                        placeholder="123456789"
                        value={formData.bulstat}
                        onChange={(e) => setFormData({ ...formData, bulstat: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vatNumber" className="text-white">VAT Number</Label>
                      <Input
                        id="vatNumber"
                        placeholder="BG123456789"
                        value={formData.vatNumber}
                        onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyCity" className="text-white">City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          id="companyCity"
                          placeholder="Sofia"
                          value={formData.companyCity}
                          onChange={(e) => setFormData({ ...formData, companyCity: e.target.value })}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyPostalCode" className="text-white">Postal Code</Label>
                      <Input
                        id="companyPostalCode"
                        placeholder="1000"
                        value={formData.companyPostalCode}
                        onChange={(e) => setFormData({ ...formData, companyPostalCode: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyAddress" className="text-white">Address</Label>
                    <Input
                      id="companyAddress"
                      placeholder="ul. Example 123"
                      value={formData.companyAddress}
                      onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                {step === 2 && (
                  <Button 
                    type="button" 
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className={`${step === 1 ? 'w-full' : 'flex-1'} bg-purple-600 hover:bg-purple-700`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : step === 1 ? (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-purple-400 hover:text-purple-300">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
