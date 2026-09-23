require('./setup');
const request = require('supertest');
const app = require('../app');

const PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
);

const registerUser = (username = 'testuser', password = 'password123') =>
    request(app).post('/register').send({ username, password });

const loginUser = async (username = 'testuser', password = 'password123') => {
    const res = await request(app).post('/login').send({ username, password });
    return res.headers['set-cookie'];
};

describe('auth', () => {
    test('register returns user without password hash', async () => {
        const res = await registerUser();
        expect(res.status).toBe(201);
        expect(res.body.username).toBe('testuser');
        expect(res.body.id).toBeDefined();
        expect(res.body.password).toBeUndefined();
    });

    test('register rejects short password', async () => {
        const res = await registerUser('testuser', 'short');
        expect(res.status).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    test('register rejects duplicate username', async () => {
        await registerUser();
        const res = await registerUser();
        expect(res.status).toBe(400);
    });

    test('login sets httpOnly cookie and returns user', async () => {
        await registerUser();
        const res = await request(app)
            .post('/login')
            .send({ username: 'testuser', password: 'password123' });
        expect(res.status).toBe(200);
        expect(res.body.username).toBe('testuser');
        expect(res.headers['set-cookie'][0]).toMatch(/token=/);
        expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/);
    });

    test('login fails with wrong password', async () => {
        await registerUser();
        const res = await request(app)
            .post('/login')
            .send({ username: 'testuser', password: 'wrongpass1' });
        expect(res.status).toBe(400);
    });

    test('profile returns 401 without cookie', async () => {
        const res = await request(app).get('/profile');
        expect(res.status).toBe(401);
    });

    test('profile returns user with valid cookie', async () => {
        await registerUser();
        const cookie = await loginUser();
        const res = await request(app).get('/profile').set('Cookie', cookie);
        expect(res.status).toBe(200);
        expect(res.body.username).toBe('testuser');
    });
});

module.exports = { PNG, registerUser, loginUser };
