'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

type FulfillmentMethod = 'pickup' | 'delivery';

type FormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  fulfillmentMethod: FulfillmentMethod;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    fulfillmentMethod: 'pickup',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
          },
          notes: form.notes,
          fulfillmentMethod: form.fulfillmentMethod,
        }),
      });
      if (!res.ok) {
        throw new Error('Unable to place order');
      }
      const payload = await res.json();
      const orderId = payload?.id || payload?.orderId;
      if (orderId) {
        router.push(`/order/${orderId}`);
      } else {
        router.push('/order/confirmation');
      }
    } catch {
      setError('Failed to submit order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <form onSubmit={submitOrder} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm font-medium">Name</span>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Email</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Phone</span>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm font-medium">Address</span>
            <input
              required={form.fulfillmentMethod === 'delivery'}
              type="text"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </label>
        </div>

        <label className="space-y-1 block">
          <span className="text-sm font-medium">Notes</span>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="w-full rounded border px-3 py-2"
            rows={3}
          />
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Pickup or delivery</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="fulfillment"
              value="pickup"
              checked={form.fulfillmentMethod === 'pickup'}
              onChange={() => handleChange('fulfillmentMethod', 'pickup')}
            />
            <span>Pickup</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="fulfillment"
              value="delivery"
              checked={form.fulfillmentMethod === 'delivery'}
              onChange={() => handleChange('fulfillmentMethod', 'delivery')}
            />
            <span>Delivery</span>
          </label>
        </fieldset>

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Place order'}
        </button>
      </form>
    </main>
  );
}
