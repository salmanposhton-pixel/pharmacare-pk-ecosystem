import { useEffect, useState } from 'react';
import { db } from '../database/db';
import type { Product } from '../domain/types';
export function useProducts(refreshKey = 0) {
  const [products,setProducts]=useState<Product[]>([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{ let live=true; db.products.orderBy('name').toArray().then(v=>{ if(live) setProducts(v); }).finally(()=>{ if(live) setLoading(false);}); return ()=>{ live=false; }; },[refreshKey]);
  return { products, loading };
}
