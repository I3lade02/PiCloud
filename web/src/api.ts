const BASE = '';

export function setToken(token: string | null) {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
}

export function getToken() { return localStorage.getItem('token'); }

export async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers = new Headers(opts.headers || {});
    if (!headers.has('Content-Type') && !(opts.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const res = await fetch(`${BASE}${path}`, { ...opts, headers });
    if (!res.ok) throw new Error(await res.text());
    return res.headers.get('content-type')?.includes('application/json')
     ? res.json()
     : (await res.text() as any);
}