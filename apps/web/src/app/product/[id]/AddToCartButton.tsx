'use client';

import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

type Props = {
  productId: string;
};

export default function AddToCartButton({ productId }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const addToCart = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) {
        throw new Error('Unable to add to cart');
      }
      setStatus('success');
      setMessage('Added to cart.');
    } catch {
      setStatus('error');
      setMessage('Failed to add to cart.');
    }
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <span className="text-sm font-medium">Quantity</span>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          className="w-20 rounded border px-2 py-1"
        />
      </label>
      <button
        type="button"
        onClick={addToCart}
        disabled={status === 'loading'}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {status === 'loading' ? 'Adding...' : 'Add to cart'}
      </button>
      {message && <p className={status === 'error' ? 'text-red-600' : 'text-green-600'}>{message}</p>}
    </div>
  );
}
