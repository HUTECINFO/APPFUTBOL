import { CLUB_ONE_LOGO_URL } from "@/lib/brand-assets";
import { cn } from "@/lib/utils";

type ClubOneMarkProps = {
  className?: string;
  priority?: boolean;
};

export function ClubOneMark({ className, priority = false }: ClubOneMarkProps) {
  return (
    // El logo vive en el bucket público de Supabase. Un <img> directo evita
    // que el optimizador de Next bloquee el dominio remoto en producción.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={CLUB_ONE_LOGO_URL}
      alt="Club One"
      width={48}
      height={48}
      fetchPriority={priority ? "high" : "auto"}
      className={cn("shrink-0", className)}
    />
  );
}
