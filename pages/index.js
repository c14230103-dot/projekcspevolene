// pages/index.js
import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, role } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]); // {product, quantity}
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    setCheckoutResult(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const totalRequested = existing.quantity + 1;
        if (totalRequested > product.stock) {
          alert('Jumlah melebihi stok tersedia');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleChangeQty = (productId, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk checkout.');
      return;
    }
    if (cart.length === 0) {
      alert('Keranjang masih kosong.');
      return;
    }

    setCheckingOut(true);
    setCheckoutResult(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Checkout gagal');
      }
      setCheckoutResult(data);
      setCart([]);
      await fetchProducts(); // refresh stok
    } catch (err) {
      alert(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="page-shop">
      <section className="hero">
        <h1>Evolene Official Replica</h1>
        <p>
          Platform E-Commerce suplemen dengan simulasi transaksi dan pengelolaan
          stok real-time.
        </p>
      </section>

      <div className="shop-layout">
        <section className="catalog-section">
          <h2>Katalog Produk</h2>
          {loading ? (
            <p>Memuat produk...</p>
          ) : (
            <div className="grid-products">
              {products.length === 0 && <p>Belum ada produk.</p>}
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="cart-section">
          <h2>Keranjang</h2>
          {cart.length === 0 ? (
            <p>Keranjang kosong.</p>
          ) : (
            <>
              <ul className="cart-list">
                {cart.map((item) => (
                  <li key={item.product.id} className="cart-item">
                    <div>
                      <strong>{item.product.name}</strong>
                      <p>
                        Rp{' '}
                        {Number(item.product.price).toLocaleString('id-ID')} x{' '}
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleChangeQty(
                              item.product.id,
                              Number(e.target.value)
                            )
                          }
                          className="qty-input"
                        />
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setCart((prev) =>
                          prev.filter(
                            (c) => c.product.id !== item.product.id
                          )
                        )
                      }
                      className="btn-link"
                    >
                      Hapus
                    </button>
                  </li>
                ))}
              </ul>
              <p className="cart-total">
                Total: Rp {cartTotal.toLocaleString('id-ID')}
              </p>
              <button
                className="btn-primary"
                onClick={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? 'Memproses...' : 'Checkout'}
              </button>

              {checkoutResult && (
                <div className="checkout-result">
                  <h3>Pembayaran Berhasil (Simulasi)</h3>
                  <p>Terima kasih! Silakan lakukan pembayaran ke:</p>
                  <p>
                    <strong>No. Rekening: {checkoutResult.bankAccount}</strong>
                  </p>
                  <p>Total: Rp {checkoutResult.total.toLocaleString('id-ID')}</p>
                </div>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
