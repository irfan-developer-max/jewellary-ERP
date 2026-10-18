'use client';

import { useState, useEffect } from 'react';
import { Bell, Calendar, ChevronDown, Menu, Search, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const user = useAuthStore((s) => s.user);
  const [dateStr, setDateStr] = useState('17 Oct 2026, Saturday');

  useEffect(() => {
    try {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        weekday: 'long',
      };
      // Format as "17 Oct 2026, Saturday"
      const formatted = now.toLocaleDateString('en-GB', options);
      // e.g. "Saturday, 17 Oct 2026" -> rearrange if desired or keep standard
      const parts = formatted.split(', ');
      if (parts.length === 2) {
        setDateStr(`${parts[1]}, ${parts[0]}`);
      } else {
        setDateStr(formatted);
      }
    } catch {
      setDateStr('17 Oct 2026, Saturday');
    }
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#ebd8be] bg-[#fbf6ed]/95 px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex flex-1 items-center gap-4">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle menu"
            className="rounded-lg p-2 text-[#724014] hover:bg-[#f3e5ce] transition-colors md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8974]" />
          <input
            type="text"
            placeholder="Search by product, customer, invoice or SKU..."
            className="h-10 w-full rounded-full border border-[#e5d3bc] bg-white/80 pl-10 pr-4 text-xs text-[#28231e] placeholder-[#9a8974] shadow-sm transition-all focus:border-[#bd873c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#bd873c]/20"
          />
        </div>
      </div>

      {/* Right Actions: Notifications, User, Date */}
      <div className="flex items-center gap-5">
        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-[#724014] hover:bg-[#f3e5ce] transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#e02d1b] text-[10px] font-semibold text-white shadow-sm">
            3
          </span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 rounded-full border border-[#ebd8be] bg-white/70 py-1 pl-1.5 pr-3 shadow-xs">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#a66d2e] to-[#d8a24f] text-xs font-semibold text-white shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <span className="text-xs font-medium text-[#28231e]">
            {user?.name || 'Admin'}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-[#9a8974]" />
        </div>

        {/* Date Display */}
        <div className="hidden items-center gap-2 rounded-xl border border-[#ebd8be] bg-white/70 px-3 py-1.5 text-xs text-[#6e5843] shadow-xs sm:flex">
          <Calendar className="h-4 w-4 text-[#a66d2e]" />
          <span className="font-medium">{dateStr}</span>
        </div>
      </div>
    </header>
  );
}
