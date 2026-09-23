import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function RequireAuth({children}){
    const {userInfo, loading} = useContext(UserContext);
    const location = useLocation();

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }
    if (!userInfo?.username) {
        return <Navigate to="/login" state={{from: location}} replace />;
    }
    return children;
}
