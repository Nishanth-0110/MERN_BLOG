import { useState } from "react";
import 'react-quill/dist/quill.snow.css';
import { Navigate, Link } from "react-router-dom";
import Editor from "../Editor";

export default function CreatePost(){
    const [title,setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files,setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);

    async function createNewPost(ev){
        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('file', files[0]);
        ev.preventDefault();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/post`, {
            method: 'POST',
            body:data,
            credentials: 'include',
        });
        if(response.ok){
            setRedirect(true);
        }
    }

    if(redirect){
        return <Navigate to={'/'} />
    }

    return (
        <div className="create-edit-form">
            <Link to="/" className="back-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
                </svg>
                Back to home
            </Link>
            <div className="page-header">
                <h1>Create New Post</h1>
            </div>
            <form onSubmit={createNewPost}>
                <div className="form-group">
                    <label htmlFor="create-title">Title</label>
                    <input
                        id="create-title"
                        type="text"
                        placeholder="Give your post a compelling title"
                        value={title}
                        onChange={ev => setTitle(ev.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="create-summary">Summary</label>
                    <input
                        id="create-summary"
                        type="text"
                        placeholder="A brief description of your post"
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
                    <Editor value={content} onChange={setContent} />
                </div>
                <button>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{width:'18px',height:'18px'}}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
                    </svg>
                    Publish Post
                </button>
            </form>
        </div>
    )
}