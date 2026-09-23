# 📝 Blogosphere — MERN Blog Platform

A full-stack blogging platform built with MongoDB, Express, React (Vite) and Node.js. Users can register, publish posts with cover images and rich-text content, search and paginate the feed, delete their own posts, and discuss via comments.

---

## 🚀 Features

- 🔐 JWT auth in httpOnly cookies (bcrypt password hashing, expiring tokens)
- ✏️ Create / edit / **delete** posts with a Quill rich-text editor
- 🖼️ Cover images on Cloudinary (auto format/quality, old assets cleaned up)
- 💬 Comments — signed-in users can comment and manage their own
- 🔎 Server-side **search** + **pagination** on the post feed
- 🛡️ Security: input sanitization (stored-XSS safe), zod validation, rate limiting, helmet, mongo-sanitize
- ⚙️ Modular API: routes / controllers / middleware / config + centralized error handling
- ✅ Backend tests (Jest + Supertest + mongodb-memory-server), frontend test (Vitest + RTL)
- ⚡ Vite frontend, ESLint + Prettier, GitHub Actions CI, Docker & docker-compose

---

## 📁 Project Structure

```
├── api/
│   ├── config/          # env validation, cloudinary/multer storage
│   ├── controllers/     # auth, post, comment handlers
│   ├── middleware/      # requireAuth, zod validate, ObjectId guard, errors
│   ├── models/          # User, Post, Comment (mongoose schemas + indexes)
│   ├── routes/          # auth.js, posts.js, comments.js
│   ├── tests/           # jest + supertest + mongodb-memory-server
│   ├── utils/           # ApiError, asyncHandler
│   ├── app.js           # express app assembly (exported for tests)
│   ├── index.js         # DB connect + listen
│   └── Dockerfile
│
├── client/
│   ├── src/
│   │   ├── api.js       # fetch wrapper (credentials, JSON, errors)
│   │   ├── UserContext.jsx / RequireAuth.jsx
│   │   ├── Header.jsx / Layout.jsx / Posts.jsx / Comments.jsx / Editor.jsx
│   │   └── pages/       # Index, Login, Register, CreatePost, EditPost, PostPage, NotFound
│   ├── index.html       # vite entry
│   ├── vite.config.js
│   ├── nginx.conf       # SPA fallback for the production image
│   └── Dockerfile
│
├── docker-compose.yml   # mongo + api + client
└── .github/workflows/ci.yml
```

---

## ⚙️ Backend Setup (api/)

```bash
cd api
npm install
cp .env.example .env    # fill in MONGO_URI, JWT_SECRET, Cloudinary keys
npm run dev             # node --watch
```

Server runs at `http://localhost:4000`.

## ⚛️ Frontend Setup (client/)

```bash
cd client
npm install
npm run dev             # vite dev server
```

Frontend runs at `http://localhost:5173` (set `VITE_API_URL` in `client/.env` to point at the API).

## 🐳 Docker

```bash
docker compose up --build
# client -> http://localhost:3000, api -> http://localhost:4000
```

## 🧪 Tests

```bash
cd api && npm test       # 17 integration tests against in-memory mongo
cd client && npm test    # vitest smoke test
```

---

## 🛠 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register (zod-validated, no hash in response) |
| POST | `/login` | Login — sets expiring httpOnly JWT cookie |
| GET | `/profile` | Current user (auth required) |
| POST | `/logout` | Clear auth cookie |
| GET | `/post?page=&limit=&search=` | Paginated post feed with search |
| GET | `/post/:id` | Single post |
| POST | `/post` | Create post (auth, multipart `file`) |
| PUT | `/post/:id` | Update post (author only) |
| DELETE | `/post/:id` | Delete post + comments + cloudinary asset (author only) |
| GET | `/post/:id/comments` | List comments |
| POST | `/post/:id/comments` | Add comment (auth) |
| DELETE | `/comment/:id` | Delete own comment |
| GET | `/health` | DB + uptime status |

---

## 🔐 Security

- `sanitize-html` allowlist on post content — prevents stored XSS through `dangerouslySetInnerHTML`
- zod validation on all write endpoints; ObjectId guard on `:id` params
- bcryptjs hashing, JWT with `expiresIn`, httpOnly + sameSite cookies (env-aware)
- express-rate-limit on auth and write routes; helmet headers; express-mongo-sanitize
- Multer file-type filter + 5MB limit

## 📦 Tech Stack

- **Backend**: Node.js, Express 4, Mongoose 6, JWT, zod, helmet, express-rate-limit
- **Frontend**: React 18, Vite 5, React Router 7, React Quill, react-hot-toast, date-fns
- **Infra**: MongoDB, Cloudinary, Docker, nginx, GitHub Actions
- **Testing**: Jest, Supertest, mongodb-memory-server, Vitest, Testing Library
