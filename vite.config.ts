import { netlifyPlugin } from "@netlify/remix-adapter/plugin";
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/server-runtime" {
    interface Future {
        v3_singleFetch: true;
    }
}

export default defineConfig({
    plugins: [remix(), netlifyPlugin(), tsconfigPaths()],
});
