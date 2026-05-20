"use client";

import Link from 'next/link';
import { Bell, Leaf, Menu, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

const nav = [
  { to: '/map', label: 'Farm Map' },
  { to: '/orchard', label: 'My Orchard' },
  { to: '/carbon', label: 'Carbon' },
  { to: '/delivery', label: 'Delivery' },
  { to: '/community', label: 'Community' },
  { to: '/how-we-grow', label: 'How we grow' }
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f8fbf5]">
      <header className="sticky top-0 z-40 border-b border-grove-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-grove-700">
            <span className="grid h-9 w-9 place-items-center rounded bg-grove-700 text-white"><Leaf size={20} /></span>
            Treekart
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => {
              const isActive = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={`rounded px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-grove-100 text-grove-700' : 'text-ink hover:bg-grove-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <Link href="/profile" className="flex items-center gap-2 rounded bg-ink px-3 py-2 text-sm font-semibold text-white">
                <UserRound size={16} /> {user.name || 'Profile'}
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/signin" className="rounded px-3 py-2 text-sm font-semibold text-grove-700 hover:bg-grove-50">Sign in</Link>
                <Link href="/signup" className="rounded bg-grove-700 px-3 py-2 text-sm font-semibold text-white">Sign up</Link>
              </div>
            )}
            <Bell size={20} className="text-grove-700" />
          </div>
          <button className="rounded border border-grove-100 p-2 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Open navigation">
            <Menu />
          </button>
        </div>
        {open && (
          <div className="border-t border-grove-100 bg-white px-4 py-3 lg:hidden">
            {nav.map((item) => (
              <Link key={item.to} href={item.to} onClick={() => setOpen(false)} className="block rounded px-3 py-2 text-sm font-medium text-ink">
                {item.label}
              </Link>
            ))}
            {user ? (
              <Link href="/profile" onClick={() => setOpen(false)} className="mt-2 block rounded bg-ink px-3 py-2 text-sm font-semibold text-white">
                Profile
              </Link>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href="/signin" onClick={() => setOpen(false)} className="rounded border border-grove-100 px-3 py-2 text-center text-sm font-semibold text-grove-700">Sign in</Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="rounded bg-grove-700 px-3 py-2 text-center text-sm font-semibold text-white">Sign up</Link>
              </div>
            )}
          </div>
        )}
      </header>
      {children}
    </div>
  );
}
