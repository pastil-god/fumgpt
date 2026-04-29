export type ManualPaymentResult = {
  status: "pending_payment";
  paymentReference?: string;
  message: string;
};

export async function createManualPayment() {
  return {
    status: "pending_payment",
    message: "پرداخت آنلاین هنوز فعال نیست. سفارش ثبت شد و ادامه پرداخت به‌صورت دستی پیگیری می‌شود."
  } satisfies ManualPaymentResult;
}
