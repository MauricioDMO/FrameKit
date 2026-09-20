export interface LandingStep {
  title: string
  description: string
}

export interface LandingPath {
  title: string
  description: string
  href: string
}

export interface LandingContent {
  lang: "en" | "es"
  title: string
  description: string
  brandHome: string
  navigation: string
  skipToContent: string
  docs: string
  language: string
  languageNames: Record<"en" | "es", string>
  eyebrow: string
  heroTitle: string
  heroDescription: string
  getStarted: string
  seeHowItWorks: string
  workflowTitle: string
  workflowDescription: string
  workflow: LandingStep[]
  pathsTitle: string
  pathsDescription: string
  paths: {
    newProject: LandingPath
    existingProject: LandingPath
  }
  footerDocs: string
  preview: {
    templateLabel: string
    fieldLabel: string
    fieldValue: string
    variantLabel: string
    variantValue: string
    exportLabel: string
    exportValue: string
  }
}

export type LandingLanguage = LandingContent["lang"]
