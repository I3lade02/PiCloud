import mongoose, { Schema, InferSchemaType, model } from 'mongoose';

const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/picloud';

export async function connectMongo() {
    if (mongoose.connection.readyState === 1) return;
    await mongoose.connect(mongoUrl, {
        serverSelectionTimeoutMS: 5000
    });
}

//Schemes
const UserSchema = new Schema({
    email: { type: String, unique: true, required: true, index: true },
    password_hash: {  type: String, required: true },
    created_at: { type: Date, default: () => new Date() }
});

const FileSchema = new Schema({
    filename: { type: String, required: true },
    path: { type: String, required: true },
    size: { type: Number, required: true },
    owner_id: { type: Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    created_at: { type: Date, default: () => new Date(), index: true}
});

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };
export type FileDoc = InferSchemaType<typeof FileSchema> & { _id: mongoose.Types.ObjectId };

export const User = model('User', UserSchema);
export const File = model('File', FileSchema);