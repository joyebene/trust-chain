import {
    Schema,
    model,
    models,
} from "mongoose";

const UserSchema = new Schema(
    {
        /*
        ==========================================
        BASIC INFORMATION
        ==========================================
        */

        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        passwordHash: {
            type: String,
            required: true,
        },

        /*
        ==========================================
        ROLE
        ==========================================
        */

        role: {
            type: String,
            enum: [
                "user",
                "admin",
            ],
            default: "user",
        },

        /*
        ==========================================
        AVAILABLE WALLET BALANCE
        ==========================================
        
        USD is the canonical accounting value.

        Example:

        balanceUSD = 5000

        The UI can display:
        $5,000
        ₦7,500,000
        etc.
        */

        balanceUSD: {
            type: Number,
            default: 0,
            min: 0,
        },

        /*
        ==========================================
        INVESTED BALANCE
        ==========================================
        */

        investedBalanceUSD: {
            type: Number,
            default: 0,
            min: 0,
        },

        /*
        ==========================================
        TOTAL PROFIT
        ==========================================
        */

        totalProfitUSD: {
            type: Number,
            default: 0,
            min: 0,
        },

        /*
        ==========================================
        ACCOUNT STATUS
        ==========================================
        */

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default models.User ||
    model("User", UserSchema);