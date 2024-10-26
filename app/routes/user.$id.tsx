import { type LoaderFunction, type MetaFunction, json } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { QueryClient, dehydrate, useQuery } from "@tanstack/react-query";
import { UserItem } from "~/components/User";
import { fetchData } from "~/lib/fetch-data";
import type { User } from "~/types/User";

export const loader: LoaderFunction = async ({ params }) => {
    const id = params.id;

    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
        queryKey: ["user", id],
        queryFn: async () => {
            if (!id) return null;
            return await fetchData<User>(`user/${id}`);
        },
    });

    return json({ dehydratedState: dehydrate(queryClient), id });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [{ title: `Hacker News: ${data.id}` }];
};

export default function UserRoute() {
    const params = useParams();
    const id = params.id;

    const { data: user } = useQuery({
        queryKey: ["user", id],
        queryFn: async () => {
            if (!id) return null;
            return await fetchData<User>(`user/${id}`);
        },
    });

    if (!user) return null;

    return <UserItem user={user} />;
}
