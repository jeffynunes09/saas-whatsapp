'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authService } from '@/services/authService';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/conversations', label: 'Conversas' },
  { href: '/appointments', label: 'Agendamentos' },
  { href: '/orders', label: 'Pedidos' },
  { href: '/agent', label: 'Agente IA' },
  { href: '/whatsapp', label: 'WhatsApp' },
  { href: '/subscription', label: 'Plano' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border-r border-gray-200 min-h-screen">
      <div className="px-6 py-6 border-b border-gray-100">
        <span className="text-lg font-bold text-primary">ZapBot</span>
      </div>
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => authService.logout()}
          className="w-full px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl text-left transition-colors"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
