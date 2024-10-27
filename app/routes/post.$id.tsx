import { type LoaderFunction, type MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { Comments } from "~/components/Comments";
import { PostItem } from "~/components/Post";
import { fetchData } from "~/lib/fetch-data";
import type { Post } from "~/types/Post";

export const loader: LoaderFunction = async ({ params }) => {
    const id = params.id;
    const post = await fetchData<Post>(`item/${id}`);
    return json({ id, post });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [{ title: `Hacker News: ${data.post.title}` }];
};

export default function PostRoute() {
    const { id, post } = useLoaderData<typeof loader>();

    const { data } = useQuery({
        queryKey: ["post", id],
        queryFn: async () => {
            if (!id) return null;
            return await fetchData<Post>(`item/${id}`);
        },
        initialData: post,
    });

    if (!data) return null;

    return (
        <div>
            <PostItem post={data} showText={true} />
            <Comments id={id} kids={data?.kids} />
        </div>
    );
}
