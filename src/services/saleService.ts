import type { PaymentMethod, Product, TaxRate } from '../domain/types';

export type CartLine = {
  product: Product;
  quantity: number;
};

export function calculateCartTotals(items: CartLine[]) {
  const subtotal = items.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
  const tax = items.reduce((sum, item) => sum + ((item.product.salePrice * item.quantity) * item.product.taxRate) / 100, 0);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

export async function completeSaleTransaction(input: {
  userId: string;
  customerName?: string;
  paymentMethod: PaymentMethod;
  items: CartLine[];
}) {
  if (!input.items.length) throw new Error('Cart cannot be empty.');

  const now = new Date().toISOString();
  const invoiceNumber = `SALE-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-6)}`;

  const saleId = crypto.randomUUID();
  const { subtotal, tax, total } = calculateCartTotals(input.items);

  const saleItems = [] as any[];
  const stockMovements = [] as any[];

  await db.transaction('rw', db.products, db.sales, db.saleItems, db.stockMovements, async () => {
    for (const entry of input.items) {
      const product = await db.products.get(entry.product.id);
      if (!product) throw new Error(`Product ${entry.product.name} not found.`);
      if (entry.quantity > product.stockQuantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`);
      }

      const beforeQuantity = product.stockQuantity;
      const afterQuantity = beforeQuantity - entry.quantity;

      await db.products.update(product.id, {
        stockQuantity: afterQuantity,
        updatedAt: now,
      });

      const saleItemId = crypto.randomUUID();
      saleItems.push({
        id: saleItemId,
        saleId,
        productId: product.id,
        batchId: product.id,
        quantity: entry.quantity,
        unitPrice: entry.product.salePrice,
        unitCost: entry.product.purchasePrice,
        tax: ((entry.product.salePrice * entry.quantity) * entry.product.taxRate) / 100,
        discount: 0,
      });

      stockMovements.push({
        id: crypto.randomUUID(),
        productId: product.id,
        batchId: product.id,
        type: 'sale',
        quantity: entry.quantity,
        beforeQuantity,
        afterQuantity,
        reference: invoiceNumber,
        createdAt: now,
        userId: input.userId,
      });
    }

    const sale = {
      id: saleId,
      invoiceNumber,
      customerId: input.customerName ? `cust-${input.customerName.toLowerCase().replace(/\s+/g, '-')}` : undefined,
      subtotal,
      tax,
      discount: 0,
      total,
      paymentMethod: input.paymentMethod,
      status: 'completed',
      createdAt: now,
      userId: input.userId,
    };

    await db.sales.add(sale);
    await db.saleItems.bulkAdd(saleItems);
    await db.stockMovements.bulkAdd(stockMovements);
  });

  return { saleId, invoiceNumber, subtotal, tax, total };
}

import { db } from '../database/db';
