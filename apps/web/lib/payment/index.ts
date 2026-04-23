import { createDevelopmentMockPayment } from "@/lib/payment/dev-mock";
import { createManualPayment } from "@/lib/payment/manual";

export type PaymentProviderKey = "manual" | "dev_mock";

export type PaymentAttemptResult = {
  status: "pending_payment" | "paid";
  paymentReference?: string;
  message: string;
};

export type PaymentProvider = {
  key: PaymentProviderKey;
  label: string;
  isLive: boolean;
  createPayment: (params: {
    orderId: string;
    orderNumber: string;
    amount: number;
    currency: string;
  }) => Promise<PaymentAttemptResult>;
};

function resolveConfiguredProviderKey(): PaymentProviderKey {
  const configuredValue = (process.env.CHECKOUT_PAYMENT_PROVIDER || "manual").trim().toLowerCase();

  if (configuredValue === "dev_mock" && process.env.NODE_ENV !== "production") {
    return "dev_mock";
  }

  return "manual";
}

export function getPaymentProvider() {
  const providerKey = resolveConfiguredProviderKey();

  if (providerKey === "dev_mock") {
    return {
      key: "dev_mock",
      label: "پرداخت توسعه‌ای",
      isLive: false,
      createPayment: async ({ orderNumber }): Promise<PaymentAttemptResult> =>
        createDevelopmentMockPayment(orderNumber)
    } satisfies PaymentProvider;
  }

  return {
    key: "manual",
    label: "پرداخت دستی",
    isLive: false,
    createPayment: async (): Promise<PaymentAttemptResult> => createManualPayment()
  } satisfies PaymentProvider;
}

export function getPaymentProviderPresentation() {
  return getPaymentProviderPresentationByKey(getPaymentProvider().key);
}

export function getPaymentProviderPresentationByKey(providerKey: string) {
  if (providerKey === "dev_mock") {
    return {
      key: "dev_mock",
      label: "پرداخت توسعه‌ای",
      title: "حالت توسعه و تست",
      description: "پرداخت زنده فعال نیست. سفارش ثبت می‌شود و وضعیت پرداخت فقط برای تست توسعه شبیه‌سازی می‌شود."
    };
  }

  return {
    key: "manual",
    label: "پرداخت دستی",
    title: "ثبت سفارش با پیگیری دستی پرداخت",
    description: "پرداخت آنلاین هنوز وصل نشده است. سفارش شما ثبت می‌شود و ادامه پرداخت از مسیر دستی و شفاف پیگیری خواهد شد."
  };
}

export function canUseDevelopmentPaymentTools() {
  return getPaymentProvider().key === "dev_mock" && process.env.NODE_ENV !== "production";
}
