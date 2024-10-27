import { useIsFetching } from "@tanstack/react-query";
import NProgress from "nprogress";
import { useEffect } from "react";

export function GlobalLoadingIndicator() {
    const isFetching = useIsFetching();

    useEffect(() => {
        if (isFetching === 0) {
            setTimeout(() => NProgress.done(), 0);
            return;
        }

        NProgress.start();
    }, [isFetching]);

    return null;
}
