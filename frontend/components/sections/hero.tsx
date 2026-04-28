"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { BridgeMenuItem, BridgeSystemSettings } from "@/lib/api";
import { brand, resolveBrand } from "@/lib/brand";

type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
};

const heroSlides: HeroSlide[] = [
  {
    id: "homes",
    eyebrow: "شاليهات وفلل",
    title: "احجز إقامة فاخرة وتجربة متكاملة من منصة واحدة",
    subtitle: `${brand.nameAr} تجمع الإقامات الخاصة، التجارب، الرحلات، والفعاليات في واجهة واحدة مرتبطة ببيانات النظام ولوحة التحكم.`,
    image:
      "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?auto=format&fit=crop&w=1900&q=80",
  },
  {
    id: "experiences",
    eyebrow: "تجارب وسفر",
    title: "اكتشف أنشطة وتجارب مختارة تناسب كل مناسبة",
    subtitle: "ابحث حسب المدينة والتاريخ وعدد الضيوف، وانتقل مباشرة إلى نتائج حقيقية قابلة للحجز.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1900&q=80",
  },
  {
    id: "events",
    eyebrow: "فعاليات ومؤتمرات",
    title: "مساحات وتجارب جاهزة للاجتماعات والمناسبات",
    subtitle: "واجهة مرنة لاستعراض الخيارات المتاحة وإدارتها من لوحة التحكم بدون فصل بين المحتوى والحجز.",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1900&q=80",
  },
];

function normalizeQuickLinks(items: BridgeMenuItem[]) {
  const links = items
    .filter((item) => item.is_active !== 0 && Number(item.parent_id || 0) === 0 && item.name.trim().length > 0)
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    .map((item) => ({
      title: item.name.trim(),
      href: item.route_name || item.url || "#",
      target: item.target || (item.open_in_new_tab ? "_blank" : "_self"),
    }));

  if (links.length > 0) {
    return links;
  }

  return [
    { title: "تجارب مميزة", href: "/experience-search-result", target: "_self" },
    { title: "فعاليات ومؤتمرات", href: "/experience-search-result?category=events", target: "_self" },
    { title: "عروض سريعة", href: "/home-search-result?featured=1", target: "_self" },
  ];
}

export function Hero({ settings, quickLinks = [] }: { settings?: BridgeSystemSettings | null; quickLinks?: BridgeMenuItem[] }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const siteBrand = resolveBrand(settings);
  const heroQuickLinks = useMemo(() => normalizeQuickLinks(quickLinks), [quickLinks]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  const currentSlide = useMemo(() => {
    const slide = heroSlides[activeSlide];

    if (activeSlide !== 0) {
      return slide;
    }

    return {
      ...slide,
      eyebrow: settings?.public_hero_eyebrow || slide.eyebrow,
      title: settings?.public_hero_title || slide.title,
      subtitle:
        settings?.public_hero_subtitle ||
        slide.subtitle.replace(brand.nameAr, siteBrand.nameAr),
    };
  }, [activeSlide, settings, siteBrand.nameAr]);

  return (
    <section className="relative overflow-x-auto overflow-y-hidden bg-white">
      <div className="relative min-h-[720px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0.4, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${currentSlide.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/34 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative mx-auto flex min-h-[720px] min-w-[1180px] max-w-[1440px] flex-col justify-end px-6 pb-10 pt-32 lg:px-10">
          <div className="max-w-4xl pb-8 text-white">
            <span className="inline-flex rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
              {currentSlide.eyebrow}
            </span>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentSlide.id}-copy`}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                  {currentSlide.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
                  {currentSlide.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-7 flex flex-wrap gap-3">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    index === activeSlide
                      ? "border-white bg-white text-slate-950"
                      : "border-white/25 bg-white/10 text-white hover:bg-white/18"
                  }`}
                >
                  {slide.eyebrow}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/40 bg-white p-3 shadow-[0_26px_80px_-38px_rgba(15,23,42,0.75)]">
            <form
              action="/home-search-result"
              className="grid grid-cols-[1.25fr_1fr_1fr_.75fr_.75fr_auto] gap-3"
            >
              <Field label="المدينة" icon={<MapPin className="size-4" />}>
                <input
                  name="city"
                  placeholder="الرياض، جدة، أبها"
                  className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                />
              </Field>

              <Field label="الوصول" icon={<CalendarDays className="size-4" />}>
                <input type="date" name="date_from" className="w-full bg-transparent text-base text-slate-900 outline-none" />
              </Field>

              <Field label="المغادرة" icon={<CalendarDays className="size-4" />}>
                <input type="date" name="date_to" className="w-full bg-transparent text-base text-slate-900 outline-none" />
              </Field>

              <Field label="الضيوف" icon={<Users className="size-4" />}>
                <input
                  type="number"
                  name="guests"
                  min={1}
                  defaultValue={2}
                  className="w-full bg-transparent text-base text-slate-900 outline-none"
                />
              </Field>

              <Field label="أعلى سعر">
                <input
                  type="number"
                  name="max_price"
                  min={0}
                  placeholder="اختياري"
                  className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
                />
              </Field>

              <button
                type="submit"
                className="inline-flex min-h-[76px] items-center justify-center gap-2 rounded-lg bg-rose-500 px-7 py-4 text-base font-semibold text-white shadow-[0_18px_38px_rgba(244,63,94,.28)] transition hover:bg-rose-600"
              >
                <Search className="h-4 w-4" />
                ابدأ البحث
              </button>
            </form>
            <div className="flex flex-wrap gap-3 px-2 pb-1 pt-4 text-sm">
              {heroQuickLinks.map((item) => (
                <Link
                  key={`${item.title}-${item.href}`}
                  className="text-slate-600 transition hover:text-rose-600"
                  href={item.href}
                  target={item.target === "_blank" ? "_blank" : undefined}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const HeroSection = Hero;

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-h-[76px] flex-col justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-rose-300 focus-within:bg-white">
      <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
