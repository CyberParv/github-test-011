import AddToCartButton from './AddToCartButton';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';

type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
};

async function fetchProduct(id: string): Promise<{ product: Product | null; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      return { product: null, error: 'Product not found.' };
    }
    const payload = await res.json();
    return { product: payload };
  } catch {
    return { product: null, error: 'Unable to load product.' };
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { product, error } = await fetchProduct(params.id);

  if (!product) {
    return (
      <main className="space-y-4">
        <h1 className="text-2xl font-semibold">Product</h1>
        <p className="text-red-600">{error ?? 'Product unavailable.'}</p>
      </main>
    );
  }

  return (
    <main className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        {product.description && <p className="text-gray-700">{product.description}</p>}
        {typeof product.price === 'number' && <p className="text-xl font-semibold">${product.price.toFixed(2)}</p>}
      </div>
      <div className="rounded border p-4">
        <AddToCartButton productId={product.id} />
      </div>
    </main>
  );
}
