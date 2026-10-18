'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { logout } from '@/lib/api';
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  Coins,
  ShoppingCart,
  ShoppingBag,
  ClipboardList,
  Users,
  Truck,
  CreditCard,
  ArrowLeftRight,
  IndianRupee,
  BarChart3,
  FileText,
  UserCheck,
  Settings,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

function DiamondLogo() {
  return (
    <svg className="h-9 w-10 text-[#d8a24f]" viewBox="0 0 72 62" fill="none" aria-hidden="true">
      <path d="M15 5 36 1l21 4 13 18-34 37L2 23 15 5Z" fill="currentColor" />
      <path d="m15 5 8 18 13 37 13-37 8-18M2 23h68M23 23 15 5m34 18 8-18" stroke="#fff9ef" strokeWidth="2.5" />
    </svg>
  );
}

function FloralFlourish() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-0 w-44 text-[#c69a4a]/20"
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M 10 190 C 30 150, 60 140, 90 160 C 120 180, 80 195, 40 195 C 15 195, 5 180, 20 160 C 40 130, 85 125, 120 150 C 150 170, 170 140, 140 110 C 110 80, 60 95, 45 125 C 30 155, 10 130, 25 105 C 45 70, 90 60, 130 80 C 170 100, 190 70, 160 45 C 130 20, 80 30, 65 60"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="90" cy="160" r="4" fill="currentColor" />
      <circle cx="120" cy="150" r="5" fill="currentColor" />
      <circle cx="140" cy="110" r="4" fill="currentColor" />
      <circle cx="130" cy="80" r="5" fill="currentColor" />
      <path
        d="M 25 185 C 40 170, 60 175, 75 190 M 60 140 C 75 130, 95 135, 105 150 M 95 90 C 110 80, 130 85, 140 100"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', href: '/inventory', icon: Package },
  { label: 'Low Stock', href: '/inventory/low-stock', icon: AlertTriangle },
  { label: 'Gold Rate', href: '/inventory/gold-rate', icon: Coins, adminOnly: true },
  { label: 'Purchases', href: '/purchases', icon: ShoppingCart },
  { label: 'Sales / POS', href: '/pos', icon: ShoppingBag },
  { label: 'Orders', href: '/sales', icon: ClipboardList },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Vendors', href: '/vendors', icon: Truck },
  { label: 'Dues & Payments', href: '/dues', icon: CreditCard },
  { label: 'Stock Movements', href: '/stock-movements', icon: ArrowLeftRight, adminOnly: true },
  { label: 'Accounts', href: '/accounts', icon: IndianRupee, adminOnly: true },
  { label: 'Reports', href: '/reports', icon: BarChart3, adminOnly: true },
  { label: 'Audit Log', href: '/audit-log', icon: FileText, adminOnly: true },
  { label: 'Users', href: '/users', icon: UserCheck, adminOnly: true },
  { label: 'Settings', href: '/settings', icon: Settings, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);
  const router = useRouter();

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'ADMIN',
  );
  const activeItem = filteredItems
    .filter((item) => {
      if (item.href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    })
    .sort((a, b) => b.href.length - a.href.length)[0];

  async function handleLogout() {
    await logout();
    clear();
    document.cookie = 'userRole=; path=/; max-age=0';
    router.push('/login');
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-col justify-between border-r border-[#382618] bg-gradient-to-b from-[#180e07] via-[#20140b] to-[#160d06] text-[#bca389] shadow-2xl shrink-0">
      {/* Top Brand Header */}
      <div>
        <div className="flex flex-col items-center border-b border-[#322013] px-6 py-5 text-center">
          <DiamondLogo />
          <h1 className="mt-2.5 font-serif text-lg font-medium tracking-wider text-[#e7c787] uppercase">
            Shree Jewellers
          </h1>
          <div className="mt-1 flex items-center justify-center gap-2 text-[8px] font-semibold tracking-[0.25em] text-[#9c7847] uppercase">
            <span className="h-px w-4 bg-[#7a572a]" />
            Tradition Meets Trust
            <span className="h-px w-4 bg-[#7a572a]" />
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-195px)] no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filteredItems.map((item) => {
            const isActive = activeItem?.label === item.label;
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ad7637] via-[#d19a4e] to-[#b47b39] text-white shadow-md shadow-[#613c12]/40'
                    : 'text-[#baa28c] hover:bg-[#2e1d11]/80 hover:text-[#f8edd9]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-[#a38059] group-hover:text-[#d4aa6d]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${
                    isActive ? 'text-white' : 'text-[#6f5339] opacity-60 group-hover:translate-x-0.5 group-hover:opacity-100'
                  }`}
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Flourish */}
      <div className="relative z-10 border-t border-[#322013] p-3.5 bg-[#140b05]/60 backdrop-blur-xs">
        <FloralFlourish />
        <div className="relative z-10 flex items-center justify-between rounded-xl bg-[#24170d]/80 border border-[#3f2a1b] p-2.5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[#996025] to-[#d8a24f] text-xs font-bold text-white shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="truncate">
              <div className="truncate text-xs font-medium text-[#f1e4d3]">{user?.name || 'Admin'}</div>
              <div className="text-[10px] text-[#93785f] capitalize">{user?.role || 'Administrator'}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
            className="rounded-lg p-1.5 text-[#a8594f] hover:bg-[#3b1c17] hover:text-[#ff7869] transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
