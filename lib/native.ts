/**
 * Utilidades para cuando la web corre dentro de la app nativa (Capacitor).
 * El puente `window.Capacitor` solo existe en la app; en el navegador todas
 * las funciones son no-op y los plugins nunca se descargan.
 */

/** Sufijo que la app nativa agrega al user-agent (ver capacitor.config.ts). */
export const NATIVE_APP_USER_AGENT = "ClubOneApp";

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
};

function capacitor(): CapacitorGlobal | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
}

export function isNativeApp(): boolean {
  return Boolean(capacitor()?.isNativePlatform?.());
}

export function nativePlatform(): "ios" | "android" | "web" {
  const platform = capacitor()?.getPlatform?.();
  return platform === "ios" || platform === "android" ? platform : "web";
}

export async function hapticTap() {
  if (!isNativeApp()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // La vibración es decorativa; si falla no interrumpe la navegación.
  }
}
