import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Users,
  Plus,
  Search,
  Trash,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { employeeService } from '@/services'
import type { Employee, CreateEmployeeRequest, EmployeeLimits } from '@/types'
import { TrialActivationModal, PremiumUpgradeModal } from '@/components/subscription'
import { useAuth } from '@/context'

export default function EmployeesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [employeeLimits, setEmployeeLimits] = useState<EmployeeLimits | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEmployee, setNewEmployee] = useState<CreateEmployeeRequest>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    address: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [trialModalOpen, setTrialModalOpen] = useState(false)

  const [premiumModalOpen, setPremiumModalOpen] = useState(false)
  const [premiumModalReason, setPremiumModalReason] = useState<'employee_limit' | 'trial_used' | 'general'>('general')

  const loadEmployees = async () => {
    setIsLoading(true)
    try {
      const data = await employeeService.getAll()
      setEmployees(data)
    } catch (error) {
      toast.error(t('common.unknown_error'))
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadEmployeeLimits = async () => {
    try {
      const limits = await employeeService.getLimits()
      setEmployeeLimits(limits)
    } catch (error) {
      console.error('Failed to load employee limits:', error)
    }
  }

  useEffect(() => {
    loadEmployees()
    loadEmployeeLimits()
  }, [])

  const handleCreate = async () => {
    if (employeeLimits && !employeeLimits.can_add_more) {
      if (employeeLimits.subscription_plan === 'Free') {
        if (user?.has_used_trial) {
          setPremiumModalReason('trial_used')
          setPremiumModalOpen(true)
          return
        } else {
          setTrialModalOpen(true)
          return
        }
      } else if (employeeLimits.subscription_plan === 'FreeTrial') {
        setPremiumModalReason('employee_limit')
        setPremiumModalOpen(true)
        return
      } else {
        setPremiumModalReason('general')
        setPremiumModalOpen(true)
        return
      }
    }

    setNewEmployee({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      address: ''
    })
    setIsDialogOpen(true)
  }

  // Password validation helper
  const validatePassword = (password: string): string[] => {
    const errors: string[] = []
    if (password.length < 8) {
      errors.push(t('validation.password_min_length', 'Password must be at least 8 characters'))
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(t('validation.password_uppercase', 'Password must contain at least one uppercase letter'))
    }
    if (!/[a-z]/.test(password)) {
      errors.push(t('validation.password_lowercase', 'Password must contain at least one lowercase letter'))
    }
    if (!/[0-9]/.test(password)) {
      errors.push(t('validation.password_number', 'Password must contain at least one number'))
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push(t('validation.password_special', 'Password must contain at least one special character'))
    }
    return errors
  }

  // Email validation helper
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors: string[] = []
    
    if (!newEmployee.first_name.trim()) {
      validationErrors.push(t('validation.first_name_required', 'First name is required'))
    }
    if (!newEmployee.last_name.trim()) {
      validationErrors.push(t('validation.last_name_required', 'Last name is required'))
    }
    if (!newEmployee.email.trim()) {
      validationErrors.push(t('validation.email_required', 'Email is required'))
    } else if (!validateEmail(newEmployee.email)) {
      validationErrors.push(t('validation.email_invalid', 'Please enter a valid email address'))
    }
    
    const passwordErrors = validatePassword(newEmployee.password)
    validationErrors.push(...passwordErrors)
    
    if (validationErrors.length > 0) {
      toast.error(validationErrors.join('. '))
      return
    }
    
    setIsSaving(true)
    try {
      await employeeService.create(newEmployee)
      toast.success(t('employees.created_success', 'Employee created successfully'))
      setIsDialogOpen(false)
      await loadEmployees()
      await loadEmployeeLimits() // Reload limits after creating employee
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return
    
    setIsDeleting(true)
    try {
      await employeeService.delete(employeeToDelete.id)
      toast.success(t('employees.deleted_success', 'Employee deleted successfully'))
      loadEmployees()
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setEmployeeToDelete(null)
    }
  }

  const handleActivateEmployee = async (e: React.MouseEvent, employee: Employee) => {
    e.stopPropagation()

    if (employeeLimits && !employeeLimits.can_add_more) {
      toast.error(
        t('employees.cannot_activate_limit',
          `Cannot activate more employees. Your plan allows ${employeeLimits.max_count} active employees.`)
      )
      return
    }

    try {
      await employeeService.activate(employee.id)
      toast.success(t('employees.activated_success', 'Employee activated successfully'))
      await loadEmployees()
      await loadEmployeeLimits()
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
    }
  }

  const handleDeactivateEmployee = async (e: React.MouseEvent, employee: Employee) => {
    e.stopPropagation()

    try {
      await employeeService.deactivate(employee.id)
      toast.success(t('employees.deactivated_success', 'Employee deactivated successfully'))
      await loadEmployees()
      await loadEmployeeLimits()
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
    }
  }

  // Frontend search filter
  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background pt-16 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-64 lg:pt-8 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 sm:w-8 h-6 sm:h-8 text-primary" />
            {t('employees.title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">{t('employees.subtitle')}</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          {t('employees.add_employee')}
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t('employees.search_placeholder')}
            className="pl-10 bg-background/50 border-input text-foreground hover:bg-background/80 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-muted/30">
              <TableHead className="text-sm sm:text-base text-muted-foreground">{t('inventory.name')}</TableHead>
              <TableHead className="text-sm sm:text-base text-muted-foreground">{t('auth.email')}</TableHead>
              <TableHead className="text-sm sm:text-base text-muted-foreground">{t('employees.role')}</TableHead>
              <TableHead className="text-sm sm:text-base text-muted-foreground">{t('auth.phone')}</TableHead>
              <TableHead className="text-sm sm:text-base text-muted-foreground">{t('common.status')}</TableHead>
              <TableHead className="text-center text-sm sm:text-base text-muted-foreground">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-sm sm:text-base text-muted-foreground">
                  {t('employees.no_employees')}
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => (
                <TableRow 
                  key={emp.id} 
                  className="border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/employees/${emp.id}`)}
                >
                  <TableCell className="font-medium text-foreground">{emp.full_name}</TableCell>
                  <TableCell className="text-sm sm:text-base text-muted-foreground">{emp.email}</TableCell>
                  <TableCell>
                    {emp.roles.map(role => (
                      <Badge key={role} variant="secondary" className="mr-1">
                        {role}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell className="text-sm sm:text-base text-muted-foreground">{emp.phone_number || '-'}</TableCell>
                  <TableCell>
                    {emp.is_active ? (
                      <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border-green-500/20">
                        {t('common.active')}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">
                        {t('common.inactive')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Activate/Deactivate toggle - only for User role */}
                      {!emp.roles.includes('Manager') && (
                        <>
                          {emp.is_active ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
                              onClick={(e) => handleDeactivateEmployee(e, emp)}
                              title={t('employees.deactivate', 'Deactivate')}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                              onClick={(e) => handleActivateEmployee(e, emp)}
                              title={t('employees.activate', 'Activate')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(emp) }}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>{t('employees.no_employees')}</p>
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <Card 
              key={emp.id} 
              className="glass-card cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => navigate(`/employees/${emp.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{emp.full_name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                  </div>
                  {emp.is_active ? (
                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 shrink-0">
                      {t('common.active')}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 shrink-0">
                      {t('common.inactive')}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  {emp.phone_number && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{t('auth.phone')}:</span>
                      <span className="text-foreground">{emp.phone_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{t('employees.role')}:</span>
                    <div className="flex flex-wrap gap-1">
                      {emp.roles.map(role => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 text-red-500 border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(emp) }}
                  >
                    <Trash className="w-3 h-3 mr-1" />
                    {t('common.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('employees.add_employee')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">{t('auth.first_name')}</Label>
                <Input
                  id="firstName"
                  value={newEmployee.first_name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })}
                  className="bg-background border-input"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">{t('auth.last_name')}</Label>
                <Input
                  id="lastName"
                  value={newEmployee.last_name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                  className="bg-background border-input"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                className="bg-background border-input"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                className="bg-background border-input"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">{t('auth.phone')}</Label>
              <Input
                id="phone"
                value={newEmployee.phone_number || ''}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone_number: e.target.value })}
                className="bg-background border-input"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('employees.create_account')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              {t('common.confirm_delete_title', 'Delete Employee')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base text-muted-foreground">
              {t('employees.delete_confirmation', 'Are you sure you want to delete this employee? This action cannot be undone.')}
              {employeeToDelete && (
                <span className="block mt-2 font-medium text-foreground">
                  {employeeToDelete.full_name} ({employeeToDelete.email})
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Trial Activation Modal */}
      <TrialActivationModal
        isOpen={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
        onSuccess={async () => {
          await loadEmployeeLimits()
          setNewEmployee({
            email: '',
            password: '',
            first_name: '',
            last_name: '',
            phone_number: '',
            address: ''
          })
          setIsDialogOpen(true)
        }}
        maxEmployees={employeeLimits?.max_count || 2}
      />

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        reason={premiumModalReason}
      />
    </div>
  )
}
