import {formatDistanceToNow} from "date-fns"
import { Link } from "react-router-dom";

export default function Post({_id, title, summary, cover, content, createdAt, author}){
    const timeAgo = formatDistanceToNow(new Date(createdAt), {addSuffix: true});
    const authorInitial = author?.username ? author.username.charAt(0).toUpperCase() : '?';

    return (
        <div className='post'>
            <div className='image'>
                <Link to={`/post/${_id}`}>
                    <img src={cover.startsWith('http') ? cover : `${process.env.REACT_APP_API_URL}/${cover}`} alt={title} />
                </Link>
            </div>
            <div className='texts'>
                <div className="post-meta">
                    <div className="author-avatar">{authorInitial}</div>
                    <div className="meta-text">
                        <span className="author-name">{author.username}</span>
                        <time dateTime={createdAt}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
                            </svg>
                            {timeAgo}
                        </time>
                    </div>
                </div>
                <Link to={`/post/${_id}`}>
                    <h2>{title}</h2>
                </Link>
                <p className='summary'>{summary}</p>
                <Link to={`/post/${_id}`} className="read-more">
                    Read more
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{width:'14px',height:'14px'}}>
                        <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}