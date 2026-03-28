import { Link } from 'react-router-dom'
import {
  Shield,
  Database,
  Eye,
  Lock,
  Mail,
  Trash2,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { AcIcon } from '@/components/AcIcon'

interface SectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <div className="text-primary">{icon}</div>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="pl-12 space-y-3 text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  )
}

interface BulletProps {
  items: string[]
}

function BulletList({ items }: BulletProps) {
  return (
    <ul className="space-y-2 mt-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

const en = {
  badge: 'Privacy Policy',
  heading: 'How we handle your data',
  intro: 'Your privacy matters to us. This page explains in plain language what information AirPro collects, how it is used, and what rights you have. We keep things simple — we only collect what is necessary to run the service.',
  updated: 'Last updated: March 2026',
  s1_title: '1. Who is responsible for your data?',
  s1_p1: 'AirPro is operated by David Popov, based in Bulgaria. If you have any questions or concerns about your data, you can reach us at:',
  s2_title: '2. What data we collect',
  s2_p1: 'We only collect information that is needed to provide the service:',
  s2_account: 'Account & company information',
  s2_account_items: [
    'Your name and email address (for login and notifications)',
    'Your company name and contact details (entered during registration)',
    'A secure password — stored as a one-way hash, never in plain text',
  ],
  s2_work: 'Work data',
  s2_work_items: [
    'Jobs you create: client names, addresses, dates, notes, and payment status',
    'Inventory items and usage records',
    'Photos uploaded for jobs',
    'Employee accounts and their assigned jobs',
  ],
  s2_technical: 'Technical data',
  s2_technical_items: [
    'Session tokens to keep you logged in (stored in your browser)',
    'Basic server logs (errors and system events) — no personal browsing data',
  ],
  s3_title: '3. How we use your data',
  s3_p1: 'Your data is used exclusively to operate AirPro:',
  s3_items: [
    'To provide the app features: jobs, inventory, team management, reports',
    'To send transactional emails: account confirmation, password reset, employee invites, subscription updates',
    'To keep your account secure and detect unauthorized access',
    'To maintain service reliability and fix technical issues',
  ],
  s3_p2: 'We do not sell your data. We do not use it for advertising. We do not share it with third parties except where necessary to operate the service (see below).',
  s4_title: '4. Third-party services',
  s4_p1: 'AirPro uses a small number of trusted services to operate:',
  s4_items: [
    'Email delivery — We use Mailtrap to send transactional emails. Only your email address and the content of the notification are shared.',
    'Payment processing — Subscription payments are handled by Stripe. We never store your card details — they go directly to Stripe.',
    'File storage — Photos you upload are stored securely on DigitalOcean Spaces (S3-compatible storage).',
    'Hosting — The application runs on DigitalOcean infrastructure in the EU region.',
  ],
  s4_p2: 'All third-party providers are reputable services with their own privacy and security standards.',
  s5_title: '5. How long we keep your data',
  s5_p1: 'Your data is kept for as long as your account is active.',
  s5_items: [
    'If you delete a team member, their job history is preserved — it belongs to your company record.',
    'If you cancel your subscription, your data remains accessible on the Free plan.',
    'If you wish to permanently delete your account and all associated data, contact us directly.',
  ],
  s6_title: '6. Your rights',
  s6_p1: 'You have full control over your data:',
  s6_items: [
    'Access — You can view all your data inside the app at any time.',
    'Correction — You can edit your profile, company details, and any records.',
    'Deletion — Contact us to request permanent deletion of your account and data.',
    'Export — If you need a copy of your data, contact us and we will provide it.',
    'Objection — If you believe your data is being processed incorrectly, let us know.',
  ],
  s7_title: '7. Cookies & local storage',
  s7_p1: 'AirPro uses minimal browser storage:',
  s7_items: [
    'A session token to keep you logged in — expires when your session ends or after inactivity.',
    'Your language preference (Bulgarian or English) — stored locally in your browser.',
    'Your theme preference (dark/light mode) — stored locally in your browser.',
  ],
  s7_p2: 'We do not use tracking cookies or advertising cookies of any kind.',
  s8_title: '8. Security',
  s8_p1: 'We take security seriously:',
  s8_items: [
    'All connections to AirPro are encrypted (HTTPS).',
    'Passwords are hashed using industry-standard algorithms — no one, including us, can read them.',
    'Accounts are temporarily locked after repeated failed login attempts.',
    'Each company\'s data is fully isolated — no other company can access your records.',
  ],
  s9_title: '9. Changes to this policy',
  s9_p1: 'If we make significant changes to this privacy policy, we will notify you by email. Minor clarifications may be updated without notice. The "last updated" date at the top of this page always reflects the most recent revision.',
  s10_title: '10. Contact',
  s10_p1: 'For any privacy-related questions, data requests, or concerns:',
  closing: 'By using AirPro you agree to this privacy policy. We are committed to keeping your data safe and using it only to provide you with the best possible service.',
  back_home: 'Back to home',
}

const bg = {
  badge: 'Политика за поверителност',
  heading: 'Как обработваме вашите данни',
  intro: 'Вашата поверителност е важна за нас. Тази страница обяснява на разбираем език каква информация събира AirPro, как се използва и какви права имате. Ние събираме само това, което е необходимо за предоставяне на услугата.',
  updated: 'Последна актуализация: март 2026',
  s1_title: '1. Кой отговаря за вашите данни?',
  s1_p1: 'AirPro се управлява от David Popov, базиран в България. При въпроси или притеснения относно вашите данни, можете да се свържете с нас на:',
  s2_title: '2. Какви данни събираме',
  s2_p1: 'Събираме само информация, необходима за предоставяне на услугата:',
  s2_account: 'Акаунт и фирмена информация',
  s2_account_items: [
    'Вашето ими и имейл адрес (за влизане и известия)',
    'Наименование и данни за контакт на фирмата (въведени при регистрация)',
    'Защитена парола — съхранявана като еднопосочен хеш, никога в обикновен текст',
  ],
  s2_work: 'Работни данни',
  s2_work_items: [
    'Задачите, които създавате: имена на клиенти, адреси, дати, бележки и статус на плащане',
    'Артикули в склада и записи за употреба',
    'Снимки, качени към задачи',
    'Акаунти на служители и назначените им задачи',
  ],
  s2_technical: 'Технически данни',
  s2_technical_items: [
    'Сесийни токени за поддържане на влизането (съхранявани в браузъра ви)',
    'Основни сървърни журнали (грешки и системни събития) — без лични данни за сърфиране',
  ],
  s3_title: '3. Как използваме вашите данни',
  s3_p1: 'Вашите данни се използват изключително за работата на AirPro:',
  s3_items: [
    'За предоставяне на функциите на приложението: задачи, склад, управление на екип, отчети',
    'За изпращане на транзакционни имейли: потвърждение на акаунт, нулиране на парола, покани за служители, промени в абонамента',
    'За осигуряване на сигурността на акаунта и разкриване на неоторизиран достъп',
    'За поддържане на надеждността на услугата и отстраняване на технически проблеми',
  ],
  s3_p2: 'Ние не продаваме вашите данни. Не ги използваме за реклама. Не ги споделяме с трети страни, освен когато е необходимо за работата на услугата (вижте по-долу).',
  s4_title: '4. Услуги на трети страни',
  s4_p1: 'AirPro използва малък брой доверени услуги за работата си:',
  s4_items: [
    'Доставка на имейли — Използваме Mailtrap за изпращане на транзакционни имейли. Споделя се само имейл адресът ви и съдържанието на известието.',
    'Обработка на плащания — Абонаментните плащания се обработват от Stripe. Ние никога не съхраняваме данните на вашата карта — те отиват директно при Stripe.',
    'Съхранение на файлове — Снимките, които качвате, се съхраняват сигурно в DigitalOcean Spaces.',
    'Хостинг — Приложението работи на инфраструктура на DigitalOcean в региона на ЕС.',
  ],
  s4_p2: 'Всички доставчици на трети страни са реномирани услуги с техните собствени стандарти за поверителност и сигурност.',
  s5_title: '5. Колко дълго съхраняваме данните ви',
  s5_p1: 'Вашите данни се съхраняват докато акаунтът ви е активен.',
  s5_items: [
    'При изтриване на член от екипа, историята на задачите му се запазва — тя принадлежи на записите на вашата фирма.',
    'При отказ от абонамента, данните ви остават достъпни в Безплатния план.',
    'При желание за окончателно изтриване на акаунта и всички свързани данни, свържете се с нас директно.',
  ],
  s6_title: '6. Вашите права',
  s6_p1: 'Имате пълен контрол над данните си:',
  s6_items: [
    'Достъп — Можете да видите всичките си данни в приложението по всяко вреиме.',
    'Поправка — Можете да редактирате профила, данните за фирмата и всички записи.',
    'Изтриване — Свържете се с нас, за да поискате окончателно изтриване на акаунта и данните ви.',
    'Износ — Ако ви е необходимо копие на данните, свържете се с нас и ще ви го предоставим.',
    'Възражение — Ако смятате, че данните ви се обработват неправилно, уведомете ни.',
  ],
  s7_title: '7. Бисквитки и локално съхранение',
  s7_p1: 'AirPro използва минимално браузърно съхранение:',
  s7_items: [
    'Сесиен токен за поддържане на влизането — изтича при края на сесията или след неактивност.',
    'Предпочитанието ви за език (Български или Английски) — съхранено локално в браузъра.',
    'Предпочитанието ви за тема (тъмен/светъл режим) — съхранено локално в браузъра.',
  ],
  s7_p2: 'Ние не използваме проследяващи или рекламни бисквитки.',
  s8_title: '8. Сигурност',
  s8_p1: 'Приемаме сигурността сериозно:',
  s8_items: [
    'Всички връзки с AirPro са криптирани (HTTPS).',
    'Паролите се хешират с индустриални алгоритми — никой, включително ние, не може да ги прочете.',
    'Акаунтите се заключват временно след повторни неуспешни опити за влизане.',
    'Данните на всяка фирма са напълно изолирани — никоя друга фирма не може да достъпи вашите записи.',
  ],
  s9_title: '9. Промени в тази политика',
  s9_p1: 'При значителни промени в тази политика за поверителност ще ви уведомим по имейл. Незначителни уточнения може да бъдат актуализирани без предизвестие. Датата „Последна актуализация" винаги отразява последната редакция.',
  s10_title: '10. Контакти',
  s10_p1: 'За въпроси, свързани с поверителността, заявки за данни или притеснения:',
  closing: 'С използването на AirPro се съгласявате с тази политика за поверителност. Ние се ангажираме да пазим данните ви сигурно и да ги използваме само за предоставяне на най-добрата услуга.',
  back_home: 'Назад към начало',
}

export default function PrivacyPage() {
  const { i18n, t } = useTranslation()
  const c = i18n.language.startsWith('bg') ? bg : en

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
      <main className="container mx-auto px-4 sm:px-6 py-16 lg:py-24 max-w-3xl">

        {/* Page header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            {c.badge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {c.heading}
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {c.intro}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            {c.updated}
          </p>
        </div>

        <div className="w-full h-px bg-border mb-14" />

        {/* 1. Responsible party */}
        <Section icon={<Shield className="w-4 h-4" />} title={c.s1_title}>
          <p>{c.s1_p1}</p>
          <div className="mt-4 p-5 rounded-2xl bg-card border border-border">
            <p className="text-foreground font-medium">David Popov</p>
            <p className="text-sm mt-1">
              <a href="mailto:deividpopov03@gmail.com" className="text-primary hover:underline">deividpopov03@gmail.com</a>
            </p>
            <p className="text-sm mt-1">
              <a href="tel:+359899526232" className="hover:text-primary transition-colors">+359 899 526 232</a>
            </p>
          </div>
        </Section>

        {/* 2. Data collected */}
        <Section icon={<Database className="w-4 h-4" />} title={c.s2_title}>
          <p>{c.s2_p1}</p>
          <div className="mt-4 space-y-5">
            <div>
              <p className="text-foreground font-medium text-sm mb-2">{c.s2_account}</p>
              <BulletList items={c.s2_account_items} />
            </div>
            <div>
              <p className="text-foreground font-medium text-sm mb-2">{c.s2_work}</p>
              <BulletList items={c.s2_work_items} />
            </div>
            <div>
              <p className="text-foreground font-medium text-sm mb-2">{c.s2_technical}</p>
              <BulletList items={c.s2_technical_items} />
            </div>
          </div>
        </Section>

        {/* 3. How we use it */}
        <Section icon={<Eye className="w-4 h-4" />} title={c.s3_title}>
          <p>{c.s3_p1}</p>
          <BulletList items={c.s3_items} />
          <p className="mt-3">{c.s3_p2}</p>
        </Section>

        {/* 4. Third parties */}
        <Section icon={<Lock className="w-4 h-4" />} title={c.s4_title}>
          <p>{c.s4_p1}</p>
          <BulletList items={c.s4_items} />
          <p className="mt-3">{c.s4_p2}</p>
        </Section>

        {/* 5. Retention */}
        <Section icon={<Database className="w-4 h-4" />} title={c.s5_title}>
          <p>{c.s5_p1}</p>
          <BulletList items={c.s5_items} />
        </Section>

        {/* 6. Rights */}
        <Section icon={<Eye className="w-4 h-4" />} title={c.s6_title}>
          <p>{c.s6_p1}</p>
          <BulletList items={c.s6_items} />
        </Section>

        {/* 7. Cookies */}
        <Section icon={<Lock className="w-4 h-4" />} title={c.s7_title}>
          <p>{c.s7_p1}</p>
          <BulletList items={c.s7_items} />
          <p className="mt-3">{c.s7_p2}</p>
        </Section>

        {/* 8. Security */}
        <Section icon={<Shield className="w-4 h-4" />} title={c.s8_title}>
          <p>{c.s8_p1}</p>
          <BulletList items={c.s8_items} />
        </Section>

        {/* 9. Changes */}
        <Section icon={<Trash2 className="w-4 h-4" />} title={c.s9_title}>
          <p>{c.s9_p1}</p>
        </Section>

        {/* 10. Contact */}
        <Section icon={<Mail className="w-4 h-4" />} title={c.s10_title}>
          <p>{c.s10_p1}</p>
          <div className="mt-4 p-5 rounded-2xl bg-card border border-border">
            <p className="text-foreground font-medium">David Popov</p>
            <p className="text-sm mt-1">
              <a href="mailto:deividpopov03@gmail.com" className="text-primary hover:underline">deividpopov03@gmail.com</a>
            </p>
            <p className="text-sm mt-1">
              <a href="tel:+359899526232" className="hover:text-primary transition-colors">+359 899 526 232</a>
            </p>
          </div>
        </Section>

        <div className="w-full h-px bg-border mt-4 mb-10" />

        <p className="text-sm text-muted-foreground text-center">
          {c.closing}
        </p>

        <div className="flex justify-center mt-8">
          <Link to="/">
            <Button variant="outline" className="gap-2 rounded-xl">
              <ArrowLeft className="w-4 h-4" />
              {c.back_home}
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/50 mt-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <AcIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span>© {new Date().getFullYear()} AirPro. {t('public.copyright')}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="hover:text-foreground transition-colors">{t('public.terms')}</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">{t('public.contact')}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
