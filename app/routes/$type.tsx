import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import {
    type ClientLoaderFunctionArgs,
    useRevalidator,
} from "@remix-run/react";
import { LRUCache } from "lru-cache";
import { capitalize } from "radash";
import { useCallback } from "react";
import { cacheClientLoader, useCachedLoaderData } from "remix-client-cache";
import { items } from "~/components/Header";
import { More } from "~/components/More";
import { PostItem } from "~/components/Post";
import { useVisibilityChange } from "~/hooks/useVisibilityChange";
import { fetchData } from "~/lib/fetch-data";
import type { Post, PostTypes } from "~/types/Post";

const POST_PER_PAGE = 30;

async function postsFetcher(type: PostTypes, page: number) {
    const storyIds = await fetchData<string[]>(`${type}stories`);
    const [start, end] = [POST_PER_PAGE * (page - 1), POST_PER_PAGE * page];

    return await Promise.all(
        storyIds.slice(start, end).map(async (id: string) => {
            return fetchData<Post>(`item/${id}`);
        })
    );
}

// Create LRU Cache with options
const postsCache = new LRUCache<string, Post[]>({
    // Maximum number of items to store in the cache
    max: 1000,

    // How long to live in milliseconds (e.g., 1 minute)
    ttl: 1000 * 60 * 1,
});

// Helper function to generate cache key
const getCacheKey = (type: PostTypes, page: number) => `${type}-${page}`;

export const loader: LoaderFunction = async ({ params, request }) => {
    if (params.type && !items.includes(params.type)) {
        return { type: "top", page: 1, posts: [], hasMore: false, nextPage: 2 };
    }

    const url = new URL(request.url);
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const type = params.type || "top";

    // Generate cache key for this request
    const cacheKey = getCacheKey(type as PostTypes, page);

    // Try to get posts from cache first
    let posts = postsCache.get(cacheKey);

    // If not in cache, fetch from API and store in cache
    if (!posts) {
        posts = await postsFetcher(type as PostTypes, page);
        postsCache.set(cacheKey, posts);
    }

    return {
        type,
        page,
        posts,
        hasMore: posts.length > 0,
        nextPage: page + 1,
    };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [{ title: `Hacker News: ${capitalize(data.type)}` }];
};

// Caches the loader data on the client
export const clientLoader = (args: ClientLoaderFunctionArgs) =>
    cacheClientLoader(args);
clientLoader.hydrate = true;

export default function TypeRoute() {
    const { type, posts, hasMore, nextPage } =
        useCachedLoaderData<typeof loader>();

    const { revalidate } = useRevalidator();

    const handleVisibilityChange = useCallback(() => {
        revalidate();
    }, [revalidate]);

    useVisibilityChange(handleVisibilityChange);

    return (
        posts && (
            <>
                {posts?.map((post: Post) => (
                    <PostItem key={post.id} post={post} />
                ))}

                {hasMore && <More url={`/${type}?page=${nextPage}`} />}
            </>
        )
    );
}
