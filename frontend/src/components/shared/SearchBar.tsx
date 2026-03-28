import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
  inputClassName?: string
  children?: React.ReactNode
}

export function SearchBar({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  children,
}: SearchBarProps) {
  return (
    <div className={cn('flex gap-4 mb-4 sm:mb-6', className)}>
      <div className={cn('relative flex-1 group', inputClassName)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
        <Input
          placeholder={placeholder}
          className="pl-10 bg-card border-input text-foreground hover:border-primary/30 focus-visible:ring-primary/30 transition-all duration-200"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {children}
    </div>
  )
}
