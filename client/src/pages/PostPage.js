import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { formatDistanceToNow } from "date-fns";
import { useContext } from "react";
import { UserContext } from "../UserContext";


export default function PostPage(){
    const [postInfo, setPostInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const {userInfo} = useContext(UserContext);
    const {id} = useParams();

    useEffect(() =>{
        fetch(`${process.env.REACT_APP_API_URL}/post/${id}`)
            .then(response =>{
                response.json().then(postInfo =>{
                    setPostInfo(postInfo);
                    setLoading(false);
                })
            })
            .catch(() => setLoading(false));
    }, [id])

    if(loading){
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading post...</p>
            </div>
        );
    }

    if(!postInfo) return "";

    const authorInitial = postInfo.author?.username ? postInfo.author.username.charAt(0).toUpperCase() : '?';
    const timeAgo = formatDistanceToNow(new Date(postInfo.createdAt), {addSuffix: true});

    return(
        <div className="post-page">
            <Link to="/" className="back-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
                </svg>
                Back to all posts
            </Link>

            <div className="post-hero-image">
                <img src={postInfo.cover.startsWith('http') ? postInfo.cover : `${process.env.REACT_APP_API_URL}/${postInfo.cover}`} alt={postInfo.title} />
            </div>

            <h1>{postInfo.title}</h1>

            <div className="post-author-bar">
                <div className="author-avatar">{authorInitial}</div>
                <div className="author-info">
                    <div className="written-by">Written by</div>
                    <div className="author-name">{postInfo.author.username}</div>
                </div>
                <time dateTime={postInfo.createdAt}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
                    </svg>
                    {timeAgo}
                </time>
                {userInfo.id === postInfo.author._id && (
                    <div className="post-actions">
                        <Link className="btn btn-outline" to={`/edit/${postInfo._id}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                                <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                            </svg>
                            Edit
                        </Link>
                    </div>
                )}
            </div>

            <div className="content" dangerouslySetInnerHTML={{__html:postInfo.content}} />
        </div>
    )
}