import { db } from './db';
import type { Product, User } from '../domain/types';

const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
export async function seedDatabase() {
  if (await db.users.count()) return;
  const user: User = { id:id(), username:'owner', passwordHash: await hashPassword('change-me'), role:'owner', active:true, createdAt:now() };
  await db.users.add(user);
  const products: Product[] = [
    { id:id(), sku:'PAN-500', barcode:'8964001234567', name:'Paracetamol 500mg', genericName:'Paracetamol', brandName:'Panadol', category:'Pain Relief', unit:'box', salePrice:120, purchasePrice:80, taxRate:0, reorderLevel:10, active:true, stockQuantity:80, createdAt:now(), updatedAt:now() },
    { id:id(), sku:'AMX-500', barcode:'8964001234568', name:'Amoxicillin 500mg', genericName:'Amoxicillin', category:'Antibiotic', unit:'box', salePrice:350, purchasePrice:240, taxRate:0, reorderLevel:8, active:true, stockQuantity:55, createdAt:now(), updatedAt:now() },
    { id:id(), sku:'VIT-C', barcode:'8964001234569', name:'Vitamin C 1000mg', genericName:'Vitamin C', brandName:'Generic', category:'Supplement', unit:'strip', salePrice:180, purchasePrice:110, taxRate:0, reorderLevel:15, active:true, stockQuantity:30, createdAt:now(), updatedAt:now() }
  ];
  await db.products.bulkAdd(products);
}
export async function hashPassword(value: string) {
  const data = new TextEncoder().encode(value); const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
