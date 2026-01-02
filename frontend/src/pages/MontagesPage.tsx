import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Calendar,
  MapPin,
  User,
  CheckCircle2
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { montageService } from '@/services'
import type { Montage, CreateMontageRequest } from '@/types'

export default function MontagesPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<Montage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newMontage, setNewMontage] = useState<CreateMontageRequest>({
    client_name: '',
    client_phone: '',
    client_email: '',
    client_address: '',
    client_city: '',
    installation_date: new Date().toISOString().split('T')[0],
    status: 'Planned',
    notes: ''
  })

  // Status Colors
  const statusColors: Record<string, string> = {
    'Planned': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Scheduled': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'In Progress': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Completed': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Cancelled': 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  const loadItems = async () => {
    setIsLoading(true)
    try {
      const response = await montageService.getAll(page, 10)
      setItems(response.items)
      setTotalPages(response.total_pages)
    } catch (error) {
      toast.error(t('common.unknown_error'))
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [page])

  const handleCreate = () => {
    setNewMontage({
      client_name: '',
      client_phone: '',
      client_email: '',
      client_address: '',
      client_city: '',
      installation_date: new Date().toISOString().split('T')[0],
      status: 'Planned',
      notes: ''
    })
    setIsDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await montageService.create(newMontage)
      toast.success(t('common.save'))
      setIsDialogOpen(false)
      loadItems()
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
      await montageService.delete(id)
      toast.success(t('common.delete'))
      loadItems()
    } catch (error) {
      toast.error(t('common.unknown_error'))
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8 ml-64">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="w-8 h-8 text-purple-500" />
            {t('montages.title')}
          </h1>
          <p className="text-gray-400">{t('montages.subtitle')}</p>
        </div>
        <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          {t('montages.new_montage')}
        </Button>
      </div>

      {/* Filters (Simplified) */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input 
            placeholder={t('montages.search_placeholder')}
            className="pl-10 bg-slate-900 border-slate-800 text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-slate-800 bg-slate-900/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900">
            <TableRow className="border-slate-800 hover:bg-slate-900">
              <TableHead className="text-gray-400">{t('montages.client')}</TableHead>
              <TableHead className="text-gray-400">{t('common.date')}</TableHead>
              <TableHead className="text-gray-400">{t('common.location')}</TableHead>
              <TableHead className="text-gray-400">{t('common.status')}</TableHead>
              <TableHead className="text-gray-400">{t('montages.technician')}</TableHead>
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
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  {t('montages.no_montages')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-white font-medium">{item.client_name}</span>
                      <span className="text-xs text-gray-500">{item.client_phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-3 h-3 text-gray-500" />
                       {new Date(item.installation_date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-500" />
                      {item.client_city}, {item.client_address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[item.status || 'Planned'] || statusColors['Planned']}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {item.user_id ? (
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-500" />
                        assigned
                      </div>
                    ) : (
                      <span className="text-gray-600 text-sm">{t('montages.unassigned')}</span>
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
                        <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">
                          <Edit className="w-4 h-4 mr-2" />
                          {t('montages.edit_details')}
                        </DropdownMenuItem>
                         <DropdownMenuItem className="hover:bg-slate-800 cursor-pointer">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          {t('montages.mark_complete')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-900/20 cursor-pointer">
                          <Trash className="w-4 h-4 mr-2" />
                          {t('common.delete')}
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

     {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="border-slate-800 text-gray-400 hover:bg-slate-800 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('common.previous')}
        </Button>
        <span className="text-sm text-gray-400">
          {t('common.page', { current: page, total: totalPages || 1 })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="border-slate-800 text-gray-400 hover:bg-slate-800 hover:text-white"
        >
          {t('common.next')}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('montages.new_montage')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid gap-4 py-4">
             <div className="grid gap-2">
              <Label htmlFor="clientName">{t('montages.client_name')}</Label>
              <Input
                id="clientName"
                value={newMontage.client_name}
                onChange={(e) => setNewMontage({ ...newMontage, client_name: e.target.value })}
                className="bg-slate-800 border-slate-700"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="clientPhone">{t('auth.phone')}</Label>
                <Input
                  id="clientPhone"
                  value={newMontage.client_phone || ''}
                  onChange={(e) => setNewMontage({ ...newMontage, client_phone: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">{t('common.date')}</Label>
                <Input
                  id="date"
                  type="date"
                  value={newMontage.installation_date}
                  onChange={(e) => setNewMontage({ ...newMontage, installation_date: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="city">{t('montages.client_city')}</Label>
              <Input
                id="city"
                value={newMontage.client_city || ''}
                onChange={(e) => setNewMontage({ ...newMontage, client_city: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="address">{t('montages.client_address')}</Label>
              <Input
                id="address"
                value={newMontage.client_address || ''}
                onChange={(e) => setNewMontage({ ...newMontage, client_address: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="notes">{t('common.notes')}</Label>
              <Input
                id="notes"
                value={newMontage.notes || ''}
                onChange={(e) => setNewMontage({ ...newMontage, notes: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('montages.new_montage')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
