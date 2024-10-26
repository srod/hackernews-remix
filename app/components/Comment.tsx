import { Link } from "@remix-run/react";
import { formatDistance } from "date-fns";
import type { Comment } from "~/types/Comment";
import styles from "./Comment.module.css";
import { CommentsList } from "./Comments";

export function CommentItem({ comment }: { comment: Comment }) {
    return (
        <div className={styles.comment}>
            <p>
                <Link to={`/user/${comment.by}`} viewTransition>
                    {comment.by}
                </Link>{" "}
                •{" "}
                {formatDistance(new Date(comment.time * 1000), new Date(), {
                    addSuffix: true,
                })}
            </p>
            <div
                // biome-ignore lint/security/noDangerouslySetInnerHtml: this is a safe value
                dangerouslySetInnerHTML={{
                    __html: comment.text,
                }}
            />
            {comment?.comments && <CommentsList comments={comment.comments} />}
        </div>
    );
}