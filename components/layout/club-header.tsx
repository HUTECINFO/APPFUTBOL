"use client";

import { useSession } from "next-auth/react";
import { signOutTo } from "@/lib/sign-out";
import { isNativeApp } from "@/lib/native";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import { ClubOneMark } from "@/components/branding/club-one-mark";

export function ClubHeader() {
  const { data: session } = useSession();

  return (
    <header className="safe-area-pt sticky top-0 z-40 glass border-b border-white/10">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-white/50 lg:hidden">
          <ClubOneMark className="h-7 w-7" priority />
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
            onClick={() => signOutTo(isNativeApp() ? "/login" : "/")}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
