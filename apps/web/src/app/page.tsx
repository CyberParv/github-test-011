import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';

type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
};

async function fetchFeaturedProducts(): Promise<{ data: Product[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products?featured=true`, { cache: 'no-store' });
    if (!res.ok) {
      return { data: [], error: 'Failed to load featured items.' };
    }
    const payload = await res.json();
    const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
    return { data: items };
  } catch {
    return { data: [], error: 'Failed to load featured items.' };
  }
}

export default async function HomePage() {
  const { data: products, error } = await fetchFeaturedProducts();

  return (
    <main className="space-y-8">
      <section className="rounded-lg bg-gray-100 p-8">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="mt-2 text-gray-700">Discover our featured items and explore the full menu.</p>
        <div className="mt-4 flex gap-4">
          <Link href="/menu" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            View Menu
          </Link>
          <Link href="/cart" className="rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50">
            View Cart
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured</h2>
          <Link href="/menu" className="text-blue-600 hover:underline">
            See all
          </Link>
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="rounded border p-4 shadow-sm">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              {product.description && <p className="text-sm text-gray-700">{product.description}</p>}
              {typeof product.price === 'number' && <p className="mt-2 font-medium">${product.price.toFixed(2)}</p>}
              <Link href={`/product/${product.id}`} className="mt-3 inline-block text-blue-600 hover:underline">
                View details
              </Link>
            </article>
          ))}
          {products.length === 0 && !error && <p>No featured items available.</p>}
        </div>
      </section>
    </main>
  );
}
