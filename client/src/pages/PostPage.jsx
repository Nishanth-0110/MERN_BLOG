import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { formatDistanceToNow } from "date-fns";
import { useContext } from "react";
import toast from "react-hot-toast";
import { UserContext } from "../UserContext";
import { api, optimizeImage } from "../api";
import Comments from "../Comments";

export default function PostPage(){
    const [postInfo, setPostInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const {userInfo} = useContext(UserContext);
    const {id} = useParams();
    const navigate = useNavigate();

    useEffect(() =>{
        api.get(`/post/${id}`)
            .then(postInfo =>{
                setPostInfo(postInfo);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [id])

    async function deletePost(){
        if (!window.confirm('Delete this post? This cannot be undone.')) return;
        setDeleting(true);
        try {
            await api.del(`/post/${id}`);
            toast.success('Post deleted');
            navigate('/');
        } catch (err) {
            toast.error(err.message);
            setDeleting(false);
        }
    }

    if(loading){
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading post...</p>
            </div>
        );
    }

    if(!postInfo){
        return (
            <div className="empty-state">
                <h2>{error ? 'Could not load post' : 'Post not found'}</h2>
                <p>{error || 'It may have been deleted or never existed.'}</p>
                <Link to="/" className="btn btn-primary">Back to home</Link>
            </div>
        );
    }

    const authorName = postInfo.author?.username || 'Unknown';
    const authorInitial = authorName.charAt(0).toUpperCase();
    const timeAgo = formatDistanceToNow(new Date(postInfo.createdAt), {addSuffix: true});
    const readingTime = Math.max(1, Math.ceil(
        postInfo.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length / 200
    ));
    const isAuthor = userInfo?.id && String(postInfo.author?._id) === String(userInfo.id);

    return(
        <div className="post-page">
            <Link to="/" className="back-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04-1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
                </svg>
                Back to all posts
            </Link>

            <div className="post-hero-image">
                <img src={optimizeImage(postInfo.cover)} alt={postInfo.title} />
            </div>

            <h1>{postInfo.title}</h1>
            <p className="reading-time">{readingTime} min read</p>

            <div className="post-author-bar">
                <div className="author-avatar">{authorInitial}</div>
                <div className="author-info">
                    <div className="written-by">Written by</div>
                    <div className="author-name">{authorName}</div>
                </div>
                <time dateTime={postInfo.createdAt}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
                    </svg>
                    {timeAgo}
                </time>
                {isAuthor && (
                    <div className="post-actions">
                        <Link className="btn btn-outline" to={`/edit/${postInfo._id}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                            </svg>
                            Edit
                        </Link>
                        <button
                            className="btn btn-danger"
                            onClick={deletePost}
                            disabled={deleting}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                            </svg>
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                )}
            </div>

            <div className="content" dangerouslySetInnerHTML={{__html:postInfo.content}} />

            <Comments postId={postInfo._id} />
        </div>
    )
}
