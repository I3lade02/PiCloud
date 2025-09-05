import { useState } from 'react';
import { api } from '../api';

type Props = { onAuth: (token: string) => void };

export default function LoginForm({ onAuth }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [error, setError] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            const res = await api<{ token: string }>(`/api/auth/${mode}`, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            onAuth(res.token);
        } catch (e:any) {
            setError(e.message || 'Chyba');
        }
    }

    return (
        <form onSubmit={submit} className='space-y-4'>
            <div className='space-y-1'>
                <label className='text-sm'>E-mail</label>
                <input className='w-full border rounded-lg px-3 py-2' type='email' value={email} onChange={e => setEmail(e.target.value)} required /> 
            </div>
            <div className='space-y-1'>
                <label className='text-sm'>Heslo</label>
                <input className='w-full border rounded-lg px-3 py-2' type='password' value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p className='text-sm text-red-600'>{error}</p>}
            <div className='flex items-center justify-between'>
                <button className='bg-black text-white rounded-lg px-4 py-2' type='submit'>
                    {mode === 'login' ? 'Přihlásit' : 'Registrovat'}
                </button>
                <button className='text-sm' type='button' onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
                    Přepnout na {mode === 'login' ? 'registraci' : 'přihlášení'}
                </button> 
            </div>
        </form>
    );
}
