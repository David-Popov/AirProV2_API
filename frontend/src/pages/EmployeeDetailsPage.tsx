import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context'
import {
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  ClipboardList,
  Edit,
  Trash2,
  AlertTriangle,
  KeyRound
} from 'lucide-react'
import { BackButton } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { toast } from 'sonner'
import { useEmployee, useUpdateEmployee, useDeleteEmployee, useResetEmployeePassword, useEmployeeMontages } from '@/hooks'
import { validatePasswordRules } from '@/lib/validators'
import { EmployeeDetailsSkeleton } from '@/components/skeletons'

export default function EmployeeDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    address: ''
  })

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: ''
  })
  const { data: employee, isLoading, error: employeeError } = useEmployee(id!)
  const { data: montagesData } = useEmployeeMontages(id!)
  const updateEmployee = useUpdateEmployee()
  const deleteEmployeeMutation = useDeleteEmployee()
  const resetPassword = useResetEmployeePassword()

  const employeeMontages = montagesData?.items ?? []

  useEffect(() => {
    if (employee) {
      setEditForm({
        first_name: employee.first_name,
        last_name: employee.last_name,
        phone_number: employee.phone_number || '',
        address: employee.address || ''
      })
    }
  }, [employee])

  useEffect(() => {
    if (employeeError) {
      toast.error(t('common.unknown_error'))
      navigate('/employees')
    }
  }, [employeeError, navigate, t])

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee) return

    try {
      const updatePayload = {
        ...editForm,
        email: employee.email,
        middle_name: employee.middle_name,
        address: editForm.address || null,
        phone_number: editForm.phone_number || null,
      }

      await updateEmployee.mutateAsync({ id: employee.id, data: updatePayload })

      if (user?.id === employee.id) {
        await refreshUser()
      }

      setIsEditing(false)
      toast.success(t('employees.updated_success', 'Employee updated successfully'))
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
    }
  }

  const handleDelete = async () => {
    if (!employee) return

    try {
      await deleteEmployeeMutation.mutateAsync(employee.id)
      toast.success(t('employees.deleted_success', 'Employee deleted successfully'))
      navigate('/employees')
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee) return

    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error(t('validation.passwords_not_match', 'Passwords do not match'))
      return
    }

    const passwordErrors = validatePasswordRules(passwordForm.password).map(key => t(key))
    if (passwordErrors.length > 0) {
      toast.error(passwordErrors.join('. '))
      return
    }

    try {
      await resetPassword.mutateAsync({
        id: employee.id,
        data: {
          first_name: employee.first_name,
          last_name: employee.last_name,
          password: passwordForm.password
        }
      })
      toast.success(t('employees.password_reset_success', 'Password has been reset successfully'))
      setIsResettingPassword(false)
      setPasswordForm({ password: '', confirmPassword: '' })
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.unknown_error')
      toast.error(message)
    }
  }

  if (isLoading) {
    return <EmployeeDetailsSkeleton />
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-background pt-14 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8">
        <p className="text-muted-foreground">{t('employees.not_found', 'Employee not found')}</p>
      </div>
    )
  }

  const completedMontages = employeeMontages.filter(m => m.status === 'Completed').length
  const activeMontages = employeeMontages.filter(m => m.status === 'InProgress' || m.status === 'Planned').length

  return (
    <div className="min-h-screen bg-background pt-14 pr-4 pb-4 pl-4 sm:p-6 lg:p-8 lg:ml-60 lg:pt-8 transition-colors duration-300 animate-fade-in">
      {/* Back Button */}
      <BackButton onClick={() => navigate('/employees')} />

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{employee.full_name}</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">{t('employees.details', 'Employee Details')}</p>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsResettingPassword(true)} className="gap-2 text-sm">
            <KeyRound className="w-4 h-4" />
            <span className="hidden sm:inline">{t('employees.reset_password', 'Reset Password')}</span>
            <span className="sm:hidden">{t('employees.reset', 'Reset')}</span>
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2 text-sm">
            <Edit className="w-4 h-4" />
            {t('common.edit')}
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} className="gap-2 text-sm">
            <Trash2 className="w-4 h-4" />
            {t('common.delete')}
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Employee Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-primary" />
                {t('employees.personal_info', 'Personal Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('auth.first_name')}</p>
                <p className="font-medium text-foreground">{employee.first_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('auth.last_name')}</p>
                <p className="font-medium text-foreground">{employee.last_name}</p>
              </div>
              {employee.middle_name && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('auth.middle_name', 'Middle Name')}</p>
                  <p className="font-medium text-foreground">{employee.middle_name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="w-5 h-5 text-primary" />
                {t('employees.contact_info', 'Contact Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('auth.email')}</p>
                  <p className="font-medium text-foreground">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('auth.phone')}</p>
                  <p className="font-medium text-foreground">{employee.phone_number || '-'}</p>
                </div>
              </div>
              {employee.address && (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('auth.address')}</p>
                    <p className="font-medium text-foreground">{employee.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Montages */}
          {employeeMontages.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  {t('employees.recent_montages', 'Recent Montages')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employeeMontages.slice(0, 5).map(montage => (
                    <div 
                      key={montage.id}
                      onClick={() => navigate(`/montages/${montage.id}`)}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50 hover:border-primary/50 cursor-pointer transition-all"
                    >
                      <div>
                        <p className="font-medium text-foreground">{montage.client_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(montage.installation_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={
                        montage.status === 'Completed' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : montage.status === 'InProgress'
                            ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }>
                        {montage.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Stats & Status */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-primary" />
                {t('employees.status_roles', 'Status & Roles')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">{t('common.status')}</p>
                {employee.is_active ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    {t('common.active')}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">
                    {t('common.inactive')}
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t('employees.role')}</p>
                <div className="flex flex-wrap gap-2">
                  {employee.roles.map(role => (
                    <Badge key={role} variant="secondary" className="bg-primary/10 text-primary">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
              {employee.created_at && (
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('employees.joined', 'Joined')}</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(employee.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="w-5 h-5 text-primary" />
                {t('employees.performance', 'Performance')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                <p className="text-muted-foreground">{t('employees.completed_montages', 'Completed Montages')}</p>
                <p className="text-2xl font-bold text-green-500">{completedMontages}</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <p className="text-muted-foreground">{t('employees.active_montages', 'Active Montages')}</p>
                <p className="text-2xl font-bold text-blue-500">{activeMontages}</p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-muted-foreground">{t('employees.total_montages', 'Total Montages')}</p>
                <p className="text-2xl font-bold text-primary">{employeeMontages.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('employees.edit_employee', 'Edit Employee')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">{t('auth.first_name')}</Label>
                <Input
                  id="firstName"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  className="bg-background border-input"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">{t('auth.last_name')}</Label>
                <Input
                  id="lastName"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  className="bg-background border-input"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">{t('auth.phone')}</Label>
              <Input
                id="phone"
                value={editForm.phone_number}
                onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                className="bg-background border-input"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">{t('auth.address')}</Label>
              <Input
                id="address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="bg-background border-input"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={updateEmployee.isPending}>
                {updateEmployee.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('common.save_changes')}
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
            <AlertDialogDescription className="text-muted-foreground">
              {t('employees.delete_confirmation', 'Are you sure you want to delete this employee? This action cannot be undone.')}
              <span className="block mt-2 font-medium text-foreground">
                {employee.full_name} ({employee.email})
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-muted">
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteEmployeeMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEmployeeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Reset Dialog */}
      <Dialog open={isResettingPassword} onOpenChange={setIsResettingPassword}>
        <DialogContent className="bg-card border-border text-card-foreground sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              {t('employees.reset_password', 'Reset Password')}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t('employees.reset_password_desc', 'Set a new password for {{name}}', { name: employee.full_name })}
            </p>
          </DialogHeader>
          <form onSubmit={handlePasswordReset} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">{t('employees.new_password', 'New Password')}</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.password}
                onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                className="bg-background border-input"
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-muted-foreground">
                {t('validation.password_requirements', 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char')}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">{t('employees.confirm_password', 'Confirm Password')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="bg-background border-input"
                placeholder="••••••••"
                required
              />
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsResettingPassword(false)
                  setPasswordForm({ password: '', confirmPassword: '' })
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={resetPassword.isPending}>
                {resetPassword.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('employees.set_password', 'Set Password')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
