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
            social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/MauricioDMO/FrameKit' }],
            sidebar: [
                {
                    label: 'Using FrameKit',
                    translations: { es: 'Usar FrameKit' },
                    items: [
                        { slug: 'users' },
                        {
                            label: 'Getting started',
                            translations: { es: 'Primeros pasos' },
                            items: [{ autogenerate: { directory: 'users/getting-started' } }],
                        },
                        {
                            label: 'Concepts',
                            items: [
                                { slug: 'users/concepts' },
                                {
                                    label: 'Templates',
                                    items: [{ autogenerate: { directory: 'users/concepts/templates' } }],
                                },
                                { slug: 'users/concepts/brand-components', label: 'Brand components' },
                                { slug: 'users/concepts/studio', label: 'Studio' },
                            ],
                        },
                        {
                            label: 'Guides',
                            items: [{ autogenerate: { directory: 'users/guides' } }],
                        },
                        {
                            label: 'Deployment',
                            translations: { es: 'Despliegue' },
                            items: [{ autogenerate: { directory: 'users/deployment' } }],
                        },
                        {
                            label: 'Migrations',
                            translations: { es: 'Migraciones' },
                            collapsed: true,
                            items: [{ autogenerate: { directory: 'users/migrations' } }],
                        },
                        {
                            label: 'Troubleshooting',
                            translations: { es: 'Solución de problemas' },
                            collapsed: true,
                            items: [{ autogenerate: { directory: 'users/troubleshooting' } }],
                        },
                        {
                            label: 'Reference',
                            collapsed: true,
                            items: [{ autogenerate: { directory: 'users/reference' } }],
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
