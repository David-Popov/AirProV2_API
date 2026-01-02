import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // User info
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    // Company info
    companyName: '',
    companyType: 'LLC',
    bulstat: '',
    companyCity: '',
    companyAddress: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      setStep(2)
      return
    }
    
    setIsLoading(true)
    
    // TODO: Implement actual registration
    console.log('Register:', formData)
    
    setTimeout(() => {
      setIsLoading(false)
      navigate('/dashboard')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
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
              <div className={`w-16 h-1 rounded-full ${step >= 1 ? 'bg-purple-500' : 'bg-white/20'}`} />
              <div className={`w-16 h-1 rounded-full ${step >= 2 ? 'bg-purple-500' : 'bg-white/20'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">Last Name</Label>
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
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-white">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="+359 888 123 456"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-white">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="ACME Corp"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyType" className="text-white">Company Type</Label>
                    <select
                      id="companyType"
                      value={formData.companyType}
                      onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                      className="w-full h-10 px-3 rounded-md bg-white/10 border border-white/20 text-white"
                    >
                      <option value="SoleProprietorship" className="bg-slate-900">Sole Proprietorship (ЕТ)</option>
                      <option value="LLC" className="bg-slate-900">LLC (ООД)</option>
                      <option value="LTD" className="bg-slate-900">LTD (ЕООД)</option>
                      <option value="JSC" className="bg-slate-900">JSC (АД)</option>
                      <option value="Other" className="bg-slate-900">Other</option>
                    </select>
                  </div>
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
                    <Label htmlFor="companyCity" className="text-white">City</Label>
                    <Input
                      id="companyCity"
                      placeholder="Sofia"
                      value={formData.companyCity}
                      onChange={(e) => setFormData({ ...formData, companyCity: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
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
                    Back
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className={`${step === 1 ? 'w-full' : 'flex-1'} bg-purple-600 hover:bg-purple-700`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : step === 1 ? 'Continue' : 'Create Account'}
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
