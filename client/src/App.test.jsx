import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { test, expect, vi } from 'vitest';
import App from './App';

vi.stubGlobal(
    'fetch',
    vi.fn(() =>
        Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ error: 'Not authenticated' }),
        })
    )
);

test('renders the blogosphere header', async () => {
    render(
        <MemoryRouter>
            <App />
        </MemoryRouter>
    );
    const matches = await screen.findAllByText('Blogosphere');
    expect(matches.length).toBeGreaterThan(0);
});
