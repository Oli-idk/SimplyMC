import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import { qwikSpeakInline } from "qwik-speak/inline";
import tsconfigPaths from "vite-tsconfig-paths";
import { languages } from "./src/speak-config";
import { partytownVite } from "@builder.io/partytown/utils";
import { join } from "path";

export default defineConfig(() => {
    return {
        plugins: [
            qwikCity(),
            qwikVite(),
            tsconfigPaths(),
            qwikSpeakInline({
                basePath: './',
                supportedLangs: Object.keys(languages),
                defaultLang: "en-US",
                assetsPath: "i18n"
            }),
            partytownVite({ dest: join(__dirname, "dist", "~partytown") })
        ],
        preview: {
            headers: {
                "Cache-Control": "public, max-age=600",
            },
        },
        ssr: {
            external: ['@prisma/client/edge'],
        },
        resolve: {
            alias: {
                crypto: 'crypto-browserify',
                stream: 'stream-browserify',
                util: 'util',
                // Add Node.js built-in polyfills
                buffer: 'buffer',
                events: 'events',
                assert: 'assert',
                path: 'path-browserify',
                http: 'stream-http',
                https: 'https-browserify',
            }
        },
        optimizeDeps: {
            include: ['crypto-browserify', 'buffer', 'events'],
            esbuildOptions: {
                target: 'esnext',
                supported: {
                    bigint: true
                },
            }
        },
        build: {
            rollupOptions: {
                external: ['@prisma/client/edge'],
            }
        }
    };
});