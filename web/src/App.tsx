import { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api';
import LoginForm from './components/LoginForm';
import UploadWidget from './components/UploadWidget';
import FileList from './components/FileList';

type FileRow = { id: string; filename: string; size: number; created_at: string };

export default function App() {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(!!getToken());

  async function load() {
    setLoading(true);
    try {
      const data = await api<FileRow[]>('/api/files');
      setFiles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (authed) load(); }, [authed]);

  if (!authed) return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm bg-white shadow rounded-2xl p-6">
        <LoginForm onAuth={(t: any) => { setToken(t); setAuthed(true); }} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">PiCloud</h1>
        <button className="text-sm text-red-600" onClick={() => { setToken(null); setAuthed(false); }}>Odhlásit</button>
      </header>

      <div className="bg-white rounded-2xl shadow p-4 mb-6">
        <UploadWidget onUploaded={load} />
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-lg font-medium mb-3">Moje soubory</h2>
        {loading ? <p>Načítám…</p> : <FileList files={files} onChanged={load} />}
      </div>
    </div>
  );
}
