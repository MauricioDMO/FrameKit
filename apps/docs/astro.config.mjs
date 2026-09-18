// @ts-check
import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
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
            social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/MauricioDMO/FrameKit' }],
            sidebar: [
                {
                    label: 'Using FrameKit',
                    translations: { es: 'Usar FrameKit' },
                    items: [
                        { slug: 'users' },
                    ],
                },
                {
                    label: 'Contributing to FrameKit',
                    translations: { es: 'Contribuir a FrameKit' },
                    items: [{ slug: 'contributors' }],
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
