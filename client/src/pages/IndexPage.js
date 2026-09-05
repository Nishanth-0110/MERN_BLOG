import { useEffect, useState, useContext } from "react"
import Post from "../Posts"
import { UserContext } from "../UserContext";
import { Link } from "react-router-dom";

export default function IndexPage(){
    const [posts,setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const {userInfo} = useContext(UserContext);
    const username = userInfo?.username;

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/post`)
            .then(response => response.json())
            .then(posts => {
                setPosts(posts);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

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
            </div>

            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading posts...</p>
                </div>
            )}

            {!loading && posts.length === 0 && (
                <div className="empty-state">
                    <h2>No stories yet</h2>
                    <p>Be the first to share something inspiring.</p>
                    {username && (
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
        </>
    )
}