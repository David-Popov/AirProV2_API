import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Users,
  Plus,
  Trash,
  Loader2,
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
import { PageHeader, SearchBar, EmptyState, ConfirmDialog } from '@/components/shared'
import { SkeletonTableRows, SkeletonMobileCards } from '@/components/skeletons'
import { useEmployees, useEmployeeLimits, useCreateEmployee, useDeleteEmployee, useActivateEmployee, useDeactivateEmployee } from '@/hooks'
import type { Employee, CreateEmployeeRequest } from '@/types'
import { TrialActivationModal, PremiumUpgradeModal } from '@/components/subscription'
import { useAuth } from '@/context'

export default function EmployeesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newEmployee, setNewEmployee] = useState<CreateEmployeeRequest>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    address: ''
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)

  const [trialModalOpen, setTrialModalOpen] = useState(false)

  const [premiumModalOpen, setPremiumModalOpen] = useState(false)
  const [premiumModalReason, setPremiumModalReason] = useState<'employee_limit' | 'trial_used' | 'general'>('general')

  const { data: employees = [], isLoading } = useEmployees()
  const { data: employeeLimits = null } = useEmployeeLimits()
  const createEmployee = useCreateEmployee()
  const deleteEmployee = useDeleteEmployee()
  const activateEmployee = useActivateEmployee()
  const deactivateEmployee = useDeactivateEmployee()

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
    
    try {
      await createEmployee.mutateAsync(newEmployee)
      toast.success(t('employees.created_success', 'Employee created successfully'))
      setIsDialogOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
    }
  }

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return

    try {
      await deleteEmployee.mutateAsync(employeeToDelete.id)
      toast.success(t('employees.deleted_success', 'Employee deleted successfully'))
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
    } finally {
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
      await activateEmployee.mutateAsync(employee.id)
      toast.success(t('employees.activated_success', 'Employee activated successfully'))
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
    }
  }

  const handleDeactivateEmployee = async (e: React.MouseEvent, employee: Employee) => {
    e.stopPropagation()

    try {
      await deactivateEmployee.mutateAsync(employee.id)
      toast.success(t('employees.deactivated_success', 'Employee deactivated successfully'))
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
    <div className="min-h-screen bg-background pt-16 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8 transition-colors duration-300">
      <PageHeader
        title={t('employees.title')}
        subtitle={t('employees.subtitle')}
        icon={Users}
        action={
          <Button onClick={handleCreate} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            {t('employees.add_employee')}
          </Button>
        }
      />

      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder={t('employees.search_placeholder')}
      />

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
              <SkeletonTableRows columns={6} />
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
                  className="border-border hover:bg-muted/30 transition-colors cursor-pointer animate-fade-in"
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
          <SkeletonMobileCards rows={4} />
        ) : filteredEmployees.length === 0 ? (
          <EmptyState icon={Users} message={t('employees.no_employees')} />
        ) : (
          filteredEmployees.map((emp) => (
            <Card
              key={emp.id}
              className="glass-card cursor-pointer hover:border-primary/50 transition-all animate-fade-in"
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
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={createEmployee.isPending}>
                {createEmployee.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('employees.create_account')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title={t('common.confirm_delete_title', 'Delete Employee')}
        description={t('employees.delete_confirmation', 'Are you sure you want to delete this employee? This action cannot be undone.')}
        itemName={employeeToDelete ? `${employeeToDelete.full_name} (${employeeToDelete.email})` : undefined}
        confirmLabel={t('common.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        isLoading={deleteEmployee.isPending}
      />

      {/* Trial Activation Modal */}
      <TrialActivationModal
        isOpen={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
        onSuccess={() => {
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
