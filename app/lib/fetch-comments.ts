import { LRUCache } from "lru-cache";
import type { Comment } from "~/types/Comment";
import { fetchData } from "./fetch-data";

// Create LRU Cache with options
const commentCache = new LRUCache<string, Comment>({
    // Maximum number of items to store in the cache
    max: 10000,

    // How long to live in milliseconds (e.g., 5 minutes)
    ttl: 1000 * 60 * 5,

    // Function to call when items are evicted
    updateAgeOnGet: true,
});

// Helper function to generate cache key
const getCacheKey = (id: string) => `comment-${id}`;

export function fetchComments(ids: string[]): Promise<Comment[]> {
    return Promise.all(
        ids.map(async (id) => {
            // Generate cache key for this request
            const cacheKey = getCacheKey(id);

            // Try to get posts from cache first
            let comment = commentCache.get(cacheKey);

            // If not in cache, fetch from API and store in cache
            if (!comment) {
                comment = await fetchData<Comment>(`item/${id}`);
                commentCache.set(cacheKey, comment);
            }
            if (comment.kids) {
                comment.comments = await fetchComments(comment.kids);
            }
            return comment;
        })
    );
}
