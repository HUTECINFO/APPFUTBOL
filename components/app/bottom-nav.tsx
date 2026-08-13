"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Home, Calendar, CreditCard, MessageSquare, User } from "lucide-react";

const navItems = [
  { href: "/app/inicio", label: "Inicio", icon: Home },
  { href: "/app/calendario", label: "Agenda", icon: Calendar },
  { href: "/app/pagos", label: "Pagos", icon: CreditCard },
  { href: "/app/chat", label: "Chat", icon: MessageSquare },
  { href: "/app/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 dock-bottom z-50 mx-auto max-w-md">
      <div className="rounded-[1.75rem] border border-white/10 bg-dark-800/70 px-2 py-2 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="flex items-center">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors",
                  active ? "text-dark-900" : "text-white/50 active:text-white"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="app-nav-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-x-1.5 inset-y-0 rounded-2xl bg-gradient-to-br from-pitch-400 to-pitch-500 pitch-glow"
                  />
                )}
                <Icon className="relative z-10 h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                <span
                  className={cn(
                    "relative z-10 text-[9px] font-semibold uppercase tracking-wider",
                    active ? "text-dark-900" : "text-white/40"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
