'use client';

import { useState } from 'react';
import {
  Settings,
  Store,
  Receipt,
  Shield,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('Shree Jewellers');
  const [tagline, setTagline] = useState('Tradition Meets Trust');
  const [gstin, setGstin] = useState('27AADCS1234F1Z5');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('Shop No. 12, Gold Souk Market, Zaveri Bazaar, Mumbai');
  const [defaultGstRate, setDefaultGstRate] = useState('3.0');
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div className="flex items-center gap-3 border-b border-[#e5d2bc] pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#996025] to-[#d8a24f] text-white shadow-sm">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#28231e]">
            Store & System Settings
          </h1>
          <p className="text-xs text-[#7e6d5b]">
            Manage store profile, GSTIN configuration, and invoice print options.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Profile */}
        <div className="rounded-2xl border border-[#ebd8be] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#f1e4d3]">
            <Store className="h-4 w-4 text-[#a66d2e]" />
            <h2 className="font-serif text-base font-semibold text-[#28231e]">Store Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-[#55473a] mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-xl border border-[#e5d3bc] bg-[#fdfbf7] px-3.5 py-2 text-xs focus:border-[#bd873c] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#55473a] mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-xl border border-[#e5d3bc] bg-[#fdfbf7] px-3.5 py-2 text-xs focus:border-[#bd873c] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#55473a] mb-1">Store Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-[#e5d3bc] bg-[#fdfbf7] px-3.5 py-2 text-xs focus:border-[#bd873c] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-[#55473a] mb-1">GSTIN Number</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full rounded-xl border border-[#e5d3bc] bg-[#fdfbf7] px-3.5 py-2 text-xs focus:border-[#bd873c] focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium text-[#55473a] mb-1">Store Address (Appears on Invoices)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-[#e5d3bc] bg-[#fdfbf7] px-3.5 py-2 text-xs focus:border-[#bd873c] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* GST & Tax Defaults */}
        <div className="rounded-2xl border border-[#ebd8be] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#f1e4d3]">
            <Receipt className="h-4 w-4 text-[#a66d2e]" />
            <h2 className="font-serif text-base font-semibold text-[#28231e]">Tax & Billing Defaults</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-[#55473a] mb-1">Default Gold Jewellery GST Rate (%)</label>
              <input
                type="text"
                value={defaultGstRate}
                onChange={(e) => setDefaultGstRate(e.target.value)}
                className="w-full rounded-xl border border-[#e5d3bc] bg-[#fdfbf7] px-3.5 py-2 text-xs focus:border-[#bd873c] focus:outline-none"
              />
              <span className="text-[10px] text-[#9a8974] mt-1 block">CGST 1.5% + SGST 1.5% for intra-state sales</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2e7d32]">
              <CheckCircle2 className="h-4 w-4" />
              Settings updated successfully!
            </div>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ad7637] via-[#d19a4e] to-[#b47b39] px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-[#613c12]/20 hover:brightness-105 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
