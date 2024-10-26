import { Link } from "@remix-run/react";
import styles from "./More.module.css";

export function More({ url }: { url: string }) {
    return (
        <Link to={url} className={styles.more} viewTransition>
            More
        </Link>
    );
}
