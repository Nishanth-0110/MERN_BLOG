const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, { method = 'GET', body, form = false } = {}) {
    let res;
    try {
        res = await fetch(`${API_URL}${path}`, {
            method,
            credentials: 'include',
            ...(body !== undefined &&
                (form
                    ? { body }
                    : {
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(body),
                      })),
        });
    } catch {
        throw new Error('Network error — please check your connection');
    }

    const data = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(data?.error || `Request failed (${res.status})`);
    }
    return data;
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body }),
    put: (path, body) => request(path, { method: 'PUT', body }),
    del: (path) => request(path, { method: 'DELETE' }),
    postForm: (path, formData) => request(path, { method: 'POST', body: formData, form: true }),
    putForm: (path, formData) => request(path, { method: 'PUT', body: formData, form: true }),
};

export const optimizeImage = (url) =>
    url && url.startsWith('http') && url.includes('/upload/')
        ? url.replace('/upload/', '/upload/f_auto,q_auto/')
        : url;

export { API_URL };
