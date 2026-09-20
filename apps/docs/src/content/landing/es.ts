import type { LandingContent } from "../landing"

export const landingContent = {
  lang: "es",
  title: "FrameKit | Contenido visual desde plantillas React",
  description:
    "Crea contenido visual consistente desde plantillas React, edita variantes en Studio y exporta imágenes listas para publicar con FrameKit.",
  brandHome: "Inicio de FrameKit",
  navigation: "Navegación principal",
  skipToContent: "Saltar al contenido",
  docs: "Documentación",
  language: "Idioma",
  languageNames: { en: "English", es: "Español" },
  eyebrow: "Contenido visual desde plantillas React",
  heroTitle: "Diseña una vez. Publica cada variante.",
  heroDescription:
    "FrameKit convierte plantillas React en herramientas visuales enfocadas. Define el diseño y sus límites en código, deja que tu equipo edite el contenido y exporta imágenes consistentes desde Studio.",
  getStarted: "Crear mi primer proyecto",
  seeHowItWorks: "Ver cómo funciona",
  workflowTitle: "Una plantilla. Muchas piezas consistentes.",
  workflowDescription:
    "Los desarrolladores definen el sistema visual. Los equipos de contenido producen las variantes. FrameKit mantiene ambos lados sincronizados.",
  workflow: [
    {
      title: "Define",
      description: "Construye el layout, los campos, las variantes y las dimensiones en React.",
    },
    {
      title: "Edita",
      description: "Usa Studio para cambiar textos, colores y recursos sin tocar el layout.",
    },
    {
      title: "Publica",
      description: "Exporta la imagen terminada con el tamaño exacto que necesita cada canal.",
    },
  ],
  pathsTitle: "Elige por dónde empezar",
  pathsDescription: "Sigue el camino que corresponda a tu proyecto.",
  paths: {
    newProject: {
      title: "Proyecto nuevo con FrameKit",
      description: "Crea un proyecto Next.js y añade tu primera plantilla.",
      href: "/es/users/getting-started/create-project/",
    },
    existingProject: {
      title: "Proyecto Next.js existente",
      description: "Añade FrameKit a una aplicación que ya tienes.",
      href: "/es/users/getting-started/existing-project/",
    },
  },
  footerDocs: "Leer la documentación",
  preview: {
    templateLabel: "social-card",
    fieldLabel: "Título",
    fieldValue: "Día de lanzamiento",
    variantLabel: "Variante",
    variantValue: "Español",
    exportLabel: "Exportar",
    exportValue: "1200 × 630 PNG",
  },
} satisfies LandingContent
