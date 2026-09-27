export type ID = string;
export type TaxRate = 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18;
export const TAX_RATES: TaxRate[] = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
export type PaymentMethod = 'cash'|'card'|'bank'|'mobile'|'credit';
export type MovementType = 'opening'|'purchase'|'sale'|'return'|'transfer'|'adjustment'|'damage'|'expiry';
export interface Product { id: ID; sku: string; barcode?: string; name: string; genericName?: string; brandName?: string; category?: string; unit: string; salePrice: number; purchasePrice: number; taxRate: TaxRate; reorderLevel: number; active: boolean; createdAt: string; updatedAt: string; }
export interface Batch { id: ID; productId: ID; batchNumber: string; expiryDate: string; remainingQuantity: number; purchaseCost: number; salePrice: number; supplierId?: ID; }
export interface StockMovement { id: ID; productId: ID; batchId?: ID; type: MovementType; quantity: number; beforeQuantity: number; afterQuantity: number; reference?: string; createdAt: string; userId: ID; }
export interface Customer { id: ID; name: string; phone?: string; creditLimit: number; balance: number; active: boolean; createdAt: string; }
export interface Sale { id: ID; invoiceNumber: string; customerId?: ID; subtotal: number; tax: number; discount: number; total: number; paymentMethod: PaymentMethod; status: 'completed'|'held'|'cancelled'|'returned'; createdAt: string; userId: ID; }
export interface SaleItem { id: ID; saleId: ID; productId: ID; batchId?: ID; quantity: number; unitPrice: number; unitCost: number; tax: number; discount: number; }
export interface User { id: ID; username: string; passwordHash: string; role: string; active: boolean; createdAt: string; }
export interface AuditLog { id: ID; userId: ID; action: string; entity: string; entityId?: ID; oldValue?: unknown; newValue?: unknown; createdAt: string; }
export interface SyncOperation { id: ID; entity: string; entityId: ID; operation: 'create'|'update'|'delete'; payload: unknown; status: 'pending'|'synced'|'failed'; attempts: number; createdAt: string; }
