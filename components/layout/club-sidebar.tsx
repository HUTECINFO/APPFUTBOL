"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  Settings,
  MessageSquare,
  Trophy,
  MapPin,
  ClipboardList,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = (clubId: string, role: string) => [
  { href: `/club/${clubId}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
  { href: `/club/${clubId}/equipos`, label: "Equipos", icon: Users },
  { href: `/club/${clubId}/calendario`, label: "Calendario", icon: Calendar },
  ...(role === "SUPER_ADMIN" || role === "CLUB_ADMIN"
    ? [
        { href: `/club/${clubId}/registro`, label: "Registro", icon: ClipboardList },
        { href: `/club/${clubId}/background-checks`, label: "Background checks", icon: ShieldCheck },
      ]
    : []),
  { href: `/club/${clubId}/cobros`, label: "Cobros", icon: CreditCard },
  { href: `/club/${clubId}/sedes`, label: "Sedes", icon: MapPin },
  { href: `/club/${clubId}/rankings`, label: "Rankings", icon: Trophy },
  { href: `/club/${clubId}/chat`, label: "Chat", icon: MessageSquare },
  ...(role === "SUPER_ADMIN" || role === "CLUB_ADMIN"
    ? [{ href: `/club/${clubId}/configuracion`, label: "Configuración", icon: Settings }]
    : []),
];

export function ClubSidebar({ clubNombre, role }: { clubNombre: string; role: string }) {
  const params = useParams();
  const pathname = usePathname();
  const clubId = params.clubId as string;

  return (
    <aside className="hidden lg:flex w-64 flex-col glass-panel h-screen sticky top-0 border-r border-white/10">
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-display font-bold text-gradient">Club One</span>
        </Link>
        <p className="mt-2 text-sm text-white/60 truncate">{clubNombre}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems(clubId, role).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-pitch-500/10 text-pitch-400 border border-pitch-500/20"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              {active && (
                <motion.span
                  layoutId="desktop-nav-active"
                  className="absolute left-0 h-7 w-0.5 rounded-r-full bg-pitch-400 shadow-[0_0_16px_rgba(31,203,107,.8)]"
                />
              )}
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Salir del club
        </Link>
      </div>
    </aside>
  );
}
