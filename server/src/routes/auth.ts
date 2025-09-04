import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { connectMongo, User } from '../lib/db';

const router = Router();
const creds = z.object({ email: z.string().email(), password: z.string().min(6) });

router.post('/register', async (req, res) => {
    const parsed = creds.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { email, password } = parsed.data;

    await connectMongo();
    const exists = await User.findOne({ email }).lean();
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const hash = bcrypt.hashSync(password, 10);
    const doc = await User.create({ email, password_hash: hash });

    const token = jwt.sign({ id: String(doc._id), email }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    res.json({ token });
});

router.post('/login',async (req, res) => {
    const parsed = creds.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const { email, password } = parsed.data;

    await connectMongo();
    const user = await User.findOne({ email }).lean();
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: String(user._id), email }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    res.json({ token });
});

export default router;