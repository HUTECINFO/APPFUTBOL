"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  MoreHorizontal,
  Trophy,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const mobileNav = (clubId: string) => [
  { href: `/club/${clubId}/dashboard`, label: "Inicio", icon: LayoutDashboard },
  { href: `/club/${clubId}/equipos`, label: "Equipos", icon: Users },
  { href: `/club/${clubId}/calendario`, label: "Agenda", icon: Calendar },
  { href: `/club/${clubId}/cobros`, label: "Cobros", icon: CreditCard },
  { href: `/club/${clubId}/configuracion`, label: "Más", icon: MoreHorizontal },
];

const mobileCoachNav = (clubId: string) => [
  { href: `/club/${clubId}/dashboard`, label: "Inicio", icon: LayoutDashboard },
  { href: `/club/${clubId}/equipos`, label: "Equipos", icon: Users },
  { href: `/club/${clubId}/calendario`, label: "Agenda", icon: Calendar },
  { href: `/club/${clubId}/rankings`, label: "Ranking", icon: Trophy },
  { href: `/club/${clubId}/chat`, label: "Chat", icon: MessageSquare },
];

export function ClubHeader() {
  const { data: session } = useSession();
  const params = useParams();
  const pathname = usePathname();
  const clubId = params.clubId as string | undefined;
  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "CLUB_ADMIN";

  return (
    <header className="sticky top-0 z-40 glass border-b border-white/10">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="text-sm text-white/50 lg:hidden">
          <span className="font-display text-white font-semibold">Club One</span>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="hidden sm:flex items-center gap-3">
            <Avatar className="w-8 h-8 border border-white/10">
              <AvatarFallback className="bg-pitch-500/10 text-pitch-400 text-xs">
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="text-white font-medium">{session?.user?.name}</p>
              <p className="text-white/50 text-xs">{session?.user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cerrar sesión"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {clubId && (
        <nav aria-label="Navegación del club" className="lg:hidden grid grid-cols-5 border-t border-white/10 px-1">
          {(isAdmin ? mobileNav(clubId) : mobileCoachNav(clubId)).map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] transition-colors",
                  active ? "text-pitch-400" : "text-white/45 hover:text-white"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-pitch-400 shadow-[0_0_14px_rgba(31,203,107,.8)]"
                  />
                )}
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
