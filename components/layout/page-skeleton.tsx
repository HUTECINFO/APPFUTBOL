import { cn } from "@/lib/utils";

/** Esqueleto que se muestra al instante mientras el servidor arma la página. */
export function PageSkeleton({ className }: { className?: string }) {
  return (
    <div role="status" aria-label="Cargando" className={cn("animate-pulse space-y-4 p-4", className)}>
      <div className="h-7 w-40 rounded-xl bg-white/10" />
      <div className="h-32 rounded-3xl bg-white/5" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-24 rounded-3xl bg-white/5" />
        <div className="h-24 rounded-3xl bg-white/5" />
      </div>
      <div className="h-20 rounded-3xl bg-white/5" />
      <div className="h-20 rounded-3xl bg-white/5" />
    </div>
  );
}
