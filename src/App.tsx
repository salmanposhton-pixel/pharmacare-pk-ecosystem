import { useEffect, useMemo, useState } from 'react';
import { Search, ShoppingCart, CreditCard, Package, Wifi, WifiOff, Plus, Minus, Trash2 } from 'lucide-react';
import { seedDatabase } from './database/seed';
import { useProducts } from './hooks/useProducts';
import { calculateCartTotals, completeSaleTransaction, type CartLine } from './services/saleService';
import './styles/design.css';

const paymentMethods = ['cash','card','bank','mobile','credit'] as const;

export default function App() {
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentMethods)[number]>('cash');
  const [customerName, setCustomerName] = useState('Walk-in');
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState('');
  const { products, loading } = useProducts(refreshKey);

  useEffect(() => {
    seedDatabase().then(() => setReady(true));
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((product) =>
      !q || [product.name, product.genericName, product.brandName, product.sku, product.barcode].some((value) => value?.toLowerCase().includes(q))
    );
  }, [products, search]);

  const addToCart = (product: typeof products[number]) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stockQuantity) {
        setMessage(`Only ${product.stockQuantity} units are available.`);
        return;
      }
      setCart((current) => current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      return;
    }
    setCart((current) => [...current, { product, quantity: 1 }]);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.product.id !== productId) return item;
          const next = item.quantity + delta;
          return next > 0 ? { ...item, quantity: next } : null;
        })
        .filter(Boolean) as CartLine[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((current) => current.filter((item) => item.product.id !== productId));
  };

  const totals = calculateCartTotals(cart);

  const completeSale = async () => {
    if (!cart.length) {
      setMessage('Add at least one product before completing the sale.');
      return;
    }
    try {
      await completeSaleTransaction({
        customerName,
        paymentMethod,
        userId: 'owner',
        items: cart,
      });
      setCart([]);
      setSearch('');
      setRefreshKey((current) => current + 1);
      setMessage('Sale completed successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sale failed.');
    }
  };

  if (!ready || loading) {
    return <main className="loading">Loading PharmaCare PK…</main>;
  }

  return (
    <div className="shell">
      <aside>
        <div className="brand">
          <div className="brand-mark"><Package size={20}/></div>
          <div>
            <b>PharmaCare</b>
            <small>PK Ecosystem</small>
          </div>
        </div>
        <nav>
          {['Dashboard','POS','Products','Inventory','Purchases','Sales','Customers','Reports','Settings'].map((x,i)=><button key={x} className={i===1?'active':''}>{x}</button>)}
        </nav>
        <div className="offline">
          {online ? <Wifi size={16}/> : <WifiOff size={16}/>} 
          <div>
            {online ? 'Online' : 'Offline'}
            <small>Local database active</small>
          </div>
        </div>
      </aside>

      <main className="content">
        <header>
          <div>
            <span className="eyebrow">PHARMACY OPERATIONS</span>
            <h1>Modern pharmacy control center</h1>
          </div>
        </header>

        <section className="stats">
          <article>
            <span>Products</span>
            <strong>{products.length}</strong>
            <small>Active catalog</small>
          </article>
          <article>
            <span>Cart Items</span>
            <strong>{cart.reduce((sum,item)=>sum+item.quantity,0)}</strong>
            <small>Current sale</small>
          </article>
          <article>
            <span>Connectivity</span>
            <strong>{online ? 'Online' : 'Offline'}</strong>
            <small>Sync ready</small>
          </article>
          <article>
            <span>Today's Sale</span>
            <strong>PKR {totals.total.toLocaleString()}</strong>
            <small>Live POS total</small>
          </article>
        </section>

        {message ? <div className="alert">{message}</div> : null}

        <section className="pos-layout">
          <div className="panel pos-panel">
            <div className="panel-head">
              <div>
                <h2>Point of Sale</h2>
                <p>Fast product lookup, quick checkout, offline-ready.</p>
              </div>
            </div>

            <div className="search-row">
              <div className="search"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product, SKU, barcode…" /></div>
            </div>

            <div className="product-grid">
              {filtered.map((product) => (
                <button key={product.id} className="product-card" onClick={() => addToCart(product)}>
                  <div className="product-card-head">
                    <strong>{product.name}</strong>
                    <span className={product.stockQuantity <= product.reorderLevel ? 'stock-critical' : 'stock-ok'}>{product.stockQuantity} in stock</span>
                  </div>
                  <small>{product.genericName || 'Generic'} • {product.category || 'Uncategorized'}</small>
                  <div className="product-price-row">
                    <b>PKR {product.salePrice.toLocaleString()}</b>
                    <span>{product.taxRate}% tax</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="panel cart-panel">
            <div className="panel-head">
              <div>
                <h2>Current sale</h2>
                <p>{customerName}</p>
              </div>
            </div>

            <div className="customer-input-row">
              <label>Customer</label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in" />
            </div>

            <div className="payment-methods">
              {paymentMethods.map((method) => (
                <button key={method} className={paymentMethod === method ? 'payment-btn active' : 'payment-btn'} onClick={() => setPaymentMethod(method)}>
                  {method.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="cart-items">
              {cart.length === 0 ? <div className="empty">No items added yet.</div> : cart.map((item) => (
                <div key={item.product.id} className="cart-item">
                  <div>
                    <strong>{item.product.name}</strong>
                    <small>PKR {item.product.salePrice.toLocaleString()} each</small>
                  </div>
                  <div className="qty-box">
                    <button onClick={() => updateCartQuantity(item.product.id, -1)}><Minus size={14}/></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.product.id, 1)}><Plus size={14}/></button>
                  </div>
                  <button className="icon-btn" onClick={() => removeFromCart(item.product.id)}><Trash2 size={14}/></button>
                </div>
              ))}
            </div>

            <div className="totals-box">
              <div><span>Subtotal</span><strong>PKR {totals.subtotal.toLocaleString()}</strong></div>
              <div><span>Tax</span><strong>PKR {totals.tax.toLocaleString()}</strong></div>
              <div className="grand-total"><span>Total</span><strong>PKR {totals.total.toLocaleString()}</strong></div>
            </div>

            <div className="checkout-actions">
              <button className="secondary" onClick={() => setCart([])}>Clear cart</button>
              <button className="primary" onClick={completeSale}><CreditCard size={16}/> Complete sale</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
