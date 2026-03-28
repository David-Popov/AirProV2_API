import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Users,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  MoreVertical,
  Trash
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader, SearchBar, EmptyState, ConfirmDialog } from '@/components/shared'
import { SkeletonTableRows, SkeletonMobileCards } from '@/components/skeletons'
import { useEmployees, useEmployeeLimits, useCreateEmployee, useDeleteEmployee, useActivateEmployee, useDeactivateEmployee, useMontages } from '@/hooks'
import type { Employee, CreateEmployeeRequest } from '@/types'
import { validatePasswordRules, isValidEmail } from '@/lib/validators'
import { TrialActivationModal, PremiumUpgradeModal } from '@/components/subscription'
import { useAuth } from '@/context'
import { usePageTitle } from '@/hooks/usePageTitle'

const MAX_EXPECTED_MONTAGES = 5

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return fullName.slice(0, 2).toUpperCase()
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-violet-500/20 text-violet-500',
    'bg-blue-500/20 text-blue-500',
    'bg-green-500/20 text-green-500',
    'bg-amber-500/20 text-amber-500',
    'bg-pink-500/20 text-pink-500',
    'bg-cyan-500/20 text-cyan-500',
    'bg-orange-500/20 text-orange-500',
    'bg-indigo-500/20 text-indigo-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getWorkloadColor(pct: number): string {
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 70) return 'bg-amber-500'
  return 'bg-green-500'
}

export default function EmployeesPage() {
  usePageTitle('Employees')
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
  const { data: montagesData } = useMontages(1, 500)
  const createEmployee = useCreateEmployee()
  const deleteEmployee = useDeleteEmployee()
  const activateEmployee = useActivateEmployee()
  const deactivateEmployee = useDeactivateEmployee()

  // Compute workload per employee from active montages linked via user_id
  const workloadMap = useMemo(() => {
    const allMontages = montagesData?.items ?? []
    const map: Record<string, number> = {}
    for (const m of allMontages) {
      if ((m.status === 'InProgress' || m.status === 'Planned') && m.user_id) {
        map[m.user_id] = (map[m.user_id] ?? 0) + 1
      }
    }
    return map
  }, [montagesData])

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
    setNewEmployee({ email: '', password: '', first_name: '', last_name: '', phone_number: '', address: '' })
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors: string[] = []
    if (!newEmployee.first_name.trim()) validationErrors.push(t('validation.first_name_required', 'First name is required'))
    if (!newEmployee.last_name.trim()) validationErrors.push(t('validation.last_name_required', 'Last name is required'))
    if (!newEmployee.email.trim()) validationErrors.push(t('validation.email_required', 'Email is required'))
    else if (!isValidEmail(newEmployee.email)) validationErrors.push(t('validation.email_invalid', 'Please enter a valid email address'))
    const passwordErrors = validatePasswordRules(newEmployee.password).map(key => t(key))
    validationErrors.push(...passwordErrors)
    if (validationErrors.length > 0) { toast.error(validationErrors.join('. ')); return }

    try {
      await createEmployee.mutateAsync(newEmployee)
      toast.success(t('employees.created_success', 'Employee created successfully'))
      setIsDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('common.unknown_error'))
    }
  }

  const handleDeleteClick = (employee: Employee) => { setEmployeeToDelete(employee); setDeleteDialogOpen(true) }
  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return
    try {
      await deleteEmployee.mutateAsync(employeeToDelete.id)
      toast.success(t('employees.deleted_success', 'Employee deleted successfully'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('common.unknown_error'))
    } finally {
      setDeleteDialogOpen(false)
      setEmployeeToDelete(null)
    }
  }

  const handleActivateEmployee = async (e: React.MouseEvent, employee: Employee) => {
    e.stopPropagation()
    if (employeeLimits && !employeeLimits.can_add_more) {
      toast.error(t('employees.cannot_activate_limit', `Cannot activate more employees. Your plan allows ${employeeLimits.max_count} active employees.`))
      return
    }
    try {
      await activateEmployee.mutateAsync(employee.id)
      toast.success(t('employees.activated_success', 'Employee activated successfully'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('common.unknown_error'))
    }
  }

  const handleDeactivateEmployee = async (e: React.MouseEvent, employee: Employee) => {
    e.stopPropagation()
    try {
      await deactivateEmployee.mutateAsync(employee.id)
      toast.success(t('employees.deactivated_success', 'Employee deactivated successfully'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('common.unknown_error'))
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background pt-14 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8 transition-colors duration-300 animate-fade-in">
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

      <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder={t('employees.search_placeholder')} />

      {/* Table — Desktop */}
      <div className="hidden md:block glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="border-border hover:bg-muted/30">
              <TableHead className="text-muted-foreground">{t('employees.member', 'Member')}</TableHead>
              <TableHead className="text-muted-foreground">{t('employees.role')}</TableHead>
              <TableHead className="text-muted-foreground">{t('common.status')}</TableHead>
              <TableHead className="text-muted-foreground">{t('auth.phone')}</TableHead>
              <TableHead className="text-muted-foreground">Workload</TableHead>
              <TableHead className="text-center text-muted-foreground">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonTableRows columns={6} />
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {t('employees.no_employees')}
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => {
                const activeMontageCount = workloadMap[emp.id] ?? 0
                const workloadPct = Math.min(Math.round((activeMontageCount / MAX_EXPECTED_MONTAGES) * 100), 100)
                const avatarColor = getAvatarColor(emp.full_name)
                const workloadIndicator = getWorkloadColor(workloadPct)
                return (
                  <TableRow
                    key={emp.id}
                    className="border-border table-row-interactive animate-fade-in"
                    onClick={() => navigate(`/employees/${emp.id}`)}
                  >
                    {/* Member column: avatar + name + email */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className={`text-xs font-semibold ${avatarColor}`}>
                            {getInitials(emp.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{emp.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        {emp.roles.map(role => (
                          <Badge key={role} variant="secondary" className="w-fit text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {emp.is_active ? (
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                          {t('common.active')}
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                          {t('common.inactive')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{emp.phone_number || '—'}</TableCell>
                    <TableCell>
                      {activeMontageCount > 0 ? (
                        <div className="flex items-center gap-2 min-w-20">
                          <Progress value={workloadPct} indicatorClassName={workloadIndicator} className="h-1.5 w-16" />
                          <span className="text-xs text-muted-foreground">{workloadPct}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {emp.id !== user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            {!emp.roles.includes('Manager') && (
                              <>
                                {emp.is_active ? (
                                  <DropdownMenuItem onClick={(e) => handleDeactivateEmployee(e, emp)}>
                                    <XCircle className="w-4 h-4 mr-2 text-orange-500" />
                                    <span className="text-orange-500">{t('employees.deactivate', 'Deactivate')}</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={(e) => handleActivateEmployee(e, emp)}>
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                    <span className="text-green-500">{t('employees.activate', 'Activate')}</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(emp) }}
                                  className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                >
                                  <Trash className="w-4 h-4 mr-2" />
                                  {t('common.delete')}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
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
          filteredEmployees.map((emp, index) => {
            const activeMontageCount = workloadMap[emp.id] ?? 0
            const workloadPct = Math.min(Math.round((activeMontageCount / MAX_EXPECTED_MONTAGES) * 100), 100)
            const avatarColor = getAvatarColor(emp.full_name)
            const workloadIndicator = getWorkloadColor(workloadPct)
            return (
              <Card
                key={emp.id}
                className={`glass-card cursor-pointer hover:border-primary/50 transition-all animate-slide-up stagger-${Math.min(index + 1, 8)}`}
                onClick={() => navigate(`/employees/${emp.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className={`text-sm font-semibold ${avatarColor}`}>
                        {getInitials(emp.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-foreground truncate">{emp.full_name}</h3>
                        {emp.is_active ? (
                          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 shrink-0 text-xs">
                            {t('common.active')}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20 shrink-0 text-xs">
                            {t('common.inactive')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">{t('employees.role')}:</span>
                      <div className="flex flex-wrap gap-1">
                        {emp.roles.map(role => (
                          <Badge key={role} variant="secondary" className="text-xs">{role}</Badge>
                        ))}
                      </div>
                    </div>
                    {emp.phone_number && (
                      <div className="flex items-center justify-between text-muted-foreground text-xs">
                        <span>{t('auth.phone')}:</span>
                        <span className="text-foreground">{emp.phone_number}</span>
                      </div>
                    )}
                    {activeMontageCount > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Workload</span>
                          <span>{workloadPct}%</span>
                        </div>
                        <Progress value={workloadPct} indicatorClassName={workloadIndicator} className="h-1.5" />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border">
                    {!emp.roles.includes('Manager') && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-500 border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(emp) }}
                        >
                          <Trash className="w-3 h-3 mr-1" />
                          {t('common.delete')}
                        </Button>
                        {emp.is_active ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-orange-500 border-orange-500/20 hover:bg-orange-500/10"
                            onClick={(e) => handleDeactivateEmployee(e, emp)}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            {t('employees.deactivate', 'Deactivate')}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-green-500 border-green-500/20 hover:bg-green-500/10"
                            onClick={(e) => handleActivateEmployee(e, emp)}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {t('employees.activate', 'Activate')}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>{t('employees.add_employee')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">{t('auth.first_name')}</Label>
                <Input id="firstName" value={newEmployee.first_name} onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })} className="bg-background border-input" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">{t('auth.last_name')}</Label>
                <Input id="lastName" value={newEmployee.last_name} onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })} className="bg-background border-input" required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} className="bg-background border-input" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} className="bg-background border-input" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">{t('auth.phone')}</Label>
              <Input id="phone" value={newEmployee.phone_number || ''} onChange={(e) => setNewEmployee({ ...newEmployee, phone_number: e.target.value })} className="bg-background border-input" />
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

      <TrialActivationModal
        isOpen={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
        onSuccess={() => {
          setNewEmployee({ email: '', password: '', first_name: '', last_name: '', phone_number: '', address: '' })
          setIsDialogOpen(true)
        }}
        maxEmployees={employeeLimits?.max_count || 2}
      />

      <PremiumUpgradeModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        reason={premiumModalReason}
      />
    </div>
  )
}
