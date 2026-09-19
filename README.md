# 📝 MERN Blog Application

A full-stack blog application built using the MERN stack — MongoDB, Express.js, React.js, and Node.js. Users can register, log in, create/edit blog posts, and upload images.

---

## 🚀 Features

- 🔐 User Registration & Login with JWT
- ✏️ Create, Edit, View Blog Posts
- 🖼️ Upload & Display Images using Multer
- 🍪 Cookie-based Authentication
- 🧠 MongoDB via Mongoose
- ⚛️ React-based Responsive Frontend

---

## 📁 Project Structure

```
MERN_Blog/
├── api/                    # Backend (Node.js + Express)
│   ├── models/            # Mongoose schemas (User, Post)
│   ├── uploads/           # Uploaded images
│   ├── index.js           # Express server entry point
│   ├── package.json       # Backend dependencies
│   └── .env               # Environment variables
│
├── client/                # Frontend (React app)
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── CreatePost.js
│   │   │   ├── EditPost.js
│   │   │   ├── IndexPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── PostPage.js
│   │   │   └── RegisterPage.js
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── App.test.js
│   │   ├── Editor.js
│   │   ├── Header.js
│   │   ├── index.css
│   │   ├── index.js
│   │   ├── Layout.js
│   │   ├── logo.svg
│   │   ├── Posts.js
│   │   ├── reportWebVitals.js
│   │   ├── setupTests.js
│   │   └── UserContext.js
│   └── package.json       # Frontend dependencies
│
├── .gitignore             # Git ignore rules
└── README.md              # You're here!
```

---

## ⚙️ Backend Setup (API)

### 1. Go to the api/ directory
```bash
cd api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
```env
MONGO_URI=mongodb+srv://<your_user>:<your_pass>@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
PORT=4000
```
> Replace placeholders with your actual MongoDB URI and secret key.

### 4. Ensure uploads folder exists
```bash
mkdir -p uploads
touch uploads/.gitkeep
```
> This ensures the uploads folder is present even when empty.

### 5. Run the backend server
```bash
node index.js
```
> Server will run at: `http://localhost:4000`

---

## ⚛️ Frontend Setup (React)

### 1. Go to the `client/` directory
```bash
cd ../client
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Run the frontend
```bash
npm start
```
> Frontend will run at: `http://localhost:3000`

---

## 🛠 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | User login (sets cookie) |
| GET | `/profile` | Get logged-in user data |
| POST | `/logout` | User logout (clears cookie) |
| POST | `/post` | Create a new post |
| PUT | `/post` | Edit existing post |
| GET | `/post` | Get all posts |
| GET | `/post/:id` | Get post by ID |

---

## 🔧 Required Dependencies

### Backend (api/package.json)
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cookie-parser": "^1.4.6",
    "multer": "^1.4.5",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  }
}
```

### Frontend (client/package.json)
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "react-quill": "^2.0.0"
  }
}
```

---

## 📝 Environment Variables

Create a `.env` file in the `api/` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/blogdb?retryWrites=true&w=majority

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Server Port
PORT=4000

---


## 📦 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Frontend**: React.js, React Router
- **Authentication**: JWT, HTTP-only Cookies
- **File Uploads**: Multer
- **Rich Text Editor**: React Quill
- **Styling**: CSS3

---

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT authentication
- HTTP-only cookies
- CORS protection
- Input validation
- File upload restrictions

---

## 🐛 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Check your MongoDB URI in `.env`
   - Ensure your IP is whitelisted in MongoDB Atlas

2. **CORS Error**
   - Verify CORS origin matches your frontend URL
   - Check if credentials are enabled

3. **File Upload Issues**
   - Ensure `uploads/` folder exists
   - Check file permissions

4. **JWT Authentication Issues**
   - Verify JWT secret is set in `.env`
   - Check cookie settings in browser

---
