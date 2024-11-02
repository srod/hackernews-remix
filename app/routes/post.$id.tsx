import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import {
    Await,
    type ClientLoaderFunctionArgs,
    useRevalidator,
} from "@remix-run/react";
import { LRUCache } from "lru-cache";
import { Suspense, useCallback } from "react";
import { cacheClientLoader, useCachedLoaderData } from "remix-client-cache";
import { CommentsList } from "~/components/Comments";
import { Loading } from "~/components/Loading";
import { PostItem } from "~/components/Post";
import { useVisibilityChange } from "~/hooks/useVisibilityChange";
import { fetchComments } from "~/lib/fetch-comments";
import { fetchData } from "~/lib/fetch-data";
import type { Post } from "~/types/Post";

// Create LRU Cache with options
const postCache = new LRUCache<string, Post>({
    // Maximum number of items to store in the cache
    max: 1000,

    // How long to live in milliseconds (e.g., 5 minutes)
    ttl: 1000 * 60 * 5,

    // Function to call when items are evicted
    updateAgeOnGet: true,
});

// Helper function to generate cache key
const getCacheKey = (id: string) => `post-${id}`;

export const loader: LoaderFunction = async ({ params }) => {
    const id = params.id;

    if (!id) return null;

    // Generate cache key for this request
    const cacheKey = getCacheKey(id);

    // Try to get posts from cache first
    let post = postCache.get(cacheKey);

    // If not in cache, fetch from API and store in cache
    if (!post) {
        post = await fetchData<Post>(`item/${id}`);
        postCache.set(cacheKey, post);
    }

    const comments = fetchComments(post.kids ?? []);

    return {
        id,
        post,
        comments,
    };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [{ title: `Hacker News: ${data.post.title}` }];
};

// Caches the loader data on the client
export const clientLoader = (args: ClientLoaderFunctionArgs) =>
    cacheClientLoader(args);
clientLoader.hydrate = true;

export default function PostRoute() {
    const { post, comments } = useCachedLoaderData<typeof loader>();

    const { revalidate } = useRevalidator();

    const handleVisibilityChange = useCallback(() => {
        revalidate();
    }, [revalidate]);

    useVisibilityChange(handleVisibilityChange);

    return (
        <div>
            <PostItem post={post} showText={true} />
            <Suspense fallback={<Loading />}>
                <Await resolve={comments}>
                    {(resolvedValue) => (
                        <CommentsList comments={resolvedValue} />
                    )}
                </Await>
            </Suspense>
        </div>
    );
}
