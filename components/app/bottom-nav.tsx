"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Calendar, CreditCard, MessageSquare, User } from "lucide-react";

const navItems = [
  { href: "/app/inicio", label: "Inicio", icon: Home },
  { href: "/app/calendario", label: "Calendario", icon: Calendar },
  { href: "/app/pagos", label: "Pagos", icon: CreditCard },
  { href: "/app/chat", label: "Chat", icon: MessageSquare },
  { href: "/app/perfil", label: "Perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark-900/90 backdrop-blur-xl border-t border-white/10 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full text-xs transition-colors",
                active ? "text-pitch-400" : "text-white/50 hover:text-white"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-xl transition-colors",
                  active ? "bg-pitch-500/10 text-pitch-400" : ""
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
