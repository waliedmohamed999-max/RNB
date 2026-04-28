import Link from "next/link";
import { BedDouble, Building2, Compass, Landmark, Mountain, Palmtree, type LucideIcon } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import type { BridgeMenuItem } from "@/lib/api";

const categoryImages = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=900&q=80",
];

const iconMap: Record<string, LucideIcon> = {
  BedDouble,
  Palmtree,
  Compass,
  Mountain,
  Building2,
  Landmark,
};

const fallbackCategories = [
  { title: "شاليهات وفلل", href: "/home-search-result", icon: BedDouble, imageIndex: 0 },
  { title: "منتجعات", href: "/home-search-result?category=resorts", icon: Palmtree, imageIndex: 1 },
  { title: "تجارب سفر", href: "/experience-search-result", icon: Compass, imageIndex: 2 },
  { title: "رحلات وأنشطة", href: "/experience-search-result?category=activities", icon: Mountain, imageIndex: 3 },
  { title: "فعاليات ومؤتمرات", href: "/experience-search-result?category=events", icon: Building2, imageIndex: 4 },
  { title: "جولات ثقافية", href: "/experience-search-result?category=culture", icon: Landmark, imageIndex: 5 },
];

function normalizeCategories(menuItems: BridgeMenuItem[]) {
  const items = menuItems
    .filter((item) => item.is_active !== 0 && Number(item.parent_id || 0) === 0 && item.name.trim().length > 0)
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    .map((item, index) => {
      const iconName = typeof item.metadata?.icon === "string" ? item.metadata.icon : "";
      const imageIndex = typeof item.metadata?.image_index === "number" ? item.metadata.image_index : index;
      return {
        title: item.name.trim(),
        href: item.route_name || item.url || "#",
        icon: iconMap[iconName] ?? fallbackCategories[index % fallbackCategories.length]?.icon ?? BedDouble,
        imageIndex,
      };
    });

  return items.length > 0 ? items : fallbackCategories;
}

export function CategoriesSection({ menuItems = [] }: { menuItems?: BridgeMenuItem[] }) {
  const categories = normalizeCategories(menuItems);

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <SectionHeading
          eyebrow="الفئات"
          title="مسارات واضحة لكل نوع حجز"
          description="اختصارات مباشرة إلى الإقامات والتجارب والفعاليات، بدون عناصر معزولة عن نتائج البحث الفعلية."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(({ title, icon: Icon, href, imageIndex }) => {
            const imageUrl = categoryImages[imageIndex % categoryImages.length];

            return (
            <Link
              key={`${title}-${href}`}
              href={href}
              className="group relative min-h-[260px] overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.55)] transition hover:-translate-y-1 hover:border-rose-200"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.2), rgba(244, 63, 94, 0.18)), url("${imageUrl}")`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/56 to-slate-950/8" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="flex size-12 items-center justify-center rounded-lg bg-white text-slate-950 shadow-lg transition group-hover:bg-rose-500 group-hover:text-white">
                  <Icon className="size-5" />
                </div>
                <div className="mt-5 text-2xl font-semibold text-white">{title}</div>
                <div className="mt-2 max-w-sm text-sm leading-7 text-white/76">
                  استكشف الخيارات المتاحة الآن وانتقل مباشرة إلى نتائج البحث المناسبة.
                </div>
                <div className="mt-5 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition group-hover:bg-rose-500 group-hover:text-white">
                  عرض الخيارات
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
