'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { formatINR, formatDate } from '@/lib/format';
import { useAuthStore } from '@/store/auth';
import { CreditCard, ExternalLink, Copy, Check, MessageSquare, X, AlertCircle } from 'lucide-react';

interface DueItem {
  id: string;
  customerId: string;
  originalAmount: string;
  paidAmount: string;
  balanceAmount: string;
  status: string;
  dueDate: string | null;
  createdAt: string;
  customer: { id: string; name: string; phone: string; email?: string };
  sale: { id: string; invoiceNumber: string; grandTotal: string };
}

export default function DuesListPage() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<{ items: DueItem[]; pagination: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Stripe Modal State
  const [selectedDue, setSelectedDue] = useState<DueItem | null>(null);
  const [stripeLink, setStripeLink] = useState('');
  const [creatingStripe, setCreatingStripe] = useState(false);
  const [stripeError, setStripeError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchDues = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiFetch<{ items: DueItem[]; pagination: any }>('/dues', {
        params: {
          status: statusFilter || undefined,
          overdue: overdueOnly || undefined,
          page,
          pageSize: 20,
        },
      });
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, overdueOnly, page]);

  useEffect(() => { fetchDues(); }, [fetchDues]);

  const isOverdue = (due: DueItem) => {
    if (!due.dueDate) return false;
    return new Date(due.dueDate) < new Date() && (due.status === 'PENDING' || due.status === 'PARTIAL');
  };

  const paidPct = (due: DueItem) => {
    const original = parseFloat(due.originalAmount);
    const paid = parseFloat(due.paidAmount);
    if (original === 0) return 0;
    return Math.round((paid / original) * 100);
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PARTIAL: 'bg-blue-100 text-blue-800',
      CLEARED: 'bg-green-100 text-green-800',
      VOIDED: 'bg-gray-100 text-gray-500',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  async function openStripeModal(due: DueItem) {
    setSelectedDue(due);
    setStripeLink('');
    setStripeError('');
    setCreatingStripe(true);
    setCopied(false);

    try {
      const res = await apiFetch<{ url: string; sessionId: string }>('/payments/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(due.balanceAmount),
          customerName: due.customer.name,
          customerPhone: due.customer.phone,
          customerEmail: due.customer.email,
          dueId: due.id,
          saleId: due.sale.id,
          invoiceNumber: due.sale.invoiceNumber,
        }),
      });
      setStripeLink(res.url);
    } catch (err: any) {
      setStripeError(err.message || 'Failed to generate Stripe payment link');
    } finally {
      setCreatingStripe(false);
    }
  }

  function handleCopy() {
    if (stripeLink) {
      navigator.clipboard.writeText(stripeLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Dues</h1>
        {user?.role === 'ADMIN' && (
          <Link href="/dues/aging" className="bg-[#ad7637] text-white px-4 py-2 rounded-xl hover:bg-[#8f5a23] font-medium text-sm transition-colors shadow-xs">
            Aging Report
          </Link>
        )}
      </div>

      <div className="flex gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-[#e5d3bc] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#bd873c]/30"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PARTIAL">Partial</option>
          <option value="CLEARED">Cleared</option>
          <option value="VOIDED">Voided</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={(e) => { setOverdueOnly(e.target.checked); setPage(1); }}
            className="rounded text-[#ad7637] focus:ring-[#ad7637]"
          />
          Overdue only
        </label>
      </div>

      <div className="bg-white rounded-2xl border border-[#ebd8be] shadow-xs overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#fcf8f2]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Original</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stripe Online Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading customer dues...</td></tr>
            ) : data?.items.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No dues found</td></tr>
            ) : (
              data?.items.map((due) => (
                <tr key={due.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm">
                    <Link href={`/customers/${due.customer.id}`} className="text-[#a66d2e] hover:underline font-medium">
                      {due.customer.name}
                    </Link>
                    <div className="text-xs text-gray-400">{due.customer.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">
                    <Link href={`/dues/${due.id}`} className="text-[#a66d2e] hover:underline">
                      {due.sale.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">{formatINR(due.originalAmount)}</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-red-600">{formatINR(due.balanceAmount)}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${paidPct(due)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{paidPct(due)}%</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{statusBadge(due.status)}</td>
                  <td className={`px-4 py-3 text-sm ${isOverdue(due) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                    {due.dueDate ? formatDate(due.dueDate) : '--'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {due.status !== 'CLEARED' && due.status !== 'VOIDED' && parseFloat(due.balanceAmount) > 0 ? (
                      <button
                        onClick={() => openStripeModal(due)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#d8a24f] bg-gradient-to-r from-[#ad7637] to-[#d19a4e] px-2.5 py-1 text-xs font-semibold text-white hover:brightness-105 shadow-xs transition-all"
                      >
                        <CreditCard className="h-3 w-3" />
                        <span>Pay Link</span>
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Settled</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {data && data.pagination.totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} dues)
            </span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50">Previous</button>
              <button disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Stripe Payment Link Modal */}
      {selectedDue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#ebd8be] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#f1e4d3] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ad7637] text-white">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-gray-900">Stripe Payment Link</h3>
                  <p className="text-xs text-gray-500">Remote collection for Invoice #{selectedDue.sale.invoiceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDue(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Summary Box */}
            <div className="rounded-xl bg-[#fdfbf7] border border-[#f1e4d3] p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Customer:</span>
                <span className="font-semibold text-gray-800">{selectedDue.customer.name} ({selectedDue.customer.phone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Due Balance to Pay:</span>
                <span className="font-bold text-red-600 text-sm">{formatINR(selectedDue.balanceAmount)}</span>
              </div>
            </div>

            {creatingStripe && (
              <div className="py-6 text-center text-xs text-gray-500 flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#ad7637] border-t-transparent" />
                <span>Generating secure Stripe payment session...</span>
              </div>
            )}

            {stripeError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{stripeError}</span>
              </div>
            )}

            {stripeLink && (
              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-600">Checkout Link:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={stripeLink}
                    className="flex-1 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 rounded-xl bg-gray-800 px-3 py-2 text-xs font-semibold text-white hover:bg-black transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <a
                    href={stripeLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#ad7637] bg-white px-3 py-2 text-xs font-semibold text-[#ad7637] hover:bg-[#ad7637]/10 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open Checkout</span>
                  </a>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Dear ${selectedDue.customer.name}, here is your secure payment link for Shree Jewellers invoice #${selectedDue.sale.invoiceNumber} of amount ${formatINR(selectedDue.balanceAmount)}: ${stripeLink}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1fb855] transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp Customer</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
