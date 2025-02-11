import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import { qwikSpeakInline } from "qwik-speak/inline";
import tsconfigPaths from "vite-tsconfig-paths";
import { languages } from "./src/speak-config";
import { partytownVite } from "@builder.io/partytown/utils";
import { join } from "path";
import tailwindcss from "@tailwindcss/vite";
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
            partytownVite({ dest: join(__dirname, "dist", "~partytown") }),
            tailwindcss(),
        ],
        preview: {
            headers: {
                "Cache-Control": "public, max-age=600",
            },
        },
        ssr: {
            external: ['@prisma/client/edge'],
        },
    };
});
