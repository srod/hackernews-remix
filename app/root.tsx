import type { LinksFunction } from "@remix-run/node";
import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useNavigation,
} from "@remix-run/react";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
    PersistQueryClientProvider,
    type PersistQueryClientProviderProps,
} from "@tanstack/react-query-persist-client";
import NProgress from "nprogress";
import nProgressStyles from "nprogress/nprogress.css?url";
import { type ReactNode, useEffect } from "react";
import { Layout as Layout2 } from "./components/Layout";
import globalCssUrl from "./styles/global.css?url";

export const links: LinksFunction = () => [
    {
        rel: "icon",
        href: "/favicon.svg",
        type: "image/svg+xml",
    },
    {
        rel: "apple-touch-icon",
        href: "/favicon.svg",
        type: "image/svg+xml",
    },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap",
    },
    {
        rel: "stylesheet",
        href: globalCssUrl,
    },
    {
        rel: "stylesheet",
        href: nProgressStyles,
    },
];

const persistOptions: PersistQueryClientProviderProps["persistOptions"] = {
    persister: createSyncStoragePersister({
        storage:
            typeof window !== "undefined" ? window.localStorage : undefined,
    }),
    maxAge: Number.POSITIVE_INFINITY,
};

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: Number.POSITIVE_INFINITY,
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
});

export function Layout({ children }: { children: ReactNode }) {
    const { state } = useNavigation();

    useEffect(() => {
        if (state !== "idle") {
            NProgress.start();
        } else {
            NProgress.done();
        }
    }, [state]);

    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    return (
        <PersistQueryClientProvider
            client={queryClient}
            persistOptions={persistOptions}
        >
            <Layout2>
                <Outlet />
            </Layout2>
            <ReactQueryDevtools initialIsOpen={false} />
        </PersistQueryClientProvider>
    );
}
