import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Bug, Upload, X, Loader2, ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { problemReportsService } from '@/services/problem-reports'
import { ProblemCategory, PROBLEM_CATEGORY_OPTIONS } from '@/types'
import { toast } from 'sonner'
import { notifyApiError } from '@/lib/apiErrors'

interface ReportProblemModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ReportProblemModal({ isOpen, onClose }: ReportProblemModalProps) {
  const { t } = useTranslation()
  const [category, setCategory] = useState<ProblemCategory>(ProblemCategory.Bug)
  const [description, setDescription] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('problem_reports.invalid_file_type'))
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('problem_reports.file_too_large'))
        return
      }
      
      setScreenshot(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleRemoveScreenshot = () => {
    setScreenshot(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error(t('problem_reports.description_required'))
      return
    }

    if (description.length > 2000) {
      toast.error(t('problem_reports.description_too_long'))
      return
    }

    setIsSubmitting(true)
    try {
      await problemReportsService.createProblemReport(category, description, screenshot || undefined)
      toast.success(t('problem_reports.submitted_success'))
      handleClose()
    } catch (error) {
      notifyApiError(error, t, t('problem_reports.submit_error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setCategory(ProblemCategory.Bug)
      setDescription('')
      handleRemoveScreenshot()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-destructive" />
            {t('problem_reports.title')}
          </DialogTitle>
          <DialogDescription>
            {t('problem_reports.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category">{t('problem_reports.category')}</Label>
            <Select
              value={String(category)}
              onValueChange={(value) => setCategory(Number(value) as ProblemCategory)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder={t('problem_reports.select_category')} />
              </SelectTrigger>
              <SelectContent>
                {PROBLEM_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('problem_reports.problem_description')}</Label>
            <Textarea
              id="description"
              placeholder={t('problem_reports.description_placeholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={2000}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/2000
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t('problem_reports.screenshot')} <span className="text-muted-foreground">({t('common.optional')})</span></Label>
            
            {!screenshot ? (
              <div
                role="button"
                tabIndex={0}
                aria-label={t('problem_reports.click_to_upload')}
                className="border-2 border-dashed border-muted rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
              >
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{t('problem_reports.click_to_upload')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('problem_reports.file_requirements')}</p>
              </div>
            ) : (
              <div className="relative border rounded-lg p-2">
                <div className="flex items-center gap-3">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-16 h-16 object-cover rounded" />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{screenshot.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(screenshot.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('common.remove')}
                    onClick={handleRemoveScreenshot}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !description.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('problem_reports.submitting')}
              </>
            ) : (
              t('problem_reports.submit')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
