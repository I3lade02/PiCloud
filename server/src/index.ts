import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'node:path';
import fs from 'node:fs';
import authRoutes from './routes/auth';
import fileRoutes from './routes/files';
import { requireAuth } from './middleware/auth';
import { connectMongo } from './lib/db';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

app.get('/api/health', async (_req, res) => {
    try {
        await connectMongo();
        res.json({ ok: true, db: 'mongo', ts: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ ok: false, error: 'DB connection failed' });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/files', requireAuth, fileRoutes);

//static FE
const distDir = path.resolve(process.cwd(), '../web/dist');
if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

const port = Number(process.env.PORT || 4000);
const host = process.env.BIND_HOST || '127.0.0.1';

app.listen(port, host, () => {
    console.log(`PiCloud & Mongo on http://${host}${port}`);
})