import { db } from '../database/db';
import type { Product, StockMovement } from '../domain/types';
const id=()=>crypto.randomUUID(); const now=()=>new Date().toISOString();
export async function createProduct(input: Omit<Product,'id'|'createdAt'|'updatedAt'>) {
  const duplicate = await db.products.where('sku').equals(input.sku).first();
  if (duplicate) throw new Error('A product with this SKU already exists.');
  if (input.salePrice < 0 || input.purchasePrice < 0) throw new Error('Prices cannot be negative.');
  const product: Product={...input,id:id(),createdAt:now(),updatedAt:now()}; await db.products.add(product); return product;
}
export async function recordStockMovement(input: Omit<StockMovement,'id'|'createdAt'>) {
  if (input.quantity <= 0) throw new Error('Quantity must be greater than zero.');
  const movement={...input,id:id(),createdAt:now()}; await db.transaction('rw',db.stockMovements,async()=>db.stockMovements.add(movement)); return movement;
}
export async function searchProducts(query: string) {
  const q=query.trim().toLowerCase(); if(!q) return db.products.where('active').equals(1).limit(50).toArray();
  return db.products.filter(p=>p.active && [p.name,p.genericName,p.brandName,p.sku,p.barcode].some(v=>v?.toLowerCase().includes(q))).limit(50).toArray();
}
