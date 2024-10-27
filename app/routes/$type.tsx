import { type LoaderFunction, type MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
    type QueryClient,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { capitalize } from "radash";
import { useEffect, useState } from "react";
import { More } from "~/components/More";
import { PostItem } from "~/components/Post";
import { fetchData } from "~/lib/fetch-data";
import type { Post, PostTypes } from "~/types/Post";

const POST_PER_PAGE = 30;

async function postsFetcher(
    type: PostTypes,
    page: number,
    queryClient: QueryClient
) {
    const storyIds = await fetchData<string[]>(`${type}stories`);
    const [start, end] = [POST_PER_PAGE * (page - 1), POST_PER_PAGE * page];

    const posts = storyIds.slice(start, end).map(async (id: string) => {
        return queryClient.fetchQuery({
            queryKey: ["post", id],
            queryFn: () => fetchData<Post>(`item/${id}`),
        });
    });
    return await Promise.all(posts);
}

export const loader: LoaderFunction = async ({ params, request }) => {
    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const type = params.type || "top";
    return json({ type, page });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [{ title: `Hacker News: ${capitalize(data.type)}` }];
};

export default function TypeRoute() {
    const { type, page } = useLoaderData<typeof loader>();
    const [url, setUrl] = useState<string | undefined>();
    const queryClient = useQueryClient();

    useEffect(() => {
        const newUrl = new URL(`/${type}`, window.location.href);
        newUrl.searchParams.append(
            "page",
            (Number.parseInt(page) + 1).toString()
        );
        setUrl(newUrl.toString());
    }, [type, page]);

    const { data } = useQuery({
        queryKey: ["posts", type, page],
        queryFn: async () => {
            return await postsFetcher(
                type as PostTypes,
                Number.parseInt(page),
                queryClient
            );
        },
    });

    return (
        data && (
            <>
                {data?.map((post: Post) => (
                    <PostItem key={post.id} post={post} />
                ))}

                {url && <More url={url} />}
            </>
        )
    );
}
