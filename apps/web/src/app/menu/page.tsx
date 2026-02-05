'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  categoryId?: string;
};

type Category = {
  id: string;
  name: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const PAGE_SIZE = 12;

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`, { cache: 'no-store' });
        if (!res.ok) return;
        const payload = await res.json();
        const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
        setCategories(items);
      } catch {
        // ignore category load errors
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', PAGE_SIZE.toString());
        if (search.trim()) params.set('search', search.trim());
        if (categoryId) params.set('categoryId', categoryId);
        const res = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setError('Unable to load menu.');
          setProducts([]);
          setHasMore(false);
        } else {
          const payload = await res.json();
          const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
          setProducts(items);
          setHasMore(Array.isArray(items) && items.length === PAGE_SIZE);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Unable to load menu.');
          setProducts([]);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [search, categoryId, page]);

  const handleSearchChange = (value: string) => {
    setPage(1);
    setSearch(value);
  };

  const handleCategoryChange = (value: string) => {
    setPage(1);
    setCategoryId(value);
  };

  return (
    <main className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Menu</h1>
          <p className="text-gray-700">Browse products, search, and filter.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            aria-label="Search menu"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search items"
            className="rounded border px-3 py-2"
          />
          <select
            aria-label="Filter by category"
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="rounded border px-3 py-2"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Loading menu...</p>}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="rounded border p-4 shadow-sm">
            <h2 className="text-lg font-semibold">{product.name}</h2>
            {product.description && <p className="text-sm text-gray-700">{product.description}</p>}
            {typeof product.price === 'number' && <p className="mt-2 font-medium">${product.price.toFixed(2)}</p>}
            <Link href={`/product/${product.id}`} className="mt-3 inline-block text-blue-600 hover:underline">
              View details
            </Link>
          </article>
        ))}
        {!loading && products.length === 0 && <p>No items found.</p>}
      </section>

      <nav aria-label="Pagination" className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasMore}
          className="rounded border px-3 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </nav>
    </main>
  );
}
