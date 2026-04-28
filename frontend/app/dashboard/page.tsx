import Link from "next/link";
import { headers } from "next/headers";
import {
  ArrowUpRight,
  Bell,
  CalendarCheck2,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock3,
  CreditCard,
  Gauge,
  Heart,
  ListChecks,
  MapPinned,
  MessageSquareMore,
  PanelTop,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  TrendingUp,
  UserCircle2,
  Wallet,
  Wrench,
} from "lucide-react";
import { type BridgeSessionUser, getDashboardSummary, getSessionUser } from "@/lib/api";
import { resolveBrand } from "@/lib/brand";
import { formatMoney } from "@/lib/presentation";
import { DASHBOARD_SESSION_HEADER, decodeSessionHeader } from "@/lib/session-header";

type IconType = React.ComponentType<{ className?: string }>;

function numberValue(value: number) {
  return Number(value || 0).toLocaleString("ar-SA");
}

function progressValue(value: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

export default async function DashboardPage() {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const [currentUser, summary] = await Promise.all([
    decodeSessionHeader<BridgeSessionUser>(headerStore.get(DASHBOARD_SESSION_HEADER)) ?? getSessionUser(cookieHeader),
    getDashboardSummary(cookieHeader),
  ]);

  if (!currentUser || !summary) {
    return null;
  }

  const siteBrand = resolveBrand();
  const completedRate = progressValue(summary.completed_count, summary.bookings_count);
  const pendingRate = progressValue(summary.pending_count, summary.bookings_count);

  const stats = [
    {
      label: "إجمالي الحجوزات",
      value: numberValue(summary.bookings_count),
      hint: `${numberValue(summary.completed_count)} مكتملة`,
      icon: ListChecks,
      tone: "bg-[#FF385C]/10 text-[#FF385C]",
    },
    {
      label: "الحجوزات المعلقة",
      value: numberValue(summary.pending_count),
      hint: `${pendingRate}% من الإجمالي`,
      icon: Clock3,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "العناصر المفضلة",
      value: numberValue(summary.wishlist_count),
      hint: "اهتمامات العملاء",
      icon: Heart,
      tone: "bg-rose-50 text-rose-600",
    },
    {
      label: "القيمة الإجمالية",
      value: formatMoney(summary.gross_total, summary.currency),
      hint: "من بيانات النظام",
      icon: Wallet,
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];

  const quickActions = [
    { href: "/dashboard/profile", label: "تحديث الملف الشخصي", description: "بيانات الحساب والأمان", icon: UserCircle2 },
    { href: "/dashboard/bookings", label: "متابعة الحجوزات", description: "تأكيد، إلغاء، ومراجعة", icon: CalendarCheck2 },
    { href: "/dashboard/services/homes/new", label: "إضافة وحدة جديدة", description: "شاليه، فيلا، أو إقامة", icon: Plus },
    { href: "/dashboard/services/homes/last-minute", label: "عروض آخر لحظة", description: "تسويق سريع للعروض", icon: TicketPercent },
    { href: "/dashboard/system/payments", label: "لوحة الدفع", description: "بوابات ومعاملات مالية", icon: CreditCard },
    { href: "/dashboard/system/messages", label: "رسائل الإشعارات", description: "قوالب وتنبيهات العملاء", icon: MessageSquareMore },
  ];

  const managementCards = [
    {
      href: "/dashboard/services/homes",
      title: "الشاليهات والفلل",
      description: "إدارة الوحدات، الأسعار، الصور، الخصومات، وحالة النشر في الواجهة.",
      icon: MapPinned,
      metric: "الوحدات",
    },
    {
      href: "/dashboard/services/homes/amenities",
      title: "وسائل الراحة",
      description: "تنظيم وسائل الراحة التي تظهر داخل كروت وتفاصيل الإعلانات.",
      icon: Sparkles,
      metric: "تصنيفات",
    },
    {
      href: "/dashboard/system/coupons",
      title: "الكوبونات",
      description: "تجهيز كوبونات خصم قابلة للتتبع حسب الحالة والتاريخ.",
      icon: TicketPercent,
      metric: "تسويق",
    },
    {
      href: "/dashboard/system/settings",
      title: "إعدادات الواجهة",
      description: "تحكم في الهوية، اللوجو، التواصل، الفوتر، والتحليلات.",
      icon: Settings,
      metric: "النظام",
    },
  ];

  const checklist = [
    { label: "مراجعة الحجوزات المعلقة", value: summary.pending_count ? `${numberValue(summary.pending_count)} تحتاج متابعة` : "لا توجد حجوزات معلقة", done: summary.pending_count === 0 },
    { label: "تحديث بيانات الحساب", value: "تحقق من البريد والرقم والصورة", done: Boolean(currentUser.display_name) },
    { label: "مراجعة أدوات الدفع", value: "تأكد من بوابات الدفع النشطة", done: true },
    { label: "مراقبة أداء الواجهة", value: "راجع الإعدادات والروابط المهمة", done: true },
  ];

  return (
    <div dir="rtl" className="max-w-full space-y-6 overflow-hidden font-[Cairo]">
      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-[#1a1f36] text-white shadow-[0_28px_90px_-48px_rgba(15,23,42,0.8)]">
        <div className="relative p-5 sm:p-6 lg:p-8">
          <div className="absolute left-8 top-8 hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white/70 lg:block">
            لوحة {siteBrand.nameAr}
          </div>
          <div className="max-w-3xl overflow-hidden">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold">
              <Gauge className="size-4" />
              مركز تشغيل موحد
            </span>
            <h1 className="mt-5 break-words text-2xl font-bold leading-tight sm:text-4xl">أهلًا {currentUser.display_name}</h1>
            <p className="mt-4 max-w-2xl break-words text-sm leading-7 text-white/72 sm:leading-8">
              لوحة عمل حديثة تجمع الحجوزات، المدفوعات، المحتوى، التنبيهات، والإعدادات المهمة في مكان واحد لاتخاذ قرارات أسرع.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:mt-8">
            <HeroSignal icon={ShieldCheck} label="حالة النظام" value="مستقر" />
            <HeroSignal icon={TrendingUp} label="اكتمال الحجوزات" value={`${completedRate}%`} />
            <HeroSignal icon={Bell} label="التنبيهات الحرجة" value={summary.pending_count ? `${numberValue(summary.pending_count)}` : "0"} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} role={summary.role} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
        <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle title="مركز الإجراءات السريعة" subtitle="أكثر المهام استخدامًا من داخل لوحة التحكم." />
            <Link href="/dashboard/bookings" className="inline-flex items-center gap-2 rounded-xl bg-[#1a1f36] px-4 py-3 text-sm font-bold text-white">
              فتح الحجوزات
              <ChevronLeft className="size-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((item) => (
              <ActionCard key={item.href} {...item} />
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <SectionTitle title="مؤشر إنجاز اليوم" subtitle="مهام تشغيلية تساعدك تبدأ يومك بوضوح." />
          <div className="mt-6 space-y-3">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <span className={`mt-0.5 grid size-7 place-items-center rounded-full ${item.done ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {item.done ? <CheckCircle2 className="size-4" /> : <Clock3 className="size-4" />}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-950">{item.label}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <SectionTitle title="حالة الحجوزات" subtitle="نظرة سريعة على حجم العمل الحالي." />
          <div className="mt-6 space-y-5">
            <ProgressRow label="مكتملة" value={summary.completed_count} total={summary.bookings_count} color="bg-emerald-500" />
            <ProgressRow label="معلقة" value={summary.pending_count} total={summary.bookings_count} color="bg-[#FF385C]" />
            <ProgressRow label="إجمالي" value={summary.bookings_count} total={summary.bookings_count || 1} color="bg-[#1a1f36]" />
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">القيمة الحالية</span>
              <b className="text-slate-950">{formatMoney(summary.gross_total, summary.currency)}</b>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <SectionTitle title="إدارة ما يظهر في الواجهة" subtitle="أدوات المحتوى والتسويق التي تؤثر مباشرة في الموقع العام." />
            <PanelTop className="size-6 text-[#FF385C]" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {managementCards.map((item) => (
              <ManagementCard key={item.href} {...item} />
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <SmartPanel
          icon={Search}
          title="بحث إداري سريع"
          description="اختصر الوصول للصفحات المهمة."
          actions={[
            { href: "/dashboard/bookings", label: "بحث الحجوزات" },
            { href: "/dashboard/services/homes", label: "بحث الإعلانات" },
          ]}
        />
        <SmartPanel
          icon={Wrench}
          title="أدوات النظام"
          description="الصيانة، SEO، API، وإعدادات الواجهة."
          actions={[
            { href: "/dashboard/system/tools", label: "الأدوات المتقدمة" },
            { href: "/dashboard/system/seo", label: "أدوات SEO" },
          ]}
        />
        <SmartPanel
          icon={ClipboardList}
          title="تقارير ومراجعة"
          description="تابع المدفوعات، الشركاء، والمستخدمين من مكان واحد."
          actions={[
            { href: "/dashboard/system/payments", label: "لوحة الدفع" },
            { href: "/dashboard/system/users", label: "المستخدمين" },
          ]}
        />
      </section>
    </div>
  );
}

function HeroSignal({ icon: Icon, label, value }: { icon: IconType; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-xs text-white/55">{label}</p>
          <p className="mt-2 break-words text-lg font-bold text-white">{value}</p>
        </div>
        <Icon className="size-5 shrink-0 text-[#FF385C]" />
      </div>
    </div>
  );
}

function StatCard({ label, value, hint, icon: Icon, tone, role }: { label: string; value: string; hint: string; icon: IconType; tone: string; role: string }) {
  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <span className={`grid size-12 place-items-center rounded-2xl ${tone}`}>
          <Icon className="size-5" />
        </span>
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-400">{role}</span>
      </div>
      <p className="mt-6 text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-2 text-xs font-bold text-emerald-600">{hint}</p>
    </article>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
    </div>
  );
}

function ActionCard({ href, label, description, icon: Icon }: { href: string; label: string; description: string; icon: IconType }) {
  return (
    <Link href={href} className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-[#FF385C]/30 hover:bg-white hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-white text-[#FF385C] shadow-sm">
          <Icon className="size-5" />
        </span>
        <ArrowUpRight className="size-4 text-slate-300 transition group-hover:text-[#FF385C]" />
      </div>
      <h3 className="mt-4 font-bold text-slate-950">{label}</h3>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    </Link>
  );
}

function ProgressRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = progressValue(value, total);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-bold text-slate-700">{label}</span>
        <span className="text-slate-500">{numberValue(value)} / {numberValue(total)}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ManagementCard({ href, title, description, icon: Icon, metric }: { href: string; title: string; description: string; icon: IconType; metric: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white hover:shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-[#FF385C] shadow-sm">
            <Icon className="size-5" />
          </span>
          <h3 className="font-bold text-slate-950">{title}</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-400">{metric}</span>
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-500">{description}</p>
    </Link>
  );
}

function SmartPanel({ icon: Icon, title, description, actions }: { icon: IconType; title: string; description: string; actions: Array<{ href: string; label: string }> }) {
  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-[#1a1f36] text-white">
          <Icon className="size-5" />
        </span>
        <div>
          <h2 className="font-bold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <div className="mt-5 grid gap-2">
        {actions.map((action) => (
          <Link key={action.href} href={action.href} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-[#1a1f36]">
            {action.label}
            <ChevronLeft className="size-4" />
          </Link>
        ))}
      </div>
    </article>
  );
}
