import type { DiscountType, Order, TableSession } from "@/domain";

import { roundCurrency } from "./helpers";

export interface BillCalculationInput {
  session: TableSession;
  orders: Order[];
  discountType?: DiscountType;
  discountValue?: number;
  serviceChargeEnabled: boolean;
  serviceChargePercent: number;
  vatEnabled: boolean;
  vatPercent: number;
}

export interface BillCalculation {
  subtotal: number;
  discountAmount: number;
  discountedSubtotal: number;
  serviceChargeAmount: number;
  vatAmount: number;
  total: number;
}

export const calculateBill = ({
  session,
  orders,
  discountType = "NONE",
  discountValue = 0,
  serviceChargeEnabled,
  serviceChargePercent,
  vatEnabled,
  vatPercent,
}: BillCalculationInput): BillCalculation => {
  const payableOrders = orders.filter(
    (order) =>
      order.tableSessionId === session.id &&
      !["DRAFT", "REJECTED", "CANCELLED", "VOIDED"].includes(order.status),
  );
  const subtotal = roundCurrency(
    payableOrders.reduce((sum, order) => sum + order.subtotal, 0),
  );
  const requestedDiscount = Math.max(0, discountValue);
  const discountAmount = roundCurrency(
    discountType === "FIXED"
      ? Math.min(subtotal, requestedDiscount)
      : discountType === "PERCENT"
        ? (subtotal * Math.min(requestedDiscount, 100)) / 100
        : 0,
  );
  const discountedSubtotal = roundCurrency(
    Math.max(0, subtotal - discountAmount),
  );
  const normalizedServicePercent = Math.max(0, serviceChargePercent);
  const serviceChargeAmount = roundCurrency(
    serviceChargeEnabled
      ? (discountedSubtotal * normalizedServicePercent) / 100
      : 0,
  );
  const normalizedVatPercent = Math.max(0, vatPercent);
  const vatAmount = roundCurrency(
    vatEnabled
      ? ((discountedSubtotal + serviceChargeAmount) * normalizedVatPercent) / 100
      : 0,
  );
  const total = roundCurrency(
    discountedSubtotal + serviceChargeAmount + vatAmount,
  );

  return {
    subtotal,
    discountAmount,
    discountedSubtotal,
    serviceChargeAmount,
    vatAmount,
    total,
  };
};
