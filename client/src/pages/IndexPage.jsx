import { useEffect, useState, useContext } from "react"
import Post from "../Posts"
import { UserContext } from "../UserContext";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function IndexPage(){
    const [posts,setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [search, setSearch] = useState('');
    const {userInfo} = useContext(UserContext);
    const username = userInfo?.username;

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true);
            const params = new URLSearchParams({ page: String(page), limit: '9' });
            if (search.trim()) params.set('search', search.trim());
            api.get(`/post?${params}`)
                .then(data => {
                    setPosts(data.posts);
                    setPages(data.pages);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }, 300);
        return () => clearTimeout(timer);
    }, [page, search]);

    function onSearch(ev){
        setSearch(ev.target.value);
        setPage(1);
    }

    return(
        <>
            <div className="hero-section">
                <h1>
                    Discover <span className="accent">Stories</span>,<br/>
                    Ideas & Inspiration
                </h1>
                <p>
                    {username
                        ? `Welcome back, ${username}! Explore the latest posts or share your own story.`
                        : 'A space for curious minds. Read, write, and connect with ideas that matter.'
                    }
                </p>
                <div className="search-bar">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
                    </svg>
                    <input
                        type="search"
                        placeholder="Search posts..."
                        value={search}
                        onChange={onSearch}
                        aria-label="Search posts"
                    />
                </div>
            </div>

            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading posts...</p>
                </div>
            )}

            {!loading && posts.length === 0 && (
                <div className="empty-state">
                    <h2>{search ? 'No posts match your search' : 'No stories yet'}</h2>
                    <p>{search ? 'Try a different search term.' : 'Be the first to share something inspiring.'}</p>
                    {!search && username && (
                        <Link to="/create" className="btn btn-primary">Create Your First Post</Link>
                    )}
                </div>
            )}

            {!loading && posts.length > 0 && (
                <div className="posts-feed">
                    {posts.map(post => (
                        <Post key={post._id} {...post} />
                    ))}
                </div>
            )}

            {!loading && pages > 1 && (
                <div className="pagination">
                    <button
                        className="btn btn-outline"
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Newer
                    </button>
                    <span className="page-indicator">Page {page} of {pages}</span>
                    <button
                        className="btn btn-outline"
                        disabled={page >= pages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Older
                    </button>
                </div>
            )}
        </>
    )
}
