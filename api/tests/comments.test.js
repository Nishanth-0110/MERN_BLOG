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

const createPost = async (cookie) => {
    const res = await request(app)
        .post('/post')
        .set('Cookie', cookie)
        .field('title', 'Post with comments')
        .field('summary', 'summary')
        .field('content', '<p>content</p>')
        .attach('file', PNG, 'cover.png');
    return res.body._id;
};

describe('comments', () => {
    test('comment lifecycle: create, list, delete', async () => {
        const owner = await setupUser('author1');
        const reader = await setupUser('reader1');
        const postId = await createPost(owner);

        const created = await request(app)
            .post(`/post/${postId}/comments`)
            .set('Cookie', reader)
            .send({ text: 'Great read!' });
        expect(created.status).toBe(201);
        expect(created.body.author.username).toBe('reader1');

        const list = await request(app).get(`/post/${postId}/comments`);
        expect(list.body).toHaveLength(1);

        const forbidden = await request(app)
            .delete(`/comment/${created.body._id}`)
            .set('Cookie', owner);
        expect(forbidden.status).toBe(403);

        const res = await request(app)
            .delete(`/comment/${created.body._id}`)
            .set('Cookie', reader);
        expect(res.status).toBe(204);
    });

    test('comment requires auth and non-empty text', async () => {
        const owner = await setupUser('author1');
        const postId = await createPost(owner);

        expect(
            (await request(app).post(`/post/${postId}/comments`).send({ text: 'hi' }))
                .status
        ).toBe(401);

        const cookie = await setupUser('reader1');
        expect(
            (
                await request(app)
                    .post(`/post/${postId}/comments`)
                    .set('Cookie', cookie)
                    .send({ text: '   ' })
            ).status
        ).toBe(400);
    });
});
