import Link from 'next/link'

export default function TemplateNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8 lg:min-h-screen">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#748078]">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Plantilla no encontrada
        </h1>
        <p className="mt-3 leading-7 text-[#657168]">
          Esta ruta no corresponde a una plantilla disponible en el catálogo.
        </p>
        <Link
          href="/editor"
          className="mt-7 inline-block rounded-xl bg-[#173d31] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f2c23]"
        >
          Volver al editor
        </Link>
      </div>
    </div>
  )
}
