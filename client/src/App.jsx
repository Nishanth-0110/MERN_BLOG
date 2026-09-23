import './App.css';
import {Route, Routes} from "react-router-dom"
import { Toaster } from "react-hot-toast";
import Layout from "./Layout"
import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { UserContextProvider } from './UserContext';
import CreatePost from './pages/CreatePost';
import PostPage from './pages/PostPage';
import EditPost from './pages/EditPost';
import NotFound from './pages/NotFound';
import RequireAuth from './RequireAuth';


function App() {
  return (
    <UserContextProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#12121a',
            color: '#f4f4f5',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          },
        }}
      />
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path={'/login'} element={<LoginPage />} />
          <Route path={'/register'} element={<RegisterPage/>}/>
          <Route path={'/create'} element={<RequireAuth><CreatePost /></RequireAuth>} />
          <Route path="/post/:id" element={<PostPage/>} />
          <Route path="/edit/:id" element={<RequireAuth><EditPost /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;
