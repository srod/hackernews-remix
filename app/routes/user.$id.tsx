import { type LoaderFunction, type MetaFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import { UserItem } from "~/components/User";
import { fetchData } from "~/lib/fetch-data";
import type { User } from "~/types/User";

export const loader: LoaderFunction = async ({ params }) => {
    const id = params.id;
    const user = await fetchData<User>(`user/${id}`);
    return json({ id, user });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [{ title: `Hacker News: ${data.id}` }];
};

export default function UserRoute() {
    const { id, user } = useLoaderData<typeof loader>();

    const { data } = useQuery({
        queryKey: ["user", id],
        queryFn: async () => {
            if (!id) return null;
            return await fetchData<User>(`user/${id}`);
        },
        initialData: user,
    });

    if (!data) return null;

    return <UserItem user={data} />;
}
