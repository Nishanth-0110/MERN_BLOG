import { createContext, useEffect, useState } from "react";
import { api } from "./api";

export const UserContext = createContext({});

export function UserContextProvider({children}){
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/profile')
            .then((info) => setUserInfo(info))
            .catch(() => setUserInfo(null))
            .finally(() => setLoading(false));
    }, []);

    return(
    <UserContext.Provider value={{userInfo,setUserInfo,loading}}>
        {children}
    </UserContext.Provider>
        );
}
