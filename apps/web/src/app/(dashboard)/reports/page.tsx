'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Coins,
  IndianRupee,
  FileText,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Percent,
  Eye,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatINR, formatDate, formatWeight } from '@/lib/format';
import { useAuthStore } from '@/store/auth';

interface ReportData {
  sales: {
    totalCompletedCount: number;
    voidedCount: number;
    grandTotal: number;
    taxableAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalDiscount: number;
    amountPaid: number;
    creditAmount: number;
  };
  payments: Array<{
    mode: string;
    amount: number;
    count: number;
  }>;
  goldRates: Array<{
    purity: string;
    ratePerGm: number;
    updatedAt: string | null;
  }>;
  inventory: {
    totalProducts: number;
    totalStockUnits: number;
    totalGrossWeightGrams: number;
    totalNetWeightGrams: number;
    estimatedStockValuation: number;
    purityBreakdown: Record<
      string,
      { units: number; netWeight: number; grossWeight: number; valuation: number }
    >;
    categories: Array<{ name: string; count: number; netWeight: number }>;
  };
  dues: {
    totalPendingCount: number;
    totalOutstanding: number;
    totalOriginal: number;
    totalRecovered: number;
    overdueCount: number;
    overdueAmount: number;
  };
  recentSales: Array<{
    id: string;
    invoiceNumber: string;
    grandTotal: string;
    taxableAmount: string;
    cgst: string;
    sgst: string;
    status: string;
    createdAt: string;
    customer: { id: string; name: string; phone: string } | null;
    payments: Array<{ mode: string; amount: string }>;
    createdBy: { name: string };
  }>;
}

type TabKey = 'overview' | 'sales' | 'inventory' | 'gst' | 'payments' | 'document';

export default function ReportsPage() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'>('month');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [printDateStr, setPrintDateStr] = useState('');

  useEffect(() => {
    try {
      const now = new Date();
      setPrintDateStr(
        now.toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      );
    } catch {
      setPrintDateStr(new Date().toISOString());
    }
  }, []);

  // Compute date range based on period
  const dateRange = useMemo(() => {
    const now = new Date();
    if (period === 'all') return { from: undefined, to: undefined, label: 'All Historic Business Records' };

    const to = now.toISOString();
    let fromDate = new Date();
    let label = '';

    if (period === 'today') {
      fromDate.setHours(0, 0, 0, 0);
      label = `Today (${formatDate(now.toISOString())})`;
    } else if (period === 'week') {
      fromDate.setDate(now.getDate() - 7);
      label = `Past 7 Days (${formatDate(fromDate.toISOString())} to ${formatDate(to)})`;
    } else if (period === 'month') {
      fromDate.setMonth(now.getMonth() - 1);
      label = `Past 30 Days (${formatDate(fromDate.toISOString())} to ${formatDate(to)})`;
    } else if (period === 'quarter') {
      fromDate.setMonth(now.getMonth() - 3);
      label = `Past Quarter (${formatDate(fromDate.toISOString())} to ${formatDate(to)})`;
    } else if (period === 'year') {
      fromDate.setFullYear(now.getFullYear() - 1);
      label = `Financial Year (${formatDate(fromDate.toISOString())} to ${formatDate(to)})`;
    }

    return { from: fromDate.toISOString(), to, label };
  }, [period]);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | undefined> = {};
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;

      const res = await apiFetch<ReportData>('/reports/overview', { params });
      setData(res);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  function handlePrint() {
    window.print();
  }

  function handleExportCSV() {
    if (!data?.recentSales?.length) {
      alert('No sales data available to export.');
      return;
    }
    const headers = [
      'Invoice Number',
      'Date',
      'Customer',
      'Phone',
      'Taxable Amount',
      'CGST (1.5%)',
      'SGST (1.5%)',
      'Grand Total',
      'Status',
    ];
    const rows = data.recentSales.map((s) => [
      s.invoiceNumber,
      formatDate(s.createdAt),
      s.customer?.name || 'Walk-in Customer',
      s.customer?.phone || '-',
      s.taxableAmount,
      s.cgst,
      s.sgst,
      s.grandTotal,
      s.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shree-jewellers-sales-report-${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const totalGST = (data?.sales.cgst || 0) + (data?.sales.sgst || 0) + (data?.sales.igst || 0);

  return (
    <div>
      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ─── SCREEN-ONLY INTERACTIVE DASHBOARD VIEW (HIDDEN ON PRINT) ─── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="no-print space-y-6 pb-12">
        {/* Top Header Banner */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[#e5d2bc] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#996025] to-[#d8a24f] text-white shadow-sm">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-tight text-[#28231e]">
                  Reports & Financial Analytics
                </h1>
                <p className="text-xs text-[#7e6d5b]">
                  Real-time executive summaries of sales revenue, gold stock valuation, GST tax schedules, and dues.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Period Selector */}
            <div className="flex rounded-xl border border-[#ebd8be] bg-white/80 p-1 shadow-xs text-xs font-medium text-[#724014]">
              {[
                { id: 'today', label: 'Today' },
                { id: 'week', label: '7D' },
                { id: 'month', label: '30D' },
                { id: 'quarter', label: 'Quarter' },
                { id: 'year', label: 'Year' },
                { id: 'all', label: 'All' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id as any)}
                  className={`rounded-lg px-2.5 py-1.5 transition-all ${
                    period === p.id
                      ? 'bg-gradient-to-r from-[#ad7637] to-[#c79148] text-white shadow-xs font-semibold'
                      : 'text-[#7e6d5b] hover:bg-[#f3e5ce] hover:text-[#28231e]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={fetchReport}
              title="Refresh Report"
              className="flex items-center gap-1.5 rounded-xl border border-[#ebd8be] bg-white/80 px-3 py-2 text-xs font-medium text-[#724014] hover:bg-[#f3e5ce] transition-colors shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-[#ebd8be] bg-white/80 px-3 py-2 text-xs font-medium text-[#724014] hover:bg-[#f3e5ce] transition-colors shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#ad7637] via-[#d19a4e] to-[#b47b39] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#613c12]/20 hover:brightness-105 transition-all"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Official Report</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#ebd8be] gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Executive Overview', icon: Layers },
            { id: 'sales', label: 'Sales & Revenue', icon: TrendingUp },
            { id: 'inventory', label: 'Gold Stock & Valuation', icon: Coins },
            { id: 'gst', label: 'GST Tax Schedule (GSTR-1)', icon: Receipt },
            { id: 'payments', label: 'Payment Modes & Dues', icon: CreditCard },
            { id: 'document', label: 'Official Audit Document Preview', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabKey)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-[#a66d2e] text-[#a66d2e] font-semibold bg-[#ebd5b3]/20 rounded-t-xl'
                    : 'border-transparent text-[#7e6d5b] hover:text-[#28231e] hover:border-[#ebd8be]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Loading / Error States */}
        {loading && !data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl border border-[#ebd8be] bg-white/50 animate-pulse p-5" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-[#f1c4bd] bg-[#fff4f1] p-5 text-sm text-[#a12f22]">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-5 w-5" />
              <span>Error fetching report data</span>
            </div>
            <p className="mt-1 text-xs opacity-90">{error}</p>
            <button
              onClick={fetchReport}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#a12f22] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#85251a]"
            >
              Try Again
            </button>
          </div>
        )}

        {data && activeTab !== 'document' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-[#ebd8be] bg-gradient-to-br from-[#ffffff] via-[#fdfaf5] to-[#fbf4e8] p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#87653f]">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Gross Sales ({period})</span>
                  <span className="rounded-full bg-[#f3e3ca] px-2 py-0.5 text-[10px] font-bold text-[#8a531b]">
                    {data.sales.totalCompletedCount} Sales
                  </span>
                </div>
                <div className="mt-2.5 font-serif text-2xl font-bold text-[#28231e]">
                  {formatINR(data.sales.grandTotal)}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#7e6d5b] border-t border-[#f0e2d0] pt-2">
                  <span>Taxable: {formatINR(data.sales.taxableAmount)}</span>
                  <span className="text-[#2e7d32] font-semibold">Paid: {formatINR(data.sales.amountPaid)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#ebd8be] bg-gradient-to-br from-[#ffffff] via-[#fdfaf5] to-[#fbf4e8] p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#87653f]">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Gold Stock Value</span>
                  <Coins className="h-4 w-4 text-[#d8a24f]" />
                </div>
                <div className="mt-2.5 font-serif text-2xl font-bold text-[#28231e]">
                  {formatINR(data.inventory.estimatedStockValuation)}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#7e6d5b] border-t border-[#f0e2d0] pt-2">
                  <span>Net Wt: {formatWeight(data.inventory.totalNetWeightGrams)}</span>
                  <span>{data.inventory.totalStockUnits} Pcs</span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#ebd8be] bg-gradient-to-br from-[#ffffff] via-[#fdfaf5] to-[#fbf4e8] p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#87653f]">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">GST Collected (3%)</span>
                  <Receipt className="h-4 w-4 text-[#a66d2e]" />
                </div>
                <div className="mt-2.5 font-serif text-2xl font-bold text-[#28231e]">
                  {formatINR(totalGST)}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#7e6d5b] border-t border-[#f0e2d0] pt-2">
                  <span>CGST: {formatINR(data.sales.cgst)}</span>
                  <span>SGST: {formatINR(data.sales.sgst)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#ebd8be] bg-gradient-to-br from-[#ffffff] via-[#fdfaf5] to-[#fbf4e8] p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#87653f]">
                  <span className="font-semibold uppercase tracking-wider text-[11px]">Customer Dues</span>
                  <span className="rounded-full bg-[#fde8e4] px-2 py-0.5 text-[10px] font-bold text-[#b72d1f]">
                    {data.dues.totalPendingCount} Pending
                  </span>
                </div>
                <div className="mt-2.5 font-serif text-2xl font-bold text-[#a12f22]">
                  {formatINR(data.dues.totalOutstanding)}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#7e6d5b] border-t border-[#f0e2d0] pt-2">
                  <span className="text-[#b72d1f]">Overdue: {formatINR(data.dues.overdueAmount)}</span>
                  <span className="text-[#2e7d32]">Recovered: {formatINR(data.dues.totalRecovered)}</span>
                </div>
              </div>
            </div>

            {/* TAB 1: OVERVIEW & SALES */}
            {(activeTab === 'overview' || activeTab === 'sales') && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Purity Stock */}
                  <div className="rounded-2xl border border-[#ebd8be] bg-white p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f1e4d3]">
                      <h2 className="font-serif text-base font-semibold text-[#28231e]">Gold Stock by Purity</h2>
                      <span className="text-xs text-[#8a531b] font-medium">Live Spot Rates</span>
                    </div>
                    <div className="mt-4 space-y-3.5">
                      {['K24', 'K22', 'K18', 'K14'].map((purity) => {
                        const item = data.inventory.purityBreakdown[purity] || {
                          units: 0,
                          netWeight: 0,
                          valuation: 0,
                        };
                        const liveRate = data.goldRates.find((r) => r.purity === purity)?.ratePerGm || 0;
                        return (
                          <div
                            key={purity}
                            className="flex items-center justify-between rounded-xl bg-[#fdfbf7] border border-[#f0e5d6] p-3 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#724014]">{purity} Gold</span>
                                <span className="text-[10px] text-[#937b64]">₹{liveRate}/g</span>
                              </div>
                              <div className="text-[11px] text-[#7e6d5b] mt-0.5">
                                {item.units} Pcs • {formatWeight(item.netWeight)}
                              </div>
                            </div>
                            <div className="text-right font-semibold text-[#28231e]">
                              {formatINR(item.valuation)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="rounded-2xl border border-[#ebd8be] bg-white p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f1e4d3]">
                      <h2 className="font-serif text-base font-semibold text-[#28231e]">Payment Settlements</h2>
                      <span className="text-xs text-[#8a531b] font-medium">Channels</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {data.payments.length === 0 ? (
                        <div className="py-8 text-center text-xs text-[#9a8974]">No payments recorded.</div>
                      ) : (
                        data.payments.map((p) => {
                          const pct = data.sales.amountPaid > 0 ? (p.amount / data.sales.amountPaid) * 100 : 0;
                          return (
                            <div key={p.mode} className="space-y-1">
                              <div className="flex justify-between text-xs font-medium">
                                <span className="text-[#55473a]">{p.mode} ({p.count} txns)</span>
                                <span className="font-semibold text-[#28231e]">{formatINR(p.amount)}</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-[#f3ebd8] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#ad7637] to-[#d8a24f]"
                                  style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Tax Summary */}
                  <div className="rounded-2xl border border-[#ebd8be] bg-white p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-[#f1e4d3]">
                      <h2 className="font-serif text-base font-semibold text-[#28231e]">GST Compliance</h2>
                      <span className="text-xs text-[#2e7d32] font-medium flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> HSN 7113
                      </span>
                    </div>
                    <div className="mt-4 space-y-2.5 text-xs text-[#5c4d3e]">
                      <div className="flex justify-between py-1.5 border-b border-[#f7ede1]">
                        <span>Taxable Turnover</span>
                        <span className="font-semibold text-[#28231e]">{formatINR(data.sales.taxableAmount)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#f7ede1]">
                        <span>CGST (1.5%)</span>
                        <span className="font-semibold text-[#28231e]">{formatINR(data.sales.cgst)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#f7ede1]">
                        <span>SGST (1.5%)</span>
                        <span className="font-semibold text-[#28231e]">{formatINR(data.sales.sgst)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#f7ede1]">
                        <span>Discounts Granted</span>
                        <span className="font-semibold text-[#b85d19]">{formatINR(data.sales.totalDiscount)}</span>
                      </div>
                      <div className="flex justify-between py-2 font-bold text-sm text-[#724014] pt-2">
                        <span>Grand Total Turnover</span>
                        <span>{formatINR(data.sales.grandTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Invoices Table */}
                <div className="rounded-2xl border border-[#ebd8be] bg-white shadow-xs overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 border-b border-[#f1e4d3] bg-[#fdfbf7]">
                    <div>
                      <h2 className="font-serif text-base font-semibold text-[#28231e]">
                        Itemized Sales Log ({data.recentSales.length})
                      </h2>
                      <p className="text-xs text-[#7e6d5b] mt-0.5">
                        Invoices generated during this audit period ({period}).
                      </p>
                    </div>
                    <Link
                      href="/sales"
                      className="mt-2 sm:mt-0 text-xs font-semibold text-[#a66d2e] hover:underline flex items-center gap-1"
                    >
                      View All Orders <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#fcf8f2] text-[#7e6d5b] font-medium border-b border-[#f1e4d3]">
                        <tr>
                          <th className="px-4 py-3">Invoice #</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3 text-right">Taxable</th>
                          <th className="px-4 py-3 text-right">CGST</th>
                          <th className="px-4 py-3 text-right">SGST</th>
                          <th className="px-4 py-3 text-right">Grand Total</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f5ece1] text-[#28231e]">
                        {data.recentSales.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-xs text-[#9a8974]">
                              No sales recorded in this period.
                            </td>
                          </tr>
                        ) : (
                          data.recentSales.map((sale) => (
                            <tr key={sale.id} className="hover:bg-[#fbf7f0] transition-colors">
                              <td className="px-4 py-3 font-semibold text-[#724014]">{sale.invoiceNumber}</td>
                              <td className="px-4 py-3 text-[#77736e]">{formatDate(sale.createdAt)}</td>
                              <td className="px-4 py-3">
                                <div className="font-medium">{sale.customer?.name || 'Walk-in Customer'}</div>
                                {sale.customer?.phone && (
                                  <div className="text-[10px] text-[#9a8974]">{sale.customer.phone}</div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right font-medium">{formatINR(sale.taxableAmount)}</td>
                              <td className="px-4 py-3 text-right text-[#77736e]">{formatINR(sale.cgst)}</td>
                              <td className="px-4 py-3 text-right text-[#77736e]">{formatINR(sale.sgst)}</td>
                              <td className="px-4 py-3 text-right font-bold text-[#724014]">{formatINR(sale.grandTotal)}</td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                    sale.status === 'COMPLETED'
                                      ? 'bg-[#e8f5e9] text-[#2e7d32]'
                                      : 'bg-[#ffebee] text-[#c62828]'
                                  }`}
                                >
                                  {sale.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INVENTORY */}
            {activeTab === 'inventory' && (
              <div className="rounded-2xl border border-[#ebd8be] bg-white p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#f1e4d3]">
                  <div>
                    <h2 className="font-serif text-base font-semibold text-[#28231e]">
                      Category Stock Breakdown
                    </h2>
                    <p className="text-xs text-[#7e6d5b] mt-0.5">
                      Net gold weight and piece count across jewellery categories.
                    </p>
                  </div>
                  <Link
                    href="/inventory"
                    className="text-xs font-semibold text-[#a66d2e] hover:underline flex items-center gap-1"
                  >
                    Inventory Manager <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {data.inventory.categories.map((cat) => (
                    <div
                      key={cat.name}
                      className="rounded-xl border border-[#ebd8be] bg-[#fdfbf7] p-4 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#724014]">{cat.name}</span>
                        <Package className="h-4 w-4 text-[#d8a24f]" />
                      </div>
                      <div className="mt-3 flex items-baseline justify-between text-xs">
                        <span className="text-[#7e6d5b]">Units:</span>
                        <span className="font-semibold text-[#28231e]">{cat.count} pcs</span>
                      </div>
                      <div className="mt-1 flex items-baseline justify-between text-xs">
                        <span className="text-[#7e6d5b]">Net Weight:</span>
                        <span className="font-bold text-[#8a531b]">{formatWeight(cat.netWeight)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: GST TAX */}
            {activeTab === 'gst' && (
              <div className="rounded-2xl border border-[#ebd8be] bg-white p-6 shadow-xs space-y-6">
                <div className="border-b border-[#f1e4d3] pb-4">
                  <h2 className="font-serif text-lg font-bold text-[#28231e]">
                    GST Statutory Tax Schedule (HSN 7113)
                  </h2>
                  <p className="text-xs text-[#7e6d5b] mt-1">
                    Ready for monthly GSTR-1 and GSTR-3B filings.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl bg-[#fdfbf7] border border-[#ebd8be] p-4">
                    <div className="text-xs text-[#7e6d5b]">Taxable Turnover</div>
                    <div className="mt-1 font-serif text-xl font-bold text-[#28231e]">
                      {formatINR(data.sales.taxableAmount)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#fdfbf7] border border-[#ebd8be] p-4">
                    <div className="text-xs text-[#7e6d5b]">CGST (1.5%) + SGST (1.5%)</div>
                    <div className="mt-1 font-serif text-xl font-bold text-[#28231e]">
                      {formatINR(data.sales.cgst + data.sales.sgst)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#fdfbf7] border border-[#ebd8be] p-4">
                    <div className="text-xs text-[#7e6d5b]">Grand Total Supply</div>
                    <div className="mt-1 font-serif text-xl font-bold text-[#724014]">
                      {formatINR(data.sales.grandTotal)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PAYMENTS & DUES */}
            {activeTab === 'payments' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-[#ebd8be] bg-white p-6 shadow-xs">
                  <h2 className="font-serif text-base font-semibold text-[#28231e] pb-3 border-b border-[#f1e4d3]">
                    Collections by Mode
                  </h2>
                  <div className="mt-4 space-y-3">
                    {data.payments.map((p) => (
                      <div key={p.mode} className="flex items-center justify-between p-3 rounded-xl bg-[#fdfbf7] border border-[#f1e4d3]">
                        <div>
                          <div className="font-bold text-sm text-[#724014]">{p.mode}</div>
                          <div className="text-xs text-[#7e6d5b]">{p.count} Transactions</div>
                        </div>
                        <div className="text-right font-serif text-base font-bold text-[#28231e]">
                          {formatINR(p.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#ebd8be] bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-[#f1e4d3]">
                    <h2 className="font-serif text-base font-semibold text-[#28231e]">Customer Receivables</h2>
                    <Link href="/dues" className="text-xs font-semibold text-[#a66d2e] hover:underline flex items-center gap-1">
                      Dues <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="mt-4 space-y-3 text-xs">
                    <div className="flex justify-between p-3 rounded-xl bg-[#fdfbf7] border border-[#f1e4d3]">
                      <span>Original Credit Given:</span>
                      <span className="font-semibold">{formatINR(data.dues.totalOriginal)}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-[#e8f5e9]/50 border border-[#c8e6c9]">
                      <span className="text-[#2e7d32]">Amount Recovered:</span>
                      <span className="font-bold text-[#2e7d32]">{formatINR(data.dues.totalRecovered)}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-[#ffebee]/50 border border-[#ffcdd2]">
                      <span className="text-[#c62828] font-medium">Outstanding Balance:</span>
                      <span className="font-bold text-[#c62828]">{formatINR(data.dues.totalOutstanding)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ON-SCREEN AUDIT DOCUMENT PREVIEW TAB */}
        {data && activeTab === 'document' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#fbf6ed] border border-[#ebd8be] p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#a66d2e]" />
                <span className="text-xs text-[#724014] font-medium">
                  This is the exact Industry Standard Audit Statement that prints on A4 paper without sidebars or menus.
                </span>
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg bg-[#a66d2e] px-4 py-2 text-xs font-bold text-white hover:bg-[#8f5a23] transition-colors"
              >
                <Printer className="h-4 w-4" /> Print Document Now
              </button>
            </div>

            {/* Embedded Paper Preview */}
            <div className="border border-[#d8c3aa] bg-white p-8 rounded-2xl shadow-md max-w-4xl mx-auto text-[#111]">
              <IndustryAuditDocument
                data={data}
                periodLabel={dateRange.label}
                printDateStr={printDateStr}
                adminName={user?.name || 'Administrator'}
              />
            </div>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ─── DEDICATED PRINT-ONLY INDUSTRY STANDARD AUDIT STATEMENT ────── */}
      {/* (VISIBLE ONLY DURING WINDOW.PRINT() / A4 PAPER EXPORT)           */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {data && (
        <div className="print-only">
          <IndustryAuditDocument
            data={data}
            periodLabel={dateRange.label}
            printDateStr={printDateStr}
            adminName={user?.name || 'Administrator'}
          />
        </div>
      )}
    </div>
  );
}

// ─── Formal Jewellery Industry Standard Audit Document Component ───
function IndustryAuditDocument({
  data,
  periodLabel,
  printDateStr,
  adminName,
}: {
  data: ReportData;
  periodLabel: string;
  printDateStr: string;
  adminName: string;
}) {
  const totalGST = data.sales.cgst + data.sales.sgst + data.sales.igst;
  const totalGrossWt = data.inventory.totalGrossWeightGrams;
  const totalNetWt = data.inventory.totalNetWeightGrams;

  return (
    <div className="space-y-5 font-serif text-[10pt] leading-normal text-black bg-white">
      {/* ─── 1. Official Jewellery Letterhead Header ─── */}
      <div className="border-b-2 border-black pb-3 text-center">
        <div className="flex items-center justify-center gap-2">
          {/* Diamond Mark */}
          <svg className="h-6 w-7 text-black inline-block" viewBox="0 0 72 62" fill="none">
            <path d="M15 5 36 1l21 4 13 18-34 37L2 23 15 5Z" fill="#333" />
            <path d="m15 5 8 18 13 37 13-37 8-18M2 23h68M23 23 15 5m34 18 8-18" stroke="#fff" strokeWidth="2.5" />
          </svg>
          <span className="text-2xl font-bold uppercase tracking-wider text-black">
            SHREE JEWELLERS
          </span>
        </div>
        <p className="text-[9pt] font-sans italic text-gray-700 mt-0.5 tracking-wide">
          Tradition Meets Trust • Certified Hallmarked Gold, Bullion & Diamond Jewellery
        </p>

        {/* Regulatory & Store Details Bar */}
        <div className="mt-2 text-[8pt] font-sans grid grid-cols-2 sm:grid-cols-4 gap-1 border-t border-gray-300 pt-1.5 text-gray-800">
          <div><strong className="text-black">GSTIN:</strong> 27AADCS1234F1Z5</div>
          <div><strong className="text-black">BIS Hallmark Reg:</strong> HM/MH/916/8842</div>
          <div><strong className="text-black">HSN Code:</strong> 7113 (Gold Jewellery)</div>
          <div><strong className="text-black">State:</strong> 27 (Maharashtra)</div>
        </div>
        <div className="text-[7.5pt] font-sans text-gray-600 mt-1">
          Registered Store: Shop No. 12, Gold Souk Market, Zaveri Bazaar, Mumbai, MH - 400002 • Tel: +91 98765 43210 • Email: audit@shreejewellers.com
        </div>
      </div>

      {/* ─── 2. Statement Title & Metadata Grid ─── */}
      <div className="border border-gray-400 bg-gray-50 p-2.5 rounded-sm page-break-avoid">
        <div className="text-center font-sans font-bold text-xs uppercase tracking-widest border-b border-gray-300 pb-1 mb-2 text-black">
          OFFICIAL BUSINESS PERFORMANCE & FINANCIAL AUDIT STATEMENT
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[8.5pt] font-sans">
          <div>
            <span className="text-gray-500 block text-[7.5pt] uppercase">Audit Period:</span>
            <span className="font-semibold text-black">{periodLabel}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[7.5pt] uppercase">Statement Date:</span>
            <span className="font-semibold text-black">{printDateStr}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[7.5pt] uppercase">Authorized Auditor:</span>
            <span className="font-semibold text-black">{adminName}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[7.5pt] uppercase">Report Reference:</span>
            <span className="font-semibold font-mono text-black">SJ-AUD-{Date.now().toString().slice(-6)}</span>
          </div>
        </div>
      </div>

      {/* ─── 3. Part I: Executive Sales & Taxable Turnover Statement ─── */}
      <div className="page-break-avoid">
        <div className="font-sans font-bold text-[9pt] uppercase tracking-wider text-black border-b border-black pb-1 mb-1.5 flex justify-between">
          <span>Part I: Executive Financial Performance & Turnover Schedule</span>
          <span className="text-[8pt] font-normal text-gray-600">Statutory Currency: Indian Rupee (INR ₹)</span>
        </div>
        <table className="print-table w-full text-[8.5pt] font-sans">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-1 px-2 border border-gray-300 font-bold">Particulars / Accounting Head</th>
              <th className="py-1 px-2 border border-gray-300 text-center font-bold">Tax Rate</th>
              <th className="py-1 px-2 border border-gray-300 text-center font-bold">Transactions</th>
              <th className="py-1 px-2 border border-gray-300 text-right font-bold">Amount (INR ₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="py-1 px-2 border border-gray-300">Gross Sales Value (Inclusive of Taxes)</td>
              <td className="py-1 px-2 border border-gray-300 text-center">-</td>
              <td className="py-1 px-2 border border-gray-300 text-center">{data.sales.totalCompletedCount} Invoices</td>
              <td className="py-1 px-2 border border-gray-300 text-right font-semibold">{formatINR(data.sales.grandTotal)}</td>
            </tr>
            <tr>
              <td className="py-1 px-2 border border-gray-300">Less: Special Customer Trade Discounts</td>
              <td className="py-1 px-2 border border-gray-300 text-center">-</td>
              <td className="py-1 px-2 border border-gray-300 text-center">-</td>
              <td className="py-1 px-2 border border-gray-300 text-right text-gray-700">({formatINR(data.sales.totalDiscount)})</td>
            </tr>
            <tr className="bg-gray-50 font-semibold">
              <td className="py-1 px-2 border border-gray-300">Net Taxable Turnover (Exclusive of GST)</td>
              <td className="py-1 px-2 border border-gray-300 text-center">-</td>
              <td className="py-1 px-2 border border-gray-300 text-center">{data.sales.totalCompletedCount}</td>
              <td className="py-1 px-2 border border-gray-300 text-right font-bold text-black">{formatINR(data.sales.taxableAmount)}</td>
            </tr>
            <tr>
              <td className="py-1 px-2 border border-gray-300">Central Goods and Services Tax (CGST)</td>
              <td className="py-1 px-2 border border-gray-300 text-center font-mono">1.50%</td>
              <td className="py-1 px-2 border border-gray-300 text-center">-</td>
              <td className="py-1 px-2 border border-gray-300 text-right">{formatINR(data.sales.cgst)}</td>
            </tr>
            <tr>
              <td className="py-1 px-2 border border-gray-300">State Goods and Services Tax (SGST)</td>
              <td className="py-1 px-2 border border-gray-300 text-center font-mono">1.50%</td>
              <td className="py-1 px-2 border border-gray-300 text-center">-</td>
              <td className="py-1 px-2 border border-gray-300 text-right">{formatINR(data.sales.sgst)}</td>
            </tr>
            <tr className="bg-gray-100 font-bold border-t-2 border-black">
              <td className="py-1.5 px-2 border border-gray-400">Total Statutory GST Liability (CGST + SGST)</td>
              <td className="py-1.5 px-2 border border-gray-400 text-center font-mono">3.00%</td>
              <td className="py-1.5 px-2 border border-gray-400 text-center">-</td>
              <td className="py-1.5 px-2 border border-gray-400 text-right">{formatINR(totalGST)}</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="py-1 px-2 border border-gray-300">Actual Realized Revenue (Received Inflow)</td>
              <td className="py-1 px-2 border border-gray-300 text-center">-</td>
              <td className="py-1 px-2 border border-gray-300 text-center">-</td>
              <td className="py-1 px-2 border border-gray-300 text-right font-semibold text-green-800">{formatINR(data.sales.amountPaid)}</td>
            </tr>
            <tr>
              <td className="py-1 px-2 border border-gray-300">Receivables Created (Customer Credit / Dues)</td>
              <td className="py-1 px-2 border border-gray-300 text-center">-</td>
              <td className="py-1 px-2 border border-gray-300 text-center">-</td>
              <td className="py-1 px-2 border border-gray-300 text-right text-red-800">{formatINR(data.sales.creditAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ─── 4. Part II: Physical Gold Stock Inventory & Live Asset Valuation Schedule ─── */}
      <div className="page-break-avoid">
        <div className="font-sans font-bold text-[9pt] uppercase tracking-wider text-black border-b border-black pb-1 mb-1.5 flex justify-between">
          <span>Part II: Physical Gold Stock Valuation Schedule (Purity-Wise Audit)</span>
          <span className="text-[8pt] font-normal text-gray-600">Spot Valuations as per BIS Norms</span>
        </div>
        <table className="print-table w-full text-[8.5pt] font-sans">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-1 px-2 border border-gray-300 font-bold">Gold Purity Grade</th>
              <th className="py-1 px-2 border border-gray-300 text-center font-bold">In-Stock Units</th>
              <th className="py-1 px-2 border border-gray-300 text-right font-bold">Gross Wt. (g)</th>
              <th className="py-1 px-2 border border-gray-300 text-right font-bold">Net Gold Wt. (g)</th>
              <th className="py-1 px-2 border border-gray-300 text-right font-bold">Spot Rate (₹/g)</th>
              <th className="py-1 px-2 border border-gray-300 text-right font-bold">Total Valuation (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { code: 'K24', title: '24K Pure Bullion (999.0 Fine Gold)' },
              { code: 'K22', title: '22K Standard Jewellery (916 Hallmarked)' },
              { code: 'K18', title: '18K Diamond / Studded Jewellery (750.0)' },
              { code: 'K14', title: '14K Contemporary Fine Jewellery (585.0)' },
            ].map((p) => {
              const item = data.inventory.purityBreakdown[p.code] || {
                units: 0,
                grossWeight: 0,
                netWeight: 0,
                valuation: 0,
              };
              const liveRate = data.goldRates.find((r) => r.purity === p.code)?.ratePerGm || 0;
              return (
                <tr key={p.code}>
                  <td className="py-1 px-2 border border-gray-300 font-medium">
                    {p.title}
                  </td>
                  <td className="py-1 px-2 border border-gray-300 text-center">{item.units} pcs</td>
                  <td className="py-1 px-2 border border-gray-300 text-right">{item.grossWeight.toFixed(3)} g</td>
                  <td className="py-1 px-2 border border-gray-300 text-right font-semibold">{item.netWeight.toFixed(3)} g</td>
                  <td className="py-1 px-2 border border-gray-300 text-right font-mono">₹{liveRate.toLocaleString('en-IN')}</td>
                  <td className="py-1 px-2 border border-gray-300 text-right font-bold">{formatINR(item.valuation)}</td>
                </tr>
              );
            })}
            <tr className="bg-gray-100 font-bold border-t-2 border-black">
              <td className="py-1.5 px-2 border border-gray-400">TOTAL PRECIOUS BULLION PORTFOLIO</td>
              <td className="py-1.5 px-2 border border-gray-400 text-center">{data.inventory.totalStockUnits} pcs</td>
              <td className="py-1.5 px-2 border border-gray-400 text-right">{totalGrossWt.toFixed(3)} g</td>
              <td className="py-1.5 px-2 border border-gray-400 text-right">{totalNetWt.toFixed(3)} g</td>
              <td className="py-1.5 px-2 border border-gray-400 text-center">-</td>
              <td className="py-1.5 px-2 border border-gray-400 text-right font-extrabold text-black">
                {formatINR(data.inventory.estimatedStockValuation)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ─── 5. Part III: Revenue Realization & Payment Breakdown ─── */}
      <div className="grid grid-cols-2 gap-4 page-break-avoid">
        <div>
          <div className="font-sans font-bold text-[9pt] uppercase tracking-wider text-black border-b border-black pb-1 mb-1.5">
            Part III: Payment Realization Schedule
          </div>
          <table className="print-table w-full text-[8pt] font-sans">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-1 px-2 border border-gray-300 font-bold">Settlement Mode</th>
                <th className="py-1 px-2 border border-gray-300 text-center font-bold">Count</th>
                <th className="py-1 px-2 border border-gray-300 text-right font-bold">Realized (INR ₹)</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.map((p) => (
                <tr key={p.mode}>
                  <td className="py-1 px-2 border border-gray-300 font-medium">{p.mode}</td>
                  <td className="py-1 px-2 border border-gray-300 text-center">{p.count}</td>
                  <td className="py-1 px-2 border border-gray-300 text-right font-semibold">{formatINR(p.amount)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="py-1 px-2 border border-gray-300">Total Settled</td>
                <td className="py-1 px-2 border border-gray-300 text-center">{data.payments.reduce((a, b) => a + b.count, 0)}</td>
                <td className="py-1 px-2 border border-gray-300 text-right font-bold">{formatINR(data.sales.amountPaid)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <div className="font-sans font-bold text-[9pt] uppercase tracking-wider text-black border-b border-black pb-1 mb-1.5">
            Part IV: Customer Dues & Aging Statement
          </div>
          <table className="print-table w-full text-[8pt] font-sans">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-1 px-2 border border-gray-300 font-bold">Receivable Classification</th>
                <th className="py-1 px-2 border border-gray-300 text-center font-bold">Accounts</th>
                <th className="py-1 px-2 border border-gray-300 text-right font-bold">Amount (INR ₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-1 px-2 border border-gray-300">Total Customer Credit Extended</td>
                <td className="py-1 px-2 border border-gray-300 text-center">-</td>
                <td className="py-1 px-2 border border-gray-300 text-right">{formatINR(data.dues.totalOriginal)}</td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-gray-300">Total Credit Recovered / Cleared</td>
                <td className="py-1 px-2 border border-gray-300 text-center">-</td>
                <td className="py-1 px-2 border border-gray-300 text-right text-green-800">{formatINR(data.dues.totalRecovered)}</td>
              </tr>
              <tr className="bg-gray-50 font-semibold">
                <td className="py-1 px-2 border border-gray-300">Current Outstanding Receivables</td>
                <td className="py-1 px-2 border border-gray-300 text-center">{data.dues.totalPendingCount} Accounts</td>
                <td className="py-1 px-2 border border-gray-300 text-right font-bold text-black">{formatINR(data.dues.totalOutstanding)}</td>
              </tr>
              <tr>
                <td className="py-1 px-2 border border-gray-300 text-red-900 font-medium">Critical Overdue Accounts</td>
                <td className="py-1 px-2 border border-gray-300 text-center text-red-900">{data.dues.overdueCount} Accounts</td>
                <td className="py-1 px-2 border border-gray-300 text-right font-bold text-red-900">{formatINR(data.dues.overdueAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 6. Part V: Recent Itemized Invoices Audit Register ─── */}
      <div className="page-break-avoid">
        <div className="font-sans font-bold text-[9pt] uppercase tracking-wider text-black border-b border-black pb-1 mb-1.5 flex justify-between">
          <span>Part V: Audited Sales Invoice Register (Sample Recent Transactions)</span>
          <span className="text-[8pt] font-normal text-gray-600">Showing {Math.min(15, data.recentSales.length)} Invoices</span>
        </div>
        <table className="print-table w-full text-[7.5pt] font-sans">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-1 px-1.5 border border-gray-300 font-bold">#</th>
              <th className="py-1 px-1.5 border border-gray-300 font-bold">Invoice No.</th>
              <th className="py-1 px-1.5 border border-gray-300 font-bold">Date</th>
              <th className="py-1 px-1.5 border border-gray-300 font-bold">Customer Name</th>
              <th className="py-1 px-1.5 border border-gray-300 text-right font-bold">Taxable (₹)</th>
              <th className="py-1 px-1.5 border border-gray-300 text-right font-bold">CGST (₹)</th>
              <th className="py-1 px-1.5 border border-gray-300 text-right font-bold">SGST (₹)</th>
              <th className="py-1 px-1.5 border border-gray-300 text-right font-bold">Total (₹)</th>
              <th className="py-1 px-1.5 border border-gray-300 text-center font-bold">Mode</th>
              <th className="py-1 px-1.5 border border-gray-300 text-center font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.recentSales.slice(0, 15).map((sale, idx) => (
              <tr key={sale.id}>
                <td className="py-0.5 px-1.5 border border-gray-300 text-center text-gray-600">{idx + 1}</td>
                <td className="py-0.5 px-1.5 border border-gray-300 font-mono font-semibold">{sale.invoiceNumber}</td>
                <td className="py-0.5 px-1.5 border border-gray-300">{formatDate(sale.createdAt)}</td>
                <td className="py-0.5 px-1.5 border border-gray-300">{sale.customer?.name || 'Walk-in Customer'}</td>
                <td className="py-0.5 px-1.5 border border-gray-300 text-right">{formatINR(sale.taxableAmount)}</td>
                <td className="py-0.5 px-1.5 border border-gray-300 text-right">{formatINR(sale.cgst)}</td>
                <td className="py-0.5 px-1.5 border border-gray-300 text-right">{formatINR(sale.sgst)}</td>
                <td className="py-0.5 px-1.5 border border-gray-300 text-right font-bold">{formatINR(sale.grandTotal)}</td>
                <td className="py-0.5 px-1.5 border border-gray-300 text-center text-gray-700">{sale.payments?.[0]?.mode || 'CASH'}</td>
                <td className="py-0.5 px-1.5 border border-gray-300 text-center font-semibold text-green-800">{sale.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── 7. Statutory Declaration & Verification Seal ─── */}
      <div className="border border-gray-400 bg-gray-50/50 p-2.5 rounded-sm text-[7.5pt] font-sans leading-relaxed text-gray-700 page-break-avoid">
        <strong className="text-black font-semibold uppercase">Statutory Business & Audit Declaration:</strong>
        <p className="mt-0.5">
          Certified that the particulars and transactional values detailed in this statement are authentic extracts from the Shree Jewellers Enterprise Resource Planning (ERP) database for the specified audit period. All precious bullion weights were logged using certified digital precision balances, and gold valuation figures are calculated based on prevailing market spot prices adhering to the Bureau of Indian Standards (BIS) Hallmarking Guidelines and Central Goods & Services Tax (CGST) Act under HSN Code 7113.
        </p>
      </div>

      {/* ─── 8. Sign-off / Signature Box (Industry Standard) ─── */}
      <div className="pt-6 grid grid-cols-3 gap-6 text-[8pt] font-sans text-center page-break-avoid">
        <div>
          <div className="h-12 border-b border-black mx-4" />
          <div className="font-bold text-black mt-1.5">PREPARED BY</div>
          <div className="text-[7.5pt] text-gray-600">Accounts & Inventory Desk</div>
        </div>

        <div>
          <div className="h-12 border-b border-black mx-4" />
          <div className="font-bold text-black mt-1.5">VERIFIED BY</div>
          <div className="text-[7.5pt] text-gray-600">Store Manager / Internal Auditor</div>
        </div>

        <div>
          <div className="h-12 border-b border-black mx-4 flex items-center justify-center">
            <span className="text-[7pt] text-gray-400 italic">[Official Stamp & Seal]</span>
          </div>
          <div className="font-bold text-black mt-1.5">FOR SHREE JEWELLERS</div>
          <div className="text-[7.5pt] text-gray-600">Authorized Signatory</div>
        </div>
      </div>

      {/* ─── 9. Print Footer ─── */}
      <div className="text-[7pt] font-sans text-gray-500 text-center border-t border-gray-300 pt-2 flex justify-between">
        <span>Shree Jewellers ERP System v2.4 • Confidential Business Audit Report</span>
        <span>Generated: {printDateStr}</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
}
