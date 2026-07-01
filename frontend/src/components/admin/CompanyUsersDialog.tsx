import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { notifyApiError } from '@/lib/apiErrors'
import {
  ArrowLeft,
  Edit2,
  Key,
  Shield,
  Mail,
  Trash2,
  Loader2,
  UserCog,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { PasswordInput } from '@/components/ui/password-input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminService } from '@/services/admin'
import type { AdminUser, AdminUpdateUser, AdminChangePassword, AdminChangeRole } from '@/types/admin'
import { ROLE_OPTIONS } from '@/types/admin'
import type { Company } from '@/types'

type Mode = 'list' | 'edit' | 'password' | 'role' | 'email' | 'delete'

interface CompanyUsersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: Company | null
}

export function CompanyUsersDialog({ open, onOpenChange, company }: CompanyUsersDialogProps) {
  const { t } = useTranslation()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState<Mode>('list')
  const [selected, setSelected] = useState<AdminUser | null>(null)

  const [editForm, setEditForm] = useState<AdminUpdateUser>({
    firstName: '', middleName: '', lastName: '', address: '', phoneNumber: '', isActive: true,
  })
  const [passwordForm, setPasswordForm] = useState<AdminChangePassword>({ newPassword: '', sendEmailNotification: true })
  const [roleForm, setRoleForm] = useState<AdminChangeRole>({ newRole: 'User' })
  const [newEmail, setNewEmail] = useState('')

  const fetchUsers = useCallback(async () => {
    if (!company) return
    setLoading(true)
    try {
      const res = await adminService.getUsers({ companyId: company.id, pageSize: 100 })
      setUsers(res.items)
    } catch {
      toast.error(t('companies.error_loading_users', 'Failed to load company users'))
    } finally {
      setLoading(false)
    }
  }, [company, t])

  useEffect(() => {
    if (open && company) {
      setMode('list')
      setSelected(null)
      fetchUsers()
    }
  }, [open, company, fetchUsers])

  const backToList = () => { setMode('list'); setSelected(null) }

  const openEdit = (user: AdminUser) => {
    setSelected(user)
    setEditForm({
      firstName: user.firstName, middleName: user.middleName, lastName: user.lastName,
      address: user.address || '', phoneNumber: user.phoneNumber || '', isActive: user.isActive,
    })
    setMode('edit')
  }
  const openPassword = (user: AdminUser) => {
    setSelected(user)
    setPasswordForm({ newPassword: '', sendEmailNotification: true })
    setMode('password')
  }
  const openRole = (user: AdminUser) => {
    if (user.roles.includes('Admin')) {
      toast.error(t('admin.cannot_change_admin_role', 'Admin roles cannot be changed'))
      return
    }
    setSelected(user)
    setRoleForm({ newRole: user.roles.includes('Manager') ? 'User' : 'Manager' })
    setMode('role')
  }
  const openEmail = (user: AdminUser) => {
    setSelected(user)
    setNewEmail('')
    setMode('email')
  }
  const openDelete = (user: AdminUser) => { setSelected(user); setMode('delete') }

  const handleSaveEdit = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await adminService.updateUser(selected.id, editForm)
      toast.success(t('admin.user_updated', 'User updated'))
      await fetchUsers()
      backToList()
    } catch (e) {
      notifyApiError(e, t, t('common.error', 'Something went wrong'))
    } finally { setSaving(false) }
  }

  const handleSavePassword = async () => {
    if (!selected || !passwordForm.newPassword) return
    setSaving(true)
    try {
      await adminService.changeUserPassword(selected.id, passwordForm)
      toast.success(t('companies.temp_password_set', 'Temporary password set. The user must change it at next login.'))
      backToList()
    } catch (e) {
      notifyApiError(e, t, t('common.error', 'Something went wrong'))
    } finally { setSaving(false) }
  }

  const handleSaveRole = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await adminService.changeUserRole(selected.id, roleForm)
      toast.success(t('admin.role_changed', 'Role changed'))
      await fetchUsers()
      backToList()
    } catch (e) {
      notifyApiError(e, t, t('common.error', 'Something went wrong'))
    } finally { setSaving(false) }
  }

  const handleSaveEmail = async () => {
    if (!selected || !newEmail) return
    setSaving(true)
    try {
      await adminService.requestUserEmailChange(selected.id, newEmail)
      toast.success(t('companies.email_change_requested', 'A confirmation link was sent to the new address.'))
      backToList()
    } catch (e) {
      notifyApiError(e, t, t('common.error', 'Something went wrong'))
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await adminService.deleteUser(selected.id)
      toast.success(t('admin.user_deleted', 'User deleted'))
      await fetchUsers()
      backToList()
    } catch (e) {
      notifyApiError(e, t, t('common.error', 'Something went wrong'))
    } finally { setSaving(false) }
  }

  const roleBadge = (roles: string[]) => {
    if (roles.includes('Admin')) return <Badge variant="destructive">Admin</Badge>
    if (roles.includes('Manager')) return <Badge variant="default">Manager</Badge>
    return <Badge variant="secondary">User</Badge>
  }

  const statusBadge = (user: AdminUser) => {
    if (user.isDeleted) return <Badge variant="destructive">{t('common.deleted', 'Deleted')}</Badge>
    return user.isActive
      ? <Badge className="bg-green-500/10 text-green-500 border-green-500/20">{t('common.active', 'Active')}</Badge>
      : <Badge variant="secondary">{t('common.inactive', 'Inactive')}</Badge>
  }

  const title =
    mode === 'list' ? `${t('companies.users_for', 'Users for')} ${company?.company_name ?? ''}`
    : mode === 'edit' ? t('admin.edit_user', 'Edit User')
    : mode === 'password' ? t('admin.change_password', 'Change Password')
    : mode === 'role' ? t('admin.change_role', 'Change Role')
    : mode === 'email' ? t('companies.change_email', 'Change Email')
    : t('admin.confirm_delete', 'Confirm Delete')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode !== 'list' && (
              <button onClick={backToList} className="text-muted-foreground hover:text-foreground" aria-label={t('common.back', 'Back')}>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {mode === 'list' && <UserCog className="w-5 h-5 text-primary" />}
            {title}
          </DialogTitle>
          {mode !== 'list' && selected && (
            <DialogDescription>{selected.fullName} · {selected.email}</DialogDescription>
          )}
        </DialogHeader>

        {mode === 'list' && (
          <div className="max-h-105 overflow-y-auto">
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">{t('common.loading', 'Loading...')}</p>
            ) : users.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">{t('companies.no_users', 'No users found')}</p>
            ) : (
              <div className="space-y-3">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{user.fullName}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {roleBadge(user.roles)}
                      {statusBadge(user)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={t('common.actions', 'Actions')}>
                            <UserCog className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem onClick={() => openEdit(user)}>
                            <Edit2 className="w-4 h-4 mr-2" />{t('common.edit', 'Edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openPassword(user)}>
                            <Key className="w-4 h-4 mr-2" />{t('admin.change_password', 'Change Password')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEmail(user)}>
                            <Mail className="w-4 h-4 mr-2" />{t('companies.change_email', 'Change Email')}
                          </DropdownMenuItem>
                          {!user.roles.includes('Admin') && (
                            <DropdownMenuItem onClick={() => openRole(user)}>
                              <Shield className="w-4 h-4 mr-2" />{t('admin.change_role', 'Change Role')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDelete(user)}
                            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />{t('common.delete', 'Delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === 'edit' && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('admin.first_name', 'First Name')}</Label><Input value={editForm.firstName} onChange={(e) => setEditForm(f => ({ ...f, firstName: e.target.value }))} /></div>
              <div><Label>{t('admin.last_name', 'Last Name')}</Label><Input value={editForm.lastName} onChange={(e) => setEditForm(f => ({ ...f, lastName: e.target.value }))} /></div>
            </div>
            <div><Label>{t('admin.middle_name', 'Middle Name')}</Label><Input value={editForm.middleName} onChange={(e) => setEditForm(f => ({ ...f, middleName: e.target.value }))} /></div>
            <div><Label>{t('admin.phone', 'Phone')}</Label><Input value={editForm.phoneNumber || ''} onChange={(e) => setEditForm(f => ({ ...f, phoneNumber: e.target.value }))} /></div>
            <div><Label>{t('admin.address', 'Address')}</Label><Input value={editForm.address || ''} onChange={(e) => setEditForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="flex items-center space-x-2">
              <Switch checked={editForm.isActive} onCheckedChange={(checked) => setEditForm(f => ({ ...f, isActive: checked }))} />
              <Label>{t('admin.active', 'Active')}</Label>
            </div>
          </div>
        )}

        {mode === 'password' && (
          <div className="space-y-4 py-2">
            <div>
              <Label>{t('admin.new_password', 'New Password')}</Label>
              <PasswordInput value={passwordForm.newPassword} onChange={(e) => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} />
            </div>
            <p className="text-sm text-amber-500">
              {t('companies.temp_password_hint', 'This is a temporary password — the user will be required to set a new one at next login.')}
            </p>
            <div className="flex items-center space-x-2">
              <Switch checked={passwordForm.sendEmailNotification} onCheckedChange={(checked) => setPasswordForm(f => ({ ...f, sendEmailNotification: checked }))} />
              <Label>{t('admin.send_email_notification', 'Email the temporary password to the user')}</Label>
            </div>
          </div>
        )}

        {mode === 'role' && (
          <div className="space-y-4 py-2">
            <div>
              <Label>{t('admin.new_role', 'New Role')}</Label>
              <Select value={roleForm.newRole} onValueChange={(v) => setRoleForm({ newRole: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLE_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        )}

        {mode === 'email' && (
          <div className="space-y-4 py-2">
            <div>
              <Label>{t('companies.new_email', 'New Email')}</Label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('companies.change_email_hint', 'A confirmation link will be sent to the new address. The change applies only after the user confirms it.')}
            </p>
          </div>
        )}

        {mode === 'delete' && (
          <p className="py-2 text-sm text-muted-foreground">
            {t('admin.delete_user_warning', { name: selected?.fullName, defaultValue: `Delete ${selected?.fullName}? This deactivates and removes the user.` })}
          </p>
        )}

        {mode !== 'list' && (
          <DialogFooter>
            <Button variant="outline" onClick={backToList} disabled={saving}>{t('common.cancel', 'Cancel')}</Button>
            {mode === 'edit' && <Button onClick={handleSaveEdit} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{t('common.save', 'Save')}</Button>}
            {mode === 'password' && <Button onClick={handleSavePassword} disabled={saving || !passwordForm.newPassword}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{t('common.save', 'Save')}</Button>}
            {mode === 'role' && <Button onClick={handleSaveRole} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{t('common.save', 'Save')}</Button>}
            {mode === 'email' && <Button onClick={handleSaveEmail} disabled={saving || !newEmail}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{t('common.send', 'Send')}</Button>}
            {mode === 'delete' && <Button variant="destructive" onClick={handleDelete} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{t('common.delete', 'Delete')}</Button>}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
