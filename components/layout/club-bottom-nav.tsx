"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Calendar, CreditCard, Trophy, MessageSquare, MoreHorizontal, X, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticTap } from "@/lib/native";
import { clubNavItems } from "@/components/layout/club-sidebar";

const adminDock = (clubId: string) => [
  { href: `/club/${clubId}/dashboard`, label: "Inicio", icon: LayoutDashboard },
  { href: `/club/${clubId}/equipos`, label: "Equipos", icon: Users },
  { href: `/club/${clubId}/calendario`, label: "Agenda", icon: Calendar },
  { href: `/club/${clubId}/cobros`, label: "Cobros", icon: CreditCard },
];

const coachDock = (clubId: string, esColegio: boolean) => [
  { href: `/club/${clubId}/dashboard`, label: "Inicio", icon: LayoutDashboard },
  { href: `/club/${clubId}/equipos`, label: "Equipos", icon: Users },
  { href: `/club/${clubId}/calendario`, label: "Agenda", icon: Calendar },
  esColegio
    ? { href: `/club/${clubId}/rubrica`, label: "Rúbrica", icon: ClipboardCheck }
    : { href: `/club/${clubId}/rankings`, label: "Ranking", icon: Trophy },
  { href: `/club/${clubId}/chat`, label: "Chat", icon: MessageSquare },
];

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/** Navegación del club en celular: dock fijo abajo; "Más" abre el resto de secciones. */
export function ClubBottomNav({ role, esEvento = false, esColegio = false }: { role: string; esEvento?: boolean; esColegio?: boolean }) {
  const params = useParams();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const clubId = params.clubId as string | undefined;
  if (!clubId) return null;

  const isAdmin = role === "SUPER_ADMIN" || role === "CLUB_ADMIN";
  const dock = isAdmin ? adminDock(clubId) : coachDock(clubId, esColegio);
  const dockHrefs = new Set(dock.map((item) => item.href));
  const more = isAdmin ? clubNavItems(clubId, role, esEvento, esColegio).filter((item) => !dockHrefs.has(item.href)) : [];
  const moreActive = more.some((item) => isActive(pathname, item.href));

  const itemClass = (active: boolean) =>
    cn(
      "relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl transition-colors",
      active ? "text-dark-900" : "text-white/50 active:text-white"
    );
  const pill = (
    <motion.span
      layoutId="club-nav-pill"
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="absolute inset-x-1 inset-y-0 rounded-2xl bg-gradient-to-br from-pitch-400 to-pitch-500 pitch-glow"
    />
  );
  const label = (text: string, active: boolean) => (
    <span className={cn("relative z-10 text-[9px] font-semibold uppercase tracking-wider", active ? "text-dark-900" : "text-white/40")}>
      {text}
    </span>
  );

  return (
    <>
      <nav aria-label="Navegación del club" className="fixed inset-x-3 dock-bottom z-50 mx-auto max-w-md lg:hidden">
        <div className="flex items-center rounded-[1.75rem] border border-white/10 bg-dark-800/95 px-2 py-2 shadow-2xl shadow-black/50">
          {dock.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { if (!active) hapticTap(); }}
                aria-current={active ? "page" : undefined}
                className={itemClass(active)}
              >
                {active && pill}
                <Icon className="relative z-10 h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                {label(item.label, active)}
              </Link>
            );
          })}
          {isAdmin && (
            <button type="button" onClick={() => { hapticTap(); setMoreOpen(true); }} className={itemClass(moreActive)}>
              {moreActive && pill}
              <MoreHorizontal className="relative z-10 h-5 w-5" strokeWidth={moreActive ? 2.4 : 2} />
              {label("Más", moreActive)}
            </button>
          )}
        </div>
      </nav>

      <DialogPrimitive.Root open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:hidden" />
          <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-[2rem] border border-white/10 bg-dark-800 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full lg:hidden">
            <div className="mb-3 flex items-center justify-between px-2">
              <DialogPrimitive.Title className="font-display text-lg font-semibold text-white">Más secciones</DialogPrimitive.Title>
              <DialogPrimitive.Close aria-label="Cerrar" className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </div>
            <div className="grid grid-cols-3 gap-2 pb-2">
              {more.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 text-center text-xs font-medium transition-colors",
                      active
                        ? "border-pitch-500/30 bg-pitch-500/10 text-pitch-400"
                        : "border-white/10 bg-white/5 text-white/70 active:bg-white/10"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
