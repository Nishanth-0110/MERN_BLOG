import {useState} from "react";
import {Link, Navigate} from "react-router-dom";

export default function RegisterPage(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [redirect, setRedirect] = useState(false);

    async function register(ev){
        ev.preventDefault();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
            method: 'POST',
            body: JSON.stringify({username, password}),
            headers: {'Content-Type' : 'application/json'}
        });
        if(response.status === 200){
            setRedirect(true);
        }else{
            alert("Registration Failed")
        }
    }

    if(redirect){
        return <Navigate to="/login" />
    }

    return(
        <>
            <Link to="/" className="back-link">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
                </svg>
                Back to home
            </Link>
            <div className="form-page">
                <div className="form-card">
                    <h1>Join the Community</h1>
                    <p className="form-subtitle">Create your account to start writing</p>
                    <form onSubmit={register}>
                        <div className="form-group">
                            <label htmlFor="register-username">Username</label>
                            <input
                                id="register-username"
                                type="text"
                                placeholder="Choose a username"
                                value={username}
                                onChange={ev => setUsername(ev.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="register-password">Password</label>
                            <input
                                id="register-password"
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={ev => setPassword(ev.target.value)}
                            />
                        </div>
                        <button>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{width:'18px',height:'18px'}}>
                                <path d="M10 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM16.25 5.75a.75.75 0 0 0-1.5 0v2h-2a.75.75 0 0 0 0 1.5h2v2a.75.75 0 0 0 1.5 0v-2h2a.75.75 0 0 0 0-1.5h-2v-2Z" />
                            </svg>
                            Create Account
                        </button>
                    </form>
                    <div className="form-footer">
                        Already have an account? <Link to="/login">Login here</Link>
                    </div>
                </div>
            </div>
        </>
    )
}