'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Coins,
  ShoppingCart,
  Package,
  Users,
  Plus,
  Truck,
  UserPlus,
  FileText,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

function DiamondIcon() {
  return (
    <svg className="h-7 w-8 text-[#d8a24f]" viewBox="0 0 72 62" fill="none" aria-hidden="true">
      <path d="M15 5 36 1l21 4 13 18-34 37L2 23 15 5Z" fill="currentColor" />
      <path d="m15 5 8 18 13 37 13-37 8-18M2 23h68M23 23 15 5m34 18 8-18" stroke="#fff9ef" strokeWidth="2.5" />
    </svg>
  );
}

function MandalaIcon() {
  return (
    <svg className="h-8 w-8 text-[#d49e4d]" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="16" cy="16" r="4" />
      <path d="M16 2 C19 8, 24 13, 30 16 C24 19, 19 24, 16 30 C13 24, 8 19, 2 16 C8 13, 13 8, 16 2 Z" />
      <circle cx="16" cy="16" r="9" strokeDasharray="1 3" />
    </svg>
  );
}

function MiniBarSparkline() {
  return (
    <div className="flex items-end gap-1 h-9 opacity-80">
      <div className="w-1.5 bg-[#e3b873] rounded-t-xs h-3" />
      <div className="w-1.5 bg-[#d49e4d] rounded-t-xs h-5" />
      <div className="w-1.5 bg-[#caa263] rounded-t-xs h-4" />
      <div className="w-1.5 bg-[#b88232] rounded-t-xs h-7" />
      <div className="w-1.5 bg-[#a97123] rounded-t-xs h-9" />
    </div>
  );
}

function MiniSparklineWave({ isPositive = true }: { isPositive?: boolean }) {
  return (
    <svg className={`h-6 w-20 ${isPositive ? 'text-[#c69a4a]' : 'text-[#d9534f]'}`} viewBox="0 0 80 24" fill="none">
      <path
        d={isPositive ? "M 2 18 Q 20 8, 40 14 T 78 4" : "M 2 6 Q 20 16, 40 10 T 78 20"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [salesPeriod, setSalesPeriod] = useState('This Month');

  return (
    <div className="space-y-6">
      {/* 1. Hero Greeting Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-[#ebd5b3] bg-gradient-to-r from-[#fefbf6] via-[#fdf6ea] to-[#fbf1db] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-[#ebd5b3] bg-white/80 p-3 shadow-xs">
              <MandalaIcon />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#27231f]">
                Good Morning, {user?.name || 'Admin'}
              </h1>
              <p className="mt-1 text-xs md:text-sm text-[#77736e]">
                Here&apos;s what&apos;s happening in your jewellery business today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-[#ebd5b3]">
              <DiamondIcon />
              <div>
                <div className="font-serif italic text-sm text-[#87501d]">Crafting</div>
                <div className="font-serif italic text-base font-semibold text-[#6e3e11]">Golden Stories</div>
              </div>
            </div>

            {/* Banner image with soft fade */}
            <div className="relative h-20 w-52 md:w-64 rounded-xl overflow-hidden shadow-xs border border-[#ebd5b3]">
              <Image
                src="/images/jewellery-banner.jpg"
                alt="Golden Jewellery"
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fbf1db]/20 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics - 4 Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="flex items-center justify-between rounded-2xl border border-[#ebd5b3] bg-white/80 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fdf5e7] border border-[#f3debf] text-[#c69a4a]">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-[#7a746e]">Today&apos;s Sales</div>
              <div className="text-lg md:text-xl font-bold text-[#27231f] tracking-tight mt-0.5">
                ₹ 1,25,680
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#1f874c] mt-0.5">
                <ArrowUpRight className="h-3 w-3" />
                <span>12%</span>
                <span className="font-normal text-[#8d8881]">vs yesterday</span>
              </div>
            </div>
          </div>
          <MiniBarSparkline />
        </div>

        {/* Today's Purchases */}
        <div className="flex items-center justify-between rounded-2xl border border-[#ebd5b3] bg-white/80 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fdf5e7] border border-[#f3debf] text-[#c69a4a]">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-[#7a746e]">Today&apos;s Purchases</div>
              <div className="text-lg md:text-xl font-bold text-[#27231f] tracking-tight mt-0.5">
                ₹ 58,400
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#1f874c] mt-0.5">
                <ArrowUpRight className="h-3 w-3" />
                <span>8%</span>
                <span className="font-normal text-[#8d8881]">vs yesterday</span>
              </div>
            </div>
          </div>
          <MiniBarSparkline />
        </div>

        {/* Total Stock Value */}
        <div className="flex items-center justify-between rounded-2xl border border-[#ebd5b3] bg-white/80 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fdf5e7] border border-[#f3debf] text-[#c69a4a]">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-[#7a746e]">Total Stock Value</div>
              <div className="text-lg md:text-xl font-bold text-[#27231f] tracking-tight mt-0.5">
                ₹ 25,68,900
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#1f874c] mt-0.5">
                <ArrowUpRight className="h-3 w-3" />
                <span>5%</span>
                <span className="font-normal text-[#8d8881]">vs last month</span>
              </div>
            </div>
          </div>
          <MiniBarSparkline />
        </div>

        {/* Total Customers */}
        <div className="flex items-center justify-between rounded-2xl border border-[#ebd5b3] bg-white/80 p-5 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fdf5e7] border border-[#f3debf] text-[#c69a4a]">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-[#7a746e]">Total Customers</div>
              <div className="text-lg md:text-xl font-bold text-[#27231f] tracking-tight mt-0.5">
                1,248
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#1f874c] mt-0.5">
                <ArrowUpRight className="h-3 w-3" />
                <span>10%</span>
                <span className="font-normal text-[#8d8881]">vs last month</span>
              </div>
            </div>
          </div>
          <MiniBarSparkline />
        </div>
      </section>

      {/* 3. Quick Action Buttons Row */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          href="/pos"
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ad7637] via-[#d19a4e] to-[#b47b39] px-4 py-3 text-xs font-semibold text-white shadow-md shadow-[#9c6a28]/25 hover:brightness-105 transition-transform hover:-translate-y-0.5"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>+ New Sale</span>
        </Link>

        <Link
          href="/inventory/new"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#ebd5b3] bg-white/80 px-4 py-3 text-xs font-semibold text-[#27231f] hover:border-[#bd873c] hover:bg-white shadow-xs transition-transform hover:-translate-y-0.5"
        >
          <Package className="h-4 w-4 text-[#bd873c]" />
          <span>+ Add Product</span>
        </Link>

        <Link
          href="/vendors"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#ebd5b3] bg-white/80 px-4 py-3 text-xs font-semibold text-[#27231f] hover:border-[#bd873c] hover:bg-white shadow-xs transition-transform hover:-translate-y-0.5"
        >
          <Truck className="h-4 w-4 text-[#bd873c]" />
          <span>+ New Purchase</span>
        </Link>

        <Link
          href="/customers"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#ebd5b3] bg-white/80 px-4 py-3 text-xs font-semibold text-[#27231f] hover:border-[#bd873c] hover:bg-white shadow-xs transition-transform hover:-translate-y-0.5"
        >
          <UserPlus className="h-4 w-4 text-[#bd873c]" />
          <span>+ Add Customer</span>
        </Link>

        <Link
          href="/sales"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#ebd5b3] bg-white/80 px-4 py-3 text-xs font-semibold text-[#27231f] hover:border-[#bd873c] hover:bg-white shadow-xs transition-transform hover:-translate-y-0.5"
        >
          <FileText className="h-4 w-4 text-[#bd873c]" />
          <span>Create Order</span>
        </Link>

        <Link
          href="/dues"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#ebd5b3] bg-white/80 px-4 py-3 text-xs font-semibold text-[#27231f] hover:border-[#bd873c] hover:bg-white shadow-xs transition-transform hover:-translate-y-0.5"
        >
          <IndianRupee className="h-4 w-4 text-[#bd873c]" />
          <span>Receive Payment</span>
        </Link>
      </section>

      {/* 4. Middle Section: Sales Overview | Metal-wise Stock | Low Stock Items */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Overview (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#ebd5b3] bg-white/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-base font-semibold text-[#27231f]">Sales Overview</h2>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#d8a24f]" />
                <span className="text-[#77736e]">Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#6a421a]" />
                <span className="text-[#77736e]">Purchases</span>
              </div>
              <select
                value={salesPeriod}
                onChange={(e) => setSalesPeriod(e.target.value)}
                className="rounded-lg border border-[#ebd5b3] bg-[#fbf6ed] px-2 py-1 text-xs text-[#27231f] focus:outline-none"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Quarter</option>
              </select>
            </div>
          </div>

          {/* Dual Bar Chart */}
          <div className="h-56 w-full flex items-end justify-between pt-6 pb-2 px-2 border-b border-[#f0e2cf]">
            {[
              { day: '01', sales: 50, purchases: 35 },
              { day: '05', sales: 65, purchases: 48 },
              { day: '10', sales: 40, purchases: 60 },
              { day: '15', sales: 85, purchases: 62 },
              { day: '20', sales: 78, purchases: 72 },
              { day: '25', sales: 95, purchases: 88 },
              { day: '30', sales: 110, purchases: 98 },
            ].map((col) => (
              <div key={col.day} className="flex flex-col items-center gap-2 h-full justify-end">
                <div className="flex items-end gap-1.5 h-44">
                  {/* Purchases bar (dark brown) */}
                  <div
                    style={{ height: `${(col.purchases / 120) * 100}%` }}
                    className="w-3 md:w-3.5 rounded-t-xs bg-[#72451d] hover:bg-[#855122] transition-all"
                    title={`Purchases: ${col.purchases}`}
                  />
                  {/* Sales bar (gold) */}
                  <div
                    style={{ height: `${(col.sales / 120) * 100}%` }}
                    className="w-3 md:w-3.5 rounded-t-xs bg-[#d49e4d] hover:bg-[#e6b162] transition-all"
                    title={`Sales: ${col.sales}`}
                  />
                </div>
                <span className="text-[10px] text-[#9a8974]">{col.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#9a8974] pt-2">
            <span>0</span>
            <span>5L</span>
            <span>10L</span>
            <span>15L</span>
            <span>20L</span>
          </div>
        </div>

        {/* Metal-wise Stock (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-[#ebd5b3] bg-white/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-base font-semibold text-[#27231f]">Metal-wise Stock</h2>
            <Link href="/inventory" className="text-xs text-[#a66d2e] hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {/* Gold */}
            <div className="flex items-center justify-between py-1.5 border-b border-[#f4e9da]">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff8eb] border border-[#ecd9bc] text-[#c69a4a]">
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#27231f]">Gold (24K)</div>
                  <div className="text-[11px] text-[#7a746e]">12.450 kg</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#1f874c]">↑ 0.8%</span>
                <MiniSparklineWave isPositive={true} />
              </div>
            </div>

            {/* Silver */}
            <div className="flex items-center justify-between py-1.5 border-b border-[#f4e9da]">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f7f8f9] border border-[#d6dbe0] text-[#788591]">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#27231f]">Silver</div>
                  <div className="text-[11px] text-[#7a746e]">25.680 kg</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#1f874c]">↑ 1.2%</span>
                <MiniSparklineWave isPositive={true} />
              </div>
            </div>

            {/* Diamonds */}
            <div className="flex items-center justify-between py-1.5 border-b border-[#f4e9da]">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0f8ff] border border-[#cbe3f7] text-[#2c7cb8]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#27231f]">Diamonds</div>
                  <div className="text-[11px] text-[#7a746e]">1,250 pcs</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#1f874c]">↑ 0.5%</span>
                <MiniSparklineWave isPositive={true} />
              </div>
            </div>

            {/* Other Stones */}
            <div className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eefaf4] border border-[#c4ebd7] text-[#1f874c]">
                  <div className="h-3.5 w-3.5 rounded-full bg-[#1f874c] shadow-xs" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#27231f]">Other Stones</div>
                  <div className="text-[11px] text-[#7a746e]">3,460 pcs</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#c7382c]">↓ 0.3%</span>
                <MiniSparklineWave isPositive={false} />
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Items (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-[#ebd5b3] bg-white/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-base font-semibold text-[#27231f]">Low Stock Items</h2>
            <Link href="/inventory/low-stock" className="text-xs text-[#a66d2e] hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {[
              { name: 'Gold Chain 20"', sku: 'CHN-2605-0001', left: 2, iconColor: '#c69a4a' },
              { name: 'Diamond Nose Pin', sku: 'NSP-2605-0001', left: 3, iconColor: '#5a98c8' },
              { name: 'Temple Necklace', sku: 'NKL-2605-0001', left: 4, iconColor: '#b87b2e' },
              { name: 'Gold Bangles (Pair)', sku: 'BNG-2605-0002', left: 5, iconColor: '#d4a250' },
              { name: 'Jhumka Earrings', sku: 'ERG-2605-0001', left: 6, iconColor: '#aa7128' },
            ].map((item) => (
              <div
                key={item.sku}
                className="flex items-center justify-between rounded-xl border border-[#f3e3ce] bg-[#fdfaf5] p-2.5 hover:bg-white hover:border-[#ebd5b3] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff8eb] border border-[#eedcbf] text-[#c69a4a]">
                    <Coins className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#27231f]">{item.name}</div>
                    <div className="text-[10px] text-[#8e877e] font-mono">{item.sku}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#fde8e8] px-2.5 py-0.5 text-[10px] font-semibold text-[#c53030]">
                    {item.left} left
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#9a8974]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Bottom Section: Recent Sales | Recent Purchases */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Table */}
        <div className="rounded-2xl border border-[#ebd5b3] bg-white/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-base font-semibold text-[#27231f]">Recent Sales</h2>
            <Link href="/sales" className="text-xs text-[#a66d2e] hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#ebd5b3] text-[10px] uppercase tracking-wider text-[#8b8277]">
                  <th className="pb-2.5 font-semibold">Invoice No.</th>
                  <th className="pb-2.5 font-semibold">Customer Name</th>
                  <th className="pb-2.5 font-semibold">Date</th>
                  <th className="pb-2.5 font-semibold text-right">Amount</th>
                  <th className="pb-2.5 font-semibold text-center">Payment</th>
                  <th className="pb-2.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5ebdd]">
                {[
                  { inv: 'INV-2026-001', customer: 'Ramesh Kumar', date: '17 Oct 2026', amount: '₹ 1,25,000', status: 'Paid' },
                  { inv: 'INV-2026-002', customer: 'Priya Jewellers', date: '16 Oct 2026', amount: '₹ 85,600', status: 'Pending' },
                  { inv: 'INV-2026-003', customer: 'Srinivas Gold', date: '15 Oct 2026', amount: '₹ 2,10,000', status: 'Paid' },
                  { inv: 'INV-2026-004', customer: 'Lakshmi Ornaments', date: '14 Oct 2026', amount: '₹ 67,800', status: 'Pending' },
                  { inv: 'INV-2026-005', customer: 'Devi Jewellers', date: '13 Oct 2026', amount: '₹ 3,45,000', status: 'Paid' },
                ].map((row) => (
                  <tr key={row.inv} className="hover:bg-[#fbf7f0] transition-colors">
                    <td className="py-2.5 font-mono font-medium text-[#87501d]">{row.inv}</td>
                    <td className="py-2.5 text-[#27231f]">{row.customer}</td>
                    <td className="py-2.5 text-[#77736e]">{row.date}</td>
                    <td className="py-2.5 text-right font-medium text-[#27231f]">{row.amount}</td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          row.status === 'Paid'
                            ? 'bg-[#e7f7ed] text-[#1f874c]'
                            : 'bg-[#fff5e5] text-[#b8761a]'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <button type="button" aria-label="View invoice" className="text-[#8e8579] hover:text-[#27231f] transition-colors">
                        <Eye className="h-3.5 w-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Purchases Table */}
        <div className="rounded-2xl border border-[#ebd5b3] bg-white/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-base font-semibold text-[#27231f]">Recent Purchases</h2>
            <Link href="/vendors" className="text-xs text-[#a66d2e] hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#ebd5b3] text-[10px] uppercase tracking-wider text-[#8b8277]">
                  <th className="pb-2.5 font-semibold">Bill No.</th>
                  <th className="pb-2.5 font-semibold">Vendor Name</th>
                  <th className="pb-2.5 font-semibold">Date</th>
                  <th className="pb-2.5 font-semibold text-right">Amount</th>
                  <th className="pb-2.5 font-semibold text-center">Status</th>
                  <th className="pb-2.5 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f5ebdd]">
                {[
                  { bill: 'PUR-2026-001', vendor: 'Raj Gold Suppliers', date: '17 Oct 2026', amount: '₹ 90,000', status: 'Received' },
                  { bill: 'PUR-2026-002', vendor: 'Sri Gems & Co.', date: '16 Oct 2026', amount: '₹ 1,45,000', status: 'Pending' },
                  { bill: 'PUR-2026-003', vendor: 'National Bullion', date: '14 Oct 2026', amount: '₹ 3,20,000', status: 'Received' },
                  { bill: 'PUR-2026-004', vendor: 'Diamond World', date: '12 Oct 2026', amount: '₹ 2,85,000', status: 'Received' },
                  { bill: 'PUR-2026-005', vendor: 'Silver Line', date: '10 Oct 2026', amount: '₹ 1,10,000', status: 'Pending' },
                ].map((row) => (
                  <tr key={row.bill} className="hover:bg-[#fbf7f0] transition-colors">
                    <td className="py-2.5 font-mono font-medium text-[#87501d]">{row.bill}</td>
                    <td className="py-2.5 text-[#27231f]">{row.vendor}</td>
                    <td className="py-2.5 text-[#77736e]">{row.date}</td>
                    <td className="py-2.5 text-right font-medium text-[#27231f]">{row.amount}</td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          row.status === 'Received'
                            ? 'bg-[#e7f7ed] text-[#1f874c]'
                            : 'bg-[#fff5e5] text-[#b8761a]'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <button type="button" aria-label="View purchase bill" className="text-[#8e8579] hover:text-[#27231f] transition-colors">
                        <Eye className="h-3.5 w-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
