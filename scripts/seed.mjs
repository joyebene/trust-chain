import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI missing");

await mongoose.connect(uri);

const UserSchema = new mongoose.Schema({ 
    name: String, 
    email: String, 
    phone: String, 
    passwordHash: String, 
    role: String, 
    balances: Object, 
    investedBalances: Object, 
    totalProfit: Number, 
    isActive: Boolean });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const email = process.env.ADMIN_EMAIL || "admin@trustchain.local";
const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
const hash = await bcrypt.hash(password, 12);
await User.findOneAndUpdate({ email }, { name: process.env.ADMIN_NAME || "Trust Chain Admin", email, phone: "N/'A", passwordHash: hash, role: "admin", balances: { NGN: 0, USD: 0, BTC: 0 }, investedBalances: { NGN: 0, USD: 0, BTC: 0 }, totalProfit: 0, isActive: true }, { upsert: true, new: true, setDefaultsOnInsert: true });
console.log(`Admin ready: ${email}`);
await mongoose.disconnect();
