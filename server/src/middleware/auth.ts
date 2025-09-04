import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { JWTPayload } from "../types";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if(!token) return res.status(401).json({ error: 'Missing token' });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;
        (req as any).user = payload;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}