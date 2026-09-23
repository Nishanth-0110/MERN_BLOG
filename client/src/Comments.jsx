import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { UserContext } from "./UserContext";
import { api } from "./api";

export default function Comments({postId}){
    const {userInfo} = useContext(UserContext);
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get(`/post/${postId}/comments`)
            .then(setComments)
            .catch(() => {});
    }, [postId]);

    async function submit(ev){
        ev.preventDefault();
        if (!text.trim()) return;
        setSubmitting(true);
        try {
            const comment = await api.post(`/post/${postId}/comments`, {text});
            setComments(prev => [comment, ...prev]);
            setText('');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    async function remove(id){
        try {
            await api.del(`/comment/${id}`);
            setComments(prev => prev.filter(c => c._id !== id));
            toast.success('Comment deleted');
        } catch (err) {
            toast.error(err.message);
        }
    }

    return (
        <section className="comments-section">
            <h2>Comments {comments.length > 0 && `(${comments.length})`}</h2>

            {userInfo?.username ? (
                <form className="comment-form" onSubmit={submit}>
                    <textarea
                        placeholder="Share your thoughts..."
                        value={text}
                        onChange={ev => setText(ev.target.value)}
                        maxLength={1000}
                        rows={3}
                    />
                    <button className="btn btn-primary" disabled={submitting || !text.trim()}>
                        {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            ) : (
                <p className="comment-login-hint">
                    <Link to="/login">Log in</Link> to join the discussion.
                </p>
            )}

            <div className="comment-list">
                {comments.map(comment => (
                    <div className="comment" key={comment._id}>
                        <div className="author-avatar">
                            {comment.author?.username?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="comment-body">
                            <div className="comment-meta">
                                <span className="author-name">{comment.author?.username}</span>
                                <time>{formatDistanceToNow(new Date(comment.createdAt), {addSuffix: true})}</time>
                                {userInfo?.id === comment.author?._id && (
                                    <button
                                        className="comment-delete"
                                        onClick={() => remove(comment._id)}
                                        aria-label="Delete comment"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            <p className="comment-text">{comment.text}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
