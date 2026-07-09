import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type PaymentMethodKey =
  | "bank_transfer"
  | "visa"
  | "mastercard"
  | "mada"
  | "stc_pay"
  | "apple_pay"
  | "cash"
  | "paytabs"
  | "hyperpay"
  | "installments";

export type PaymentMethod = {
  key: PaymentMethodKey;
  label: string;
  description: string;
  enabled: boolean;
  settlement: "online" | "manual" | "offline" | "installment";
  instructions?: string;
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  merchantId?: string;
  terminalId?: string;
  merchantKey?: string;
  bankName?: string;
  accountName?: string;
  iban?: string;
  swift?: string;
  maxAmount?: number;
  feePercent?: number;
  feeFixed?: number;
  logo?: string;
};

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "payment-methods.json");

export const defaultPaymentMethods: PaymentMethod[] = [
  {
    key: "visa",
    label: "فيزا",
    description: "دفع إلكتروني آمن بالبطاقات الائتمانية.",
    settlement: "online",
    enabled: true,
    publicKey: "pk_live_visa_demo",
    secretKey: "demo_live_visa_demo",
    webhookSecret: "whsec_visa_demo",
    feePercent: 2.9,
    feeFixed: 0.3,
  },
  {
    key: "bank_transfer",
    label: "تحويل بنكي",
    description: "استلام الحجز كطلب مع تعليمات التحويل البنكي والمتابعة من الإدارة.",
    settlement: "manual",
    enabled: true,
    instructions: "حوّل المبلغ إلى الحساب البنكي المعتمد ثم أرفق رقم العملية في الملاحظات.",
    bankName: "مصرف الراجحي",
    accountName: "شركة لبية",
    iban: "SA0000000000000000000000",
    swift: "RJHISARI",
  },
  {
    key: "mastercard",
    label: "ماستر كارد",
    description: "دفع إلكتروني آمن ببطاقات ماستر كارد.",
    settlement: "online",
    enabled: true,
    publicKey: "pk_live_mastercard_demo",
    secretKey: "demo_live_mastercard_demo",
    webhookSecret: "whsec_mastercard_demo",
    feePercent: 2.9,
    feeFixed: 0.3,
  },
  {
    key: "mada",
    label: "مدى",
    description: "دفع محلي ببطاقات مدى داخل المملكة.",
    settlement: "online",
    enabled: true,
    merchantId: "MID-MADA-1001",
    terminalId: "TERM-01",
    merchantKey: "mada_secret_demo",
    feePercent: 1.75,
    feeFixed: 0,
  },
  {
    key: "apple_pay",
    label: "Apple Pay",
    description: "دفع سريع عبر Apple Pay للأجهزة المدعومة.",
    settlement: "online",
    enabled: false,
    publicKey: "pk_live_apple_demo",
    secretKey: "demo_live_apple_demo",
    webhookSecret: "whsec_apple_demo",
    feePercent: 2.4,
    feeFixed: 0.25,
  },
  {
    key: "stc_pay",
    label: "STC Pay",
    description: "دفع عبر محفظة STC Pay.",
    settlement: "online",
    enabled: true,
    merchantId: "MID-STC-2201",
    terminalId: "STC-TERM-01",
    merchantKey: "stc_secret_demo",
    feePercent: 1.9,
    feeFixed: 0.2,
  },
  {
    key: "paytabs",
    label: "PayTabs",
    description: "بوابة دفع إلكترونية للبطاقات والمحافظ المحلية.",
    settlement: "online",
    enabled: false,
    merchantId: "PT-MERCHANT",
    merchantKey: "paytabs_secret_demo",
    feePercent: 2.7,
    feeFixed: 0.35,
  },
  {
    key: "hyperpay",
    label: "HyperPay",
    description: "بوابة دفع إلكترونية متقدمة للمدفوعات المحلية والدولية.",
    settlement: "online",
    enabled: false,
    merchantId: "HP-MERCHANT",
    terminalId: "HP-TERM-01",
    merchantKey: "hyperpay_secret_demo",
    feePercent: 2.8,
    feeFixed: 0.3,
  },
  {
    key: "cash",
    label: "دفع عند الوصول",
    description: "تأكيد الحجز والمتابعة يدوياً من لوحة الحجوزات.",
    settlement: "offline",
    enabled: false,
    instructions: "يدفع العميل عند الوصول وفق تعليمات المضيف.",
    maxAmount: 5000,
  },
  {
    key: "installments",
    label: "تقسيط Tabby/Tamara",
    description: "خيارات تقسيط مرنة للعميل عبر مزودي التقسيط.",
    settlement: "installment",
    enabled: false,
    merchantId: "INSTALLMENT-MERCHANT",
    merchantKey: "installments_secret_demo",
    feePercent: 3.5,
    feeFixed: 0,
  },
];

function isPaymentMethodKey(value: unknown): value is PaymentMethodKey {
  return defaultPaymentMethods.some((method) => method.key === value);
}

function mergeWithDefaults(methods: Partial<PaymentMethod>[]): PaymentMethod[] {
  return defaultPaymentMethods.map((method) => {
    const saved = methods.find((item) => item.key === method.key) ?? {};
    return {
      ...method,
      ...saved,
      key: method.key,
      enabled: typeof saved.enabled === "boolean" ? saved.enabled : method.enabled,
    };
  });
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as Partial<PaymentMethod>[];
    return mergeWithDefaults(Array.isArray(parsed) ? parsed : []);
  } catch {
    return defaultPaymentMethods;
  }
}

export async function savePaymentMethods(methods: Partial<PaymentMethod>[]): Promise<PaymentMethod[]> {
  const sanitized = methods.filter((method) => isPaymentMethodKey(method.key));
  const normalized = mergeWithDefaults(sanitized);
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  return normalized;
}

export function getEnabledPaymentMethods(methods: PaymentMethod[]): PaymentMethod[] {
  return methods.filter((method) => method.enabled);
}

export type PublicPaymentMethod = Omit<PaymentMethod, "secretKey" | "webhookSecret" | "merchantKey"> & {
  secretKeyPreview?: string;
  webhookSecretPreview?: string;
  merchantKeyPreview?: string;
};

function maskSecret(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const visible = value.slice(-4);
  return `${"•".repeat(8)}${visible}`;
}

export function toPublicPaymentMethod(method: PaymentMethod): PublicPaymentMethod {
  const { secretKey, webhookSecret, merchantKey, ...rest } = method;
  return {
    ...rest,
    secretKeyPreview: maskSecret(secretKey),
    webhookSecretPreview: maskSecret(webhookSecret),
    merchantKeyPreview: maskSecret(merchantKey),
  };
}

