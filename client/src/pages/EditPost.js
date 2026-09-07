import { useEffect, useState } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import Editor from "../Editor";

export default function EditPost(){
    const {id} = useParams();
    const [title,setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files,setFiles] = useState('');
    const [redirect,setRedirect] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() =>{
        fetch(`${process.env.REACT_APP_API_URL}/post/` + id)
            .then(response =>{
                response.json().then(postInfo =>{
                    setTitle(postInfo.title);
                    setContent(postInfo.content);
                    setSummary(postInfo.summary);
                    setLoading(false);
                })
            })
    }, [id]);

    async function updatePost(ev){
        ev.preventDefault();
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('id', id);
        if(files?.[0]){
            data.set('file', files?.[0]);
        }
        const response = await fetch(`${process.env.REACT_APP_API_URL}/post`, {
            method: 'PUT',
            body: data,
            credentials: 'include',
        });
        if(response.ok){
            setRedirect(true);
        }
    }

    if(redirect){
        return <Navigate to={'/post/' +id} />
    }

    if(loading){
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading post...</p>
            </div>
        );
    }

    return (
        <div className="create-edit-form">
            <Link to={`/post/${id}`} className="back-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
                </svg>
                Back to post
            </Link>
            <div className="page-header">
                <h1>Edit Post</h1>
            </div>
            <form onSubmit={updatePost}>
                <div className="form-group">
                    <label htmlFor="edit-title">Title</label>
                    <input
                        id="edit-title"
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={ev => setTitle(ev.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="edit-summary">Summary</label>
                    <input
                        id="edit-summary"
                        type="text"
                        placeholder="Summary"
                        value={summary}
                        onChange={ev => setSummary(ev.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Cover Image</label>
                    <input type="file" onChange={ev => setFiles(ev.target.files)} />
                </div>
                <div className="form-group">
                    <label>Content</label>
                    <Editor onChange={setContent} value={content} />
                </div>
                <button>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{width:'18px',height:'18px'}}>
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                    Update Post
                </button>
            </form>
        </div>
    )
}