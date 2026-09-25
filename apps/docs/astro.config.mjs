// @ts-check
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
    site: 'https://framekit.mauriciodmo.com',
    redirects: {
        '/': '/en/',
    },

    integrations: [
        mermaid({
            theme: 'forest'
        }),
        starlight({
            title: 'FrameKit Docs',
            description: 'Template-based image editor with visual Studio, CLI, and code generation for React and Next.js',
            customCss: ['./src/styles/starlight.css'],
            components: {
                Head: './src/components/analytics/StarlightHead.astro',
            },
            favicon: '/favicon.svg',
            head: [
                {
                    tag: 'meta',
                    attrs: { name: 'theme-color', content: '#071a15' },
                },
                {
                    tag: 'link',
                    attrs: { rel: 'manifest', href: '/site.webmanifest' },
                },
                {
                    tag: 'link',
                    attrs: { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
                },
                {
                    tag: 'link',
                    attrs: { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
                },
            ],
            social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/MauricioDMO/FrameKit' }],
            sidebar: [
                {
                    label: 'Start',
                    translations: { es: 'Empezar' },
                    items: [
                        {
                            slug: 'users/getting-started/create-project',
                            label: 'Quick start',
                            translations: { es: 'Inicio rápido' },
                        },
                        {
                            slug: 'users/getting-started/existing-project',
                            label: 'Add FrameKit to an existing project',
                            translations: { es: 'Añadir FrameKit a un proyecto existente' },
                        },
                        {
                            slug: 'users/getting-started/project-structure',
                            label: 'Project structure',
                            translations: { es: 'Estructura del proyecto' },
                        },
                    ],
                },
                {
                    label: 'Templates',
                    translations: { es: 'Plantillas' },
                    items: [
                        {
                            slug: 'users/guides/create-template',
                            label: 'Create a template',
                            translations: { es: 'Crear una plantilla' },
                        },
                        {
                            slug: 'users/concepts/templates/fields',
                            label: 'Fields',
                            translations: { es: 'Campos' },
                        },
                        {
                            slug: 'users/concepts/templates/content-and-variants',
                            label: 'Content & variants',
                            translations: { es: 'Contenido y variantes' },
                        },
                        {
                            slug: 'users/concepts/templates/assets',
                            label: 'Assets',
                            translations: { es: 'Recursos' },
                        },
                        {
                            slug: 'users/concepts/brand-components',
                            label: 'Brand components',
                            translations: { es: 'Componentes de marca' },
                        },
                    ],
                },
                {
                    label: 'Studio',
                    items: [
                        {
                            slug: 'users/guides/use-studio',
                            label: 'Using Studio',
                            translations: { es: 'Usar Studio' },
                        },
                        {
                            slug: 'users/guides/authentication-and-access',
                            label: 'Authentication & access',
                            translations: { es: 'Autenticación y acceso' },
                        },
                    ],
                },
                {
                    label: 'Automation',
                    translations: { es: 'Automatización' },
                    items: [
                        {
                            slug: 'users/guides/render-images-with-the-api',
                            label: 'Render images with the API',
                            translations: { es: 'Renderizar imágenes con la API' },
                        },
                        {
                            label: 'HTTP API',
                            translations: { es: 'API HTTP' },
                            items: [{ autogenerate: { directory: 'users/reference/http-api' } }],
                        },
                    ],
                },
                {
                    label: 'Configuration',
                    translations: { es: 'Configuración' },
                    items: [
                        {
                            slug: 'users/reference/configuration',
                            label: 'Configuration',
                            translations: { es: 'Configuración' },
                        },
                        {
                            slug: 'users/deployment',
                            label: 'Deployment',
                            translations: { es: 'Despliegue' },
                        },
                        {
                            slug: 'users/reference/cli',
                            label: 'CLI',
                        },
                    ],
                },
                {
                    label: 'Reference',
                    translations: { es: 'Referencia' },
                    collapsed: true,
                    items: [
                        {
                            slug: 'users/reference/template',
                            label: 'Template API',
                            translations: { es: 'API de plantillas' },
                        },
                        {
                            slug: 'users/reference/package-api',
                            label: 'Package API',
                            translations: { es: 'API de paquetes' },
                        },
                        {
                            slug: 'users/reference/generated-files',
                            label: 'Generated files',
                            translations: { es: 'Archivos generados' },
                        },
                        {
                            slug: 'users/migrations',
                            label: 'Migrations',
                            translations: { es: 'Migraciones' },
                        },
                        {
                            slug: 'users/troubleshooting',
                            label: 'Troubleshooting',
                            translations: { es: 'Solución de problemas' },
                        },
                    ],
                },
                {
                    label: 'Contributing to FrameKit',
                    translations: { es: 'Contribuir a FrameKit' },
                    collapsed: true,
                    items: [
                        { slug: 'contributors' },
                        {
                            label: 'Getting started',
                            translations: { es: 'Primeros pasos' },
                            items: [{ autogenerate: { directory: 'contributors/getting-started' } }],
                        },
                        {
                            label: 'Architecture',
                            translations: { es: 'Arquitectura' },
                            items: [{ autogenerate: { directory: 'contributors/architecture' } }],
                        },
                        {
                            label: 'Development',
                            translations: { es: 'Desarrollo' },
                            items: [{ autogenerate: { directory: 'contributors/development' } }],
                        },
                        {
                            label: 'Testing',
                            translations: { es: 'Pruebas' },
                            items: [{ autogenerate: { directory: 'contributors/testing' } }],
                        },
                        {
                            label: 'Distribution',
                            translations: { es: 'Distribución' },
                            items: [{ autogenerate: { directory: 'contributors/distribution' } }],
                        },
                        {
                            label: 'Releases',
                            translations: { es: 'Lanzamientos' },
                            items: [{ autogenerate: { directory: 'contributors/releases' } }],
                        },
                        {
                            label: 'Documentation',
                            translations: { es: 'Documentación' },
                            items: [{ autogenerate: { directory: 'contributors/documentation' } }],
                        },
                    ],
                },
            ],
            defaultLocale: 'en',
            locales: {
                en: {
                    label: 'English',
                    lang: 'en',
                },
                es: {
                    label: 'Español',
                    lang: 'es',
                },
            },
        }),
    ],

    vite: {
        plugins: [tailwindcss()],
    },

    adapter: cloudflare({
        prerenderEnvironment: 'node',
    }),
});
