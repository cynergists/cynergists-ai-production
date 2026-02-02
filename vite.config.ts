import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import path from 'node:path';
import fs from 'node:fs';

export default defineConfig(({ mode }) => ({
    base: mode === 'production' ? '/' : '/',
    plugins: [
        {
            name: 'resolve-at-fallback',
            enforce: 'pre',
            async resolveId(source, importer) {
                const cleanSource = source.split('?')[0].split('#')[0];
                const isAtAlias = cleanSource.startsWith('@/');
                const isAbsoluteResource = cleanSource.startsWith('/resources/js/');

                if (!isAtAlias && !isAbsoluteResource) {
                    return null;
                }

                const relativePath = isAtAlias
                    ? cleanSource.slice(2)
                    : cleanSource.replace('/resources/js/', '');
                const cynergistsRoot = path.resolve(__dirname, 'resources/js/cynergists');
                const appRoot = path.resolve(__dirname, 'resources/js');

                const cynergistsCandidate = path.resolve(cynergistsRoot, relativePath);
                const appCandidate = path.resolve(appRoot, relativePath);
                const resolveCandidate = (candidate: string) => {
                    const directMatches = [
                        candidate,
                        `${candidate}.tsx`,
                        `${candidate}.ts`,
                        `${candidate}.jsx`,
                        `${candidate}.js`,
                    ];

                    for (const match of directMatches) {
                        if (fs.existsSync(match) && fs.statSync(match).isFile()) {
                            return match;
                        }
                    }

                    const indexMatches = [
                        path.join(candidate, 'index.tsx'),
                        path.join(candidate, 'index.ts'),
                        path.join(candidate, 'index.jsx'),
                        path.join(candidate, 'index.js'),
                    ];

                    for (const match of indexMatches) {
                        if (fs.existsSync(match) && fs.statSync(match).isFile()) {
                            return match;
                        }
                    }

                    return null;
                };

                const preferCynergists = importer?.includes('/resources/js/cynergists/') ?? false;
                const cynergistsResolved = resolveCandidate(cynergistsCandidate);
                const appResolved = resolveCandidate(appCandidate);

                if (preferCynergists && cynergistsResolved) {
                    return cynergistsResolved;
                }

                if (!preferCynergists && appResolved) {
                    return appResolved;
                }

                return cynergistsResolved ?? appResolved;

                return null;
            },
        },
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
            buildDirectory: 'build',
        }),
        react(),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    resolve: {
        alias: {
            '@cy': path.resolve(__dirname, 'resources/js/cynergists'),
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
}));
