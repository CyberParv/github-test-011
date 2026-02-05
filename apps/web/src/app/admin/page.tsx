import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';

type Product = { id: string; name: string };

type Order = { id: string; status?: string; total?: number; createdAt?: string };

async function fetchRecentOrders(): Promise<{ items: Order[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/orders?limit=5`, { cache: 'no-store' });
    if (!res.ok) {
      return { items: [], error: 'Unable to load orders.' };
    }
    const payload = await res.json();
    const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
    return { items };
  } catch {
    return { items: [], error: 'Unable to load orders.' };
  }
}

async function fetchProducts(): Promise<{ items: Product[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/products?limit=5`, { cache: 'no-store' });
    if (!res.ok) {
      return { items: [], error: 'Unable to load products.' };
    }
    const payload = await res.json();
    const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
    return { items };
  } catch {
    return { items: [], error: 'Unable to load products.' };
  }
}

export default async function AdminDashboardPage() {
  const [{ items: recentOrders, error: ordersError }, { items: products, error: productsError }] = await Promise.all([
    fetchRecentOrders(),
    fetchProducts(),
  ]);

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-gray-700">Overview of recent activity.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products" className="rounded border px-4 py-2">
            Manage Products
          </Link>
          <Link href="/admin/orders" className="rounded border px-4 py-2">
            Manage Orders
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded border p-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          {ordersError && <p className="text-red-600">{ordersError}</p>}
          <ul className="mt-3 space-y-2">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between">
                <span>#{order.id}</span>
                <span>{order.status ?? 'Pending'}</span>
              </li>
            ))}
            {recentOrders.length === 0 && !ordersError && <li>No recent orders.</li>}
          </ul>
        </div>
        <div className="rounded border p-4">
          <h2 className="text-lg font-semibold">Products</h2>
          {productsError && <p className="text-red-600">{productsError}</p>}
          <ul className="mt-3 space-y-2">
            {products.map((product) => (
              <li key={product.id}>{product.name}</li>
            ))}
            {products.length === 0 && !productsError && <li>No products found.</li>}
          </ul>
        </div>
      </section>
    </main>
  );
}
