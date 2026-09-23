import {Link} from "react-router-dom"
import {useContext} from "react";
import toast from "react-hot-toast";
import { UserContext } from "./UserContext";
import { api } from "./api";

export default function Header(){
    const {setUserInfo, userInfo} = useContext(UserContext);

    async function logout(){
        try {
            await api.post('/logout');
        } catch {
            // cookie may already be gone — still clear local state
        }
        setUserInfo(null);
        toast.success('Logged out');
    }

    const username = userInfo?.username;

    return(
        <header className="site-header">
            <Link to='/' className='logo'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width:'24px',height:'24px'}}>
                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                    <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                </svg>
                Blogosphere
            </Link>
            <nav>
                {username && (
                    <>
                        <span className="greeting-badge">
                            👋 Welcome back, <span className="username">{username}</span>
                        </span>
                        <Link to="/create" className="btn btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                            </svg>
                            New Post
                        </Link>
                        <button onClick={logout} className="btn btn-ghost" type="button">Logout</button>
                    </>
                )}
                {!username && (
                    <>
                        <Link to='/login' className="btn btn-outline">Login</Link>
                        <Link to='/register' className="btn btn-primary">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
}
