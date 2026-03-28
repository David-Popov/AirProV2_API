import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, User, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { AcIcon } from '@/components/AcIcon'
import { usePageTitle } from '@/hooks/usePageTitle'

interface ContactCardProps {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
}

function ContactCard({ icon, label, value, href }: ContactCardProps) {
  const inner = (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 group">
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors duration-200">
        <div className="text-primary">{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-foreground font-medium truncate">{value}</p>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="block">
        {inner}
      </a>
    )
  }
  return inner
}

export default function ContactPage() {
  usePageTitle('Contact')
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-60 -right-60 w-125 h-125 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-60 w-100 h-100 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-75 h-75 bg-violet-400/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
              <AcIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">AirPro</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ModeToggle />
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                {t('public.back')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 py-20 lg:py-28 max-w-lg">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">{t('contact.page_title')}</h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            {t('contact.page_subtitle')}
          </p>
        </div>

        {/* Contact cards */}
        <div className="flex flex-col gap-3">
          <ContactCard
            icon={<User className="w-5 h-5" />}
            label={t('contact.label_name')}
            value="David Popov"
          />
          <ContactCard
            icon={<Phone className="w-5 h-5" />}
            label={t('contact.label_phone')}
            value="+359 899 526 232"
            href="tel:+359899526232"
          />
          <ContactCard
            icon={<Mail className="w-5 h-5" />}
            label={t('contact.label_email')}
            value="deividpopov03@gmail.com"
            href="mailto:deividpopov03@gmail.com"
          />
          <ContactCard
            icon={<MapPin className="w-5 h-5" />}
            label={t('contact.label_location')}
            value="София · Велико Търново · Горна Оряховица"
          />
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <a href="tel:+359899526232" className="flex-1">
            <Button className="w-full gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/25 rounded-xl h-11">
              <Phone className="w-4 h-4" />
              {t('contact.call_now')}
            </Button>
          </a>
          <a href="mailto:deividpopov03@gmail.com" className="flex-1">
            <Button variant="outline" className="w-full gap-2 rounded-xl h-11 border-border hover:border-primary/40 hover:bg-primary/5">
              <Mail className="w-4 h-4" />
              {t('contact.send_email')}
            </Button>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50">
        <div className="container mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <AcIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span>© {new Date().getFullYear()} AirPro. {t('public.copyright')}</span>
          </div>
          <Link to="/" className="hover:text-foreground transition-colors">
            {t('public.back_to_home')}
          </Link>
        </div>
      </footer>
    </div>
  )
}
