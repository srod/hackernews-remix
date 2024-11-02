import { RemixBrowser } from "@remix-run/react";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { type CacheAdapter, configureGlobalCache } from "remix-client-cache";
import { queryClient } from "./root";

class ReactQueryAdapter implements CacheAdapter {
    async getItem(key: string) {
        return queryClient.getQueryData([key]);
    }

    async setItem(key: string, value: string) {
        return queryClient.setQueryData([key], value);
    }

    async removeItem(key: string) {
        return queryClient.removeQueries({ queryKey: [key] });
    }
}

configureGlobalCache(() => new ReactQueryAdapter());

startTransition(() => {
    hydrateRoot(
        document,
        <StrictMode>
            <RemixBrowser />
        </StrictMode>
    );
});
