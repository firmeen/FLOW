import {
  loadCashierSnapshot,
  paymentFailure,
  paymentSuccess,
  readRecordPaymentRequest,
  recordMerchantPayment,
} from "@/modules/payment-operations/server";

export async function GET(): Promise<Response> {
  try {
    return paymentSuccess(await loadCashierSnapshot());
  } catch (error) {
    return paymentFailure(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const input = await readRecordPaymentRequest(request);
    return paymentSuccess(await recordMerchantPayment(input), 201);
  } catch (error) {
    return paymentFailure(error);
  }
}
