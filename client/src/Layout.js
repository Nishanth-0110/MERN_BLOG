import Header from "./Header"
import {Outlet} from "react-router-dom"

export default function Layout(){
    return(
        <>
            <main className="site-layout">
                <Header />
                <Outlet />
            </main>
            <footer className="site-footer">
                <p>© {new Date().getFullYear()} <span className="footer-brand">Blogosphere</span>. All rights reserved.</p>
            </footer>
        </>
    )
}