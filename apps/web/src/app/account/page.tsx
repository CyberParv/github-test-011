const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';

type Order = {
  id: string;
  status?: string;
  total?: number;
  createdAt?: string;
};

async function fetchOrders(): Promise<{ orders: Order[]; error?: string; unauthorized?: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders`, { cache: 'no-store' });
    if (res.status === 401) {
      return { orders: [], unauthorized: true };
    }
    if (!res.ok) {
      return { orders: [], error: 'Unable to load orders.' };
    }
    const payload = await res.json();
    const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
    return { orders: items };
  } catch {
    return { orders: [], error: 'Unable to load orders.' };
  }
}

export default async function AccountPage() {
  const { orders, error, unauthorized } = await fetchOrders();

  if (unauthorized) {
    return (
      <main className="space-y-4">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p>Please sign in to view your account and orders.</p>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      {error && <p className="text-red-600">{error}</p>}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Order history</h2>
        {orders.map((order) => (
          <article key={order.id} className="flex items-center justify-between rounded border p-4">
            <div>
              <p className="font-semibold">Order #{order.id}</p>
              {order.createdAt && <p className="text-sm text-gray-700">{new Date(order.createdAt).toLocaleString()}</p>}
              {order.status && <p className="text-sm">Status: {order.status}</p>}
            </div>
            {typeof order.total === 'number' && <p className="text-lg font-bold">${order.total.toFixed(2)}</p>}
          </article>
        ))}
        {orders.length === 0 && !error && <p>No past orders yet.</p>}
      </section>
    </main>
  );
}
