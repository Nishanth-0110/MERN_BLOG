import {useContext, useState} from "react";
import {Navigate, Link} from "react-router-dom"
import { UserContext } from "../UserContext";

export default function LoginPage(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);
    const {setUserInfo} = useContext(UserContext);

    async function login(ev){
        ev.preventDefault();
        const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
            method: 'POST',
            body: JSON.stringify({username,password}),
            headers:{'Content-Type':'application/json'},
            credentials: 'include',
        });
        if(response.ok){
            response.json().then(userInfo =>{
                setUserInfo(userInfo)
                setRedirect(true);
            })
        }else{
            alert("Wrong Credentials");
        }
    }

    if(redirect){
        return <Navigate to={'/'} />
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
                    <h1>Welcome Back</h1>
                    <p className="form-subtitle">Sign in to continue writing</p>
                    <form onSubmit={login}>
                        <div className="form-group">
                            <label htmlFor="login-username">Username</label>
                            <input
                                id="login-username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={ev => setUsername(ev.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="login-password">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={ev => setPassword(ev.target.value)}
                            />
                        </div>
                        <button>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{width:'18px',height:'18px'}}>
                                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
                            </svg>
                            Sign In
                        </button>
                    </form>
                    <div className="form-footer">
                        Don't have an account? <Link to="/register">Register here</Link>
                    </div>
                </div>
            </div>
        </>
    )
}