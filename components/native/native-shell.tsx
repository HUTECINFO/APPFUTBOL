"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { WifiOff } from "lucide-react";
import { isNativeApp, nativePlatform } from "@/lib/native";

/** Rutas donde el botón atrás de Android minimiza la app en lugar de navegar. */
const ROOT_PATHS = ["/app/inicio", "/login", "/club"];
/** Pestañas de la app móvil: atrás regresa a Inicio. */
const TAB_PATHS = ["/app/calendario", "/app/pagos", "/app/chat", "/app/perfil"];

/**
 * Integra la web con el contenedor nativo de iOS / Android. No renderiza nada
 * en el navegador.
 */
export function NativeShell() {
  const router = useRouter();
  const pathname = usePathname();
  const [native, setNative] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!isNativeApp()) return;
    setNative(true);
    document.documentElement.classList.add("native-app", `native-${nativePlatform()}`);

    const removers: Array<() => void> = [];
    let cancelled = false;

    (async () => {
      const [{ App }, { SplashScreen }, { StatusBar, Style }, { Network }] = await Promise.all([
        import("@capacitor/app"),
        import("@capacitor/splash-screen"),
        import("@capacitor/status-bar"),
        import("@capacitor/network"),
      ]);
      if (cancelled) return;

      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {});

      const back = await App.addListener("backButton", ({ canGoBack }) => {
        const path = window.location.pathname;
        if (ROOT_PATHS.some((root) => path === root || path === `${root}/`)) {
          App.minimizeApp();
        } else if (TAB_PATHS.includes(path)) {
          router.push("/app/inicio");
        } else if (canGoBack) {
          window.history.back();
        } else {
          App.minimizeApp();
        }
      });
      removers.push(() => back.remove());

      const resume = await App.addListener("resume", () => router.refresh());
      removers.push(() => resume.remove());

      const net = await Network.addListener("networkStatusChange", (status) => {
        setOffline(!status.connected);
        if (status.connected) router.refresh();
      });
      removers.push(() => net.remove());
      const status = await Network.getStatus();
      setOffline(!status.connected);
    })().catch(() => {});

    return () => {
      cancelled = true;
      removers.forEach((remove) => remove());
    };
  }, [router]);

  // La landing comercial no tiene sentido dentro de la app instalada.
  useEffect(() => {
    if (native && pathname === "/") router.replace("/app/inicio");
  }, [native, pathname, router]);

  if (!native || !offline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[100] flex items-center justify-center gap-2 bg-amber-500 px-4 pb-2 text-xs font-bold uppercase tracking-wider text-dark-900"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.5rem)" }}
    >
      <WifiOff className="h-4 w-4" /> Sin conexión a internet
    </div>
  );
}
