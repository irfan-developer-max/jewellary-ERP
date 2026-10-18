'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  Wallet,
  Building,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  Receipt,
  Users,
  Truck,
  Plus,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatINR, formatDate } from '@/lib/format';

export default function AccountsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const report = await apiFetch<any>('/reports/overview');
        setData(report);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAccounts();
  }, []);

  const totalCash = data?.payments?.find((p: any) => p.mode === 'CASH')?.amount || 0;
  const totalUpi = data?.payments?.find((p: any) => p.mode === 'UPI')?.amount || 0;
  const totalCard = data?.payments?.find((p: any) => p.mode === 'CARD')?.amount || 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#e5d2bc] pb-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#996025] to-[#d8a24f] text-white shadow-sm">
            <IndianRupee className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#28231e]">
              Accounts & Cash Book
            </h1>
            <p className="text-xs text-[#7e6d5b]">
              Track store cash flows, payment receipts, vendor settlements, and day book.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dues"
            className="rounded-xl border border-[#ebd8be] bg-white/80 px-3 py-2 text-xs font-medium text-[#724014] hover:bg-[#f3e5ce] transition-colors shadow-xs"
          >
            Customer Dues
          </Link>
          <Link
            href="/reports"
            className="rounded-xl bg-gradient-to-r from-[#ad7637] to-[#b47b39] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:brightness-105 transition-all"
          >
            Financial Reports
          </Link>
        </div>
      </div>

      {/* Account Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#ebd8be] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#87653f]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Cash In Register</span>
            <Wallet className="h-4 w-4 text-[#a66d2e]" />
          </div>
          <div className="mt-2 font-serif text-2xl font-bold text-[#28231e]">
            {formatINR(totalCash)}
          </div>
          <p className="mt-1 text-[11px] text-[#7e6d5b]">Collected via Cash Payments</p>
        </div>

        <div className="rounded-2xl border border-[#ebd8be] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#87653f]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">UPI / QR Settlements</span>
            <Building className="h-4 w-4 text-[#a66d2e]" />
          </div>
          <div className="mt-2 font-serif text-2xl font-bold text-[#28231e]">
            {formatINR(totalUpi)}
          </div>
          <p className="mt-1 text-[11px] text-[#7e6d5b]">Bank deposits via UPI QR</p>
        </div>

        <div className="rounded-2xl border border-[#ebd8be] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#87653f]">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Card / POS Machine</span>
            <CreditCard className="h-4 w-4 text-[#a66d2e]" />
          </div>
          <div className="mt-2 font-serif text-2xl font-bold text-[#28231e]">
            {formatINR(totalCard)}
          </div>
          <p className="mt-1 text-[11px] text-[#7e6d5b]">Debit / Credit Card Swipes</p>
        </div>
      </div>

      {/* Day Book Recent Inflows */}
      <div className="rounded-2xl border border-[#ebd8be] bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#f1e4d3] bg-[#fdfbf7] flex items-center justify-between">
          <div>
            <h2 className="font-serif text-base font-semibold text-[#28231e]">Recent Cash Book Entries</h2>
            <p className="text-xs text-[#7e6d5b] mt-0.5">Real-time receipts from retail POS billing</p>
          </div>
          <Link href="/sales" className="text-xs font-semibold text-[#a66d2e] hover:underline">
            View All Sales
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcf8f2] text-[#7e6d5b] font-medium border-b border-[#f1e4d3]">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Customer / Particulars</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3 text-right">Inflow (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5ece1] text-[#28231e]">
              {data?.recentSales?.length ? (
                data.recentSales.slice(0, 10).map((s: any) => (
                  <tr key={s.id} className="hover:bg-[#fbf7f0] transition-colors">
                    <td className="px-4 py-3 text-[#77736e]">{formatDate(s.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold text-[#724014]">{s.invoiceNumber}</td>
                    <td className="px-4 py-3">{s.customer?.name || 'Walk-in Customer'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-[#f4eade] px-2 py-0.5 text-[10px] font-semibold text-[#724014]">
                        {s.payments?.[0]?.mode || 'CASH'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#2e7d32]">
                      +{formatINR(s.grandTotal)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-[#9a8974]">
                    No entries recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
