'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

type CartItem = {
  id?: string;
  productId?: string;
  quantity: number;
  price?: number;
  name?: string;
  product?: {
    id: string;
    name: string;
    price?: number;
    imageUrl?: string;
  };
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const loadCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart`, { cache: 'no-store' });
      if (!res.ok) {
        setError('Unable to load cart.');
        setItems([]);
      } else {
        const payload = await res.json();
        const loaded = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
        setItems(loaded);
      }
    } catch {
      setError('Unable to load cart.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (productId: string, quantity: number) => {
    setUpdating(productId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) {
        throw new Error('Unable to update cart');
      }
      await loadCart();
    } catch {
      setError('Failed to update cart.');
    } finally {
      setUpdating(null);
    }
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = item.price ?? item.product?.price ?? 0;
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Cart</h1>
      {loading && <p>Loading cart...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <section className="space-y-4">
        {items.map((item) => {
          const productName = item.name ?? item.product?.name ?? 'Item';
          const productId = item.productId ?? item.product?.id ?? '';
          const price = item.price ?? item.product?.price ?? 0;
          return (
            <article key={productId || item.id} className="rounded border p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{productName}</h2>
                  <p className="text-sm text-gray-700">${price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2">
                    <span className="text-sm">Qty</span>
                    <input
                      type="number"
                      min={0}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(productId, Math.max(0, Number(e.target.value)))}
                      className="w-20 rounded border px-2 py-1"
                      disabled={updating === productId}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => updateQuantity(productId, 0)}
                    className="rounded border px-3 py-1 text-red-600"
                    disabled={updating === productId}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        {!loading && items.length === 0 && <p>Your cart is empty.</p>}
      </section>

      <div className="flex items-center justify-between rounded border p-4">
        <span className="text-lg font-semibold">Subtotal</span>
        <span className="text-xl font-bold">${subtotal.toFixed(2)}</span>
      </div>

      <div className="flex gap-3">
        <Link href="/menu" className="rounded border px-4 py-2">
          Continue shopping
        </Link>
        <Link href="/checkout" className="rounded bg-blue-600 px-4 py-2 text-white">
          Proceed to checkout
        </Link>
      </div>
    </main>
  );
}
