import { BrandHero } from './component'

export default function Preview() {
  return (
    <div className="w-[720px] bg-[#10271f] p-14 text-[#f5f7ee]">
      <BrandHero
        eyebrow="NUEVO / FRAMEKIT"
        title="Diseña imágenes desde **React**"
        description="Plantillas editables para crear contenido visual consistente, reutilizable y listo para exportar."
      />
    </div>
  )
}
