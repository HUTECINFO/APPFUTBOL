import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Building2, Users, CreditCard, TrendingUp } from "lucide-react";

export default async function SuperAdminDashboardPage() {
  const clubs = await db.club.count();
  const clubsActivos = await db.club.count({ where: { activo: true } });
  const jugadores = await db.jugador.count();
  const usuarios = await db.usuario.count();

  const totalMensualidades = await db.mensualidad.aggregate({
    where: { estado: "PAGADO" },
    _sum: { monto: true },
  });

  const mrr = parseFloat(totalMensualidades._sum.monto?.toString() || "0");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard de plataforma</h1>
        <p className="text-white/60">Métricas globales de Club One</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard icon={<Building2 className="w-5 h-5" />} label="Clubes activos" value={clubsActivos} color="pitch" />
        <KpiCard icon={<Users className="w-5 h-5" />} label="Jugadores totales" value={jugadores} color="blue" />
        <KpiCard icon={<CreditCard className="w-5 h-5" />} label="Usuarios" value={usuarios} color="gold" />
        <KpiCard icon={<TrendingUp className="w-5 h-5" />} label="Mensualidades cobradas" value={formatCurrency(mrr)} color="green" isCurrency />
      </div>

      <Card className="glass-panel p-6">
        <h2 className="text-xl font-display font-semibold mb-4">Clubes registrados</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left">Slug</th>
                <th className="px-6 py-3 text-left">Fee mensual</th>
                <th className="px-6 py-3 text-left">% Plataforma</th>
                <th className="px-6 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(await db.club.findMany({ orderBy: { createdAt: "desc" }, take: 10 })).map((c: any) => (
                <tr key={c.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-6 py-4 text-white">{c.nombre}</td>
                  <td className="px-6 py-4 text-white/60">{c.slug}</td>
                  <td className="px-6 py-4 text-white/60">{formatCurrency(parseFloat(c.feeMensual.toString()))}</td>
                  <td className="px-6 py-4 text-white/60">{c.porcentajePlataforma.toString()}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${c.activo ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                      {c.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  color,
  isCurrency,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: "pitch" | "blue" | "gold" | "green";
  isCurrency?: boolean;
}) {
  const colorClasses = {
    pitch: "bg-pitch-500/10 text-pitch-400 border-pitch-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    gold: "bg-gold-500/10 text-gold-400 border-gold-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
  };

  return (
    <Card className="glass-card p-6">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 border ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-3xl font-display font-bold text-white">{value}</p>
      <p className="text-sm text-white/50 mt-1">{label}</p>
    </Card>
  );
}
