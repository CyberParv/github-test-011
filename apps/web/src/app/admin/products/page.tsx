'use client';

import { FormEvent, useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Product>>({});
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', price: '' });

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products`, { cache: 'no-store' });
      if (!res.ok) {
        setError('Unable to load products.');
        setProducts([]);
      } else {
        const payload = await res.json();
        const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
        setProducts(items);
      }
    } catch {
      setError('Unable to load products.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setDraft(product);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          price: draft.price,
        }),
      });
      if (!res.ok) throw new Error('Unable to save');
      setEditingId(null);
      setDraft({});
      await loadProducts();
    } catch {
      setError('Failed to update product.');
    }
  };

  const createProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description,
          price: Number(createForm.price) || 0,
        }),
      });
      if (!res.ok) throw new Error('Unable to create');
      setCreateForm({ name: '', description: '', price: '' });
      await loadProducts();
    } catch {
      setError('Failed to create product.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Manage Products</h1>
      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Loading products...</p>}

      <section className="space-y-3">
        {products.map((product) => (
          <article key={product.id} className="rounded border p-4 shadow-sm">
            {editingId === product.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={draft.name ?? ''}
                  onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded border px-3 py-2"
                />
                <textarea
                  value={draft.description ?? ''}
                  onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded border px-3 py-2"
                  rows={3}
                />
                <input
                  type="number"
                  value={draft.price ?? 0}
                  onChange={(e) => setDraft((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full rounded border px-3 py-2"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={saveEdit} className="rounded bg-blue-600 px-4 py-2 text-white">
                    Save
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} className="rounded border px-4 py-2">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{product.name}</h2>
                  {product.description && <p className="text-sm text-gray-700">{product.description}</p>}
                  {typeof product.price === 'number' && <p className="font-medium">${product.price.toFixed(2)}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(product)}
                  className="rounded border px-3 py-1"
                >
                  Edit
                </button>
              </div>
            )}
          </article>
        ))}
        {!loading && products.length === 0 && <p>No products available.</p>}
      </section>

      <section className="rounded border p-4">
        <h2 className="text-lg font-semibold">Create Product</h2>
        <form onSubmit={createProduct} className="mt-3 space-y-2">
          <input
            required
            type="text"
            placeholder="Name"
            value={createForm.name}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full rounded border px-3 py-2"
          />
          <textarea
            placeholder="Description"
            value={createForm.description}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full rounded border px-3 py-2"
            rows={3}
          />
          <input
            required
            type="number"
            placeholder="Price"
            value={createForm.price}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, price: e.target.value }))}
            className="w-full rounded border px-3 py-2"
          />
          <button
            type="submit"
            disabled={creating}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </form>
      </section>
    </main>
  );
}
