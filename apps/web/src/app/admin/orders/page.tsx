'use client';

import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

type Order = {
  id: string;
  status?: string;
  total?: number;
  createdAt?: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusDraft, setStatusDraft] = useState<Record<string, string>>({});

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders`, { cache: 'no-store' });
      if (!res.ok) {
        setError('Unable to load orders.');
        setOrders([]);
      } else {
        const payload = await res.json();
        const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
        setOrders(items);
        const drafts: Record<string, string> = {};
        items.forEach((order: Order) => {
          drafts[order.id] = order.status ?? '';
        });
        setStatusDraft(drafts);
      }
    } catch {
      setError('Unable to load orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId: string) => {
    const newStatus = statusDraft[orderId];
    setUpdating(orderId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Unable to update');
      await loadOrders();
    } catch {
      setError('Failed to update order.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Manage Orders</h1>
      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Loading orders...</p>}
      <section className="space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="rounded border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                {order.createdAt && <p className="text-sm text-gray-700">{new Date(order.createdAt).toLocaleString()}</p>}
                {typeof order.total === 'number' && <p className="text-sm">Total: ${order.total.toFixed(2)}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={statusDraft[order.id] ?? ''}
                  onChange={(e) => setStatusDraft((prev) => ({ ...prev, [order.id]: e.target.value }))}
                  className="rounded border px-3 py-2"
                  aria-label={`Status for order ${order.id}`}
                />
                <button
                  type="button"
                  onClick={() => updateStatus(order.id)}
                  disabled={updating === order.id}
                  className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  {updating === order.id ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>
          </article>
        ))}
        {!loading && orders.length === 0 && <p>No orders found.</p>}
      </section>
    </main>
  );
}
