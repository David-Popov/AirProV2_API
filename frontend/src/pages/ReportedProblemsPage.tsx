import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MessageSquareWarning,
  Eye,
  Image as ImageIcon,
  User,
  Tag,
  Check
} from 'lucide-react'
import { LoadingState, EmptyState, ConfirmDialog } from '@/components/shared'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { problemReportsService } from '@/services/problem-reports'
import type { ReportedProblem } from '@/types'
import { ProblemCategory, PROBLEM_CATEGORY_OPTIONS } from '@/types'
import { toast } from 'sonner'

export default function ReportedProblemsPage() {
  const { t } = useTranslation()
  const [problems, setProblems] = useState<ReportedProblem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProblem, setSelectedProblem] = useState<ReportedProblem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [problemToDelete, setProblemToDelete] = useState<ReportedProblem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)

  useEffect(() => {
    loadProblems()
  }, [])

  const loadProblems = async () => {
    try {
      setIsLoading(true)
      const data = await problemReportsService.getAllProblemReports()
      setProblems(data)
    } catch (error) {
      toast.error(t('problem_reports.load_error'))
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryLabel = (category: ProblemCategory): string => {
    const option = PROBLEM_CATEGORY_OPTIONS.find(opt => opt.value === category)
    return option ? t(option.labelKey) : String(category)
  }

  const getCategoryColor = (category: ProblemCategory): string => {
    switch (category) {
      case ProblemCategory.Bug:
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case ProblemCategory.FeatureNotWorking:
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case ProblemCategory.DataNotInserted:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case ProblemCategory.UIIssue:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case ProblemCategory.PerformanceIssue:
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const handleViewDetails = async (problem: ReportedProblem) => {
    setSelectedProblem(problem)
    setIsDetailOpen(true)

    if (problem.hasScreenshot) {
      try {
        const url = await problemReportsService.getScreenshotBlobUrl(problem.id)
        setScreenshotUrl(url)
      } catch {
        setScreenshotUrl(null)
      }
    }
  }

  const handleDetailClose = (open: boolean) => {
    setIsDetailOpen(open)
    if (!open) {
      if (screenshotUrl) {
        URL.revokeObjectURL(screenshotUrl)
        setScreenshotUrl(null)
      }
    }
  }

  const handleDeleteClick = (problem: ReportedProblem) => {
    setProblemToDelete(problem)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!problemToDelete) return

    setIsDeleting(true)
    try {
      await problemReportsService.deleteProblemReport(problemToDelete.id)
      setProblems(prev => prev.filter(p => p.id !== problemToDelete.id))
      toast.success(t('problem_reports.marked_reviewed'))
      setIsDeleteDialogOpen(false)
      setProblemToDelete(null)
      
      // Close detail dialog if we just deleted the viewed problem
      if (selectedProblem?.id === problemToDelete.id) {
        setIsDetailOpen(false)
        setSelectedProblem(null)
      }
    } catch (error) {
      toast.error(t('problem_reports.delete_error'))
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <main className="lg:pl-64 min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <MessageSquareWarning className="w-5 h-5 text-orange-500" />
              </div>
              {t('problem_reports.admin_title')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('problem_reports.admin_subtitle')}</p>
          </div>
          
          <Badge variant="outline" className="w-fit">
            {t('problem_reports.total_count', { count: problems.length })}
          </Badge>
        </div>

        {/* Problems Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('problem_reports.all_reports')}</CardTitle>
            <CardDescription>{t('problem_reports.admin_description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingState />
            ) : problems.length === 0 ? (
              <EmptyState icon={MessageSquareWarning} message={t('problem_reports.no_problems')} />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('problem_reports.reporter')}</TableHead>
                      <TableHead>{t('problem_reports.category')}</TableHead>
                      <TableHead className="hidden md:table-cell">{t('problem_reports.description_preview')}</TableHead>
                      <TableHead>{t('problem_reports.date')}</TableHead>
                      <TableHead className="text-right">{t('common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {problems.map((problem) => (
                      <TableRow key={problem.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{problem.userName}</p>
                            <p className="text-xs text-muted-foreground">{problem.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getCategoryColor(problem.category)}>
                            {getCategoryLabel(problem.category)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-xs">
                          <p className="truncate text-muted-foreground">
                            {problem.description}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(problem.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(problem)}
                              title={t('problem_reports.view_details')}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(problem)}
                              className="text-destructive hover:text-destructive"
                              title={t('problem_reports.mark_reviewed')}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={handleDetailClose}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5" />
                {t('problem_reports.report_details')}
              </DialogTitle>
              <DialogDescription>
                {selectedProblem && formatDate(selectedProblem.createdAt)}
              </DialogDescription>
            </DialogHeader>

            {selectedProblem && (
              <div className="space-y-4">
                {/* Reporter Info */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{selectedProblem.userName}</p>
                    <p className="text-sm text-muted-foreground">{selectedProblem.userEmail}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-muted-foreground" />
                  <Badge variant="outline" className={getCategoryColor(selectedProblem.category)}>
                    {getCategoryLabel(selectedProblem.category)}
                  </Badge>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="font-medium">{t('problem_reports.problem_description')}</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap p-3 bg-muted/30 rounded-lg">
                    {selectedProblem.description}
                  </p>
                </div>

                {/* Screenshot */}
                {selectedProblem.hasScreenshot && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      {t('problem_reports.screenshot')}
                    </h4>
                    {screenshotUrl ? (
                      <img
                        src={screenshotUrl}
                        alt="Screenshot"
                        className="rounded-lg border max-h-80 w-full object-contain bg-muted/30"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-40 bg-muted/30 rounded-lg">
                        <LoadingState />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => handleDetailClose(false)}>
                {t('common.close')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedProblem) {
                    handleDeleteClick(selectedProblem)
                  }
                }}
              >
                <Check className="w-4 h-4 mr-2" />
                {t('problem_reports.mark_reviewed')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          title={t('problem_reports.confirm_reviewed_title')}
          description={t('problem_reports.confirm_reviewed_description')}
          confirmLabel={t('problem_reports.confirm_mark_reviewed')}
          cancelLabel={t('common.cancel')}
          isLoading={isDeleting}
          icon={Check}
        />
      </div>
    </main>
  )
}
