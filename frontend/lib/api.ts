import { cache } from "react";
import { legacyUrl } from "@/lib/platform";
import { normalizeDeepText } from "@/lib/text";

const VERCEL_ADMIN_COOKIE = "labayh_vercel_admin";
const LOGIN_DISABLED_USER: BridgeSessionUser = {
  id: 1,
  email: "admin@labayh.local",
  mobile: "",
  first_name: "Admin",
  last_name: "",
  display_name: "Admin",
  avatar: "",
  roles: ["admin", "administrator"],
  dashboard_url: "/dashboard",
};

export type BridgeListingType = "home" | "experience" | "service";

export type BridgeListing = {
  id: number;
  type: BridgeListingType;
  slug: string;
  title: string;
  price_from: number;
  rating: number;
  thumb: string;
  city: string;
  amenity_ids?: string;
  guests?: number;
  bedrooms?: number;
  baths?: number;
  is_featured?: boolean;
  use_offer?: boolean;
  offer_percent?: number;
};

export type BridgeSessionUser = {
  id: number;
  email: string;
  mobile: string;
  first_name: string;
  last_name: string;
  display_name: string;
  avatar: string;
  roles: string[];
  dashboard_url: string;
};

export type BridgeAmenity = {
  id: number;
  name: string;
  icon: string;
};

export type BridgeRoom = {
  title: string;
  beds_label: string;
  image_url: string;
};

export type BridgeRule = {
  title: string;
  value: string;
  icon: string;
};

export type BridgeReview = {
  id: number;
  author_name: string;
  author_avatar: string;
  rating: number;
  comment: string;
  date_label: string;
};

export type BridgeListingDetails = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  images: string[];
  amenities: BridgeAmenity[];
  sleeping_arrangements: BridgeRoom[];
  house_rules: BridgeRule[];
  safety_items: BridgeRule[];
  cancellation_policy: {
    title: string;
    summary: string;
    details: string;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    country: string;
    map_image_url: string;
  };
  property_type_label: string;
  rating: number;
  review_count: number;
  guest_favorite_label: string;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  host: {
    id: number;
    name: string;
    avatar_url: string;
    is_superhost: boolean;
    hosting_years: number;
    reviews_count: number;
    rating: number;
    response_rate: number;
    response_time_label: string;
    badge_label: string;
    about_title: string;
    about_body: string;
    location_label: string;
    job_title: string;
    message_button_label: string;
  };
  pricing: {
    currency: string;
    total: number;
    nights: number;
    start_date: string;
    end_date: string;
    date_range_label: string;
    free_cancellation_label: string;
  };
  review_highlight: {
    rating: number;
    title: string;
    body: string;
    author_name: string;
    author_avatar: string;
    date_label: string;
    badge_label: string;
  };
};

export type BridgeWishlistItem = BridgeListing;

export type BridgeProfile = {
  id: number;
  email: string;
  mobile: string;
  first_name: string;
  last_name: string;
  display_name: string;
  location: string;
  address: string;
  description: string;
  trade_name: string;
  avatar: string;
  roles: string[];
  dashboard_url: string;
};

export type BridgeDashboardSummary = {
  role: string;
  bookings_count: number;
  pending_count: number;
  completed_count: number;
  wishlist_count: number;
  gross_total: number;
  currency: string;
  quick_links: Array<{
    label: string;
    href: string;
  }>;
};

export type BridgeDashboardBooking = {
  id: number;
  booking_id: string;
  status: string;
  service_id: number;
  service_type: BridgeListingType;
  service_title: string;
  service_slug: string;
  service_image: string;
  service_city: string;
  service_path: string;
  guests_count: number;
  total: number;
  currency: string;
  payment_type: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

export type BridgeBookingsResponse = {
  total: number;
  page: number;
  per_page: number;
  pages?: number;
  results: BridgeDashboardBooking[];
};

export type BridgeBookingStats = {
  total: number;
  upcoming: number;
  active: number;
  completed: number;
  canceled: number;
  pending: number;
  revenue: number;
  avgPrice: number;
  occupancyRate: number;
  cancellationRate: number;
  currency: string;
  last7Days: Array<{
    label: string;
    count: number;
  }>;
};

export type BridgeDashboardBookingDetail = BridgeDashboardBooking & {
  confirm_status: string;
  is_confirmed: boolean;
  status_label: string;
  payment_method: string;
  payment_follow_up: {
    status: string;
    label: string;
    message: string;
    legacy_url: string;
  };
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    note: string;
  };
  owner: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  invoice: {
    booking_id: string;
    service_name: string;
    guests_count: number;
    currency: string;
    payment_method: string;
    status: string;
    status_label: string;
    date_range: {
      start_date: string;
      end_date: string;
      start_time: string;
      end_time: string;
    };
    line_items: Array<{
      label: string;
      value: number;
    }>;
    tax_percent: number;
    commission_percent: number;
    subtotal: number;
    total: number;
  };
};

export type BridgeManagedServiceType = "home" | "experience";

export type BridgeManagedServiceItem = {
  id: number;
  title: string;
  slug: string;
  status: string;
  status_label: string;
  price: number;
  currency: string;
  guests: number;
  thumbnail: string;
  type_label: string;
  public_url: string;
  legacy_edit_url: string;
};

export type BridgeManagedServicesResponse = {
  type: BridgeManagedServiceType;
  total: number;
  page: number;
  per_page: number;
  add_url: string;
  results: BridgeManagedServiceItem[];
};

export type BridgeEditorChoice = {
  value: string;
  label: string;
};

export type BridgeEditorFieldItem = {
  id: string;
  label: string;
  type: string;
  choices: BridgeEditorChoice[];
};

export type BridgeUploadedMedia = {
  id: number;
  url: string;
  description: string;
  type: string;
};

export type BridgeEditorField = {
  id: string;
  label: string;
  desc: string;
  type: string;
  section: string;
  layout: string;
  condition: string;
  choices: BridgeEditorChoice[];
  items: BridgeEditorFieldItem[];
  value: unknown;
};

export type BridgeEditorPayload = {
  service_type: BridgeManagedServiceType;
  service_id: number;
  created: boolean;
  title: string;
  sections: Array<{
    id: string;
    label: string;
  }>;
  fields: BridgeEditorField[];
  public_url: string;
  list_url: string;
  preview: {
    id: number;
    title: string;
    status: string;
    status_label: string;
    thumbnail_url: string;
    type_label: string;
    price: number;
    currency: string;
  };
};

export type BridgeBookingQuote = {
  product_id: number;
  type: BridgeListingType;
  title: string;
  unit_price: number;
  unit_label: string;
  currency: string;
  checkin: string;
  checkout: string;
  guests_count: number;
  nights: number;
  subtotal: number;
  fees: number;
  tax: number;
  discount: number;
  total: number;
  coupon_code?: string;
  coupon_label?: string;
  coupon_valid?: boolean;
  coupon_error?: string;
  booking_url: string;
};

export type BridgeBookingCompletion = {
  booking_id: number;
  status: string;
  token_code: string;
  dashboard_url: string;
  service_path: string;
};

export type BridgeNotification = {
  id: number;
  type: string;
  title: string;
  time_ago: string;
  created_at: string;
  icon: string;
};

export type BridgeNotificationsResponse = {
  total: number;
  page: number;
  per_page: number;
  unread_count: number;
  results: BridgeNotification[];
};

export type BridgeDashboardReview = {
  id: number;
  author: string;
  email: string;
  content: string;
  status: string;
  service_id: number;
  service_title: string;
  public_url: string;
};

export type BridgeDashboardTerm = {
  id: number;
  title: string;
  name: string;
  description?: string;
  icon?: string;
  price: number;
  usage_count?: number;
};

export type BridgeLastMinuteHome = {
  id: number;
  home_id: number;
  title: string;
  price: number;
  original_price?: number;
  discount_percent?: number;
  enabled: boolean;
  date: string;
  ends_date?: string;
  starts_at?: string;
  ends_at?: string;
  starts_at_timestamp?: number;
  ends_at_timestamp?: number;
  duration_hours?: number;
  remaining_seconds?: number;
  expired?: boolean;
  thumbnail: string;
  public_url: string;
};

export type BridgeCenterVoteItem = {
  id: number;
  experience_id: number;
  title: string;
  event_date: string;
  image: string;
  public_url: string;
};

export type BridgeContentItem = {
  id: number;
  title: string;
  slug: string;
  status: string;
  status_label: string;
  thumbnail?: string;
  created_at: string;
  public_url: string;
  legacy_edit_url: string;
};

export type BridgeContentResponse = {
  total: number;
  page: number;
  per_page: number;
  new_url: string;
  results: BridgeContentItem[];
};

export type BridgeMediaItem = {
  id: number;
  title: string;
  url: string;
  type: string;
  author: number;
  created_at: string;
};

export type BridgeMediaResponse = {
  page: number;
  per_page: number;
  results: BridgeMediaItem[];
};

export type BridgeDashboardUser = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  phone?: string;
  avatar?: string;
  role: string;
  role_slug: string;
  request: string;
  status?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  identity_verified?: boolean;
  bookings_count?: number;
  listings_count?: number;
  rating?: number;
  created_at?: string;
  last_login?: string;
  request_status: string;
};

export type BridgeDashboardUsersResponse = {
  total: number;
  page: number;
  per_page: number;
  pages?: number;
  results: BridgeDashboardUser[];
};

export type BridgeDashboardUserStats = {
  total: number;
  active: number;
  suspended: number;
  hosts: number;
  guests: number;
};

export type BridgeActivityItem = {
  type: string;
  title: string;
  description: string;
  date: string;
};

export type BridgeDashboardUserDetail = BridgeDashboardUser & {
  country?: string;
  language?: string;
  nationality?: string;
  birth_date?: string;
  address?: string;
  description?: string;
  permissions: Record<string, boolean>;
  bookings: Array<{ id: number; title: string; dates: string; status: string; price: number; currency: string }>;
  listings: Array<{ id: number; title: string; status: string; price: number; image: string }>;
  payments: {
    total_spent: number;
    total_earned: number;
    methods: string[];
    transactions: Array<{ id: number; title: string; dates: string; status: string; price: number; currency: string }>;
  };
  activity: BridgeActivityItem[];
};

export type BridgePartnerRequest = BridgeDashboardUser & {
  company_name?: string;
  partner_type?: string;
  submitted_at?: string;
};

export type BridgePartnerRequestDetail = BridgePartnerRequest & {
  nationality?: string;
  location?: string;
  birth_date?: string;
  national_id_masked?: string;
  commercial_registration?: string;
  experience_years?: string;
  planned_listings?: string;
  target_cities?: string;
  expected_monthly_bookings?: string;
  priority?: string;
  review_reason?: string;
  documents: Array<{ id: string; title: string; url: string; thumbnail: string; status: string }>;
  activity: BridgeActivityItem[];
  onboarding: Array<{ label: string; done: boolean }>;
};

export type BridgePartnerStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  this_month: number;
};

export type BridgePermissionsMatrix = Record<string, Record<string, boolean>>;

export type BridgeDashboardCoupon = {
  id: number;
  code: string;
  description: string;
  price_type: string;
  price: number;
  status: string;
  start_date: string;
  end_date: string;
  service_type?: string;
};

export type BridgeDashboardCouponsResponse = {
  total: number;
  page: number;
  per_page: number;
  results: BridgeDashboardCoupon[];
};

export type BridgeDashboardPayout = {
  id: number;
  payout_id: string;
  user_id: number;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  note: string;
};

export type BridgeDashboardPayoutsResponse = {
  total: number;
  page: number;
  per_page: number;
  results: BridgeDashboardPayout[];
};

export type BridgeFinanceStats = {
  total_revenue: number;
  vat: number;
  net_profit: number;
  expenses: number;
  currency: string;
  date_from: string;
  date_to: string;
};

export type BridgeContentEditorTermOption = {
  id: number;
  title: string;
};

export type BridgeContentEditorTerms = {
  available: BridgeContentEditorTermOption[];
  selected: number[];
};

export type BridgePostEditorPayload = {
  id: number;
  title: string;
  content: string;
  slug: string;
  status: string;
  thumbnail_id: number;
  thumbnail_url: string;
  categories: BridgeContentEditorTerms;
  tags: BridgeContentEditorTerms;
};

export type BridgePageEditorPayload = {
  id: number;
  title: string;
  content: string;
  slug: string;
  status: string;
  thumbnail_id: number;
  thumbnail_url: string;
  page_template: string;
};

export type BridgeSystemSettings = {
  site_title: string;
  site_description: string;
  admin_email: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  dashboard_logo: string | number;
  dashboard_logo_short: string | number;
  site_language: string;
  brand_name_ar?: string;
  brand_name_en?: string;
  brand_logo_url?: string;
  brand_logo_short_url?: string;
  public_hero_eyebrow?: string;
  public_hero_title?: string;
  public_hero_subtitle?: string;
  footer_tagline?: string;
  footer_description?: string;
  footer_sections_title?: string;
  footer_account_title?: string;
  footer_newsletter_title?: string;
  footer_newsletter_text?: string;
};

export type BridgeMenuItem = {
  item_id: number;
  parent_id: number;
  depth: number;
  name: string;
  type: string;
  post_id: number;
  post_title: string;
  url: string;
  route_name?: string;
  target?: string;
  icon?: string;
  class: string;
  css_class?: string;
  sort_order?: number;
  is_active?: number;
  target_blank: number;
  open_in_new_tab?: number;
  permission_key?: string;
  metadata?: Record<string, unknown>;
};

export type BridgeMenu = {
  id: number;
  title: string;
  key?: string;
  position: string;
  description?: string;
  is_active?: number;
  items: BridgeMenuItem[];
};

export type BridgeMessageUser = {
  id: number;
  name: string;
  mobile: string;
  email: string;
};

export type BridgeMessagesMeta = {
  users: BridgeMessageUser[];
};

export type BridgeLanguageItem = {
  id: number;
  code: string;
  name: string;
  flag_name: string;
  flag_code: string;
  status: string;
  rtl: string;
  priority: number;
};

export type BridgeLanguagesResponse = {
  total: number;
  page: number;
  per_page: number;
  catalog: Record<string, { name: string }>;
  results: BridgeLanguageItem[];
};

export type BridgeTranslationResponse = {
  langs: Record<string, { name: string }>;
  lang: string;
  strings: string[];
  translation: Record<string, string>;
};

export type BridgeSeoPage = {
  key: string;
  screen: string;
  name: string;
  seo_title: string;
  seo_description: string;
  facebook_title: string;
  facebook_description: string;
  facebook_image: number;
  twitter_title: string;
  twitter_description: string;
  twitter_image: number;
};

export type BridgeSeoResponse = {
  enabled: boolean;
  pages: BridgeSeoPage[];
};

export type BridgeApiSettings = {
  access_token: string;
  api_lifetime: string;
  api_lifetime_type: string;
};

export type BridgeSystemTools = {
  password_required: boolean;
  tools: Array<{
    value: string;
    label: string;
  }>;
};

export type BridgePostComment = {
  id: number;
  title: string;
  content: string;
  author_name: string;
  author_email: string;
  status: string;
  post_id: number;
  post_title: string;
  post_slug: string;
  created_at: string;
  public_url: string;
};

export type BridgePostCommentsResponse = {
  total: number;
  page: number;
  per_page: number;
  results: BridgePostComment[];
};

export type BridgePostTerm = {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  price: number;
  taxonomy: "post-category" | "post-tag";
};

export type BridgePostTermsResponse = {
  taxonomy: "post-category" | "post-tag";
  total: number;
  page: number;
  per_page: number;
  results: BridgePostTerm[];
};

type BridgeResponse<T> = {
  status: number;
  data: T;
  message?: string;
  redirect?: string;
};

export type BridgeResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  message?: string;
};

type FetchBridgeOptions = {
  cookieHeader?: string;
  method?: "GET" | "POST";
  body?: unknown;
  revalidate?: number | false;
};

const FALLBACK_DASHBOARD_SUMMARY: BridgeDashboardSummary = {
  role: "admin",
  bookings_count: 0,
  pending_count: 0,
  completed_count: 0,
  wishlist_count: 0,
  gross_total: 0,
  currency: "SAR",
  quick_links: [],
};

const FALLBACK_PROFILE: BridgeProfile = {
  id: LOGIN_DISABLED_USER.id,
  email: LOGIN_DISABLED_USER.email,
  mobile: LOGIN_DISABLED_USER.mobile,
  first_name: LOGIN_DISABLED_USER.first_name,
  last_name: LOGIN_DISABLED_USER.last_name,
  display_name: LOGIN_DISABLED_USER.display_name,
  location: "",
  address: "",
  description: "Preview admin profile until the Laravel API is connected.",
  trade_name: "Labayh",
  avatar: LOGIN_DISABLED_USER.avatar,
  roles: LOGIN_DISABLED_USER.roles,
  dashboard_url: LOGIN_DISABLED_USER.dashboard_url,
};

const FALLBACK_NOTIFICATIONS: BridgeNotificationsResponse = {
  total: 3,
  page: 1,
  per_page: 20,
  unread_count: 3,
  results: [
    {
      id: 1,
      type: "system",
      title: "Backend connection is not configured yet",
      time_ago: "now",
      created_at: new Date().toISOString(),
      icon: "bell",
    },
    {
      id: 2,
      type: "global",
      title: "Configure NEXT_PUBLIC_LEGACY_BASE_URL to load live dashboard data",
      time_ago: "now",
      created_at: new Date().toISOString(),
      icon: "shield",
    },
    {
      id: 3,
      type: "booking",
      title: "Dashboard is running in preview mode",
      time_ago: "now",
      created_at: new Date().toISOString(),
      icon: "calendar",
    },
  ],
};

const FALLBACK_SETTINGS: BridgeSystemSettings = {
  site_title: "Labayh",
  site_description: "Booking platform",
  admin_email: "admin@labayh.local",
  contact_phone: "",
  contact_email: "admin@labayh.local",
  contact_address: "",
  dashboard_logo: "",
  dashboard_logo_short: "",
  site_language: "ar",
  brand_name_ar: "لبية",
  brand_name_en: "Labayh",
  brand_logo_url: "",
  brand_logo_short_url: "",
  public_hero_eyebrow: "Labayh",
  public_hero_title: "Booking management",
  public_hero_subtitle: "Preview mode",
  footer_tagline: "Labayh",
  footer_description: "Preview mode until backend is connected.",
  footer_sections_title: "Sections",
  footer_account_title: "Account",
  footer_newsletter_title: "Newsletter",
  footer_newsletter_text: "Stay updated.",
};

const FALLBACK_MESSAGES_META: BridgeMessagesMeta = {
  users: [
    { id: 1, name: "Admin", mobile: "+966500000000", email: "admin@labayh.local" },
    { id: 2, name: "Preview User", mobile: "+966511111111", email: "preview@labayh.local" },
  ],
};

const FALLBACK_LANGUAGES: BridgeLanguagesResponse = {
  total: 2,
  page: 1,
  per_page: 20,
  catalog: {
    ar: { name: "Arabic" },
    en: { name: "English" },
  },
  results: [
    {
      id: 1,
      code: "ar",
      name: "Arabic",
      flag_name: "Saudi Arabia",
      flag_code: "sa",
      status: "publish",
      rtl: "on",
      priority: 1,
    },
    {
      id: 2,
      code: "en",
      name: "English",
      flag_name: "United States",
      flag_code: "us",
      status: "publish",
      rtl: "off",
      priority: 2,
    },
  ],
};

const FALLBACK_TRANSLATION: BridgeTranslationResponse = {
  langs: {
    ar: { name: "Arabic" },
    en: { name: "English" },
  },
  lang: "ar",
  strings: ["dashboard.title", "dashboard.preview", "common.save", "common.cancel"],
  translation: {
    "dashboard.title": "Dashboard",
    "dashboard.preview": "Preview mode",
    "common.save": "Save",
    "common.cancel": "Cancel",
  },
};

const FALLBACK_SEO: BridgeSeoResponse = {
  enabled: true,
  pages: [
    {
      key: "home",
      screen: "home",
      name: "Home",
      seo_title: JSON.stringify({ ar: "Labayh", en: "Labayh" }),
      seo_description: JSON.stringify({ ar: "Booking platform", en: "Booking platform" }),
      facebook_title: JSON.stringify({ ar: "Labayh", en: "Labayh" }),
      facebook_description: JSON.stringify({ ar: "Booking platform", en: "Booking platform" }),
      facebook_image: 0,
      twitter_title: JSON.stringify({ ar: "Labayh", en: "Labayh" }),
      twitter_description: JSON.stringify({ ar: "Booking platform", en: "Booking platform" }),
      twitter_image: 0,
    },
    {
      key: "dashboard",
      screen: "dashboard",
      name: "Dashboard",
      seo_title: JSON.stringify({ ar: "Dashboard", en: "Dashboard" }),
      seo_description: JSON.stringify({ ar: "Administration dashboard", en: "Administration dashboard" }),
      facebook_title: JSON.stringify({ ar: "Dashboard", en: "Dashboard" }),
      facebook_description: JSON.stringify({ ar: "Administration dashboard", en: "Administration dashboard" }),
      facebook_image: 0,
      twitter_title: JSON.stringify({ ar: "Dashboard", en: "Dashboard" }),
      twitter_description: JSON.stringify({ ar: "Administration dashboard", en: "Administration dashboard" }),
      twitter_image: 0,
    },
  ],
};

const FALLBACK_API_SETTINGS: BridgeApiSettings = {
  access_token: "preview-token",
  api_lifetime: "30",
  api_lifetime_type: "day",
};

const FALLBACK_SYSTEM_TOOLS: BridgeSystemTools = {
  password_required: false,
  tools: [
    { value: "clear_cache", label: "Clear cache" },
    { value: "database_backup", label: "Database backup" },
    { value: "test_email", label: "Test email" },
  ],
};

function fallbackPostTerms(taxonomy: "post-category" | "post-tag"): BridgePostTermsResponse {
  const isTag = taxonomy === "post-tag";
  return {
    taxonomy,
    total: 2,
    page: 1,
    per_page: 20,
    results: [
      {
        id: isTag ? 101 : 1,
        title: isTag ? "Preview" : "General",
        slug: isTag ? "preview" : "general",
        description: "Fallback item until backend is connected.",
        image: "",
        icon: isTag ? "#" : "G",
        price: 0,
        taxonomy,
      },
      {
        id: isTag ? 102 : 2,
        title: isTag ? "News" : "Announcements",
        slug: isTag ? "news" : "announcements",
        description: "Sample dashboard data.",
        image: "",
        icon: isTag ? "N" : "A",
        price: 0,
        taxonomy,
      },
    ],
  };
}

export type SearchInput = Record<string, string | number | string[] | undefined>;

function toStringValue(value: string | number | string[] | undefined) {
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (Array.isArray(value)) {
    return value[0] ? String(value[0]) : "";
  }

  return String(value);
}

function toStringArray(value: string | string[] | undefined) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function fetchBridgePayload<T>(
  path: string,
  options: FetchBridgeOptions = {},
): Promise<BridgeResponse<T> | null> {
  try {
    const headers: HeadersInit = {
      Accept: "application/json",
    };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (options.cookieHeader) {
      headers.Cookie = options.cookieHeader;
    }

    const response = await fetch(legacyUrl(`/bridge/v1/${path}`), {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      ...(options.revalidate === false
        ? { cache: "no-store" as const }
        : { next: { revalidate: options.revalidate ?? 120 } }),
    });

    if (!response.ok) {
      return null;
    }

    return normalizeDeepText((await response.json()) as BridgeResponse<T>);
  } catch {
    return null;
  }
}

async function fetchBridgeResult<T>(
  path: string,
  options: FetchBridgeOptions = {},
): Promise<BridgeResult<T>> {
  try {
    const headers: HeadersInit = {
      Accept: "application/json",
    };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (options.cookieHeader) {
      headers.Cookie = options.cookieHeader;
    }

    const response = await fetch(legacyUrl(`/bridge/v1/${path}`), {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      ...(options.revalidate === false
        ? { cache: "no-store" as const }
        : { next: { revalidate: options.revalidate ?? 120 } }),
    });

    const contentType = response.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? normalizeDeepText((await response.json()) as Partial<BridgeResponse<T>>)
      : null;

    return {
      ok: response.ok,
      status: response.status,
      data: payload?.data ?? null,
      message: payload?.message,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      message: error instanceof Error ? error.message : "Unknown bridge error",
    };
  }
}

async function fetchBridge<T>(
  path: string,
  options: FetchBridgeOptions = {},
): Promise<T | null> {
  const payload = await fetchBridgePayload<T>(path, options);
  return payload?.data ?? null;
}

export function bridgeTypeToPath(type: BridgeListingType) {
  return type === "service" ? "car" : type;
}

export function pathToBridgeType(type: string): BridgeListingType | null {
  if (type === "home") {
    return "home";
  }

  if (type === "experience") {
    return "experience";
  }

  if (type === "car" || type === "service") {
    return "service";
  }

  return null;
}

export function buildListingPath(item: Pick<BridgeListing, "id" | "slug" | "type">) {
  return `/${bridgeTypeToPath(item.type)}/${item.id}/${item.slug}`;
}

export const getSessionUser = cache(async function getSessionUser(cookieHeader?: string) {
  return LOGIN_DISABLED_USER;

  const localSession = readLocalAdminSession(cookieHeader);
  if (localSession) {
    return localSession;
  }

  return fetchBridge<BridgeSessionUser>("session", {
    cookieHeader,
    revalidate: false,
  });
});

function readLocalAdminSession(cookieHeader?: string): BridgeSessionUser | null {
  const value = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${VERCEL_ADMIN_COOKIE}=`))
    ?.slice(VERCEL_ADMIN_COOKIE.length + 1);

  if (!value) {
    return null;
  }

  try {
    const session = JSON.parse(decodeURIComponent(value)) as BridgeSessionUser;
    return Array.isArray(session.roles) && session.roles.length > 0 ? session : null;
  } catch {
    return null;
  }
}

export async function getHomeProducts() {
  return fetchBridge<BridgeListing[]>("products?type=home");
}

export async function getFeaturedPromotions() {
  return fetchBridge<BridgeListing[]>("promotions/featured");
}

export async function getWishlist(cookieHeader?: string, type?: string) {
  const suffix = type ? `?type=${type}` : "";

  return fetchBridge<BridgeWishlistItem[]>(`wishlist${suffix}`, {
    cookieHeader,
    revalidate: false,
  });
}

export async function getProfile(cookieHeader?: string) {
  return (await fetchBridge<BridgeProfile>("profile", {
    cookieHeader,
    revalidate: false,
  })) ?? FALLBACK_PROFILE;
}

export async function getDashboardSummary(cookieHeader?: string) {
  return (await fetchBridge<BridgeDashboardSummary>("dashboard/summary", {
    cookieHeader,
    revalidate: false,
  })) ?? FALLBACK_DASHBOARD_SUMMARY;
}

export async function getDashboardBookings(
  cookieHeader?: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const allowed = [
    "page",
    "per_page",
    "limit",
    "status",
    "search",
    "dateFrom",
    "dateTo",
    "listingType",
    "paymentMethod",
    "minPrice",
    "maxPrice",
    "sortBy",
  ];

  for (const key of allowed) {
    const value = toStringValue(searchParams?.[key]);
    if (value) {
      params.set(key === "limit" ? "per_page" : key, value);
    }
  }

  const query = params.toString();

  return fetchBridge<BridgeBookingsResponse>(
    `dashboard/bookings${query ? `?${query}` : ""}`,
    {
      cookieHeader,
      revalidate: false,
    },
  );
}

export async function getDashboardBookingStats(cookieHeader?: string) {
  return fetchBridge<BridgeBookingStats>("dashboard/bookings/stats", {
    cookieHeader,
    revalidate: false,
  });
}

export async function getDashboardBookingDetail(
  id: number,
  cookieHeader?: string,
) {
  return fetchBridge<BridgeDashboardBookingDetail>(`dashboard/bookings/${id}`, {
    cookieHeader,
    revalidate: false,
  });
}

export async function getNotifications(
  cookieHeader?: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const page = toStringValue(searchParams?.page);

  if (page) {
    params.set("page", page);
  }

  return (await fetchBridge<BridgeNotificationsResponse>(
    `notifications${params.toString() ? `?${params.toString()}` : ""}`,
    {
      cookieHeader,
      revalidate: false,
    },
  )) ?? FALLBACK_NOTIFICATIONS;
}

export async function searchProducts(type: string, input: SearchInput = {}) {
  const bridgeType = pathToBridgeType(type) ?? "home";
  const params = new URLSearchParams();

  params.set("type", bridgeType);

  const city = toStringValue(input.city ?? input.address);
  if (city) {
    params.set("city", city);
  }

  const dateFrom = toStringValue(input.date_from ?? input.checkIn);
  if (dateFrom) {
    params.set("date_from", dateFrom);
  }

  const dateTo = toStringValue(input.date_to ?? input.checkOut);
  if (dateTo) {
    params.set("date_to", dateTo);
  }

  const guests = toStringValue(input.guests ?? input.num_adults);
  if (guests) {
    params.set("guests", guests);
  }

  const minPrice = toStringValue(input.min_price);
  const maxPrice = toStringValue(input.max_price);
  const oldPriceFilter = toStringValue(input.price_filter);

  if (oldPriceFilter && (!minPrice || !maxPrice)) {
    const [oldMin, oldMax] = oldPriceFilter.split(";");
    if (oldMin) {
      params.set("min_price", oldMin);
    }
    if (oldMax) {
      params.set("max_price", oldMax);
    }
  } else {
    if (minPrice) {
      params.set("min_price", minPrice);
    }
    if (maxPrice) {
      params.set("max_price", maxPrice);
    }
  }

  const amenities = [
    ...toStringArray(input.amenities as string | string[] | undefined),
    ...toStringArray(input["home-amenity"] as string | string[] | undefined),
  ];

  amenities.forEach((amenity) => {
    params.append("amenities[]", amenity);
  });

  const page = toStringValue(input.page);
  if (page) {
    params.set("page", page);
  }

  return fetchBridge<BridgeListing[]>(`products?${params.toString()}`);
}

export async function getProductDetails(id: number, type: string) {
  const bridgeType = pathToBridgeType(type);
  if (!bridgeType) {
    return null;
  }

  return fetchBridge<BridgeListingDetails>(`products/${id}?type=${bridgeType}`, {
    revalidate: false,
  });
}

export async function getProductReviews(id: number, type: string) {
  const bridgeType = pathToBridgeType(type);
  if (!bridgeType) {
    return null;
  }

  return fetchBridge<BridgeReview[]>(`products/${id}/reviews?type=${bridgeType}`, {
    revalidate: false,
  });
}

export async function getBookingQuote(
  payload: {
    product_id: number;
    type: string;
    checkin: string;
    checkout: string;
    guests_count: number;
    coupon_code?: string;
  },
  cookieHeader?: string,
) {
  return fetchBridge<BridgeBookingQuote>("bookings/quote", {
    method: "POST",
    body: payload,
    cookieHeader,
    revalidate: false,
  });
}

export async function completeBooking(
  payload: {
    product_id: number;
    type: string;
    checkin: string;
    checkout: string;
    guests_count: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address?: string;
    note?: string;
    payment?: string;
    payment_status?: string;
  },
  cookieHeader?: string,
) {
  return fetchBridge<BridgeBookingCompletion>("bookings/complete", {
    method: "POST",
    body: payload,
    cookieHeader,
    revalidate: false,
  });
}

export async function cancelDashboardBooking(id: number, cookieHeader?: string) {
  return fetchBridge<{ message?: string }>(`dashboard/bookings/${id}/cancel`, {
    method: "POST",
    cookieHeader,
    revalidate: false,
  });
}

export async function confirmDashboardBooking(id: number, cookieHeader?: string) {
  return fetchBridge<{ message?: string }>(`dashboard/bookings/${id}/confirm`, {
    method: "POST",
    cookieHeader,
    revalidate: false,
  });
}

export async function getManagedHomes(
  cookieHeader?: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const page = toStringValue(searchParams?.page);
  const status = toStringValue(searchParams?.status);
  const search = toStringValue(searchParams?._s);

  if (page) {
    params.set("page", page);
  }
  if (status) {
    params.set("status", status);
  }
  if (search) {
    params.set("_s", search);
  }

  return fetchBridge<BridgeManagedServicesResponse>(
    `dashboard/services/homes${params.toString() ? `?${params.toString()}` : ""}`,
    {
      cookieHeader,
      revalidate: false,
    },
  );
}

export async function getManagedExperiences(
  cookieHeader?: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const page = toStringValue(searchParams?.page);
  const status = toStringValue(searchParams?.status);
  const search = toStringValue(searchParams?._s);

  if (page) {
    params.set("page", page);
  }
  if (status) {
    params.set("status", status);
  }
  if (search) {
    params.set("_s", search);
  }

  return fetchBridge<BridgeManagedServicesResponse>(
    `dashboard/services/experiences${params.toString() ? `?${params.toString()}` : ""}`,
    {
      cookieHeader,
      revalidate: false,
    },
  );
}

export async function updateManagedServiceStatus(
  type: BridgeManagedServiceType,
  id: number,
  status: string,
  cookieHeader?: string,
) {
  return fetchBridge<{ message?: string }>(`dashboard/services/${type === "home" ? "homes" : "experiences"}/${id}/status`, {
    method: "POST",
    body: { status },
    cookieHeader,
    revalidate: false,
  });
}

export async function duplicateManagedService(
  type: BridgeManagedServiceType,
  id: number,
  cookieHeader?: string,
) {
  return fetchBridge<{ message?: string; new_id?: number }>(
    `dashboard/services/${type === "home" ? "homes" : "experiences"}/${id}/duplicate`,
    {
      method: "POST",
      cookieHeader,
      revalidate: false,
    },
  );
}

export async function deleteManagedService(
  type: BridgeManagedServiceType,
  id: number,
  cookieHeader?: string,
) {
  return fetchBridge<{ message?: string }>(
    `dashboard/services/${type === "home" ? "homes" : "experiences"}/${id}/delete`,
    {
      method: "POST",
      cookieHeader,
      revalidate: false,
    },
  );
}

export async function getManagedServiceEditorNew(
  type: BridgeManagedServiceType,
  cookieHeader?: string,
) {
  return fetchBridge<BridgeEditorPayload>(
    `dashboard/services/${type === "home" ? "homes" : "experiences"}/editor/new`,
    {
      cookieHeader,
      revalidate: false,
    },
  );
}

export async function getManagedServiceEditorNewResult(
  type: BridgeManagedServiceType,
  cookieHeader?: string,
) {
  return fetchBridgeResult<BridgeEditorPayload>(
    `dashboard/services/${type === "home" ? "homes" : "experiences"}/editor/new`,
    {
      cookieHeader,
      revalidate: false,
    },
  );
}

export async function getManagedServiceEditor(
  type: BridgeManagedServiceType,
  id: number,
  cookieHeader?: string,
) {
  return fetchBridge<BridgeEditorPayload>(
    `dashboard/services/${type === "home" ? "homes" : "experiences"}/editor/${id}`,
    {
      cookieHeader,
      revalidate: false,
    },
  );
}

export async function getManagedServiceEditorResult(
  type: BridgeManagedServiceType,
  id: number,
  cookieHeader?: string,
) {
  return fetchBridgeResult<BridgeEditorPayload>(
    `dashboard/services/${type === "home" ? "homes" : "experiences"}/editor/${id}`,
    {
      cookieHeader,
      revalidate: false,
    },
  );
}

export async function getDashboardReviews(
  type: BridgeManagedServiceType,
  cookieHeader?: string,
) {
  return fetchBridge<BridgeDashboardReview[]>(
    `dashboard/reviews/${type}`,
    {
      cookieHeader,
      revalidate: false,
    },
  );
}

export async function getDashboardTerms(
  taxonomy: string,
  cookieHeader?: string,
) {
  return fetchBridge<BridgeDashboardTerm[]>(
    `dashboard/terms/${taxonomy}`,
    {
      cookieHeader,
      revalidate: false,
    },
  );
}

export async function getLastMinuteHomes(cookieHeader?: string) {
  return fetchBridge<BridgeLastMinuteHome[]>(
    "dashboard/last-minute/homes",
    {
      cookieHeader,
      revalidate: false,
    },
  );
}

export async function getCenterVote(cookieHeader?: string) {
  return fetchBridge<BridgeCenterVoteItem[]>(
    "dashboard/center-vote",
    {
      cookieHeader,
      revalidate: false,
    },
  );
}

export async function getDashboardPosts(
  cookieHeader?: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const page = toStringValue(searchParams?.page);
  const search = toStringValue(searchParams?._s);
  const status = toStringValue(searchParams?.status);

  if (page) {
    params.set("page", page);
  }
  if (search) {
    params.set("_s", search);
  }
  if (status) {
    params.set("status", status);
  }

  return fetchBridge<BridgeContentResponse>(
    `dashboard/posts${params.toString() ? `?${params.toString()}` : ""}`,
    { cookieHeader, revalidate: false },
  );
}

export async function getDashboardPages(
  cookieHeader?: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const page = toStringValue(searchParams?.page);
  const search = toStringValue(searchParams?._s);
  const status = toStringValue(searchParams?.status);

  if (page) {
    params.set("page", page);
  }
  if (search) {
    params.set("_s", search);
  }
  if (status) {
    params.set("status", status);
  }

  return fetchBridge<BridgeContentResponse>(
    `dashboard/pages${params.toString() ? `?${params.toString()}` : ""}`,
    { cookieHeader, revalidate: false },
  );
}

export async function getDashboardMedia(
  cookieHeader?: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const page = toStringValue(searchParams?.page);
  const search = toStringValue(searchParams?._s);

  if (page) {
    params.set("page", page);
  }
  if (search) {
    params.set("_s", search);
  }

  return fetchBridge<BridgeMediaResponse>(
    `dashboard/media${params.toString() ? `?${params.toString()}` : ""}`,
    { cookieHeader, revalidate: false },
  );
}

export async function getDashboardUsers(
  cookieHeader?: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const page = toStringValue(searchParams?.page);
  const search = toStringValue(searchParams?._s ?? searchParams?.search);
  const role = toStringValue(searchParams?.role);
  const status = toStringValue(searchParams?.status);
  const verification = toStringValue(searchParams?.verification);
  const sort = toStringValue(searchParams?.sort);
  const dateFrom = toStringValue(searchParams?.date_from);
  const dateTo = toStringValue(searchParams?.date_to);

  if (page) {
    params.set("page", page);
  }
  if (search) {
    params.set("search", search);
  }
  if (role) params.set("role", role);
  if (status) params.set("status", status);
  if (verification) params.set("verification", verification);
  if (sort) params.set("sort", sort);
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);

  return fetchBridge<BridgeDashboardUsersResponse>(
    `admin/users${params.toString() ? `?${params.toString()}` : ""}`,
    { cookieHeader, revalidate: false },
  );
}

export async function getDashboardUsersStats(cookieHeader?: string) {
  return fetchBridge<BridgeDashboardUserStats>("admin/users/stats", {
    cookieHeader,
    revalidate: false,
  });
}

export async function getDashboardPermissionsMatrix(cookieHeader?: string) {
  return fetchBridge<BridgePermissionsMatrix>("admin/permissions", {
    cookieHeader,
    revalidate: false,
  });
}

export async function getDashboardPartnerRequests(
  cookieHeader?: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const page = toStringValue(searchParams?.page);
  const search = toStringValue(searchParams?._s ?? searchParams?.search);
  const status = toStringValue(searchParams?.status);
  const partnerType = toStringValue(searchParams?.partner_type);
  const sort = toStringValue(searchParams?.sort);
  const dateFrom = toStringValue(searchParams?.date_from);
  const dateTo = toStringValue(searchParams?.date_to);

  if (page) {
    params.set("page", page);
  }
  if (search) {
    params.set("search", search);
  }
  if (status) params.set("status", status);
  if (partnerType) params.set("partner_type", partnerType);
  if (sort) params.set("sort", sort);
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);

  return fetchBridge<BridgeDashboardUsersResponse>(
    `admin/partners${params.toString() ? `?${params.toString()}` : ""}`,
    { cookieHeader, revalidate: false },
  );
}

export async function getDashboardPartnerStats(cookieHeader?: string) {
  return fetchBridge<BridgePartnerStats>("admin/partners/stats", {
    cookieHeader,
    revalidate: false,
  });
}

export async function getDashboardCoupons(
  cookieHeader?: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const page = toStringValue(searchParams?.page);
  const search = toStringValue(searchParams?._s);
  const status = toStringValue(searchParams?.status);

  if (page) {
    params.set("page", page);
  }
  if (search) {
    params.set("_s", search);
  }
  if (status) {
    params.set("status", status);
  }

  return fetchBridge<BridgeDashboardCouponsResponse>(
    `dashboard/coupons${params.toString() ? `?${params.toString()}` : ""}`,
    { cookieHeader, revalidate: false },
  );
}

export async function getDashboardPayouts(
  cookieHeader?: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const page = toStringValue(searchParams?.page);
  const search = toStringValue(searchParams?._s);
  const status = toStringValue(searchParams?.status);

  if (page) {
    params.set("page", page);
  }
  if (search) {
    params.set("_s", search);
  }
  if (status) {
    params.set("status", status);
  }

  return fetchBridge<BridgeDashboardPayoutsResponse>(
    `dashboard/payouts${params.toString() ? `?${params.toString()}` : ""}`,
    { cookieHeader, revalidate: false },
  );
}

export async function getDashboardPayoutDetail(id: number, cookieHeader?: string) {
  return fetchBridge<BridgeDashboardPayout>(`dashboard/payouts/${id}`, {
    cookieHeader,
    revalidate: false,
  });
}

export async function getDashboardFinanceStats(
  cookieHeader?: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const range = toStringValue(searchParams?.range);
  const dateFrom = toStringValue(searchParams?.date_from);
  const dateTo = toStringValue(searchParams?.date_to);

  if (range) params.set("range", range);
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);

  return fetchBridge<BridgeFinanceStats>(
    `dashboard/finance/stats${params.toString() ? `?${params.toString()}` : ""}`,
    { cookieHeader, revalidate: false },
  );
}

export async function getPostEditor(id: number | "new", cookieHeader?: string) {
  return fetchBridge<BridgePostEditorPayload>(`dashboard/content/posts/editor/${id}`, {
    cookieHeader,
    revalidate: false,
  });
}

export async function getPageEditor(id: number | "new", cookieHeader?: string) {
  return fetchBridge<BridgePageEditorPayload>(`dashboard/content/pages/editor/${id}`, {
    cookieHeader,
    revalidate: false,
  });
}

export async function getSystemSettings(cookieHeader?: string) {
  return (await fetchBridge<BridgeSystemSettings>("dashboard/system-native/settings", {
    cookieHeader,
    revalidate: false,
  })) ?? FALLBACK_SETTINGS;
}

export async function getPublicSystemSettings() {
  return (await fetchBridge<BridgeSystemSettings>("public/settings", {
    revalidate: false,
  })) ?? FALLBACK_SETTINGS;
}

export async function getMenus(cookieHeader?: string) {
  return fetchBridge<BridgeMenu[]>("dashboard/system-native/menus", {
    cookieHeader,
    revalidate: false,
  });
}

export async function getPublicMenus(location = "primary") {
  return fetchBridge<BridgeMenu[]>(`public/menus?location=${encodeURIComponent(location)}`, {
    revalidate: 0,
  });
}

export async function getMessagesMeta(cookieHeader?: string) {
  return (await fetchBridge<BridgeMessagesMeta>("dashboard/system-native/messages", {
    cookieHeader,
    revalidate: false,
  })) ?? FALLBACK_MESSAGES_META;
}

export async function getLanguages(
  cookieHeader?: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const page = toStringValue(searchParams?.page);
  const search = toStringValue(searchParams?._s);
  const status = toStringValue(searchParams?.status);
  if (page) params.set("page", page);
  if (search) params.set("_s", search);
  if (status) params.set("status", status);

  return (await fetchBridge<BridgeLanguagesResponse>(
    `dashboard/system-native/languages${params.toString() ? `?${params.toString()}` : ""}`,
    { cookieHeader, revalidate: false },
  )) ?? FALLBACK_LANGUAGES;
}

export async function getTranslationData(lang: string, cookieHeader?: string) {
  const suffix = lang ? `?lang=${encodeURIComponent(lang)}` : "";
  const payload = await fetchBridge<BridgeTranslationResponse>(`dashboard/system-native/translation${suffix}`, {
    cookieHeader,
    revalidate: false,
  });

  return payload ?? { ...FALLBACK_TRANSLATION, lang: lang && lang !== "none" ? lang : FALLBACK_TRANSLATION.lang };
}

export async function getSeoData(cookieHeader?: string) {
  return (await fetchBridge<BridgeSeoResponse>("dashboard/system-native/seo", {
    cookieHeader,
    revalidate: false,
  })) ?? FALLBACK_SEO;
}

export async function getApiSettings(cookieHeader?: string) {
  return (await fetchBridge<BridgeApiSettings>("dashboard/system-native/api", {
    cookieHeader,
    revalidate: false,
  })) ?? FALLBACK_API_SETTINGS;
}

export async function getSystemTools(cookieHeader?: string) {
  return (await fetchBridge<BridgeSystemTools>("dashboard/system-native/tools", {
    cookieHeader,
    revalidate: false,
  })) ?? FALLBACK_SYSTEM_TOOLS;
}

export async function getPostComments(
  cookieHeader?: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const page = toStringValue(searchParams?.page);
  const search = toStringValue(searchParams?._s);
  const status = toStringValue(searchParams?.status);
  if (page) params.set("page", page);
  if (search) params.set("_s", search);
  if (status) params.set("status", status);

  return fetchBridge<BridgePostCommentsResponse>(
    `dashboard/content/posts/comments${params.toString() ? `?${params.toString()}` : ""}`,
    { cookieHeader, revalidate: false },
  );
}

export async function getPostTerms(
  taxonomy: "post-category" | "post-tag",
  cookieHeader?: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();
  const page = toStringValue(searchParams?.page);
  const search = toStringValue(searchParams?._s);
  if (page) params.set("page", page);
  if (search) params.set("_s", search);

  return (await fetchBridge<BridgePostTermsResponse>(
    `dashboard/content/posts/terms/${taxonomy}${params.toString() ? `?${params.toString()}` : ""}`,
    { cookieHeader, revalidate: false },
  )) ?? fallbackPostTerms(taxonomy);
}

export async function loginWithSessionBridge(payload: {
  mobile: string;
  digit1: string;
  digit2: string;
  digit3: string;
  digit4: string;
  remember?: boolean;
  return_url?: string;
}) {
  return fetchBridgePayload<BridgeSessionUser>("session/login", {
    method: "POST",
    body: payload,
    revalidate: false,
  });
}
