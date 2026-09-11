import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not configured");

declare global { var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined; }

const cached = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(uri as string, { bufferCommands: false });
  cached.conn = await cached.promise;
  return cached.conn;
}
