import { useState, type ReactNode } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  /**
   * Optional icon to render on the left side of the input (e.g. a Lock icon
   * for Login/Register). The input padding is automatically adjusted.
   */
  leadingIcon?: ReactNode
  /**
   * Optional class for the relative-positioned wrapper div (rarely needed).
   */
  containerClassName?: string
}

/**
 * Password text input with a built-in Eye/EyeOff toggle for revealing the
 * value. Forward-passes a `ref` (React 19 — refs are regular props now), so
 * React Hook Form's `register({...})` continues to work without changes.
 *
 * The toggle button is `tabIndex={-1}` so keyboard tab order stays input →
 * next field; users can still click the icon with mouse or activate via
 * screen reader.
 */
export function PasswordInput({
  className,
  leadingIcon,
  containerClassName,
  ...props
}: PasswordInputProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  return (
    <div className={cn("relative", containerClassName)}>
      {leadingIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none flex items-center">
          {leadingIcon}
        </div>
      )}
      <Input
        type={visible ? "text" : "password"}
        className={cn(leadingIcon && "pl-10", "pr-10", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={
          visible ? t("common.hide_password") : t("common.show_password")
        }
        aria-pressed={visible}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {visible ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  )
}
