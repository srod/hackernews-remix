import { type LoaderFunction, redirect } from "@remix-run/cloudflare";

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);

    if (url.pathname === "/") {
        return redirect("/top");
    }

    return null;
};

export default function Index() {
    return null;
}
