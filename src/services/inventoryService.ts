import type { ID, Product, StockMovement, TaxRate } from '../domain/types';

export type SalesCartItem = {
  product: Product;
  quantity: number;
};

export function calculateTaxAmount(value: number, taxRate: TaxRate) {
  return (value * taxRate) / 100;
}

export function calculateCartSummary(items: SalesCartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  const tax = items.reduce((sum, item) => sum + calculateTaxAmount(item.product.salePrice * item.quantity, item.product.taxRate), 0);
  return { subtotal, tax, total: subtotal + tax };
}

export function generateInvoiceNumber() {
  const time = Date.now().toString().slice(-6);
  return `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${time}`;
}

export function buildStockMovement(record: {
  productId: ID;
  batchId?: ID;
  type: StockMovement['type'];
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  userId: ID;
  reference: string;
}) {
  return {
    id: crypto.randomUUID(),
    ...record,
    createdAt: new Date().toISOString(),
  } satisfies StockMovement;
}
