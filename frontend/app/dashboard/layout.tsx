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
      ? "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
      : "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950";

  return (
    <Link href={href} prefetch className={className}>
      <Icon className="size-4" />
      {children}
    </Link>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
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
    <main className="min-h-screen bg-[#f8f8f6] text-slate-950">
      <Navbar currentUser={currentUser} />
      <section className="overflow-x-auto px-6 pb-16 pt-36 lg:px-10">
        <div className="mx-auto grid min-w-[1180px] max-w-[1440px] grid-cols-[300px_minmax(0,1fr)] gap-8">
          <aside className="sticky top-28 h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-[0_20px_70px_-48px_rgba(15,23,42,0.6)]">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
              <div className="flex size-12 items-center justify-center rounded-lg bg-slate-950 text-white">
                <UserCircle2 className="size-6" />
              </div>
              <div className="min-w-0">
                <div className="text-sm text-slate-500">الحساب الحالي</div>
                <div className="truncate text-lg font-semibold">{currentUser.display_name}</div>
              </div>
            </div>

            <nav className="mt-4 max-h-[calc(100vh-190px)] space-y-1 overflow-auto pr-1">
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

          <div className="min-w-0">{children}</div>
        </div>
      </section>
    </main>
  );
}
