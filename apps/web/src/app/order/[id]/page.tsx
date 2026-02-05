const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';

type OrderItem = {
  id?: string;
  name?: string;
  quantity?: number;
  price?: number;
  productId?: string;
};

type Order = {
  id: string;
  status?: string;
  total?: number;
  items?: OrderItem[];
  createdAt?: string;
};

async function fetchOrder(id: string): Promise<{ order: Order | null; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/orders/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      return { order: null, error: 'Order not found.' };
    }
    const payload = await res.json();
    return { order: payload };
  } catch {
    return { order: null, error: 'Unable to load order.' };
  }
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const { order, error } = await fetchOrder(params.id);

  if (!order) {
    return (
      <main className="space-y-4">
        <h1 className="text-2xl font-semibold">Order</h1>
        <p className="text-red-600">{error ?? 'Order unavailable.'}</p>
      </main>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
        <span className="rounded bg-gray-100 px-3 py-1 text-sm">{order.status ?? 'Pending'}</span>
      </div>
      {order.createdAt && <p className="text-sm text-gray-700">Placed on {new Date(order.createdAt).toLocaleString()}</p>}
      <section className="space-y-3 rounded border p-4">
        <h2 className="text-lg font-semibold">Items</h2>
        {items.map((item) => (
          <div key={item.id ?? item.productId} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{item.name ?? 'Item'}</p>
              <p className="text-sm text-gray-700">Qty: {item.quantity ?? 0}</p>
            </div>
            {typeof item.price === 'number' && <p>${(item.price * (item.quantity ?? 1)).toFixed(2)}</p>}
          </div>
        ))}
        {items.length === 0 && <p>No items in this order.</p>}
      </section>
      {typeof order.total === 'number' && (
        <div className="flex items-center justify-between rounded border p-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-xl font-bold">${order.total.toFixed(2)}</span>
        </div>
      )}
    </main>
  );
}
