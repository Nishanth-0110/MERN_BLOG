# 🐛 Blogosphere — Full Project Bug Report

> Complete audit of the MERN blog project, covering both backend (API) and frontend (React client).

---

## Critical Bugs (Feature-Breaking)

### Bug #1 — Broken SVG in Login Button (LoginPage.jsx)

| Detail | Value |
|--------|-------|
| **File** | [LoginPage.jsx](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/client/src/pages/LoginPage.jsx#L71) |
| **Line** | 71 |
| **Severity** | 🔴 Critical — renders broken/invalid SVG |

The SVG `<path>` data inside the login button contains a malformed `d` attribute. Specifically:

```
d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5a2.25 2.25 0 0 1 13 4.25v2..."
```

The value `13` is not a valid SVG path coordinate in this context — it should be `2.25 2.25 0 0 1 2.25 2.25` (forming a proper arc command for a rounded rectangle). This produces a visually broken or invisible icon next to the "Sign In" text.

---

### Bug #2 — `EditPost` Sends FormData via PUT but Backend Runs Zod Validation on `req.body`

| Detail | Value |
|--------|-------|
| **Files** | [EditPost.jsx](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/client/src/pages/EditPost.jsx#L51-L57), [posts.js (route)](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/api/routes/posts.js#L40-L48) |
| **Severity** | 🔴 Critical — edit post may fail depending on multer/body parsing order |

The route chain for `PUT /post/:id` is:

```
requireAuth → writeLimiter → validateObjectId() → upload.single('file') → validate(postSchema) → updatePost
```

When `FormData` is sent, `multer` parses it and populates `req.body` with text fields. The `validate(postSchema)` middleware then runs Zod's `.safeParse(req.body)` on the multer-parsed body. **This works** because multer runs first.

However, there's a subtle issue: if the user sends a request **without** a file (just text fields via FormData), `multer` still processes the multipart body, but `req.body` fields are all **strings** — including `content`, which Zod validates with `.min(1)`. If `content` is empty HTML like `<p><br></p>`, Zod will pass it (it's a non-empty string), but the backend's `sanitizeHtml` will strip most of it, potentially storing near-empty content.

---

### Bug #3 — Comment Delete Button Never Appears (ID Mismatch)

| Detail | Value |
|--------|-------|
| **File** | [Comments.jsx](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/client/src/Comments.jsx#L78) |
| **Line** | 78 |
| **Severity** | 🔴 Critical — users can never delete their own comments from the UI |

The delete button visibility check is:

```jsx
{userInfo?.id === comment.author?._id && (
```

The problem: `userInfo` is set from the `/profile` endpoint which returns `{ id: req.user.id, username: req.user.username }`. The `req.user` comes from JWT verification which sets `{ username, id: userDoc._id }`. So `userInfo.id` is the user's MongoDB `_id` as a **string**.

Meanwhile, `comment.author._id` comes from the `.populate('author', ['username'])` call, which returns the author's `_id` as a **MongoDB ObjectId string**.

This comparison **should** work in most cases since both are string representations. **However**, the real problem is that `userInfo.id` comes from the JWT payload where it was set as `userDoc._id` — and after JSON serialization through JWT and the profile endpoint, it remains a string. The `comment.author._id` from the populated Mongoose document is also a string in the JSON response. So this comparison *may* work.

**BUT** — the JWT payload signs `{ username, id: userDoc._id }`, then the profile endpoint returns `{ id: req.user.id, username: req.user.username }`. The `req.user.id` here is from the decoded JWT. If the JWT library serializes the ObjectId to a string, the comparison works. If any step introduces an inconsistency (e.g., the `_id` is an ObjectId object in the populated response), the comparison will **always fail**, and users will never see the delete button.

> [!IMPORTANT]
> Test this by logging in, posting a comment, and checking if the "Delete" button appears. If it doesn't, this is confirmed as a string-vs-ObjectId comparison bug.

---

### Bug #4 — Post Edit Authorization Not Checked on Frontend

| Detail | Value |
|--------|-------|
| **File** | [EditPost.jsx](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/client/src/pages/EditPost.jsx#L19-L31) |
| **Severity** | 🟡 Medium — any logged-in user can access the edit form (backend still blocks the save) |

`EditPost` fetches the post data but never checks if the current user is the author. Any logged-in user can navigate to `/edit/:id` and see the edit form pre-filled with another user's post content. The **save** will fail (backend returns 403), but the UX is confusing and leaks post content into editable fields.

---

## Medium Bugs (Functional Issues)

### Bug #5 — `bcrypt.genSaltSync` Called at Module Load (Shared Salt)

| Detail | Value |
|--------|-------|
| **File** | [authController.js](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/api/controllers/authController.js#L9) |
| **Line** | 9 |
| **Severity** | 🟡 Medium — security concern |

```js
const salt = bcrypt.genSaltSync(10);
```

The salt is generated **once** when the module loads and reused for all password hashing. This means every user's password is hashed with the **same salt**. While bcrypt's output is still unique due to the password input, using a fixed salt weakens the security model — if two users have the same password, they'll have the **same hash**, making it easier to identify duplicate passwords in a database breach.

**Best practice**: Generate a new salt per password:
```js
const hash = bcrypt.hashSync(password, 10);
```

---

### Bug #6 — `jwt.sign` Uses Callback but Error Inside Callback Is Unhandled

| Detail | Value |
|--------|-------|
| **File** | [authController.js](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/api/controllers/authController.js#L49-L57) |
| **Lines** | 49–57 |
| **Severity** | 🟡 Medium — unhandled error crashes the server |

```js
jwt.sign(
    { username, id: userDoc._id },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
    (err, token) => {
        if (err) throw err;  // ← This throw is inside a callback!
        res.cookie('token', token, env.cookieOptions).json(publicUser(userDoc));
    }
);
```

The `throw err` inside the callback is **not caught** by the `asyncHandler` wrapper (which only catches Promise rejections). If `jwt.sign` fails, this will throw an unhandled exception and **crash the Node.js process**.

---

### Bug #7 — `URL.createObjectURL` Memory Leak in CreatePost & EditPost

| Detail | Value |
|--------|-------|
| **Files** | [CreatePost.jsx](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/client/src/pages/CreatePost.jsx#L16), [EditPost.jsx](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/client/src/pages/EditPost.jsx#L91) |
| **Severity** | 🟡 Medium — memory leak |

Both components call `URL.createObjectURL(files[0])` for the cover image preview but **never** call `URL.revokeObjectURL()` to release the blob URL. Each time the user selects a new file, a new blob URL is created and the previous one leaks memory.

---

### Bug #8 — Race Condition in `deletePost` (Backend)

| Detail | Value |
|--------|-------|
| **File** | [postController.js](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/api/controllers/postController.js#L125-L127) |
| **Lines** | 125–127 |
| **Severity** | 🟡 Medium — orphaned comments if post deletion fails mid-way |

```js
await postDoc.deleteOne();
await Comment.deleteMany({ post: postDoc._id });
await destroyCover(postDoc.coverPublicId);
```

These three operations are **not atomic**. If the server crashes after `deleteOne()` but before `deleteMany()`, comments will be orphaned in the database. The delete order is also wrong — comments should be deleted **before or alongside** the post deletion to avoid orphans.

---

### Bug #9 — Cloudinary Not Configured Gracefully for Local Development

| Detail | Value |
|--------|-------|
| **File** | [upload.js](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/api/config/upload.js#L10-L23) |
| **Severity** | 🟡 Medium — app crashes without Cloudinary credentials in non-test mode |

The upload config only uses `memoryStorage` in test mode. In development, it always tries to configure Cloudinary. If `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, or `CLOUDINARY_API_SECRET` are not set in the `.env` file, the Cloudinary storage will be configured with `undefined` values, causing **runtime errors** when trying to upload images.

These variables are **not** in the `required` array in [env.js](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/api/config/env.js#L6), so the server will start fine but crash on the first image upload.

---

### Bug #10 — `validate` Middleware Overwrites `req.body` After Multer Parsing

| Detail | Value |
|--------|-------|
| **File** | [validate.js](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/api/middleware/validate.js#L4-L11) |
| **Line** | 9 |
| **Severity** | 🟡 Medium — potential data loss for form fields |

```js
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return next(new ApiError(400, result.error.issues[0].message));
    }
    req.body = result.data;  // ← Overwrites req.body
    next();
};
```

After multer populates `req.body` with all form fields, `validate` runs Zod's `safeParse` and then replaces `req.body` with `result.data`. The `postSchema` only defines `title`, `summary`, and `content` — any extra fields multer parsed will be **silently dropped**. While this is arguably a security feature (stripping unknown fields), it could cause issues if future fields are added to the form but not the schema.

---

## Low Severity Issues (UX / Code Quality)

### Bug #11 — No Error Handling for Invalid Post ID in PostPage

| Detail | Value |
|--------|-------|
| **File** | [PostPage.jsx](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/client/src/pages/PostPage.jsx#L18-L25) |
| **Severity** | 🟢 Low — silent failure, shows "Post not found" for all errors |

```jsx
useEffect(() => {
    api.get(`/post/${id}`)
        .then(postInfo => {
            setPostInfo(postInfo);
            setLoading(false);
        })
        .catch(() => setLoading(false));  // ← Swallows all errors
}, [id])
```

Network errors, server errors, and "not found" errors are all silently caught. The user always sees "Post not found" even when the real problem is a network failure or server crash.

---

### Bug #12 — Search Debounce Resets on Every Keystroke But Also Resets `page`

| Detail | Value |
|--------|-------|
| **File** | [IndexPage.jsx](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/client/src/pages/IndexPage.jsx#L32-L35) |
| **Severity** | 🟢 Low — subtle UX issue |

```jsx
function onSearch(ev) {
    setSearch(ev.target.value);
    setPage(1);  // resets page on every keystroke
}
```

The `setPage(1)` call on every keystroke is correct in intent but causes the `useEffect` to trigger twice per keystroke — once for `search` change and once for `page` change (if page was > 1). With the 300ms debounce on the `useEffect`, the `page` change might trigger a fetch with the old search term before the debounce fires with the new one.

---

### Bug #13 — `Posts.jsx` Does Not Handle Missing `author` Gracefully

| Detail | Value |
|--------|-------|
| **File** | [Posts.jsx](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/client/src/Posts.jsx#L20) |
| **Line** | 20 |
| **Severity** | 🟢 Low — crashes if author is null |

```jsx
<span className="author-name">{author.username}</span>
```

Line 7 uses optional chaining (`author?.username`), but line 20 directly accesses `author.username` without optional chaining. If `author` is `null` or `undefined` (e.g., if the author's account was deleted), this will throw a runtime error and crash the component.

---

### Bug #14 — No `key` Attribute Warning Potential in Comments

| Detail | Value |
|--------|-------|
| **File** | [Comments.jsx](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/client/src/Comments.jsx#L69-L70) |
| **Severity** | 🟢 Low — no actual bug, but fragile |

The `key={comment._id}` is fine, but when a new comment is created via `api.post()`, the response from the server includes the populated comment document. If the server ever returns a response without `_id`, the key will be `undefined`, causing React reconciliation issues.

---

### Bug #15 — Missing `react-quill` CSS Import in EditPost

| Detail | Value |
|--------|-------|
| **File** | [EditPost.jsx](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/client/src/pages/EditPost.jsx) |
| **Severity** | 🟢 Low — Quill editor may render without styles |

[CreatePost.jsx](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/client/src/pages/CreatePost.jsx#L2) imports `'react-quill/dist/quill.snow.css'` but `EditPost.jsx` does not. The editor in edit mode relies on `CreatePost` having been loaded first (or the CSS being globally bundled). If a user navigates directly to `/edit/:id` without visiting `/create` first, the Quill editor **may** render unstyled.

> [!NOTE]
> In practice, Vite/Webpack bundles all CSS imports together, so this likely works. But it's a fragile dependency on import ordering.

---

### Bug #16 — `login` Function's Error Inside `jwt.sign` Callback Not Forwarded to Express Error Handler

| Detail | Value |
|--------|-------|
| **File** | [authController.js](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/api/controllers/authController.js#L49-L57) |
| **Severity** | 🟢 Low (duplicate of Bug #6 — listed here for completeness) |

The `asyncHandler` wrapper wraps the outer `async` function in a `Promise.resolve().catch(next)`. But the `jwt.sign` callback is **not** within that promise chain. So `throw err` inside the callback bypasses Express's error handling entirely.

---

### Bug #17 — Logout Route Not Protected by Auth Middleware

| Detail | Value |
|--------|-------|
| **File** | [auth.js (routes)](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/api/routes/auth.js#L26) |
| **Line** | 26 |
| **Severity** | 🟢 Low — unauthenticated users can call logout |

```js
router.post('/logout', logout);
```

The logout endpoint has no `requireAuth` middleware. Any unauthenticated request can call this endpoint. While this is technically harmless (it just clears a cookie), it's inconsistent with the other auth endpoints and could be used to clear cookies for CSRF scenarios.

---

### Bug #18 — Missing `import 'react-quill/dist/quill.snow.css'` in Editor Component Itself

| Detail | Value |
|--------|-------|
| **File** | [Editor.jsx](file:///c:/Users/NISHANTH/Desktop/BLOG_MERN/repo/client/src/Editor.jsx) |
| **Severity** | 🟢 Low — CSS import is in the wrong place |

The Quill CSS is imported in `CreatePost.jsx` instead of in the `Editor.jsx` component itself. The `Editor` component is the one that renders `ReactQuill`, so the CSS should be co-located with it to ensure it's always available regardless of which page imports `Editor`.

---

## Summary Table

| # | Bug | Severity | Area | File |
|---|-----|----------|------|------|
| 1 | Broken SVG path in Login button | 🔴 Critical | Frontend | `LoginPage.jsx` |
| 2 | FormData + Zod validation: empty HTML content passes | 🔴 Critical | Backend | `posts.js`, `postController.js` |
| 3 | Comment delete button never shown (potential ID mismatch) | 🔴 Critical | Frontend | `Comments.jsx` |
| 4 | Edit page accessible by non-authors | 🟡 Medium | Frontend | `EditPost.jsx` |
| 5 | Shared bcrypt salt across all users | 🟡 Medium | Backend | `authController.js` |
| 6 | `jwt.sign` callback `throw` crashes server | 🟡 Medium | Backend | `authController.js` |
| 7 | `URL.createObjectURL` memory leak | 🟡 Medium | Frontend | `CreatePost.jsx`, `EditPost.jsx` |
| 8 | Non-atomic post deletion (orphaned comments) | 🟡 Medium | Backend | `postController.js` |
| 9 | Cloudinary not configured for local dev | 🟡 Medium | Backend | `upload.js` |
| 10 | `validate` middleware overwrites `req.body` | 🟡 Medium | Backend | `validate.js` |
| 11 | Silent error swallowing in PostPage | 🟢 Low | Frontend | `PostPage.jsx` |
| 12 | Double state update in search handler | 🟢 Low | Frontend | `IndexPage.jsx` |
| 13 | Missing optional chaining for `author.username` | 🟢 Low | Frontend | `Posts.jsx` |
| 14 | Fragile comment key dependency | 🟢 Low | Frontend | `Comments.jsx` |
| 15 | Missing Quill CSS import in EditPost | 🟢 Low | Frontend | `EditPost.jsx` |
| 16 | JWT callback error not forwarded (dup of #6) | 🟢 Low | Backend | `authController.js` |
| 17 | Logout route unprotected | 🟢 Low | Backend | `auth.js` |
| 18 | Quill CSS in wrong component | 🟢 Low | Frontend | `Editor.jsx` |

---

> **Total: 18 bugs identified** — 3 Critical, 7 Medium, 8 Low
