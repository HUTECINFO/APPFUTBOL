"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Download, Plus, Minus } from "lucide-react";
import Link from "next/link";

interface PizarraTacticaProps {
  equipo: any;
  clubId: string;
  role: string;
}

const FIELD_WIDTH = 480;
const FIELD_HEIGHT = 720;

const formations: Record<string, Record<string, { x: number; y: number }>> = {
  "4-3-3": {
    portero: { x: 50, y: 92 },
    ld: { x: 75, y: 72 },
    dcd: { x: 60, y: 72 },
    dci: { x: 40, y: 72 },
    li: { x: 25, y: 72 },
    mcd: { x: 60, y: 52 },
    mco: { x: 50, y: 52 },
    mci: { x: 40, y: 52 },
    ed: { x: 75, y: 28 },
    dc: { x: 50, y: 20 },
    ei: { x: 25, y: 28 },
  },
  "4-4-2": {
    portero: { x: 50, y: 92 },
    ld: { x: 75, y: 72 },
    dcd: { x: 60, y: 72 },
    dci: { x: 40, y: 72 },
    li: { x: 25, y: 72 },
    emd: { x: 75, y: 52 },
    mcd: { x: 60, y: 52 },
    mci: { x: 40, y: 52 },
    emi: { x: 25, y: 52 },
    dd: { x: 60, y: 28 },
    di: { x: 40, y: 28 },
  },
};

export function PizarraTactica({ equipo, clubId, role }: PizarraTacticaProps) {
  const router = useRouter();
  const svgRef = useRef<SVGSVGElement>(null);
  const canEdit = ["SUPER_ADMIN", "CLUB_ADMIN", "ENTRENADOR"].includes(role);

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(
    equipo.formaciones?.[0]?.esquema || formations["4-3-3"]
  );
  const [formationName, setFormationName] = useState("4-3-3");
  const [saveName, setSaveName] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const players = [
    { key: "portero", label: "POR", color: "#F2B33D" },
    { key: "li", label: "LI", color: "#3B82F6" },
    { key: "dci", label: "DCI", color: "#3B82F6" },
    { key: "dcd", label: "DCD", color: "#3B82F6" },
    { key: "ld", label: "LD", color: "#3B82F6" },
    { key: "mci", label: "MCI", color: "#1FCB6B" },
    { key: "mco", label: "MCO", color: "#1FCB6B" },
    { key: "mcd", label: "MCD", color: "#1FCB6B" },
    { key: "ei", label: "EI", color: "#EF4444" },
    { key: "dc", label: "DC", color: "#EF4444" },
    { key: "dd", label: "DD", color: "#EF4444" },
    { key: "emi", label: "EMI", color: "#1FCB6B" },
    { key: "emd", label: "EMD", color: "#1FCB6B" },
    { key: "di", label: "DI", color: "#EF4444" },
  ];

  const activePlayers = players.filter((p) => positions[p.key]);

  const handleMouseDown = (key: string) => {
    if (!canEdit) return;
    setDragging(key);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging || !svgRef.current || !canEdit) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPositions((prev) => ({
      ...prev,
      [dragging]: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) },
    }));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const loadFormation = (name: string) => {
    setFormationName(name);
    setPositions(formations[name]);
  };

  const handleSave = async () => {
    if (!saveName.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/clubs/${clubId}/equipos/${equipo.id}/formaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: saveName,
        esquema: positions,
        esTitular: true,
      }),
    });

    if (res.ok) {
      setSaveName("");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Error al guardar");
    }

    setLoading(false);
  };

  const handleExport = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `formacion-${equipo.nombre}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/club/${clubId}/equipos`}>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold">Pizarra táctica</h1>
            <p className="text-white/60">{equipo.nombre}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-white/10"
              onClick={() => loadFormation("4-3-3")}
            >
              4-3-3
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 hover:bg-white/10"
              onClick={() => loadFormation("4-4-2")}
            >
              4-4-2
            </Button>
          </div>

          {canEdit && (
            <div className="flex items-center gap-2">
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Nombre de la formación"
                className="w-48 bg-white/5 border-white/10 text-sm"
              />
              <Button
                size="sm"
                className="bg-pitch-500 hover:bg-pitch-400 text-dark-900 font-semibold"
                onClick={handleSave}
                disabled={loading || !saveName.trim()}
              >
                <Save className="w-4 h-4 mr-1" />
                Guardar
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="border-white/10 hover:bg-white/10"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-panel p-4 flex items-center justify-center">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`}
            className="w-full max-w-md h-auto rounded-xl border border-white/10 shadow-2xl"
            style={{ cursor: dragging ? "grabbing" : "default" }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Campo */}
            <rect width={FIELD_WIDTH} height={FIELD_HEIGHT} fill="#0B3D2E" />
            <pattern id="grass" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="20" height="40" fill="#0F4D3A" />
              <rect x="20" width="20" height="40" fill="#0B3D2E" />
            </pattern>
            <rect width={FIELD_WIDTH} height={FIELD_HEIGHT} fill="url(#grass)" opacity={0.6} />

            {/* Líneas de campo */}
            <rect x="20" y="20" width={FIELD_WIDTH - 40} height={FIELD_HEIGHT - 40} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            <line x1="20" y1={FIELD_HEIGHT / 2} x2={FIELD_WIDTH - 20} y2={FIELD_HEIGHT / 2} stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            <circle cx={FIELD_WIDTH / 2} cy={FIELD_HEIGHT / 2} r="70" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            <circle cx={FIELD_WIDTH / 2} cy={FIELD_HEIGHT / 2} r="3" fill="rgba(255,255,255,0.6)" />
            <rect x="120" y="20" width={FIELD_WIDTH - 240} height="80" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            <rect x="120" y={FIELD_HEIGHT - 100} width={FIELD_WIDTH - 240} height="80" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />

            {/* Jugadores */}
            {activePlayers.map((p) => {
              const pos = positions[p.key];
              const x = (pos.x / 100) * FIELD_WIDTH;
              const y = (pos.y / 100) * FIELD_HEIGHT;
              return (
                <g
                  key={p.key}
                  transform={`translate(${x}, ${y})`}
                  style={{ cursor: canEdit ? "grab" : "default" }}
                  onMouseDown={() => handleMouseDown(p.key)}
                >
                  <circle r="20" fill={p.color} stroke="white" strokeWidth="2" opacity={0.95} />
                  <text y="5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                    {p.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </Card>

        <Card className="glass-panel p-6">
          <h2 className="text-lg font-display font-semibold mb-4">Instrucciones</h2>
          <p className="text-sm text-white/60 mb-4">
            Arrastra los círculos sobre la cancha para ajustar la posición de cada jugador. Selecciona una formación base (4-3-3 o 4-4-2) y guarda tu propia alineación.
          </p>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span className="w-3 h-3 rounded-full bg-[#F2B33D]" /> Portero
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span className="w-3 h-3 rounded-full bg-[#3B82F6]" /> Defensa
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span className="w-3 h-3 rounded-full bg-[#1FCB6B]" /> Mediocampo
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span className="w-3 h-3 rounded-full bg-[#EF4444]" /> Delantera
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-medium text-white mb-2">Formaciones guardadas</h3>
            {equipo.formaciones?.length === 0 ? (
              <p className="text-sm text-white/40">No hay formaciones guardadas.</p>
            ) : (
              <div className="space-y-2">
                {equipo.formaciones.map((f: any) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setPositions(f.esquema);
                      setFormationName(f.nombre);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:border-pitch-400/30 text-sm"
                  >
                    {f.nombre} {f.esTitular && <span className="text-pitch-400 text-xs ml-2">Titular</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
