import {
    type RouteConfig,
    index,
    layout,
    route,
} from "@remix-run/route-config";

export const routes: RouteConfig = [
    index("pages/home/route.tsx"),
    layout("pages/layout.tsx", [
        route(":type", "pages/type/route.tsx"),
        route("post/:id", "pages/post/route.tsx"),
        route("user/:id", "pages/user/route.tsx"),
    ]),
];
