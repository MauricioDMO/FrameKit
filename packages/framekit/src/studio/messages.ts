import type { EditorMessages } from '../editor/types'

export type FrameKitLocale = 'es' | 'en'

export interface FrameKitStudioMessages {
  metadata: { title: string, description: string }
  sidebar: {
    workshop: string, navigationLabel: string, noTemplates: string, languageLabel: string
    settingsLabel: string, themeToggleLabel: string, developedBy: string
    languageNames: Record<FrameKitLocale, string>
  }
  editor: EditorMessages & { loadingLabel: string, loadError: string, invalidDefinition: string }
  emptyState: { ready: string, title: string, description: string }
  notFound: { title: string, description: string, backToEditor: string }
}

export const frameKitMessages: Record<FrameKitLocale, FrameKitStudioMessages> = {
  es: {
    metadata: { title: 'FrameKit', description: 'Editor de imágenes basado en plantillas React' },
    sidebar: { workshop: 'Taller visual', navigationLabel: 'Plantillas', noTemplates: 'No hay plantillas disponibles.', languageLabel: 'Idioma de la interfaz', settingsLabel: 'Ajustes', themeToggleLabel: 'Cambiar tema', developedBy: 'Desarrollado por', languageNames: { es: 'Español', en: 'English' } },
    editor: { templateEditor: 'Editor de plantilla', reset: 'Restablecer', generating: 'Generando...', downloadPng: 'Descargar PNG', content: 'Contenido', preview: 'Vista previa', actualSize: 'Tamaño real', fitToView: 'Ajustar', contentLanguageLabel: 'Idioma del diseño', exportError: 'No se pudo exportar la plantilla:', exportAlert: 'No fue posible generar la imagen.', loadingLabel: 'Cargando...', loadError: 'Error al cargar la plantilla', invalidDefinition: 'La plantilla no es válida', errorRequired: 'Este campo es requerido', errorInvalidNumber: 'Ingresa un número válido', errorNumberTooSmall: 'El valor debe ser mayor o igual a {min}', errorNumberTooLarge: 'El valor debe ser menor o igual a {max}', errorInvalidUrl: 'Ingresa una URL válida', errorInvalidColor: 'Ingresa un color hexadecimal válido (#RRGGBB)' },
    emptyState: { ready: 'Lienzo preparado', title: 'Selecciona una plantilla', description: 'Elige un formato en la navegación para editar su contenido y exportarlo como PNG.' },
    notFound: { title: 'Plantilla no encontrada', description: 'Esta ruta no corresponde a una plantilla disponible en el catálogo.', backToEditor: 'Volver al editor' },
  },
  en: {
    metadata: { title: 'FrameKit', description: 'A React template-based image editor' },
    sidebar: { workshop: 'Visual workshop', navigationLabel: 'Templates', noTemplates: 'No templates are available.', languageLabel: 'App language', settingsLabel: 'Settings', themeToggleLabel: 'Change theme', developedBy: 'Developed by', languageNames: { es: 'Español', en: 'English' } },
    editor: { templateEditor: 'Template editor', reset: 'Reset', generating: 'Generating...', downloadPng: 'Download PNG', content: 'Content', preview: 'Preview', actualSize: 'Actual size', fitToView: 'Fit to view', contentLanguageLabel: 'Design language', exportError: 'Could not export the template:', exportAlert: 'The image could not be generated.', loadingLabel: 'Loading...', loadError: 'Error loading template', invalidDefinition: 'Invalid template', errorRequired: 'This field is required', errorInvalidNumber: 'Enter a valid number', errorNumberTooSmall: 'Value must be at least {min}', errorNumberTooLarge: 'Value must be at most {max}', errorInvalidUrl: 'Enter a valid URL', errorInvalidColor: 'Enter a valid hexadecimal color (#RRGGBB)' },
    emptyState: { ready: 'Canvas ready', title: 'Select a template', description: 'Choose a format from the navigation to edit its content and export it as a PNG.' },
    notFound: { title: 'Template not found', description: 'This route does not match a template available in the catalog.', backToEditor: 'Back to editor' },
  },
}

export function getFrameKitLocale(value?: string | null): FrameKitLocale {
  return value?.toLowerCase().startsWith('en') ? 'en' : 'es'
}
