import { Link } from "react-router-dom";

export default function NotFound(){
    return(
        <div className="form-page">
            <div className="form-card">
                <h1>404</h1>
                <p className="form-subtitle">This page doesn't exist.</p>
                <Link to="/" className="btn btn-primary">Back to home</Link>
            </div>
        </div>
    )
}
