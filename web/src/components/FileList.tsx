import { getToken } from '../api';

type FileRow = { id: string; filename: string; size: number; created_at: string };
type Props = { files: FileRow[]; onChanged: () => void };

export default function FileList({ files, onChanged }: Props) {
  async function download(id: string) {
    const res = await fetch(`/api/files/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) return alert('Chyba při stahování');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function remove(id: string) {
    if (!confirm('Smazat soubor?')) return;
    const res = await fetch(`/api/files/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) return alert('Smazání selhalo');
    onChanged();
  }

  if (files.length === 0) return <p>Žádné soubory zatím nejsou.</p>;

  return (
    <ul className="divide-y">
      {files.map(f => (
        <li key={f.id} className="py-3 flex items-center justify-between">
          <div>
            <p className="font-medium">{f.filename}</p>
            <p className="text-sm text-gray-500">
              {(f.size / 1024).toFixed(1)} kB • {new Date(f.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="text-blue-600" onClick={() => download(f.id)}>Stáhnout</button>
            <button className="text-red-600" onClick={() => remove(f.id)}>Smazat</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
