import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Search, Users, RotateCcw, Trash2, Edit, Key, Shield, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import { adminService } from '@/services/admin'
import type { AdminUser, AdminUserFilter, AdminUpdateUser, AdminChangePassword, AdminChangeRole } from '@/types/admin'
import { ROLE_OPTIONS } from '@/types/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export default function AdminUsersPage() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState<AdminUserFilter>({ page: 1, pageSize: 20 })
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [isRoleOpen, setIsRoleOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  const [editForm, setEditForm] = useState<AdminUpdateUser>({
    firstName: '', middleName: '', lastName: '', address: '', phoneNumber: '', isActive: true
  })
  const [passwordForm, setPasswordForm] = useState<AdminChangePassword>({ newPassword: '', sendEmailNotification: true })
  const [roleForm, setRoleForm] = useState<AdminChangeRole>({ newRole: 'User' })

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const result = await adminService.getUsers(filter)
      setUsers(result.items)
      setTotalPages(result.totalPages)
    } catch (error) {
      toast.error(t('common.error'))
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [filter.page])

  const handleSearch = () => { setFilter(f => ({ ...f, page: 1 })); fetchUsers() }
  const handleResetFilters = () => { setFilter({ page: 1, pageSize: 20 }); fetchUsers() }

  const openEdit = (user: AdminUser) => {
    setSelectedUser(user)
    setEditForm({
      firstName: user.firstName, middleName: user.middleName, lastName: user.lastName,
      address: user.address || '', phoneNumber: user.phoneNumber || '', isActive: user.isActive
    })
    setIsEditOpen(true)
  }

  const openPassword = (user: AdminUser) => {
    setSelectedUser(user)
    setPasswordForm({ newPassword: '', sendEmailNotification: true })
    setIsPasswordOpen(true)
  }

  const openRole = (user: AdminUser) => {
    if (user.roles.includes('Admin')) {
      toast.error(t('admin.cannot_change_admin_role'))
      return
    }
    setSelectedUser(user)
    setRoleForm({ newRole: user.roles.includes('Manager') ? 'User' : 'Manager' })
    setIsRoleOpen(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    try {
      await adminService.updateUser(selectedUser.id, editForm)
      toast.success(t('admin.user_updated'))
      setIsEditOpen(false)
      fetchUsers()
    } catch (error) {
      toast.error(t('common.error'))
    }
  }

  const handleChangePassword = async () => {
    if (!selectedUser || !passwordForm.newPassword) return
    try {
      await adminService.changeUserPassword(selectedUser.id, passwordForm)
      toast.success(t('admin.password_changed'))
      setIsPasswordOpen(false)
    } catch (error) {
      toast.error(t('common.error'))
    }
  }

  const handleChangeRole = async () => {
    if (!selectedUser) return
    try {
      await adminService.changeUserRole(selectedUser.id, roleForm)
      toast.success(t('admin.role_changed'))
      setIsRoleOpen(false)
      fetchUsers()
    } catch (error) {
      toast.error(t('common.error'))
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    try {
      await adminService.deleteUser(selectedUser.id)
      toast.success(t('admin.user_deleted'))
      setIsDeleteOpen(false)
      fetchUsers()
    } catch (error) {
      toast.error(t('common.error'))
    }
  }

  const handleRestore = async (user: AdminUser) => {
    try {
      await adminService.restoreUser(user.id)
      toast.success(t('admin.user_restored'))
      fetchUsers()
    } catch (error) {
      toast.error(t('common.error'))
    }
  }

  const getRoleBadge = (roles: string[]) => {
    if (roles.includes('Admin')) return <Badge variant="destructive">Admin</Badge>
    if (roles.includes('Manager')) return <Badge variant="default">Manager</Badge>
    return <Badge variant="secondary">User</Badge>
  }

  const FilterPanel = () => (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>{t('admin.name')}</Label>
          <Input placeholder={t('admin.search_by_name')} value={filter.name || ''} onChange={(e) => setFilter(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <Label>{t('admin.email')}</Label>
          <Input placeholder={t('admin.search_by_email')} value={filter.email || ''} onChange={(e) => setFilter(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div>
          <Label>{t('admin.role')}</Label>
          <Select value={filter.role || 'all'} onValueChange={(v) => setFilter(f => ({ ...f, role: v === 'all' ? undefined : v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              {ROLE_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch checked={filter.isActive ?? true} onCheckedChange={(checked) => setFilter(f => ({ ...f, isActive: checked }))} />
            <Label>{t('admin.active_only')}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={filter.isDeleted ?? false} onCheckedChange={(checked) => setFilter(f => ({ ...f, isDeleted: checked }))} />
            <Label>{t('admin.show_deleted')}</Label>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSearch}><Search className="w-4 h-4 mr-2" />{t('common.search')}</Button>
        <Button variant="outline" onClick={handleResetFilters}><X className="w-4 h-4 mr-2" />{t('common.clear')}</Button>
      </div>
    </div>
  )

  const MobileCard = ({ user }: { user: AdminUser }) => (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold">{user.fullName}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground">{user.companyName}</p>
          </div>
          {getRoleBadge(user.roles)}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => openEdit(user)}><Edit className="w-4 h-4 mr-1" />{t('common.edit')}</Button>
          <Button size="sm" variant="outline" onClick={() => openPassword(user)}><Key className="w-4 h-4 mr-1" />{t('admin.password')}</Button>
          {!user.roles.includes('Admin') && <Button size="sm" variant="outline" onClick={() => openRole(user)}><Shield className="w-4 h-4 mr-1" />{t('admin.role')}</Button>}
          {user.isDeleted ? (
            <Button size="sm" variant="outline" onClick={() => handleRestore(user)}><RotateCcw className="w-4 h-4 mr-1" />{t('common.restore')}</Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={() => { setSelectedUser(user); setIsDeleteOpen(true) }}><Trash2 className="w-4 h-4 mr-1" />{t('common.delete')}</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />{t('admin.users_management')}</CardTitle>
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild><Button variant="outline" className="md:hidden"><Filter className="w-4 h-4 mr-2" />{t('common.filters')}</Button></SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]"><SheetHeader><SheetTitle>{t('common.filters')}</SheetTitle></SheetHeader><div className="mt-4"><FilterPanel /></div></SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block mb-6"><FilterPanel /></div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.name')}</TableHead>
                  <TableHead>{t('admin.email')}</TableHead>
                  <TableHead>{t('admin.company')}</TableHead>
                  <TableHead>{t('admin.role')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">{t('common.loading')}</TableCell></TableRow>
                ) : users.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">{t('common.no_data')}</TableCell></TableRow>
                ) : users.map(user => (
                  <TableRow key={user.id} className={user.isDeleted ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.companyName || '-'}</TableCell>
                    <TableCell>{getRoleBadge(user.roles)}</TableCell>
                    <TableCell>
                      {user.isDeleted ? <Badge variant="destructive">{t('common.deleted')}</Badge> : 
                       user.isActive ? <Badge variant="success">{t('common.active')}</Badge> : <Badge variant="secondary">{t('common.inactive')}</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(user)}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => openPassword(user)}><Key className="w-4 h-4" /></Button>
                        {!user.roles.includes('Admin') && <Button size="sm" variant="ghost" onClick={() => openRole(user)}><Shield className="w-4 h-4" /></Button>}
                        {user.isDeleted ? (
                          <Button size="sm" variant="ghost" onClick={() => handleRestore(user)}><RotateCcw className="w-4 h-4" /></Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedUser(user); setIsDeleteOpen(true) }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden">{loading ? <div className="text-center py-8">{t('common.loading')}</div> : users.length === 0 ? <div className="text-center py-8">{t('common.no_data')}</div> : users.map(user => <MobileCard key={user.id} user={user} />)}</div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" disabled={filter.page === 1} onClick={() => setFilter(f => ({ ...f, page: (f.page || 1) - 1 }))}><ChevronLeft className="w-4 h-4" /></Button>
            <span>{t('common.page')} {filter.page} / {totalPages}</span>
            <Button variant="outline" disabled={filter.page === totalPages} onClick={() => setFilter(f => ({ ...f, page: (f.page || 1) + 1 }))}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('admin.edit_user')}</DialogTitle><DialogDescription>{selectedUser?.email}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>{t('admin.first_name')}</Label><Input value={editForm.firstName} onChange={(e) => setEditForm(f => ({ ...f, firstName: e.target.value }))} /></div>
              <div><Label>{t('admin.last_name')}</Label><Input value={editForm.lastName} onChange={(e) => setEditForm(f => ({ ...f, lastName: e.target.value }))} /></div>
            </div>
            <div><Label>{t('admin.middle_name')}</Label><Input value={editForm.middleName} onChange={(e) => setEditForm(f => ({ ...f, middleName: e.target.value }))} /></div>
            <div><Label>{t('admin.phone')}</Label><Input value={editForm.phoneNumber || ''} onChange={(e) => setEditForm(f => ({ ...f, phoneNumber: e.target.value }))} /></div>
            <div><Label>{t('admin.address')}</Label><Input value={editForm.address || ''} onChange={(e) => setEditForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="flex items-center space-x-2"><Switch checked={editForm.isActive} onCheckedChange={(checked) => setEditForm(f => ({ ...f, isActive: checked }))} /><Label>{t('admin.active')}</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsEditOpen(false)}>{t('common.cancel')}</Button><Button onClick={handleUpdateUser}>{t('common.save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('admin.change_password')}</DialogTitle><DialogDescription>{selectedUser?.email}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><Label>{t('admin.new_password')}</Label><PasswordInput value={passwordForm.newPassword} onChange={(e) => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} /></div>
            <div className="flex items-center space-x-2"><Switch checked={passwordForm.sendEmailNotification} onCheckedChange={(checked) => setPasswordForm(f => ({ ...f, sendEmailNotification: checked }))} /><Label>{t('admin.send_email_notification')}</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsPasswordOpen(false)}>{t('common.cancel')}</Button><Button onClick={handleChangePassword}>{t('common.save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRoleOpen} onOpenChange={setIsRoleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{t('admin.change_role')}</DialogTitle><DialogDescription>{selectedUser?.email}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('admin.new_role')}</Label>
              <Select value={roleForm.newRole} onValueChange={(v) => setRoleForm({ newRole: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLE_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsRoleOpen(false)}>{t('common.cancel')}</Button><Button onClick={handleChangeRole}>{t('common.save')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t('admin.confirm_delete')}</DialogTitle><DialogDescription>{t('admin.delete_user_warning', { name: selectedUser?.fullName })}</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setIsDeleteOpen(false)}>{t('common.cancel')}</Button><Button variant="destructive" onClick={handleDelete}>{t('common.delete')}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
