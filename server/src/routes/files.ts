import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { nanoid } from 'nanoid';
import { connectMongo, File } from '../lib/db.js';
import mongoose from 'mongoose';

const router = Router();
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/lib/picloud/uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const id = nanoid();
    const ext = path.extname(file.originalname);
    cb(null, `${id}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 200 } }); // 200MB

router.post('/upload', upload.single('file'), async (req, res) => {
  const user = (req as any).user;
  if (!req.file) return res.status(400).json({ error: 'No file' });
  await connectMongo();

  const doc = await File.create({
    filename: req.file.originalname,
    path: req.file.filename,
    size: req.file.size,
    owner_id: new mongoose.Types.ObjectId(user.id)
  });

  res.json({ id: String(doc._id) });
});

router.get('/', async (req, res) => {
  const user = (req as any).user;
  await connectMongo();

  const rows = await File.find({ owner_id: user.id })
    .select({ filename: 1, size: 1, created_at: 1 })
    .sort({ created_at: -1 })
    .lean();

  // sjednotíme tvar odpovědi s původní FE
  const data = rows.map(r => ({
    id: String(r._id),
    filename: r.filename,
    size: r.size,
    created_at: r.created_at
  }));

  res.json(data);
});

router.get('/:id', async (req, res) => {
  const user = (req as any).user;
  await connectMongo();

  const file = await File.findOne({ _id: req.params.id, owner_id: user.id }).lean();
  if (!file) return res.status(404).json({ error: 'Not found' });

  res.download(path.join(UPLOAD_DIR, file.path), file.filename);
});

router.delete('/:id', async (req, res) => {
  const user = (req as any).user;
  await connectMongo();

  const file = await File.findOne({ _id: req.params.id, owner_id: user.id }).lean();
  if (!file) return res.status(404).json({ error: 'Not found' });

  fs.unlinkSync(path.join(UPLOAD_DIR, file.path));
  await File.deleteOne({ _id: req.params.id });
  res.json({ ok: true });
});

export default router;
