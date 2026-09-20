import type { LandingContent } from "../landing"

export const landingContent = {
  lang: "en",
  title: "FrameKit | Visual content from React templates",
  description:
    "Create consistent visual content from React templates, edit variants in Studio, and export production-ready images with FrameKit.",
  brandHome: "FrameKit home",
  navigation: "Main navigation",
  skipToContent: "Skip to content",
  docs: "Documentation",
  language: "Language",
  languageNames: { en: "English", es: "Español" },
  eyebrow: "Visual content from React templates",
  heroTitle: "Design once. Publish every variation.",
  heroDescription:
    "FrameKit turns React templates into focused visual tools. Define the design and its constraints in code, then let your team edit content and export consistent images in Studio.",
  getStarted: "Create my first project",
  seeHowItWorks: "See how it works",
  workflowTitle: "One template. Many consistent pieces.",
  workflowDescription:
    "Developers own the visual system. Content teams produce the variations. FrameKit keeps both in sync.",
  workflow: [
    {
      title: "Define",
      description: "Build the layout, fields, variants, and dimensions in React.",
    },
    {
      title: "Edit",
      description: "Use Studio to change copy, colors, and assets without touching the layout.",
    },
    {
      title: "Publish",
      description: "Export the finished image at the exact size your channel needs.",
    },
  ],
  pathsTitle: "Choose where to start",
  pathsDescription: "Take the path that matches your project.",
  paths: {
    newProject: {
      title: "New FrameKit project",
      description: "Scaffold a Next.js project and create your first template.",
      href: "/en/users/getting-started/create-project/",
    },
    existingProject: {
      title: "Existing Next.js project",
      description: "Add FrameKit to an application you already have.",
      href: "/en/users/getting-started/existing-project/",
    },
  },
  footerDocs: "Read the documentation",
  preview: {
    templateLabel: "social-card",
    fieldLabel: "Title",
    fieldValue: "Launch day",
    variantLabel: "Variant",
    variantValue: "English",
    exportLabel: "Export",
    exportValue: "1200 × 630 PNG",
  },
} satisfies LandingContent
