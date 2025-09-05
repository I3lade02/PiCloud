import { getToken } from '../api';

type Props = { onUploaded: () => void };

export default function UploadWidget({ onUploaded }: Props) {
    async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const form = new FormData();
        form.append('file', file);
        const res = await fetch ('/api/files/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${getToken()}` },
            body: form
        });
        if (!res.ok) alert('Upload selhal');
        onUploaded();
        e.currentTarget.value = '';
    }

    return (
        <div className='flex items-center gap-3'>
            <input type='file' onChange={onChange} />
        </div>
    );
}