"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Handshake,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserPlus,
  Zap,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useMemo, useState, useTransition } from "react";
import { secureFetch } from "@/lib/client-security";

type ActiveMode = "login" | "register" | "partner";
type FieldErrors = Record<string, string>;

type AuthAccessPanelProps = {
  returnUrl?: string;
  initialMode?: ActiveMode;
  brandName?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const countries = ["السعودية", "الإمارات", "الكويت", "البحرين", "قطر", "عمان", "مصر", "الأردن", "المغرب"];
const cities = ["الرياض", "جدة", "مكة", "المدينة", "الدمام"];
const partnerTypes = [
  { value: "individual_host", title: "مضيف فردي", body: "تملك عقارات للإيجار", icon: Building2 },
  { value: "company", title: "شركة / مؤسسة", body: "كيان تجاري مسجل", icon: Building2 },
  { value: "travel_agency", title: "وكالة سياحية", body: "ترتيب رحلات وإقامات", icon: Handshake },
  { value: "experience_operator", title: "مشغل تجارب", body: "فعاليات وأنشطة", icon: Sparkles },
];

function normalizePhone(value: string) {
  return value.replace(/[^\d]/g, "").slice(0, 12);
}

function passwordStrength(password: string) {
  const hasLetters = /[A-Za-z\u0600-\u06FF]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9\u0600-\u06FF]/.test(password);
  if (password.length >= 8 && hasLetters && hasNumbers && hasSpecial) return { level: 3, label: "قوية", color: "bg-emerald-500" };
  if (password.length >= 8 && hasLetters && hasNumbers) return { level: 2, label: "متوسطة", color: "bg-amber-400" };
  return { level: password ? 1 : 0, label: "ضعيفة", color: "bg-red-500" };
}

function Spinner() {
  return <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
}

function StrengthMeter({ value }: { value: string }) {
  const strength = passwordStrength(value);
  return (
    <div className="mt-2">
      <div className="grid grid-cols-3 gap-1">
        {[1, 2, 3].map((item) => (
          <span key={item} className={`h-1.5 rounded-full ${strength.level >= item ? strength.color : "bg-gray-200"}`} />
        ))}
      </div>
      {value ? <p className="mt-1 text-xs text-gray-500">قوة كلمة المرور: {strength.label}</p> : null}
    </div>
  );
}

function ErrorText({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null;
}

function FieldIcon({ children }: { children: ReactNode }) {
  return <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">{children}</span>;
}

export function AuthAccessPanel({ returnUrl = "/", initialMode = "login", brandName = "لبية" }: AuthAccessPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<ActiveMode>(initialMode);
  const [isPending, startTransition] = useTransition();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showPartnerPassword, setShowPartnerPassword] = useState(false);
  const [partnerStep, setPartnerStep] = useState(1);
  const [successApplication, setSuccessApplication] = useState<{ email: string; phone: string } | null>(null);
  const [globalMessage, setGlobalMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [emailStatus, setEmailStatus] = useState<Record<string, "idle" | "checking" | "available" | "taken">>({});

  const [login, setLogin] = useState({ email: "", password: "", rememberMe: true });
  const [register, setRegister] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+966",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "undisclosed",
    birthDate: "",
    terms: false,
  });
  const [partner, setPartner] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+966",
    phone: "",
    password: "",
    confirmPassword: "",
    nationality: "السعودية",
    idNumber: "",
    partnerType: "",
    companyName: "",
    commercialReg: "",
    primaryCity: "",
    cities: [] as string[],
    expectedListings: "",
    yearsExperience: "",
    description: "",
    agreed: false,
    idDocument: null as File | null,
    commercialDoc: null as File | null,
    propertyPhotos: [] as File[],
  });

  const marketing = useMemo(() => {
    if (mode === "register") {
      return {
        badge: "حساب جديد",
        title: `انضم لآلاف المستخدمين على منصة ${brandName}`,
        description: "ابدأ حسابك خلال دقائق واحفظ تفضيلاتك وحجوزاتك في تجربة واحدة مرتبطة بالنظام الحالي.",
        cards: [
          { title: "حساب آمن", body: "بياناتك محمية بتشفير كامل", icon: ShieldCheck },
          { title: "حجز سريع", body: "احجز في ثوان معدودة", icon: Zap },
          { title: "تجربة مخصصة", body: "توصيات بناء على اهتماماتك", icon: Sparkles },
        ],
        stats: [] as string[],
      };
    }
    if (mode === "partner") {
      return {
        badge: "شراكة",
        title: `حول عقاراتك إلى دخل ثابت مع ${brandName}`,
        description: "أرسل طلبك كشريك، وسيظهر مباشرة في لوحة إدارة طلبات الشركاء للمراجعة والمتابعة.",
        cards: [
          { title: "دخل إضافي", body: "ابدأ بتحقيق الدخل من عقاراتك", icon: Sparkles },
          { title: "لوحة تحكم", body: "إدارة كاملة لحجوزاتك وإيراداتك", icon: Building2 },
          { title: "دعم كامل", body: "فريق متخصص لمساعدتك في كل خطوة", icon: Handshake },
        ],
        stats: ["+5,000 شريك نشط", "98% معدل الرضا", "+50,000 حجز شهريا"],
      };
    }
    return {
      badge: "تسجيل دخول موحد",
      title: "ادخل إلى حسابك بدون فقدان جلسة النظام الحالية",
      description: "صفحة الدخول تستخدم نفس جلسة Sentinel الموجودة في المنصة الحالية، لذلك ينتقل المستخدم للواجهة الحديثة بنفس الحساب.",
      cards: [
        { title: "جلسة موحدة", body: "جلسة واحدة للواجهة ولوحة التحكم", icon: ShieldCheck },
        { title: "دخول سريع", body: "تحقق واضح وحفظ آمن للجلسة", icon: CheckCircle2 },
        { title: "واجهة أحدث", body: "تجربة أنظف مع نفس البيانات", icon: Sparkles },
      ],
      stats: ["1. أدخل بيانات حسابك", "2. يتم حفظ الجلسة بأمان", "3. تنتقل تلقائيا للوجهة المطلوبة"],
    };
  }, [brandName, mode]);

  async function checkEmail(email: string, key: string) {
    if (!emailPattern.test(email)) return;
    setEmailStatus((current) => ({ ...current, [key]: "checking" }));
    const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`).catch(() => null);
    const payload = response ? ((await response.json().catch(() => null)) as { available?: boolean } | null) : null;
    setEmailStatus((current) => ({ ...current, [key]: payload?.available ? "available" : "taken" }));
  }

  function validateLogin() {
    const next: FieldErrors = {};
    if (!emailPattern.test(login.email)) next.loginEmail = "أدخل بريد إلكتروني صحيح.";
    if (login.password.length < 8) next.loginPassword = "كلمة المرور يجب ألا تقل عن 8 أحرف.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateRegister() {
    const next: FieldErrors = {};
    if (!register.firstName.trim()) next.registerFirstName = "الاسم الأول مطلوب.";
    if (!register.lastName.trim()) next.registerLastName = "اسم العائلة مطلوب.";
    if (!emailPattern.test(register.email)) next.registerEmail = "أدخل بريد إلكتروني صحيح.";
    if (!register.phone.trim()) next.registerPhone = "رقم الجوال مطلوب.";
    if (register.password.length < 8) next.registerPassword = "كلمة المرور يجب ألا تقل عن 8 أحرف.";
    if (register.confirmPassword !== register.password) next.registerConfirmPassword = "تأكيد كلمة المرور غير مطابق.";
    if (!register.terms) next.registerTerms = "يجب الموافقة على الشروط.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validatePartnerStep(step = partnerStep) {
    const next: FieldErrors = {};
    if (step === 1) {
      if (!partner.firstName.trim()) next.partnerFirstName = "الاسم الأول مطلوب.";
      if (!partner.lastName.trim()) next.partnerLastName = "اسم العائلة مطلوب.";
      if (!emailPattern.test(partner.email)) next.partnerEmail = "أدخل بريد إلكتروني صحيح.";
      if (!partner.phone.trim()) next.partnerPhone = "رقم الجوال مطلوب.";
      if (partner.password.length < 8) next.partnerPassword = "كلمة المرور يجب ألا تقل عن 8 أحرف.";
      if (partner.confirmPassword !== partner.password) next.partnerConfirmPassword = "تأكيد كلمة المرور غير مطابق.";
      if (!partner.nationality) next.partnerNationality = "الجنسية مطلوبة.";
      if (!partner.idNumber.trim()) next.partnerIdNumber = "رقم الهوية / الإقامة مطلوب.";
    }
    if (step === 2) {
      if (!partner.partnerType) next.partnerType = "اختر نوع الشراكة.";
      if (["company", "travel_agency"].includes(partner.partnerType)) {
        if (!partner.companyName.trim()) next.companyName = "اسم الشركة مطلوب.";
        if (!partner.commercialReg.trim()) next.commercialReg = "رقم السجل التجاري مطلوب.";
      }
      if (partner.cities.length === 0) next.partnerCities = "اختر مدينة واحدة على الأقل.";
      if (!partner.expectedListings) next.expectedListings = "أدخل العدد المتوقع.";
      if (!partner.yearsExperience) next.yearsExperience = "اختر سنوات الخبرة.";
    }
    if (step === 3) {
      if (!partner.idDocument) next.idDocument = "صورة الهوية مطلوبة.";
      if (["company", "travel_agency"].includes(partner.partnerType) && !partner.commercialDoc) next.commercialDoc = "السجل التجاري مطلوب.";
      if (!partner.agreed) next.partnerAgreed = "يجب الموافقة على شروط الشراكة.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submitLogin(event: FormEvent) {
    event.preventDefault();
    setGlobalMessage(null);
    if (!validateLogin()) return;
    startTransition(async () => {
      const response = await secureFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...login, return_url: returnUrl }),
      });
      const payload = (await response.json().catch(() => null)) as { status?: number; message?: string; redirect?: string } | null;
      if (!response.ok || payload?.status !== 1) {
        setGlobalMessage({ ok: false, text: payload?.message || "تعذر تسجيل الدخول." });
        return;
      }
      router.push(payload.redirect || returnUrl);
      router.refresh();
    });
  }

  function submitRegister(event: FormEvent) {
    event.preventDefault();
    setGlobalMessage(null);
    if (!validateRegister()) return;
    startTransition(async () => {
      const response = await secureFetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: register.firstName,
          last_name: register.lastName,
          email: register.email,
          mobile: `${register.countryCode}${register.phone}`,
          password: register.password,
          gender: register.gender,
          birth_date: register.birthDate,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { status?: number; message?: string | Record<string, string[]>; redirect?: string } | null;
      if (!response.ok || payload?.status !== 1) {
        const text = typeof payload?.message === "string" ? payload.message : payload?.message ? Object.values(payload.message).flat().join(" ") : "تعذر إنشاء الحساب.";
        setGlobalMessage({ ok: false, text });
        return;
      }
      router.push(payload.redirect || "/");
      router.refresh();
    });
  }

  function submitPartner(event: FormEvent) {
    event.preventDefault();
    setGlobalMessage(null);
    if (!validatePartnerStep(3)) return;
    startTransition(async () => {
      const formData = new FormData();
      Object.entries({
        firstName: partner.firstName,
        lastName: partner.lastName,
        email: partner.email,
        phone: `${partner.countryCode}${partner.phone}`,
        password: partner.password,
        nationality: partner.nationality,
        idNumber: partner.idNumber,
        partnerType: partner.partnerType,
        companyName: partner.companyName,
        commercialReg: partner.commercialReg,
        primaryCity: partner.primaryCity,
        cities: partner.cities.join(", "),
        expectedListings: partner.expectedListings,
        yearsExperience: partner.yearsExperience,
        description: partner.description,
      }).forEach(([key, value]) => formData.set(key, value));
      if (partner.idDocument) formData.set("idDocument", partner.idDocument);
      if (partner.commercialDoc) formData.set("commercialDoc", partner.commercialDoc);
      partner.propertyPhotos.forEach((file) => formData.append("propertyPhotos[]", file));

      const response = await secureFetch("/api/partners/apply", { method: "POST", body: formData });
      const payload = (await response.json().catch(() => null)) as { status?: number; message?: string } | null;
      if (!response.ok || payload?.status !== 1) {
        setGlobalMessage({ ok: false, text: payload?.message || "تعذر إرسال طلب الشراكة." });
        return;
      }
      setSuccessApplication({ email: partner.email, phone: `${partner.countryCode}${partner.phone}` });
    });
  }

  const inputBase = "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1a1f36]";
  const invalid = "border-red-300";
  const valid = "border-green-400";
  const neutral = "border-gray-200";

  return (
    <section dir="rtl" className="relative px-4 pb-16 pt-28 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-[1240px] items-stretch gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl bg-white p-5 shadow-lg shadow-slate-950/10 sm:p-7">
          <div className="mb-7 flex rounded-2xl bg-gray-100 p-1">
            {[
              { key: "login" as const, label: "تسجيل دخول", icon: LogIn },
              { key: "register" as const, label: "إنشاء حساب", icon: UserPlus },
              { key: "partner" as const, label: "انضم كشريك", icon: Handshake },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = mode === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setMode(tab.key);
                    setGlobalMessage(null);
                    setErrors({});
                  }}
                  className={`flex min-w-fit flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm transition ${active ? "bg-white font-semibold text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {globalMessage ? (
            <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${globalMessage.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-600"}`}>
              {globalMessage.text}
            </div>
          ) : null}

          {mode === "login" ? (
            <form onSubmit={submitLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">البريد الإلكتروني</label>
                <div className="relative">
                  <FieldIcon><Mail className="size-4" /></FieldIcon>
                  <input dir="ltr" type="email" value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} placeholder="admin@labayh.local" className={`${inputBase} pl-10 ${errors.loginEmail ? invalid : login.email ? valid : neutral}`} />
                </div>
                <ErrorText message={errors.loginEmail} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-800">كلمة المرور</label>
                <div className="relative">
                  <FieldIcon><Lock className="size-4" /></FieldIcon>
                  <input dir="ltr" type={showLoginPassword ? "text" : "password"} value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} placeholder="••••••••" className={`${inputBase} px-10 ${errors.loginPassword ? invalid : login.password ? valid : neutral}`} />
                  <button type="button" onClick={() => setShowLoginPassword((value) => !value)} className="absolute inset-y-0 right-3 text-gray-400">
                    {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <ErrorText message={errors.loginPassword} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <a href="#" className="font-semibold text-[#FF385C]">نسيت كلمة المرور؟</a>
                <label className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" checked={login.rememberMe} onChange={(event) => setLogin({ ...login, rememberMe: event.target.checked })} className="size-4 rounded border-gray-300" />
                  تذكرني على هذا الجهاز
                </label>
              </div>
              <button disabled={isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF385C] py-3 text-base font-bold text-white transition hover:bg-[#E31C5F] disabled:opacity-60">
                {isPending ? <><Spinner /> جار تسجيل الدخول...</> : "تسجيل الدخول"}
              </button>
              {process.env.NODE_ENV !== "production" ? (
                <p className="text-center text-xs font-bold text-gray-500">بيانات الأدمن المحلي: admin@labayh.local / password</p>
              ) : null}
              <div className="flex items-center gap-3"><div className="flex-1 border-t border-gray-200" /><span className="text-xs text-gray-400">أو</span><div className="flex-1 border-t border-gray-200" /></div>
              {/* TODO: Enable Google and Apple buttons when OAuth provider keys are configured. */}
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" disabled className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-400">Google</button>
                <button type="button" disabled className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-400">Apple</button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-500">
                <button type="button" onClick={() => setMode("register")} className="font-bold text-[#FF385C]">ليس لديك حساب؟ إنشاء حساب جديد</button>
                <Link href="/" className="inline-flex items-center gap-2 font-bold text-gray-900">العودة للرئيسية <ArrowLeft className="size-4" /></Link>
              </div>
            </form>
          ) : null}

          {mode === "register" ? (
            <form onSubmit={submitRegister} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><input value={register.firstName} onChange={(e) => setRegister({ ...register, firstName: e.target.value })} placeholder="الاسم الأول" className={`${inputBase} ${errors.registerFirstName ? invalid : register.firstName ? valid : neutral}`} /><ErrorText message={errors.registerFirstName} /></div>
                <div><input value={register.lastName} onChange={(e) => setRegister({ ...register, lastName: e.target.value })} placeholder="اسم العائلة" className={`${inputBase} ${errors.registerLastName ? invalid : register.lastName ? valid : neutral}`} /><ErrorText message={errors.registerLastName} /></div>
              </div>
              <div>
                <input dir="ltr" type="email" value={register.email} onBlur={() => checkEmail(register.email, "register")} onChange={(e) => setRegister({ ...register, email: e.target.value })} placeholder="البريد الإلكتروني" className={`${inputBase} ${errors.registerEmail ? invalid : register.email ? valid : neutral}`} />
                <ErrorText message={errors.registerEmail} />
                {emailStatus.register === "available" ? <p className="mt-1 text-xs text-emerald-600">البريد متاح.</p> : null}
                {emailStatus.register === "taken" ? <p className="mt-1 text-xs text-red-500">هذا البريد مستخدم بالفعل.</p> : null}
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-3">
                <select value={register.countryCode} onChange={(e) => setRegister({ ...register, countryCode: e.target.value })} className={`${inputBase} ${neutral}`}><option>+966</option><option>+971</option><option>+965</option><option>+20</option></select>
                <input dir="ltr" value={register.phone} onChange={(e) => setRegister({ ...register, phone: normalizePhone(e.target.value) })} placeholder="5xxxxxxxx" className={`${inputBase} ${errors.registerPhone ? invalid : register.phone ? valid : neutral}`} />
              </div>
              <ErrorText message={errors.registerPhone} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <input dir="ltr" type={showRegisterPassword ? "text" : "password"} value={register.password} onChange={(e) => setRegister({ ...register, password: e.target.value })} placeholder="كلمة المرور" className={`${inputBase} ${errors.registerPassword ? invalid : register.password ? valid : neutral}`} />
                  <StrengthMeter value={register.password} /><ErrorText message={errors.registerPassword} />
                </div>
                <div>
                  <input dir="ltr" type={showRegisterPassword ? "text" : "password"} value={register.confirmPassword} onChange={(e) => setRegister({ ...register, confirmPassword: e.target.value })} placeholder="تأكيد كلمة المرور" className={`${inputBase} ${errors.registerConfirmPassword ? invalid : register.confirmPassword ? valid : neutral}`} />
                  <button type="button" onClick={() => setShowRegisterPassword((value) => !value)} className="mt-2 text-xs font-bold text-gray-500">{showRegisterPassword ? "إخفاء" : "إظهار"} كلمة المرور</button>
                  <ErrorText message={errors.registerConfirmPassword} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[["male", "ذكر"], ["female", "أنثى"], ["undisclosed", "أفضل عدم الإفصاح"]].map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setRegister({ ...register, gender: value })} className={`rounded-xl border px-4 py-2 text-sm transition ${register.gender === value ? "border-[#1a1f36] bg-[#1a1f36] text-white" : "border-gray-200 text-gray-600"}`}>{label}</button>
                ))}
              </div>
              <input type="date" value={register.birthDate} onChange={(e) => setRegister({ ...register, birthDate: e.target.value })} className={`${inputBase} ${neutral}`} />
              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={register.terms} onChange={(e) => setRegister({ ...register, terms: e.target.checked })} className="mt-1 size-4 rounded border-gray-300" />
                <span>أوافق على <Link href="/terms" className="text-[#FF385C]">الشروط والأحكام</Link> و <Link href="/privacy" className="text-[#FF385C]">سياسة الخصوصية</Link></span>
              </label>
              <ErrorText message={errors.registerTerms} />
              <button disabled={isPending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF385C] py-3 text-base font-bold text-white transition hover:bg-[#E31C5F] disabled:opacity-60">{isPending ? <><Spinner /> جار إنشاء الحساب...</> : "إنشاء الحساب"}</button>
              <button type="button" onClick={() => setMode("login")} className="text-sm font-bold text-[#FF385C]">لديك حساب بالفعل؟ تسجيل الدخول</button>
            </form>
          ) : null}

          {mode === "partner" ? (
            successApplication ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-7 text-center">
                <CheckCircle2 className="mx-auto size-16 text-emerald-600" />
                <h3 className="mt-4 text-2xl font-black text-gray-900">تم إرسال طلبك بنجاح!</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">سيتم مراجعة طلبك خلال 2-3 أيام عمل وسنتواصل معك على:</p>
                <div className="mt-4 space-y-1 text-sm font-bold text-gray-800"><p>{successApplication.email}</p><p>{successApplication.phone}</p></div>
                <Link href="/" className="mt-6 inline-flex rounded-xl bg-[#FF385C] px-5 py-3 text-sm font-bold text-white">العودة للرئيسية</Link>
              </div>
            ) : (
              <form onSubmit={submitPartner} className="space-y-5">
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-gray-500">
                  {["المعلومات الشخصية", "معلومات الشراكة", "المستندات"].map((label, index) => (
                    <div key={label} className={partnerStep >= index + 1 ? "text-[#FF385C]" : ""}>
                      <span className={`mx-auto mb-2 block size-3 rounded-full ${partnerStep >= index + 1 ? "bg-[#FF385C]" : "bg-gray-200"}`} />
                      {label}
                    </div>
                  ))}
                </div>

                {partnerStep === 1 ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><input value={partner.firstName} onChange={(e) => setPartner({ ...partner, firstName: e.target.value })} placeholder="الاسم الأول" className={`${inputBase} ${errors.partnerFirstName ? invalid : partner.firstName ? valid : neutral}`} /><ErrorText message={errors.partnerFirstName} /></div>
                      <div><input value={partner.lastName} onChange={(e) => setPartner({ ...partner, lastName: e.target.value })} placeholder="اسم العائلة" className={`${inputBase} ${errors.partnerLastName ? invalid : partner.lastName ? valid : neutral}`} /><ErrorText message={errors.partnerLastName} /></div>
                    </div>
                    <input dir="ltr" type="email" onBlur={() => checkEmail(partner.email, "partner")} value={partner.email} onChange={(e) => setPartner({ ...partner, email: e.target.value })} placeholder="البريد الإلكتروني" className={`${inputBase} ${errors.partnerEmail ? invalid : partner.email ? valid : neutral}`} />
                    <ErrorText message={errors.partnerEmail} />
                    <div className="grid grid-cols-[110px_1fr] gap-3">
                      <select value={partner.countryCode} onChange={(e) => setPartner({ ...partner, countryCode: e.target.value })} className={`${inputBase} ${neutral}`}><option>+966</option><option>+971</option><option>+965</option><option>+20</option></select>
                      <input dir="ltr" value={partner.phone} onChange={(e) => setPartner({ ...partner, phone: normalizePhone(e.target.value) })} placeholder="5xxxxxxxx" className={`${inputBase} ${errors.partnerPhone ? invalid : partner.phone ? valid : neutral}`} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div><input dir="ltr" type={showPartnerPassword ? "text" : "password"} value={partner.password} onChange={(e) => setPartner({ ...partner, password: e.target.value })} placeholder="كلمة المرور" className={`${inputBase} ${errors.partnerPassword ? invalid : partner.password ? valid : neutral}`} /><StrengthMeter value={partner.password} /><ErrorText message={errors.partnerPassword} /></div>
                      <div><input dir="ltr" type={showPartnerPassword ? "text" : "password"} value={partner.confirmPassword} onChange={(e) => setPartner({ ...partner, confirmPassword: e.target.value })} placeholder="تأكيد كلمة المرور" className={`${inputBase} ${errors.partnerConfirmPassword ? invalid : partner.confirmPassword ? valid : neutral}`} /><button type="button" onClick={() => setShowPartnerPassword((value) => !value)} className="mt-2 text-xs font-bold text-gray-500">{showPartnerPassword ? "إخفاء" : "إظهار"} كلمة المرور</button><ErrorText message={errors.partnerConfirmPassword} /></div>
                    </div>
                    <select value={partner.nationality} onChange={(e) => setPartner({ ...partner, nationality: e.target.value })} className={`${inputBase} ${neutral}`}>{countries.map((item) => <option key={item}>{item}</option>)}</select>
                    <input value={partner.idNumber} onChange={(e) => setPartner({ ...partner, idNumber: e.target.value })} placeholder="رقم الهوية / الإقامة" className={`${inputBase} ${errors.partnerIdNumber ? invalid : partner.idNumber ? valid : neutral}`} />
                    <ErrorText message={errors.partnerIdNumber} />
                    <button type="button" onClick={() => validatePartnerStep(1) && setPartnerStep(2)} className="w-full rounded-xl bg-[#FF385C] py-3 font-bold text-white">التالي</button>
                  </div>
                ) : null}

                {partnerStep === 2 ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {partnerTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button key={type.value} type="button" onClick={() => setPartner({ ...partner, partnerType: type.value })} className={`rounded-xl border p-4 text-start transition ${partner.partnerType === type.value ? "border-2 border-[#1a1f36] bg-[#1a1f36]/5" : "border-gray-200"}`}>
                            <Icon className="mb-3 size-5 text-[#FF385C]" />
                            <div className="font-black text-gray-900">{type.title}</div>
                            <p className="mt-1 text-xs text-gray-500">{type.body}</p>
                          </button>
                        );
                      })}
                    </div>
                    <ErrorText message={errors.partnerType} />
                    {["company", "travel_agency"].includes(partner.partnerType) ? (
                      <div className="grid gap-3">
                        <input value={partner.companyName} onChange={(e) => setPartner({ ...partner, companyName: e.target.value })} placeholder="اسم الشركة / المؤسسة" className={`${inputBase} ${errors.companyName ? invalid : neutral}`} />
                        <input value={partner.commercialReg} onChange={(e) => setPartner({ ...partner, commercialReg: e.target.value })} placeholder="رقم السجل التجاري" className={`${inputBase} ${errors.commercialReg ? invalid : neutral}`} />
                        <input value={partner.primaryCity} onChange={(e) => setPartner({ ...partner, primaryCity: e.target.value })} placeholder="المدينة الرئيسية للنشاط" className={`${inputBase} ${neutral}`} />
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {cities.map((city) => {
                        const selected = partner.cities.includes(city);
                        return <button key={city} type="button" onClick={() => setPartner({ ...partner, cities: selected ? partner.cities.filter((item) => item !== city) : [...partner.cities, city] })} className={`rounded-xl border px-4 py-2 text-sm ${selected ? "border-[#1a1f36] bg-[#1a1f36] text-white" : "border-gray-200 text-gray-600"}`}>{city}</button>;
                      })}
                    </div>
                    <ErrorText message={errors.partnerCities} />
                    <input type="number" value={partner.expectedListings} onChange={(e) => setPartner({ ...partner, expectedListings: e.target.value })} placeholder="عدد العقارات / الأنشطة المتوقعة" className={`${inputBase} ${errors.expectedListings ? invalid : neutral}`} />
                    <select value={partner.yearsExperience} onChange={(e) => setPartner({ ...partner, yearsExperience: e.target.value })} className={`${inputBase} ${errors.yearsExperience ? invalid : neutral}`}><option value="">سنوات الخبرة</option><option>أقل من سنة</option><option>1-3</option><option>3-5</option><option>+5</option></select>
                    <textarea maxLength={200} value={partner.description} onChange={(e) => setPartner({ ...partner, description: e.target.value })} placeholder="وصف مختصر عن نشاطك" className={`${inputBase} min-h-24 resize-none ${neutral}`} />
                    <div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setPartnerStep(1)} className="rounded-xl border border-gray-200 py-3 font-bold">السابق</button><button type="button" onClick={() => validatePartnerStep(2) && setPartnerStep(3)} className="rounded-xl bg-[#FF385C] py-3 font-bold text-white">التالي</button></div>
                  </div>
                ) : null}

                {partnerStep === 3 ? (
                  <div className="space-y-4">
                    <UploadBox title="صورة الهوية الوطنية / الإقامة" file={partner.idDocument} error={errors.idDocument} onChange={(files) => setPartner({ ...partner, idDocument: files[0] ?? null })} />
                    {["company", "travel_agency"].includes(partner.partnerType) ? <UploadBox title="السجل التجاري" file={partner.commercialDoc} error={errors.commercialDoc} onChange={(files) => setPartner({ ...partner, commercialDoc: files[0] ?? null })} /> : null}
                    <UploadBox multiple title="صور العقارات / النشاط" files={partner.propertyPhotos} onChange={(files) => setPartner({ ...partner, propertyPhotos: files.slice(0, 5) })} />
                    <label className="flex items-start gap-2 text-sm text-gray-600"><input type="checkbox" checked={partner.agreed} onChange={(e) => setPartner({ ...partner, agreed: e.target.checked })} className="mt-1 size-4 rounded" />أوافق على شروط الشراكة وسياسة العمل مع لبية</label>
                    <ErrorText message={errors.partnerAgreed} />
                    <div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setPartnerStep(2)} className="rounded-xl border border-gray-200 py-3 font-bold">السابق</button><button disabled={isPending} className="flex items-center justify-center gap-2 rounded-xl bg-[#FF385C] py-3 font-bold text-white disabled:opacity-60">{isPending ? <><Spinner /> جار إرسال الطلب...</> : "إرسال طلب الانضمام"}</button></div>
                  </div>
                ) : null}
              </form>
            )
          ) : null}
        </div>

        <aside className="hidden rounded-2xl bg-[linear-gradient(145deg,#1a1f36_0%,#2d1b69_100%)] p-8 text-white shadow-lg shadow-slate-950/20 lg:block">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold">{marketing.badge}</span>
          <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight">{marketing.title}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-white/75">{marketing.description}</p>
          <div className="mt-10 grid gap-4 xl:grid-cols-3">
            {marketing.cards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-white/12"><Icon className="size-5" /></div>
                  <h2 className="mt-4 font-bold">{card.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/70">{card.body}</p>
                </article>
              );
            })}
          </div>
          {marketing.stats.length > 0 ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {marketing.stats.map((item) => <div key={item} className="rounded-xl border border-white/10 bg-black/10 px-4 py-4 text-center text-sm font-black">{item}</div>)}
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function UploadBox({
  title,
  file,
  files,
  error,
  multiple = false,
  onChange,
}: {
  title: string;
  file?: File | null;
  files?: File[];
  error?: string;
  multiple?: boolean;
  onChange: (files: File[]) => void;
}) {
  const selected = files && files.length > 0 ? `${files.length} ملفات` : file?.name;
  return (
    <div>
      <label className="block cursor-pointer rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center transition hover:border-[#FF385C] hover:bg-[#FF385C]/5">
        <UploadCloud className="mx-auto size-7 text-[#FF385C]" />
        <span className="mt-2 block text-sm font-bold text-gray-900">{title}</span>
        <span className="mt-1 block text-xs text-gray-500">{selected || "اسحب الملف هنا أو انقر للرفع"}</span>
        <span className="mt-1 block text-[11px] text-gray-400">JPG, PNG, PDF - Max 5MB</span>
        <input
          type="file"
          multiple={multiple}
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={(event) => onChange(Array.from(event.target.files ?? []))}
        />
      </label>
      <ErrorText message={error} />
    </div>
  );
}
