import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import Editor from "../Editor";
import { api } from "../api";

export default function CreatePost(){
    const [title,setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [files,setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!files?.[0]) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(files[0]);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [files]);

    function validate(){
        if (title.trim().length < 3) return 'Title must be at least 3 characters';
        if (!summary.trim()) return 'Summary is required';
        if (!content.replace(/<[^>]*>/g, '').trim()) return 'Content is required';
        if (!files?.[0]) return 'Cover image is required';
        return '';
    }

    async function createNewPost(ev){
        ev.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        setError('');
        setSubmitting(true);

        const data = new FormData();
        data.set('title', title);
        data.set('summary', summary);
        data.set('content', content);
        data.set('file', files[0]);

        try {
            await api.postForm('/post', data);
            setRedirect(true);
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    }

    if(redirect){
        return <Navigate to={'/'} />
    }

    return (
        <div className="create-edit-form">
            <Link to="/" className="back-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04-1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
                </svg>
                Back to home
            </Link>
            <div className="page-header">
                <h1>Create New Post</h1>
            </div>
            {error && <p className="error-text">{error}</p>}
            <form onSubmit={createNewPost}>
                <div className="form-group">
                    <label htmlFor="create-title">Title</label>
                    <input
                        id="create-title"
                        type="text"
                        placeholder="Give your post a compelling title"
                        value={title}
                        onChange={ev => setTitle(ev.target.value)}
                        required
                        minLength={3}
                        maxLength={200}
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
                        required
                        maxLength={500}
                    />
                </div>
                <div className="form-group">
                    <label>Cover Image</label>
                    <input type="file" accept="image/*" onChange={ev => setFiles(ev.target.files)} />
                    {preview && <img className="cover-preview" src={preview} alt="Cover preview" />}
                </div>
                <div className="form-group">
                    <label>Content</label>
                    <Editor value={content} onChange={setContent} />
                </div>
                <button disabled={submitting}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{width:'18px',height:'18px'}}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v2.5h-2.5a.75.75 0 0 0 0 1.5h2.5v2.5a.75.75 0 0 0 1.5 0v-2.5h2.5a.75.75 0 0 0 0-1.5h-2.5v-2.5Z" clipRule="evenodd" />
                    </svg>
                    {submitting ? 'Publishing...' : 'Publish Post'}
                </button>
            </form>
        </div>
    )
}
