import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Bell,
  BookText,
  Building2,
  Map,
  FileText,
  Heart,
  ImageIcon,
  Languages,
  LayoutDashboard,
  ListChecks,
  MapPinned,
  MessageSquareMore,
  PanelsTopLeft,
  Settings,
  ShieldUser,
  Sparkles,
  TicketPercent,
  UserCircle2,
  Users,
  Wallet,
} from "lucide-react";
import { Navbar } from "@/components/sections/navbar";
import { type BridgeSessionUser, getSessionUser } from "@/lib/api";
import { LogoutButton } from "@/components/auth/logout-button";
import { DASHBOARD_SESSION_HEADER, decodeSessionHeader } from "@/lib/session-header";

type NavLinkProps = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  tone?: "default" | "danger";
};

function NavLink({ href, icon: Icon, children, tone = "default" }: NavLinkProps) {
  const className =
    tone === "danger"
      ? "flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 lg:shrink"
      : "flex shrink-0 items-center gap-3 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 lg:shrink";

  return (
    <Link href={href} prefetch className={className}>
      <Icon className="size-4" />
      {children}
    </Link>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="hidden px-4 pt-5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400 lg:block">
      {children}
    </div>
  );
}

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";
  const currentUser =
    decodeSessionHeader<BridgeSessionUser>(headerStore.get(DASHBOARD_SESSION_HEADER)) ??
    await getSessionUser(cookieHeader);

  if (!currentUser) {
    redirect("/auth/login?return_url=/dashboard");
  }

  return (
    <main className="dashboard-shell min-h-screen bg-[#f8f8f6] text-slate-950">
      <Navbar currentUser={currentUser} />
      <section className="px-4 pb-16 pt-32 sm:px-6 lg:px-10 lg:pt-36">
        <div className="mx-auto grid max-w-[1440px] gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8">
          <aside className="h-fit overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-[0_20px_70px_-48px_rgba(15,23,42,0.6)] lg:sticky lg:top-28 lg:p-5">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className="flex size-12 items-center justify-center rounded-lg bg-slate-950 text-white">
                <UserCircle2 className="size-6" />
              </div>
              <div className="min-w-0">
                <div className="text-sm text-slate-500">الحساب الحالي</div>
                <div className="truncate text-lg font-semibold">{currentUser.display_name}</div>
              </div>
            </div>

            <nav className="mt-4 flex max-h-[96px] gap-1 overflow-x-auto overflow-y-hidden pb-1 pr-1 scrollbar-hide lg:block lg:max-h-[calc(100vh-190px)] lg:space-y-1 lg:overflow-auto lg:pb-0">
              <NavLink href="/dashboard" icon={LayoutDashboard}>الرئيسية</NavLink>
              <NavLink href="/dashboard/profile" icon={UserCircle2}>الملف الشخصي</NavLink>
              <NavLink href="/dashboard/alerts" icon={Bell}>إشعارات النظام</NavLink>

              <GroupLabel>نظرة عامة</GroupLabel>
              <NavLink href="/dashboard/bookings" icon={ListChecks}>الحجوزات</NavLink>
              <NavLink href="/dashboard/wishlist" icon={Heart}>المفضلة</NavLink>
              <NavLink href="/dashboard/notifications" icon={Bell}>التنبيهات</NavLink>

              <GroupLabel>الوحدات</GroupLabel>
              <NavLink href="/dashboard/services/homes" icon={MapPinned}>الشاليهات والفلل</NavLink>
              <NavLink href="/dashboard/services/homes/amenities" icon={Sparkles}>وسائل الراحة</NavLink>
              <NavLink href="/dashboard/services/homes/types" icon={PanelsTopLeft}>تصنيفات الوحدات</NavLink>

              <GroupLabel>التجارب والفعاليات</GroupLabel>
              <NavLink href="/dashboard/services/experiences" icon={Sparkles}>التجارب</NavLink>
              <NavLink href="/dashboard/services/experiences?category=events" icon={Building2}>الفعاليات</NavLink>
              <NavLink href="/dashboard/services/experiences?category=conferences" icon={Building2}>المؤتمرات</NavLink>
              <NavLink href="/dashboard/services/experiences/types" icon={PanelsTopLeft}>تصنيفات التجارب</NavLink>

              <GroupLabel>العروض والتسويق</GroupLabel>
              <NavLink href="/dashboard/services/homes/last-minute" icon={TicketPercent}>عروض آخر لحظة</NavLink>
              <NavLink href="/dashboard/system/coupons" icon={TicketPercent}>الكوبونات</NavLink>

              <GroupLabel>المحتوى</GroupLabel>
              <NavLink href="/dashboard/posts" icon={BookText}>المنشورات</NavLink>
              <NavLink href="/dashboard/pages" icon={FileText}>الصفحات</NavLink>
              <NavLink href="/dashboard/posts/categories" icon={PanelsTopLeft}>تصنيفات المقالات</NavLink>
              <NavLink href="/dashboard/posts/tags" icon={PanelsTopLeft}>وسوم المقالات</NavLink>

              <GroupLabel>إعدادات النظام</GroupLabel>
              <NavLink href="/dashboard/system/settings" icon={Settings}>الإعدادات</NavLink>
              <NavLink href="/dashboard/system/users" icon={Users}>المستخدمين</NavLink>
              <NavLink href="/dashboard/system/partner-requests" icon={ShieldUser}>طلبات الشركاء</NavLink>
              <NavLink href="/dashboard/system/languages" icon={Languages}>اللغات</NavLink>
              <NavLink href="/dashboard/system/translation" icon={Languages}>الترجمة</NavLink>
              <NavLink href="/dashboard/system/menus" icon={PanelsTopLeft}>القوائم</NavLink>
              <NavLink href="/dashboard/system/media" icon={ImageIcon}>مكتبة الوسائط</NavLink>
              <NavLink href="/dashboard/system/seo" icon={Settings}>SEO</NavLink>
              <NavLink href="/dashboard/system/api" icon={Settings}>إعدادات API</NavLink>
              <NavLink href="/dashboard/system/tools" icon={Settings}>أدوات متقدمة</NavLink>
              <NavLink href="/dashboard/system/settings#cities" icon={Map}>المدن والوجهات</NavLink>

              <GroupLabel>المالية</GroupLabel>
              <NavLink href="/dashboard/system/payments" icon={Wallet}>لوحة الدفع</NavLink>
              <NavLink href="/dashboard/system/payouts" icon={Wallet}>المدفوعات</NavLink>
              <NavLink href="/dashboard/system/messages" icon={MessageSquareMore}>رسائل الإشعارات</NavLink>

              <LogoutButton />
            </nav>
          </aside>

          <div className="dashboard-content min-w-0">{children}</div>
        </div>
      </section>
    </main>
  );
}
