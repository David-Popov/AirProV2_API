import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Users, 
  Plus, 
  Search, 
  Trash, 
  MoreVertical, 
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { employeeService } from '@/services'
import type { Employee, CreateEmployeeRequest } from '@/types'

export default function EmployeesPage() {
  const { t } = useTranslation()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Dialog State
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

  useEffect(() => {
    loadEmployees()
  }, [])

  const handleCreate = () => {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await employeeService.create(newEmployee)
      toast.success(t('common.save'))
      setIsDialogOpen(false)
      loadEmployees()
    } catch (error) {
      toast.error(t('common.unknown_error'))
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('common.confirm_delete'))) return

    try {
      await employeeService.delete(id)
      toast.success(t('common.remove'))
      loadEmployees()
    } catch (error) {
      toast.error(t('common.unknown_error'))
    }
  }

  // Frontend search filter
  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-950 p-8 ml-64">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-purple-500" />
            {t('employees.title')}
          </h1>
          <p className="text-gray-400">{t('employees.subtitle')}</p>
        </div>
        <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          {t('employees.add_employee')}
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input 
            placeholder={t('employees.search_placeholder')}
            className="pl-10 bg-slate-900 border-slate-800 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-slate-800 bg-slate-900/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900">
            <TableRow className="border-slate-800 hover:bg-slate-900">
              <TableHead className="text-gray-400">{t('inventory.name')}</TableHead>
              <TableHead className="text-gray-400">{t('auth.email')}</TableHead>
              <TableHead className="text-gray-400">{t('employees.role')}</TableHead>
              <TableHead className="text-gray-400">{t('auth.phone')}</TableHead>
              <TableHead className="text-gray-400">{t('common.status')}</TableHead>
              <TableHead className="text-right text-gray-400">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  {t('employees.no_employees')}
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => (
                <TableRow key={emp.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-medium text-white">{emp.full_name}</TableCell>
                  <TableCell className="text-gray-400">{emp.email}</TableCell>
                  <TableCell>
                    {emp.roles.map(role => (
                      <Badge key={role} variant="secondary" className="mr-1">
                        {role}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell className="text-gray-400">{emp.phone_number || '-'}</TableCell>
                  <TableCell>
                    {emp.is_active ? (
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                        {t('common.active')}
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">
                        {t('common.inactive')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-gray-300">
                        <DropdownMenuItem onClick={() => handleDelete(emp.id)} className="text-red-500 hover:bg-red-900/20 cursor-pointer">
                          <Trash className="w-4 h-4 mr-2" />
                          {t('common.remove')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
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
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">{t('auth.last_name')}</Label>
                <Input
                  id="lastName"
                  value={newEmployee.last_name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                  className="bg-slate-800 border-slate-700"
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
                className="bg-slate-800 border-slate-700"
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
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">{t('auth.phone')}</Label>
              <Input
                id="phone"
                value={newEmployee.phone_number || ''}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone_number: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('employees.create_account')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
