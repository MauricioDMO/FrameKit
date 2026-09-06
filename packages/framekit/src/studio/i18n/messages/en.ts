const enMessages = {
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
    metadataLabel: 'Metadata',
    closeLabel: 'Close',
    generating: 'Generating...',
    downloadPng: 'Download PNG',
    copyPng: 'Copy PNG',
    content: 'Content',
    preview: 'Preview',
    actualSize: 'Actual size',
    fitToView: 'Fit to view',
    variantLabel: 'Variant',
    descriptionLabel: 'Functional description',
    marketingDescriptionLabel: 'Marketing goal',
    tagsLabel: 'Tags',
    colorPickerLabel: 'Select color',
    exportError: 'Could not export the template:',
    exportAlert: 'The image could not be generated.',
    loadingLabel: 'Loading...',
    loadError: 'Error loading template',
    invalidDefinition: 'Invalid template',
    dataError: 'The template data is invalid',
    errorRequired: 'This field is required',
    errorInvalidNumber: 'Enter a valid number',
    errorNumberTooSmall: 'Value must be at least {min}',
    errorNumberTooLarge: 'Value must be at most {max}',
    errorInvalidStep: 'Value must use step {step}',
    errorTextTooShort: 'Text must be at least {minLength} characters',
    errorTextTooLong: 'Text must be at most {maxLength} characters',
    errorInvalidColor: 'Enter a valid hexadecimal color (#RRGGBB)',
    errorInvalidChoice: 'Select a valid option',
    errorInvalidBoolean: 'Enter a valid boolean value',
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
    loadError: 'The component could not be loaded',
    badgeLabel: 'Brand',
    sourceLabel: 'component.tsx',
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
    statusLabel: 'Error 404',
    title: 'Template not found',
    description: 'This route does not match a template available in the catalog.',
    backToEditor: 'Back to editor'
  }
}

export default enMessages
