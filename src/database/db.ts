import { db } from './db';
import type { AuditLog, Batch, Customer, Product, Sale, SaleItem, StockMovement, SyncOperation, User } from '../domain/types';

export class PharmaDatabase extends Dexie {
  products!: Table<Product, string>; batches!: Table<Batch, string>; customers!: Table<Customer, string>;
  sales!: Table<Sale, string>; saleItems!: Table<SaleItem, string>; stockMovements!: Table<StockMovement, string>;
  users!: Table<User, string>; auditLogs!: Table<AuditLog, string>; syncQueue!: Table<SyncOperation, string>;
  constructor() {
    super('pharmacare-pk');
    this.version(1).stores({
      products:'id,sku,barcode,name,genericName,category,active,stockQuantity',
      batches:'id,productId,batchNumber,expiryDate,remainingQuantity',
      customers:'id,name,phone,active',
      sales:'id,invoiceNumber,customerId,createdAt,status',
      saleItems:'id,saleId,productId',
      stockMovements:'id,productId,batchId,type,createdAt',
      users:'id,username,role,active',
      auditLogs:'id,userId,entity,createdAt',
      syncQueue:'id,status,entity,createdAt'
    });
  }
}
export const db = new PharmaDatabase();
