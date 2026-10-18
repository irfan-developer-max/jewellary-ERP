'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Package, Plus, Search, Filter, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatINR, formatWeight } from '@/lib/format';

interface Product {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  goldPurity: string;
  grossWeight: string;
  netWeight: string;
  currentStock: number;
  reorderLevel: number;
  isActive: boolean;
  sellingPrice: string | null;
  category: { id: string; name: string };
  vendor: { id: string; name: string; code: string };
}

interface ProductListResponse {
  items: Product[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function InventoryListPage() {
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiFetch<ProductListResponse>('/inventory/products', {
        params: {
          q: search || undefined,
          categoryId: categoryId || undefined,
          page,
          pageSize: 20,
        },
      });
      setData(result);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError(err?.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, [search, page, categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    apiFetch<Array<{ id: string; name: string }>>('/inventory/categories').then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Product */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#27231f]">
            Inventory
          </h1>
          <p className="mt-1 text-xs text-[#77736e]">
            Manage all gold jewellery, diamond sets, weights, purities, and pricing.
          </p>
        </div>

        <Link
          href="/inventory/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ad7637] via-[#d19a4e] to-[#b47b39] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#9c6a28]/25 hover:brightness-105 transition-all hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8974]" />
          <input
            type="text"
            placeholder="Search by name, SKU, or barcode..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="h-10 w-full rounded-xl border border-[#ebd5b3] bg-white/90 pl-10 pr-4 text-xs text-[#28231e] placeholder-[#9a8974] shadow-xs transition-all focus:border-[#bd873c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#bd873c]/20"
          />
        </div>

        <div className="sm:w-60">
          <select
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
            className="h-10 w-full rounded-xl border border-[#ebd5b3] bg-white/90 px-3.5 text-xs text-[#28231e] shadow-xs transition-all focus:border-[#bd873c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#bd873c]/20"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Luxury Table */}
      <div className="rounded-2xl border border-[#ebd5b3] bg-white/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#f2e5d5] text-left text-xs">
            <thead className="bg-[#fcf8f2] border-b border-[#ebd5b3]">
              <tr className="text-[10px] font-semibold text-[#8b8277] uppercase tracking-wider">
                <th className="px-5 py-3.5">SKU</th>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Purity</th>
                <th className="px-5 py-3.5 text-right">Net Wt</th>
                <th className="px-5 py-3.5 text-right">Price</th>
                <th className="px-5 py-3.5 text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5ebdd]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[#8e8579] font-serif italic text-sm">
                    Loading jewellery inventory...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-red-600">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertTriangle className="h-8 w-8 text-red-500" />
                      <p className="font-serif text-sm font-semibold">{error}</p>
                      <button
                        type="button"
                        onClick={fetchProducts}
                        className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-[#ad7637] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#8f5e27]"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[#8e8579]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-8 w-8 text-[#d8a24f]/60" />
                      <p className="font-serif text-sm">No products found</p>
                      <p className="text-[11px] text-[#a1998f]">Try adjusting your search or category filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.items.map((product) => {
                  const isLowStock = product.currentStock <= product.reorderLevel;
                  return (
                    <tr key={product.id} className="hover:bg-[#fdfaf5] transition-colors">
                      {/* SKU */}
                      <td className="px-5 py-3.5 font-mono font-medium">
                        <Link href={`/inventory/${product.id}`} className="text-[#a86e2e] hover:text-[#804f18] hover:underline">
                          {product.sku}
                        </Link>
                      </td>

                      {/* Name */}
                      <td className="px-5 py-3.5 font-medium text-[#27231f]">
                        {product.name}
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5 text-[#77736e]">
                        {product.category?.name || 'General'}
                      </td>

                      {/* Purity */}
                      <td className="px-5 py-3.5">
                        <span className="inline-block rounded-md bg-[#fff7ea] border border-[#f1deb9] px-2 py-0.5 text-[11px] font-semibold text-[#a86e2e]">
                          {product.goldPurity}
                        </span>
                      </td>

                      {/* Net Weight */}
                      <td className="px-5 py-3.5 text-right font-mono text-[#554e46]">
                        {formatWeight(product.netWeight)}
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5 text-right font-semibold text-[#27231f]">
                        {product.sellingPrice ? (
                          formatINR(product.sellingPrice)
                        ) : (
                          <span className="text-[#b8761a] text-[11px] font-normal italic">No rate set</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-3.5 text-right">
                        {isLowStock ? (
                          <span className="inline-block rounded-full bg-[#fde8e8] px-2.5 py-0.5 text-[11px] font-semibold text-[#c53030]">
                            {product.currentStock} left
                          </span>
                        ) : (
                          <span className="font-semibold text-[#27231f]">
                            {product.currentStock}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="px-5 py-3.5 bg-[#fcf8f2] border-t border-[#ebd5b3] flex items-center justify-between text-xs text-[#77736e]">
            <span>
              Showing {((data.pagination.page - 1) * data.pagination.pageSize) + 1}–
              {Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)} of {data.pagination.total} items
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-[#ebd5b3] bg-white px-3 py-1.5 font-medium text-[#27231f] hover:bg-[#fbf6ed] disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="px-2 font-medium text-[#a86e2e]">
                Page {page} of {data.pagination.totalPages}
              </span>
              <button
                disabled={page >= data.pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-[#ebd5b3] bg-white px-3 py-1.5 font-medium text-[#27231f] hover:bg-[#fbf6ed] disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
