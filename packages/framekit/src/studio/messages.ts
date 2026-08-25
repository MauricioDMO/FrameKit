import type { EditorMessages } from '../editor/types'

export type FrameKitLocale = 'es' | 'en'

export interface FrameKitStudioMessages {
  metadata: { title: string, description: string }
  sidebar: {
    workshop: string, navigationLabel: string, templatesLabel: string, brandsLabel: string
    noTemplates: string, noBrands: string, languageLabel: string
    collapseLabel: string, expandLabel: string
    settingsLabel: string, themeToggleLabel: string, developedBy: string
    languageNames: Record<FrameKitLocale, string>
  }
  editor: EditorMessages & { loadingLabel: string, loadError: string, invalidDefinition: string }
  brand: {
    componentLabel: string, previewLabel: string, descriptionLabel: string, editHint: string, loadingLabel: string
    emptyTitle: string, emptyDescription: string, notFoundTitle: string, notFoundDescription: string
  }
  emptyState: { ready: string, title: string, description: string }
  notFound: { title: string, description: string, backToEditor: string }
}

export const frameKitMessages: Record<FrameKitLocale, FrameKitStudioMessages> = {
  es: {
    metadata: { title: 'FrameKit', description: 'Editor de imágenes basado en plantillas React' },
    sidebar: {
      workshop: 'Taller visual',
      navigationLabel: 'Plantillas',
      templatesLabel: 'Plantillas',
      brandsLabel: 'Marca',
      noTemplates: 'No hay plantillas disponibles.',
      noBrands: 'No hay componentes de marca disponibles.',
      languageLabel: 'Idioma de la interfaz',
      collapseLabel: 'Colapsar navegación',
      expandLabel: 'Expandir navegación',
      settingsLabel: 'Ajustes',
      themeToggleLabel: 'Cambiar tema',
      developedBy: 'Desarrollado por',
      languageNames: {
        es: 'Español',
        en: 'English'
      }
    },
    editor: {
      templateEditor: 'Editor de plantilla',
      reset: 'Restablecer',
      generating: 'Generando...',
      downloadPng: 'Descargar PNG',
      copyPng: 'Copiar PNG',
      content: 'Contenido',
      preview: 'Vista previa',
      actualSize: 'Tamaño real',
      fitToView: 'Ajustar',
      contentVariantLabel: 'Variante de contenido',
      exportError: 'No se pudo exportar la plantilla:',
      exportAlert: 'No fue posible generar la imagen.',
      loadingLabel: 'Cargando...',
      loadError: 'Error al cargar la plantilla',
      invalidDefinition: 'La plantilla no es válida',
      errorRequired: 'Este campo es requerido',
      errorInvalidNumber: 'Ingresa un número válido',
      errorNumberTooSmall: 'El valor debe ser mayor o igual a {min}',
      errorNumberTooLarge: 'El valor debe ser menor o igual a {max}',
      errorTextTooShort: 'El texto debe tener al menos {minLength} caracteres',
      errorTextTooLong: 'El texto debe tener como máximo {maxLength} caracteres',
      errorInvalidColor: 'Ingresa un color hexadecimal válido (#RRGGBB)',
      errorInvalidChoice: 'Selecciona una opción válida',
      imageSelect: 'Subir imagen',
      imageUploading: 'Subiendo...',
      imageLoadError: 'No se pudo cargar el asset',
      imageUploadError: 'No se pudo subir el asset'
    },
    brand: {
      componentLabel: 'Componente de marca',
      previewLabel: 'Vista previa del componente',
      descriptionLabel: 'Descripción',
      editHint: 'Edita la implementación en código y usa este preview para verificar el resultado.',
      loadingLabel: 'Cargando componente...',
      emptyTitle: 'Selecciona un componente',
      emptyDescription: 'Elige un componente de marca para visualizar su preview y conocer su propósito.',
      notFoundTitle: 'Componente no encontrado',
      notFoundDescription: 'Esta ruta no corresponde a un componente de marca disponible en el catálogo.'
    },
    emptyState: {
      ready: 'Lienzo preparado',
      title: 'Selecciona una plantilla',
      description: 'Elige un formato en la navegación para editar su contenido y exportarlo como PNG.'
    },
    notFound: {
      title: 'Plantilla no encontrada',
      description: 'Esta ruta no corresponde a una plantilla disponible en el catálogo.',
      backToEditor: 'Volver al editor'
    }
  },
  en: {
    metadata: { title: 'FrameKit', description: 'A React template-based image editor' },
    sidebar: {
      workshop: 'Visual workshop',
      navigationLabel: 'Templates',
      templatesLabel: 'Templates',
      brandsLabel: 'Brand',
      noTemplates: 'No templates are available.',
      noBrands: 'No brand components are available.',
      languageLabel: 'App language',
      collapseLabel: 'Collapse navigation',
      expandLabel: 'Expand navigation',
      settingsLabel: 'Settings',
      themeToggleLabel: 'Change theme',
      developedBy: 'Developed by',
      languageNames: {
        es: 'Español',
        en: 'English'
      }
    },
    editor: {
      templateEditor: 'Template editor',
      reset: 'Reset',
      generating: 'Generating...',
      downloadPng: 'Download PNG',
      copyPng: 'Copy PNG',
      content: 'Content',
      preview: 'Preview',
      actualSize: 'Actual size',
      fitToView: 'Fit to view',
      contentVariantLabel: 'Content variant',
      exportError: 'Could not export the template:',
      exportAlert: 'The image could not be generated.',
      loadingLabel: 'Loading...',
      loadError: 'Error loading template',
      invalidDefinition: 'Invalid template',
      errorRequired: 'This field is required',
      errorInvalidNumber: 'Enter a valid number',
      errorNumberTooSmall: 'Value must be at least {min}',
      errorNumberTooLarge: 'Value must be at most {max}',
      errorTextTooShort: 'Text must be at least {minLength} characters',
      errorTextTooLong: 'Text must be at most {maxLength} characters',
      errorInvalidColor: 'Enter a valid hexadecimal color (#RRGGBB)',
      errorInvalidChoice: 'Select a valid option',
      imageSelect: 'Upload image',
      imageUploading: 'Uploading...',
      imageLoadError: 'The asset could not be loaded',
      imageUploadError: 'The asset could not be uploaded'
    },
    brand: {
      componentLabel: 'Brand component',
      previewLabel: 'Component preview',
      descriptionLabel: 'Description',
      editHint: 'Edit the implementation in code and use this preview to verify the result.',
      loadingLabel: 'Loading component...',
      emptyTitle: 'Select a component',
      emptyDescription: 'Choose a brand component to view its preview and learn its purpose.',
      notFoundTitle: 'Component not found',
      notFoundDescription: 'This route does not match a brand component available in the catalog.'
    },
    emptyState: {
      ready: 'Canvas ready',
      title: 'Select a template',
      description: 'Choose a format from the navigation to edit its content and export it as a PNG.'
    },
    notFound: {
      title: 'Template not found',
      description: 'This route does not match a template available in the catalog.',
      backToEditor: 'Back to editor'
    },
  },
}

export function getFrameKitLocale(value?: string | null): FrameKitLocale {
  return value?.toLowerCase().startsWith('en') ? 'en' : 'es'
}
