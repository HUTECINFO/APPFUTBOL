import Link from "next/link";
import { ArrowLeft, Cookie, PageEdit, ShieldCheck } from "iconoir-react";
import { ClubOneMark } from "@/components/branding/club-one-mark";

type LegalPageType = "privacy" | "cookies" | "terms";

const content = {
  privacy: {
    title: "Aviso de privacidad",
    intro: "En Club One tratamos los datos personales necesarios para administrar organizaciones deportivas, equipos, entrenamientos, eventos y comunicaciones.",
    icon: ShieldCheck,
    sections: [
      ["Datos que tratamos", "Podemos tratar datos de identificación y contacto de responsables, entrenadores, jugadores y familiares; información deportiva y administrativa que una organización registre; y datos técnicos necesarios para la seguridad y funcionamiento de la plataforma."],
      ["Para qué los usamos", "Usamos los datos para crear y administrar cuentas, organizar equipos y calendarios, gestionar registros, pagos cuando correspondan, enviar comunicaciones operativas, resolver solicitudes y proteger la plataforma."],
      ["Quién puede verlos", "El acceso está limitado a las personas autorizadas por cada club, academia u organización, y a proveedores necesarios para operar servicios como autenticación, infraestructura y procesamiento de pagos."],
      ["Tus derechos", "Puedes solicitar acceso, corrección, actualización o eliminación de tus datos a través del canal de contacto habilitado por tu organización o dentro de la plataforma. Algunas solicitudes pueden estar sujetas a obligaciones legales o contractuales aplicables."],
      ["Seguridad y conservación", "Aplicamos medidas razonables de seguridad y conservamos la información solo durante el tiempo necesario para prestar el servicio, cumplir obligaciones y atender controversias."],
    ],
  },
  cookies: {
    title: "Política de cookies",
    intro: "Club One utiliza almacenamiento local y tecnologías similares para que el sitio funcione, recuerde tus elecciones y, solo si lo autorizas, entienda de forma agregada cómo se usa la plataforma.",
    icon: Cookie,
    sections: [
      ["Cookies esenciales", "Son necesarias para guardar tus preferencias de privacidad, mantener la seguridad y permitir funciones básicas. No pueden desactivarse desde nuestro gestor porque son indispensables para el funcionamiento."],
      ["Cookies analíticas", "Son opcionales. Si las autorizas, nos ayudan a medir de forma agregada la navegación y mejorar la experiencia. Actualmente tu preferencia se guarda en el navegador bajo la clave club-one:cookie-consent:v1."],
      ["Cómo administrar tus preferencias", "Puedes aceptar, rechazar o modificar las cookies analíticas desde el enlace “Gestionar cookies” del footer. También puedes borrar el almacenamiento del sitio desde las preferencias de tu navegador."],
      ["Proveedores externos", "Algunos servicios integrados por una organización, como pagos o mapas, pueden establecer sus propias tecnologías de almacenamiento. Sus políticas aplican de manera independiente."],
    ],
  },
  terms: {
    title: "Términos y condiciones",
    intro: "Estos términos regulan el acceso y uso de Club One como plataforma de gestión para clubes, academias, entrenadores, jugadores y eventos de fútbol.",
    icon: PageEdit,
    sections: [
      ["Uso de la plataforma", "Debes utilizar Club One de forma lícita, con información exacta y únicamente para fines relacionados con la operación deportiva de tu organización. Cada usuario es responsable de proteger sus credenciales."],
      ["Administradores de organizaciones", "La organización que crea y administra un espacio en Club One es responsable de definir quién tiene acceso, de contar con las autorizaciones necesarias para registrar datos de jugadores y familias, y de mantener actualizada su información."],
      ["Pagos y eventos", "Los cobros, inscripciones y condiciones de un evento pueden depender de reglas particulares publicadas por la organización responsable. Club One puede facilitar su gestión sin sustituir esas reglas específicas."],
      ["Contenido y propiedad", "Conservas los derechos sobre el contenido que registras. Nos autorizas a procesarlo únicamente para operar, proteger y mejorar el servicio. La marca, software y elementos propios de Club One están protegidos por la legislación aplicable."],
      ["Cambios y contacto", "Podemos actualizar estos términos cuando sea necesario. Cuando un cambio sea relevante, lo comunicaremos por los medios disponibles en la plataforma. El uso posterior a la actualización implica la aceptación de los términos vigentes."],
    ],
  },
} as const;

export function LegalPage({ type }: { type: LegalPageType }) {
  const page = content[type];
  const Icon = page.icon;

  return <main id="contenido-principal" className="min-h-screen bg-dark-900 px-6 py-8 text-foreground sm:px-10 lg:px-12">
    <div className="mx-auto max-w-3xl">
      <header className="flex items-center justify-between border-b border-white/10 pb-6"><Link href="/" className="flex items-center gap-2"><ClubOneMark className="h-8 w-8" /><span className="font-display text-xl font-bold text-white">CLUB <span className="text-gradient">ONE</span></span></Link><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-pitch-300"><ArrowLeft className="h-4 w-4" /> Volver al inicio</Link></header>
      <article className="py-16 sm:py-20"><span className="grid h-12 w-12 place-items-center rounded-2xl border border-pitch-400/20 bg-pitch-500/10 text-pitch-300"><Icon className="h-6 w-6" /></span><p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-pitch-400">Club One · HUTEC</p><h1 className="mt-3 font-display text-5xl font-bold leading-none text-white sm:text-6xl">{page.title}</h1><p className="mt-6 text-base leading-8 text-white/65 sm:text-lg">{page.intro}</p><p className="mt-5 text-sm text-white/40">Última actualización: 11 de septiembre de 2026</p>
        <div className="mt-12 space-y-9">{page.sections.map(([heading, body]) => <section key={heading}><h2 className="font-display text-2xl font-bold text-white">{heading}</h2><p className="mt-3 text-base leading-7 text-white/60">{body}</p></section>)}</div>
        <div className="mt-14 rounded-2xl border border-white/10 bg-white/[.035] p-6 text-sm leading-6 text-white/55">Este contenido comunica las prácticas generales de Club One. Para necesidades regulatorias específicas de tu país, organización o tratamiento de menores, te recomendamos una revisión legal profesional.</div>
      </article>
      <footer className="flex flex-wrap gap-x-5 gap-y-3 border-t border-white/10 py-8 text-sm font-semibold text-white/50"><Link href="/aviso-de-privacidad" className="hover:text-pitch-300">Privacidad</Link><Link href="/politica-de-cookies" className="hover:text-pitch-300">Cookies</Link><Link href="/terminos-y-condiciones" className="hover:text-pitch-300">Términos</Link></footer>
    </div>
  </main>;
}
