import { db } from '../database/db';
import { hashPassword } from '../database/seed';
export async function authenticate(username:string,password:string) {
  const user=await db.users.where('username').equals(username).first(); if(!user||!user.active) return null;
  return (await hashPassword(password))===user.passwordHash ? user : null;
}
export const permissions: Record<string,string[]> = { owner:['*'], manager:['products.view','products.create','sales.create','reports.view'], cashier:['products.view','sales.create'] };
export function can(role:string, permission:string) { return permissions[role]?.includes('*') || permissions[role]?.includes(permission) || false; }
