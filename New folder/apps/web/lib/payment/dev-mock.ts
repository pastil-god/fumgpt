export type DevMockPaymentResult = {
  status: "pending_payment";
  paymentReference: string;
  message: string;
};

export async function createDevelopmentMockPayment(orderNumber: string) {
  return {
    status: "pending_payment",
    paymentReference: `DEV-${orderNumber}`,
    message: "این سفارش در حالت توسعه ثبت شده است. می‌توانی در صفحه تایید، وضعیت پرداخت را شبیه‌سازی کنی."
  } satisfies DevMockPaymentResult;
}
