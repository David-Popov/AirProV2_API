import { Link } from 'react-router-dom'
import {
  ClipboardList,
  Package,
  Users,
  BarChart3,
  Shield,
  Bell,
  Camera,
  CreditCard,
  UserCheck,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Mail,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { AcIcon } from '@/components/AcIcon'
import { usePageTitle } from '@/hooks/usePageTitle'

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

interface FeatureRowProps {
  title: string
  description: string
}

function FeatureRow({ title, description }: FeatureRowProps) {
  return (
    <div className="flex gap-3">
      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
      <p><span className="text-foreground font-medium">{title}</span> — {description}</p>
    </div>
  )
}

const en = {
  badge: 'What we offer',
  heading: 'Everything you need to run your business',
  intro: "AirPro is a management tool built specifically for air conditioning service companies. Below you'll find a clear description of everything the platform offers — so you always know exactly what you're getting.",
  updated: 'Last updated: March 2026',
  s1_title: '1. What is AirPro?',
  s1_p1: 'AirPro replaces spreadsheets, paper job cards, and phone calls with one simple tool that your whole team can use from any device — phone, tablet, or computer.',
  s1_p2: "When you register, you create your company's workspace. From there you can add your team, start logging jobs, track your materials, and get a clear picture of how the business is running — all in one place.",
  s2_title: '2. Who uses AirPro?',
  s2_intro: 'AirPro is designed for two types of users within your company:',
  s2_manager_label: 'Manager (Business Owner)',
  s2_manager_points: [
    'Full control over the company account',
    'Add and manage employees',
    'Create and oversee all jobs',
    'Manage inventory and stock',
    'View analytics and reports',
    'Handle subscription and billing',
  ],
  s2_employee_label: 'Employee (Technician)',
  s2_employee_points: [
    'View and update their assigned jobs',
    'Upload photos for each job',
    'Log materials used on site',
    'Browse the AC catalog and error codes',
    'Report problems or feedback',
  ],
  s3_title: '3. Job Management',
  s3_p1: 'A job in AirPro represents any service visit — an installation, repair, maintenance check, or any other on-site task. Jobs are the heart of the platform.',
  s3_rows: [
    { title: 'Create jobs', desc: "Add a job with the client's name, address, date, the technician assigned, price, and the AC unit being serviced." },
    { title: 'Track progress', desc: 'Each job has a clear status: Planned, In Progress, Completed, or Cancelled. Both the manager and the technician can update it.' },
    { title: 'Payment tracking', desc: 'Mark each job as Unpaid, Partially Paid, or Paid so you always know what has been collected and what is outstanding.' },
    { title: 'Assign to technicians', desc: "Each job is assigned to one team member. Technicians only see their own jobs; the manager sees everything." },
    { title: 'Notes', desc: 'Add any extra details — client preferences, access instructions, or a summary of work done.' },
  ],
  s4_title: '4. Photo Documentation',
  s4_p1: 'Keep a visual record of every job. Photos are stored securely and linked directly to the job they belong to.',
  s4_rows: [
    { title: 'Upload from any device', desc: 'Technicians can take and upload photos straight from their phone during or after a job.' },
    { title: 'Before & after gallery', desc: 'All photos for a job are grouped in a gallery inside the job detail page.' },
    { title: 'Easy removal', desc: 'Managers can delete photos that are no longer needed.' },
  ],
  s5_title: '5. Inventory Management',
  s5_p1: "Keep track of all the materials, parts, and consumables your team uses — so you never run out of something important mid-job.",
  s5_rows: [
    { title: 'Add stock items', desc: 'Register any part or material with a name, category, unit, current quantity, and a minimum threshold.' },
    { title: 'Low-stock warnings', desc: 'Items that fall below their minimum are highlighted so you know when to reorder.' },
    { title: 'Log usage per job', desc: 'Technicians can record which materials they used during a job. The stock count updates automatically.' },
    { title: 'Full history', desc: 'See every change ever made to a stock item — who added it, who used it, and when.' },
  ],
  s6_title: '6. Team Management',
  s6_p1: 'Add your technicians and give them their own accounts so everyone works from the same system.',
  s6_rows: [
    { title: 'Invite team members', desc: "Enter a name and email — your employee receives a welcome email with a link to set their own password. No passwords are ever shared by email." },
    { title: 'Employee profiles', desc: "See each technician's current workload, active jobs, and contact details at a glance." },
    { title: 'Deactivate when needed', desc: "If someone leaves, you can deactivate their account. All their past work and history remains safe and intact." },
  ],
  s7_title: '7. Air Conditioner Catalog',
  s7_p1: 'AirPro includes a built-in catalog of air conditioning models from leading brands that your team can reference anytime.',
  s7_rows: [
    { title: 'Browse & search', desc: 'Filter units by brand, model, power output, or price to quickly find what you\'re looking for.' },
    { title: 'Full specifications', desc: 'Each model has a dedicated page with all technical details.' },
    { title: 'Error code reference', desc: 'Every model includes a full list of error codes with a plain-language explanation of what each code means, what likely caused it, and how to fix it — a handy guide for technicians on the job.' },
  ],
  s8_title: '8. Dashboard & Reports',
  s8_p1: 'Get a clear overview of how your business is performing without having to dig through individual records.',
  s8_rows: [
    { title: 'Business snapshot', desc: 'See your active jobs, completed jobs this month, and total revenue — all on one screen.' },
    { title: 'Monthly revenue chart', desc: 'A visual chart shows your earnings month by month over the past year.' },
    { title: 'Recent jobs', desc: 'A quick-access list of your latest jobs with their status and value.' },
    { title: 'Team workload', desc: 'See at a glance how many active jobs each technician currently has.' },
    { title: 'Stock health', desc: 'Visual indicators show which inventory items need attention.' },
  ],
  s9_title: '9. Plans & Pricing',
  s9_p1: 'AirPro offers a free plan to get started and a Premium plan for growing teams. Payments are handled securely and you can cancel at any time.',
  s9_plans: [
    {
      name: 'Free',
      color: 'text-muted-foreground',
      border: 'border-border',
      bg: 'bg-muted/30',
      points: ['Up to 2 active employees', 'Unlimited jobs', 'Inventory management', 'AC catalog & error codes'],
    },
    {
      name: 'Premium',
      color: 'text-primary',
      border: 'border-primary/30',
      bg: 'bg-primary/5',
      points: ['Up to 10 active employees', 'Full dashboard & analytics', 'Complete stock history', 'Priority support'],
    },
    {
      name: '6-Month Free Trial',
      color: 'text-emerald-500',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      points: ['Full Premium access', 'Available on first sign-up', 'No credit card needed to start', 'Moves to Free plan after trial'],
    },
  ],
  s9_cancel: 'Subscriptions renew monthly. You can cancel at any time from your Settings page. After cancellation you keep full access until the end of your paid period, then the account switches to the Free plan automatically.',
  s10_title: '10. Automatic Email Notifications',
  s10_p1: 'AirPro keeps you and your team informed with automatic emails at the right moments:',
  s10_rows: [
    { title: 'Welcome', desc: 'A welcome email is sent when your company account is created.' },
    { title: 'New employee invite', desc: 'When you add a team member, they receive an email with a secure link to set their own password.' },
    { title: 'Email verification', desc: 'After signing up, a confirmation email is sent so we can verify your address before you log in.' },
    { title: 'Password reset', desc: 'If you forget your password, a reset link is sent to your email immediately.' },
    { title: 'Subscription updates', desc: "You'll receive a confirmation whenever your plan changes — activation, renewal, cancellation, or expiry." },
  ],
  s11_title: "11. Your Data is Safe",
  s11_p1: "We take the security of your business data seriously. Here's how we protect it:",
  s11_rows: [
    { title: 'Secure login', desc: "Your account is protected with secure sessions. If you close the browser or stay inactive, you'll be asked to log in again." },
    { title: 'Account protection', desc: 'After several failed login attempts, your account is temporarily locked to prevent unauthorized access. You can unlock it instantly via password reset.' },
    { title: 'Your data stays yours', desc: "Your company's information is completely private. No other company can see your jobs, employees, or inventory." },
    { title: 'Encrypted connection', desc: 'All data travels over a fully encrypted connection — the same security standard used by banks.' },
    { title: 'Nothing is lost', desc: "Even if a team member is removed, their job history and records are preserved for your company." },
  ],
  s12_title: '12. Support & Contact',
  s12_p1: "Have a question, need help, or want to report an issue? We're here for you:",
  s12_report: 'You can also send feedback or report a problem directly from inside the app — just click the',
  s12_report_link: 'Report a Problem',
  s12_report_end: 'button in the sidebar menu.',
  closing: 'By creating an account you agree to use AirPro responsibly and keep your login details secure. We may update this page from time to time — we\'ll let you know by email if anything important changes.',
  back_home: 'Back to home',
}

const bg = {
  badge: 'Какво предлагаме',
  heading: 'Всичко, от което се нуждае бизнесът ви',
  intro: 'AirPro е инструмент за управление, създаден специално за фирми за климатична техника. По-долу ще намерите ясно описание на всичко, което платформата предлага — за да знаете точно какво получавате.',
  updated: 'Последна актуализация: март 2026',
  s1_title: '1. Какво е AirPro?',
  s1_p1: 'AirPro замества таблиците в Excel, хартиените работни карти и телефонните обаждания с един прост инструмент, достъпен от всяко устройство — телефон, таблет или компютър.',
  s1_p2: 'При регистрация създавате работното пространство на вашата фирма. Оттам можете да добавите екипа си, да започнете да записвате задачи, да следите материалите и да получите ясна картина за работата — всичко на едно място.',
  s2_title: '2. Кой използва AirPro?',
  s2_intro: 'AirPro е проектиран за два вида потребители във вашата фирма:',
  s2_manager_label: 'Мениджър (Собственик)',
  s2_manager_points: [
    'Пълен контрол над фирмения акаунт',
    'Добавяне и управление на служители',
    'Създаване и наблюдение на всички задачи',
    'Управление на склад и материали',
    'Преглед на анализи и отчети',
    'Управление на абонамент и плащания',
  ],
  s2_employee_label: 'Служител (Техник)',
  s2_employee_points: [
    'Преглед и обновяване на назначените задачи',
    'Качване на снимки за всяка задача',
    'Записване на използваните материали',
    'Преглед на каталога с климатици и кодове за грешки',
    'Докладване на проблеми или обратна връзка',
  ],
  s3_title: '3. Управление на задачи',
  s3_p1: 'Задача в AirPro представлява всяко посещение — монтаж, ремонт, профилактика или друга работа на обект. Задачите са сърцето на платформата.',
  s3_rows: [
    { title: 'Създаване на задачи', desc: 'Добавете задача с имe на клиента, адрес, дата, назначен техник, цена и климатика за обслужване.' },
    { title: 'Проследяване на напредъка', desc: 'Всяка задача има ясен статус: Планирана, В изпълнение, Завършена или Отменена. И мениджърът, и техникът могат да го актуализират.' },
    { title: 'Проследяване на плащания', desc: 'Маркирайте всяка задача като Неплатена, Частично платена или Платена — за да знаете винаги какво е събрано и какво е дължимо.' },
    { title: 'Назначаване на техник', desc: 'Всяка задача се назначава на един член на екипа. Техниците виждат само своите задачи; мениджърът вижда всички.' },
    { title: 'Гаранция', desc: 'Задайте гаранционен период за всяка задача. Можете да зададете и стандартна гаранция за цялата фирма в настройките.' },
    { title: 'Бележки', desc: 'Добавете допълнителни детайли — предпочитания на клиента, инструкции за достъп или резюме на извършената работа.' },
  ],
  s4_title: '4. Фотодокументация',
  s4_p1: 'Пазете визуален запис на всяка задача. Снимките се съхраняват сигурно и са свързани директно с конкретната задача.',
  s4_rows: [
    { title: 'Качване от всяко устройство', desc: 'Техниците могат да правят и качват снимки директно от телефона си по време или след задача.' },
    { title: 'Галерия преди и след', desc: 'Всички снимки за задача са групирани в галерия в страницата с детайли.' },
    { title: 'Лесно изтриване', desc: 'Мениджърите могат да изтриват снимки, които вече не са нужни.' },
  ],
  s5_title: '5. Управление на склад',
  s5_p1: 'Следете всички материали, части и консумативи, използвани от екипа — за да не ви свърши нещо важно по средата на задача.',
  s5_rows: [
    { title: 'Добавяне на артикули', desc: 'Регистрирайте всяка част или материал с наименование, категория, мерна единица, текущо количество и минимален праг.' },
    { title: 'Предупреждения за ниски наличности', desc: 'Артикулите под минималното ниво се маркират, за да знаете кога да поръчате.' },
    { title: 'Записване на употреба по задача', desc: 'Техниците могат да отбелязват кои материали са използвали. Количеството се актуализира автоматично.' },
    { title: 'Пълна история', desc: 'Вижте всяка промяна на даден артикул — кой го е добавил, кой го е използвал и кога.' },
  ],
  s6_title: '6. Управление на екип',
  s6_p1: 'Добавете техниците си и им дайте собствени акаунти, за да работи целият екип от една система.',
  s6_rows: [
    { title: 'Покана на членове', desc: 'Въведете ime и имейл — служителят получава имейл с връзка за задаване на собствена парола. Никакви пароли не се изпращат по имейл.' },
    { title: 'Профили на служители', desc: 'Вижте натовареността, активните задачи и данните за контакт на всеки техник с един поглед.' },
    { title: 'Деактивиране при нужда', desc: 'Ако някой напусне, можете да деактивирате акаунта му. Цялата минала работа и история остават запазени.' },
  ],
  s7_title: '7. Каталог с климатици',
  s7_p1: 'AirPro включва вграден каталог с модели климатични техники от водещи марки, достъпен за екипа ви по всяко време.',
  s7_rows: [
    { title: 'Преглед и търсене', desc: 'Филтрирайте по марка, модел, мощност или цена за бързо намиране.' },
    { title: 'Пълни технически характеристики', desc: 'Всеки модел има отделна страница с всички технически данни.' },
    { title: 'Справочник за кодове за грешки', desc: 'Всеки модел включва пълен списък с кодове за грешки — с обяснение на причината и начина за отстраняване. Удобен наръчник за техниците на обекта.' },
  ],
  s8_title: '8. Табло и отчети',
  s8_p1: 'Получете ясен преглед на представянето на бизнеса ви, без да се налага да разглеждате отделни записи.',
  s8_rows: [
    { title: 'Обобщение', desc: 'Вижте активните задачи, завършените за месеца и общия приход — всичко на един екран.' },
    { title: 'Диаграма на приходите', desc: 'Визуална диаграма показва приходите по месеци за последната година.' },
    { title: 'Последни задачи', desc: 'Бърз достъп до последните задачи с техния статус и стойност.' },
    { title: 'Натовареност на екипа', desc: 'Вижте с един поглед колко активни задачи има всеки техник.' },
    { title: 'Състояние на склада', desc: 'Визуални индикатори показват кои артикули изискват внимание.' },
  ],
  s9_title: '9. Планове и цени',
  s9_p1: 'AirPro предлага безплатен план за начало и Premium план за разрастващи се екипи. Плащанията се обработват сигурно и можете да се откажете по всяко време.',
  s9_plans: [
    {
      name: 'Безплатен',
      color: 'text-muted-foreground',
      border: 'border-border',
      bg: 'bg-muted/30',
      points: ['До 2 активни служители', 'Неограничени задачи', 'Управление на склад', 'Каталог и кодове за грешки'],
    },
    {
      name: 'Premium',
      color: 'text-primary',
      border: 'border-primary/30',
      bg: 'bg-primary/5',
      points: ['До 10 активни служители', 'Пълно табло и анализи', 'Пълна история на склада', 'Приоритетна поддръжка'],
    },
    {
      name: '6-месечен безплатен пробен период',
      color: 'text-emerald-500',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/5',
      points: ['Пълен Premium достъп', 'Достъпен при първа регистрация', 'Без кредитна карта', 'След периода — преминаване към Безплатен план'],
    },
  ],
  s9_cancel: 'Абонаментите се подновяват месечно. Можете да се откажете по всяко вреиме от страницата Настройки. След отказ запазвате пълен достъп до края на платения период, след което акаунтът автоматично преминава към Безплатния план.',
  s10_title: '10. Автоматични имейл известия',
  s10_p1: 'AirPro ви държи информирани с автоматични имейли в точния момент:',
  s10_rows: [
    { title: 'Добре дошли', desc: 'Имейл за добре дошли се изпраща при създаване на фирмен акаунт.' },
    { title: 'Покана на нов служител', desc: 'При добавяне на член, той получава имейл с връзка за задаване на собствена парола.' },
    { title: 'Потвърждение на имейл', desc: 'След регистрация се изпраща имейл за потвърждение на адреса преди влизане.' },
    { title: 'Нулиране на парола', desc: 'При забравена парола незабавно се изпраща връзка за нулиране.' },
    { title: 'Промени в абонамента', desc: 'Получавате потвърждение при всяка промяна на плана — активиране, подновяване, отказ или изтичане.' },
  ],
  s11_title: '11. Вашите данни са в безопасност',
  s11_p1: 'Приемаме сигурността на вашите бизнес данни сериозно. Ето как ги защитаваме:',
  s11_rows: [
    { title: 'Сигурно влизане', desc: 'Акаунтът ви е защитен със сигурни сесии. При затваряне на браузъра или неактивност ще бъдете помолени да влезете отново.' },
    { title: 'Защита на акаунта', desc: 'След няколко неуспешни опита за влизане акаунтът се заключва временно. Можете да го отключите незабавно чрез нулиране на паролата.' },
    { title: 'Данните ви остават ваши', desc: 'Информацията на вашата фирма е напълно поверителна. Никоя друга фирма не може да вижда задачите, служителите или склада ви.' },
    { title: 'Криптирана връзка', desc: 'Всички данни се предават по напълно криптирана връзка — същият стандарт, използван от банките.' },
    { title: 'Нищо не се губи', desc: 'Дори ако член на екипа бъде премахнат, историята на задачите му се запазва за вашата фирма.' },
  ],
  s12_title: '12. Поддръжка и контакти',
  s12_p1: 'Имате въпрос, нуждаете се от помощ или искате да докладвате проблем? Свържете се с нас:',
  s12_report: 'Можете също да изпратите обратна връзка или да докладвате проблем директно от приложението — натиснете бутона',
  s12_report_link: 'Докладвай проблем',
  s12_report_end: 'в страничното меню.',
  closing: 'С създаването на акаунт се съгласявате да използвате AirPro отговорно и да пазите данните си за вход. Може да актуализираме тази страница от время на вреиме — ще ви уведомим по имейл при важни промени.',
  back_home: 'Назад към начало',
}

export default function TermsPage() {
  usePageTitle('Terms of Service')
  const { i18n, t } = useTranslation()
  const c = i18n.language.startsWith('bg') ? bg : en

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-60 -right-60 w-125 h-125 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-60 w-100 h-100 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-75 h-75 bg-violet-400/5 rounded-full blur-3xl" />
      </div>

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

      <main className="container mx-auto px-4 sm:px-6 py-16 lg:py-24 max-w-3xl">

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

        <Section icon={<AcIcon className="w-4 h-4" />} title={c.s1_title}>
          <p>{c.s1_p1}</p>
          <p>{c.s1_p2}</p>
        </Section>

        <Section icon={<UserCheck className="w-4 h-4" />} title={c.s2_title}>
          <p className="mb-6">{c.s2_intro}</p>
          <div className="grid sm:grid-cols-2 gap-4 not-prose">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm font-bold text-primary mb-3">{c.s2_manager_label}</p>
              <ul className="space-y-2">
                {c.s2_manager_points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <p className="text-sm font-bold text-emerald-500 mb-3">{c.s2_employee_label}</p>
              <ul className="space-y-2">
                {c.s2_employee_points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section icon={<ClipboardList className="w-4 h-4" />} title={c.s3_title}>
          <p>{c.s3_p1}</p>
          <div className="space-y-2.5 mt-4">
            {c.s3_rows.map((r) => <FeatureRow key={r.title} title={r.title} description={r.desc} />)}
          </div>
        </Section>

        <Section icon={<Camera className="w-4 h-4" />} title={c.s4_title}>
          <p>{c.s4_p1}</p>
          <div className="space-y-2.5 mt-4">
            {c.s4_rows.map((r) => <FeatureRow key={r.title} title={r.title} description={r.desc} />)}
          </div>
        </Section>

        <Section icon={<Package className="w-4 h-4" />} title={c.s5_title}>
          <p>{c.s5_p1}</p>
          <div className="space-y-2.5 mt-4">
            {c.s5_rows.map((r) => <FeatureRow key={r.title} title={r.title} description={r.desc} />)}
          </div>
        </Section>

        <Section icon={<Users className="w-4 h-4" />} title={c.s6_title}>
          <p>{c.s6_p1}</p>
          <div className="space-y-2.5 mt-4">
            {c.s6_rows.map((r) => <FeatureRow key={r.title} title={r.title} description={r.desc} />)}
          </div>
        </Section>

        <Section icon={<AcIcon className="w-4 h-4" />} title={c.s7_title}>
          <p>{c.s7_p1}</p>
          <div className="space-y-2.5 mt-4">
            {c.s7_rows.map((r) => <FeatureRow key={r.title} title={r.title} description={r.desc} />)}
          </div>
        </Section>

        <Section icon={<BarChart3 className="w-4 h-4" />} title={c.s8_title}>
          <p>{c.s8_p1}</p>
          <div className="space-y-2.5 mt-4">
            {c.s8_rows.map((r) => <FeatureRow key={r.title} title={r.title} description={r.desc} />)}
          </div>
        </Section>

        <Section icon={<CreditCard className="w-4 h-4" />} title={c.s9_title}>
          <p>{c.s9_p1}</p>
          <div className="grid sm:grid-cols-3 gap-4 mt-4 not-prose">
            {c.s9_plans.map((plan) => (
              <div key={plan.name} className={`rounded-2xl border ${plan.border} ${plan.bg} p-5`}>
                <p className={`text-sm font-bold mb-3 ${plan.color}`}>{plan.name}</p>
                <ul className="space-y-2">
                  {plan.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4">{c.s9_cancel}</p>
        </Section>

        <Section icon={<Bell className="w-4 h-4" />} title={c.s10_title}>
          <p>{c.s10_p1}</p>
          <div className="space-y-2.5 mt-4">
            {c.s10_rows.map((r) => <FeatureRow key={r.title} title={r.title} description={r.desc} />)}
          </div>
        </Section>

        <Section icon={<Shield className="w-4 h-4" />} title={c.s11_title}>
          <p>{c.s11_p1}</p>
          <div className="space-y-2.5 mt-4">
            {c.s11_rows.map((r) => <FeatureRow key={r.title} title={r.title} description={r.desc} />)}
          </div>
        </Section>

        <Section icon={<Mail className="w-4 h-4" />} title={c.s12_title}>
          <p>{c.s12_p1}</p>
          <div className="mt-4 p-5 rounded-2xl bg-card border border-border">
            <p className="text-foreground font-medium">David Popov</p>
            <p className="text-sm mt-1">
              <a href="mailto:deividpopov03@gmail.com" className="text-primary hover:underline">deividpopov03@gmail.com</a>
            </p>
            <p className="text-sm mt-1">
              <a href="tel:+359899526232" className="hover:text-primary transition-colors">+359 899 526 232</a>
            </p>
            <p className="text-sm mt-1 text-muted-foreground">София · Велико Търново · Горна Оряховица</p>
          </div>
          <p className="mt-4">
            {c.s12_report} <span className="text-foreground font-medium"> {c.s12_report_link}</span> {c.s12_report_end}
          </p>
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

      <footer className="border-t border-border/50 bg-background/50 mt-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <AcIcon className="w-4 h-4 text-primary-foreground" />
            </div>
            <span>© {new Date().getFullYear()} AirPro. {t('public.copyright')}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">{t('public.privacy')}</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">{t('public.contact')}</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
