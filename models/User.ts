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


        emailVerified: {
            type: Boolean,
            default: false,
        },

        policiesAccepted: {
            type: Boolean,
            default: false,
        },

        policiesAcceptedAt: {
            type: Date,
            default: null,
        },

        policyVersions: {
            privacyPolicy: String,
            refundPolicy: String,
            withdrawalPolicy: String,
            termsAndConditions: String,
        },

        accountStatus: {
            type: String,
            enum: ["PENDING", "ACTIVE", "SUSPENDED"],
            default: "PENDING",
        },

        emailVerificationToken: {
            type: String,
            default: null,
        },

        emailVerificationExpires: {
            type: Date,
            default: null,
        },

    },
    {
        timestamps: true,
    }
);

export default models.User ||
    model("User", UserSchema);