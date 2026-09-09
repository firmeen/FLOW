import {
  paymentFailure,
  paymentSuccess,
  readVoidPaymentRequest,
  voidMerchantPayment,
} from "@/modules/payment-operations/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ paymentId: string }> },
): Promise<Response> {
  try {
    const { paymentId } = await context.params;
    const reason = await readVoidPaymentRequest(request);
    await voidMerchantPayment(paymentId, reason);
    return paymentSuccess({ paymentId, status: "VOIDED" });
  } catch (error) {
    return paymentFailure(error);
  }
}
