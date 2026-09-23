import { useEffect, useState } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import Editor from "../Editor";
import { api, optimizeImage } from "../api";

export default function EditPost(){
    const {id} = useParams();
    const [title,setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [cover, setCover] = useState('');
    const [files,setFiles] = useState('');
    const [redirect,setRedirect] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() =>{
        api.get(`/post/${id}`)
            .then(postInfo =>{
                setTitle(postInfo.title);
                setContent(postInfo.content);
                setSummary(postInfo.summary);
                setCover(postInfo.cover);
                setLoading(false);
            })
            .catch(() => {
                setNotFound(true);
                setLoading(false);
            });
    }, [id]);

    function validate(){
        if (title.trim().length < 3) return 'Title must be at least 3 characters';
        if (!summary.trim()) return 'Summary is required';
        if (!content.replace(/<[^>]*>/g, '').trim()) return 'Content is required';
        return '';
    }

    async function updatePost(ev){
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
        if(files?.[0]){
            data.set('file', files[0]);
        }

        try {
            await api.putForm(`/post/${id}`, data);
            setRedirect(true);
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
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

    if(notFound){
        return (
            <div className="empty-state">
                <h2>Post not found</h2>
                <p>It may have been deleted.</p>
                <Link to="/" className="btn btn-primary">Back to home</Link>
            </div>
        );
    }

    const preview = files?.[0] ? URL.createObjectURL(files[0]) : optimizeImage(cover);

    return (
        <div className="create-edit-form">
            <Link to={`/post/${id}`} className="back-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04-1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
                </svg>
                Back to post
            </Link>
            <div className="page-header">
                <h1>Edit Post</h1>
            </div>
            {error && <p className="error-text">{error}</p>}
            <form onSubmit={updatePost}>
                <div className="form-group">
                    <label htmlFor="edit-title">Title</label>
                    <input
                        id="edit-title"
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={ev => setTitle(ev.target.value)}
                        required
                        minLength={3}
                        maxLength={200}
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
                    <Editor onChange={setContent} value={content} />
                </div>
                <button disabled={submitting}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{width:'18px',height:'18px'}}>
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                    {submitting ? 'Updating...' : 'Update Post'}
                </button>
            </form>
        </div>
    )
}
