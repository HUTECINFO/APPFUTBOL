"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Cookie, Xmark } from "iconoir-react";

type Preferences = {
  necessary: true;
  analytics: boolean;
};

const storageKey = "club-one:cookie-consent:v1";

function save(preferences: Preferences) {
  localStorage.setItem(storageKey, JSON.stringify({ ...preferences, updatedAt: new Date().toISOString() }));
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (!saved) setOpen(true);
    else {
      try {
        setAnalytics(Boolean(JSON.parse(saved).analytics));
      } catch {
        setOpen(true);
      }
    }

    const showSettings = () => {
      const current = localStorage.getItem(storageKey);
      if (current) {
        try {
          setAnalytics(Boolean(JSON.parse(current).analytics));
        } catch {
          setAnalytics(false);
        }
      }
      setSettings(true);
      setOpen(true);
    };

    window.addEventListener("club-one:cookie-settings", showSettings);
    return () => window.removeEventListener("club-one:cookie-settings", showSettings);
  }, []);

  const acceptAll = () => {
    setAnalytics(true);
    save({ necessary: true, analytics: true });
    setOpen(false);
    setSettings(false);
  };

  const acceptEssential = () => {
    setAnalytics(false);
    save({ necessary: true, analytics: false });
    setOpen(false);
    setSettings(false);
  };

  const saveSettings = () => {
    save({ necessary: true, analytics });
    setOpen(false);
    setSettings(false);
  };

  if (!open) return null;

  return (
    <aside role="dialog" aria-modal="false" aria-labelledby="cookies-title" className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-xl rounded-[1.5rem] border border-white/15 bg-dark-800/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:bottom-6 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-pitch-500/12 text-pitch-300"><Cookie className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <h2 id="cookies-title" className="font-display text-xl font-bold text-white">{settings ? "Configura tus cookies" : "Tu privacidad importa"}</h2>
            {settings && <button type="button" onClick={() => setOpen(false)} className="text-white/45 hover:text-white" aria-label="Cerrar preferencias"><Xmark className="h-5 w-5" /></button>}
          </div>
          {!settings ? (
            <p className="mt-2 text-sm leading-6 text-white/60">Usamos almacenamiento esencial para mantener tu sesión y preferencias. Puedes aceptar analítica opcional o decidir más tarde. Consulta nuestra <Link href="/politica-de-cookies" className="font-semibold text-pitch-300 hover:text-pitch-200">política de cookies</Link>.</p>
          ) : (
            <div className="mt-4 space-y-3">
              <PreferenceRow title="Esenciales" detail="Necesarias para que la plataforma recuerde tu elección y funcione correctamente." checked disabled />
              <PreferenceRow title="Analítica" detail="Nos ayuda a entender el uso de la plataforma y mejorarla." checked={analytics} onChange={setAnalytics} />
            </div>
          )}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            {!settings && <button type="button" onClick={() => setSettings(true)} className="h-10 rounded-full px-4 text-sm font-semibold text-white/65 hover:text-white">Personalizar</button>}
            <button type="button" onClick={settings ? saveSettings : acceptEssential} className="h-10 rounded-full border border-white/15 px-4 text-sm font-semibold text-white hover:bg-white/10">{settings ? "Guardar preferencias" : "Solo esenciales"}</button>
            <button type="button" onClick={acceptAll} className="h-10 rounded-full bg-pitch-500 px-4 text-sm font-bold text-dark-900 hover:bg-pitch-400">Aceptar todas</button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function PreferenceRow({ title, detail, checked, disabled = false, onChange }: { title: string; detail: string; checked: boolean; disabled?: boolean; onChange?: (value: boolean) => void }) {
  return <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[.035] p-3"><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange?.(event.target.checked)} className="peer sr-only" /><span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border border-white/25 bg-dark-900 text-dark-900 peer-checked:border-pitch-400 peer-checked:bg-pitch-400 peer-disabled:cursor-not-allowed"><Check className="h-3 w-3" /></span><span><span className="block text-sm font-semibold text-white">{title}</span><span className="mt-0.5 block text-xs leading-5 text-white/50">{detail}</span></span></label>;
}
