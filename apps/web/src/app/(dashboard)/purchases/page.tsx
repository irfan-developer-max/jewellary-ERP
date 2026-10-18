'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface Vendor {
  id: string;
  code: string;
  name: string;
  phone: string;
}

export default function PurchasesPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<{ items: Vendor[] }>('/vendors', { params: { pageSize: 100 } })
      .then((result) => setVendors(result.items))
      .catch((err: Error) => setError(err.message || 'Could not load vendors'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
        <p className="mt-1 text-sm text-gray-500">Choose a vendor to record a purchase.</p>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-lg bg-white shadow">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading vendors...</p>
        ) : vendors.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No vendors found. Add a vendor before recording a purchase.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {vendors.map((vendor) => (
              <li key={vendor.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-gray-900">{vendor.name}</p>
                  <p className="mt-1 text-xs text-gray-500">{vendor.code}{vendor.phone ? ` · ${vendor.phone}` : ''}</p>
                </div>
                <Link
                  href={`/vendors/${vendor.id}/transactions/new`}
                  className="shrink-0 rounded-md bg-gold-600 px-3 py-2 text-sm font-medium text-white hover:bg-gold-700"
                >
                  New Purchase
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
