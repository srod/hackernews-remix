import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    json,
    redirect,
    useNavigation,
} from "@remix-run/react";
import {
    HydrationBoundary,
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import NProgress from "nprogress";
import nProgressStyles from "nprogress/nprogress.css?url";
import { useEffect, useState } from "react";
import { useDehydratedState } from "use-dehydrated-state";
import { Layout } from "./components/Layout";
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

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);

    if (url.pathname === "/") {
        return redirect("/top");
    }

    return json({});
};

export default function App() {
    const { state } = useNavigation();

    useEffect(() => {
        if (state !== "idle") {
            NProgress.start();
        } else {
            NProgress.done();
        }
    }, [state]);

    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        gcTime: Number.POSITIVE_INFINITY,
                        staleTime: 60 * 1000,
                    },
                },
            })
    );
    const dehydratedState = useDehydratedState();

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
                <QueryClientProvider client={queryClient}>
                    <HydrationBoundary state={dehydratedState}>
                        <Layout>
                            <Outlet />
                        </Layout>
                    </HydrationBoundary>
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}
