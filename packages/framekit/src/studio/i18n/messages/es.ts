const esMessages = {
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
    metadataLabel: 'Metadata',
    closeLabel: 'Cerrar',
    generating: 'Generando...',
    downloadPng: 'Descargar PNG',
    copyPng: 'Copiar PNG',
    content: 'Contenido',
    preview: 'Vista previa',
    actualSize: 'Tamaño real',
    fitToView: 'Ajustar',
    variantLabel: 'Variante',
    descriptionLabel: 'Descripción funcional',
    marketingDescriptionLabel: 'Objetivo de marketing',
    tagsLabel: 'Tags',
    colorPickerLabel: 'Seleccionar color',
    exportError: 'No se pudo exportar la plantilla:',
    exportAlert: 'No fue posible generar la imagen.',
    loadingLabel: 'Cargando...',
    loadError: 'Error al cargar la plantilla',
    invalidDefinition: 'La plantilla no es válida',
    dataError: 'Los datos de la plantilla no son válidos',
    errorRequired: 'Este campo es requerido',
    errorInvalidNumber: 'Ingresa un número válido',
    errorNumberTooSmall: 'El valor debe ser mayor o igual a {min}',
    errorNumberTooLarge: 'El valor debe ser menor o igual a {max}',
    errorInvalidStep: 'El valor debe respetar el incremento de {step}',
    errorTextTooShort: 'El texto debe tener al menos {minLength} caracteres',
    errorTextTooLong: 'El texto debe tener como máximo {maxLength} caracteres',
    errorInvalidColor: 'Ingresa un color hexadecimal válido (#RRGGBB)',
    errorInvalidChoice: 'Selecciona una opción válida',
    errorInvalidBoolean: 'El valor booleano no es válido',
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
    loadError: 'No se pudo cargar el componente',
    badgeLabel: 'Marca',
    sourceLabel: 'component.tsx',
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
    statusLabel: 'Error 404',
    title: 'Plantilla no encontrada',
    description: 'Esta ruta no corresponde a una plantilla disponible en el catálogo.',
    backToEditor: 'Volver al editor'
  }
}

export default esMessages
