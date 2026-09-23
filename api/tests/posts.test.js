require('./setup');
const request = require('supertest');
const app = require('../app');

const PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
);

const setupUser = async (username) => {
    await request(app).post('/register').send({ username, password: 'password123' });
    const res = await request(app)
        .post('/login')
        .send({ username, password: 'password123' });
    return res.headers['set-cookie'];
};

const createPost = (cookie, fields = {}) =>
    request(app)
        .post('/post')
        .set('Cookie', cookie)
        .field('title', fields.title || 'Test post')
        .field('summary', fields.summary || 'A test summary')
        .field('content', fields.content || '<p>Hello world</p>')
        .attach('file', PNG, 'cover.png');

describe('posts', () => {
    test('create requires auth', async () => {
        const res = await request(app)
            .post('/post')
            .field('title', 'x')
            .field('summary', 'x')
            .field('content', '<p>x</p>')
            .attach('file', PNG, 'cover.png');
        expect(res.status).toBe(401);
    });

    test('create requires a cover image', async () => {
        const cookie = await setupUser('userone');
        const res = await request(app)
            .post('/post')
            .set('Cookie', cookie)
            .field('title', 'x')
            .field('summary', 'x')
            .field('content', '<p>x</p>');
        expect(res.status).toBe(400);
    });

    test('create validates body', async () => {
        const cookie = await setupUser('userone');
        const res = await request(app)
            .post('/post')
            .set('Cookie', cookie)
            .field('title', '')
            .field('summary', 'x')
            .field('content', '<p>x</p>')
            .attach('file', PNG, 'cover.png');
        expect(res.status).toBe(400);
    });

    test('create works with file and sanitizes content', async () => {
        const cookie = await setupUser('userone');
        const res = await createPost(cookie, {
            content: '<p>Hi</p><script>alert(1)</script>',
        });
        expect(res.status).toBe(201);
        expect(res.body.content).not.toMatch(/script/);
        expect(res.body.cover).toBeDefined();
        expect(res.body.author).toBeDefined();
    });

    test('list returns pagination metadata and search filters', async () => {
        const cookie = await setupUser('userone');
        await createPost(cookie, { title: 'MongoDB tips' });
        await createPost(cookie, { title: 'React patterns' });

        const res = await request(app).get('/post?page=1&limit=10');
        expect(res.status).toBe(200);
        expect(res.body.posts).toHaveLength(2);
        expect(res.body.total).toBe(2);
        expect(res.body.pages).toBe(1);

        const filtered = await request(app).get('/post?search=mongodb');
        expect(filtered.body.posts).toHaveLength(1);
        expect(filtered.body.posts[0].title).toBe('MongoDB tips');
    });

    test('get post by id, 400 on invalid id, 404 on missing', async () => {
        const cookie = await setupUser('userone');
        const created = await createPost(cookie);

        const res = await request(app).get(`/post/${created.body._id}`);
        expect(res.status).toBe(200);
        expect(res.body.author.username).toBe('userone');

        expect((await request(app).get('/post/not-an-id')).status).toBe(400);
        expect(
            (await request(app).get('/post/507f1f77bcf86cd799439011')).status
        ).toBe(404);
    });

    test('only the author can update a post', async () => {
        const owner = await setupUser('owner1');
        const other = await setupUser('other1');
        const created = await createPost(owner);

        const forbidden = await request(app)
            .put(`/post/${created.body._id}`)
            .set('Cookie', other)
            .field('title', 'hijacked')
            .field('summary', 'x')
            .field('content', '<p>x</p>');
        expect(forbidden.status).toBe(403);

        const ok = await request(app)
            .put(`/post/${created.body._id}`)
            .set('Cookie', owner)
            .field('title', 'Updated title')
            .field('summary', 'x')
            .field('content', '<p>x</p>');
        expect(ok.status).toBe(200);
        expect(ok.body.title).toBe('Updated title');
    });

    test('author can delete their post and its comments', async () => {
        const owner = await setupUser('owner1');
        const other = await setupUser('other1');
        const created = await createPost(owner);

        await request(app)
            .post(`/post/${created.body._id}/comments`)
            .set('Cookie', other)
            .send({ text: 'nice post' });

        const forbidden = await request(app)
            .delete(`/post/${created.body._id}`)
            .set('Cookie', other);
        expect(forbidden.status).toBe(403);

        const res = await request(app)
            .delete(`/post/${created.body._id}`)
            .set('Cookie', owner);
        expect(res.status).toBe(204);

        const comments = await request(app).get(
            `/post/${created.body._id}/comments`
        );
        expect(comments.body).toHaveLength(0);
    });
});
