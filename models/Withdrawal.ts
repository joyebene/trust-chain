import {
    Schema,
    model,
    models,
    Types,
} from "mongoose";

const WithdrawalSchema = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },

        amountUSD: {
            type: Number,
            required: true,
            min: 0,
        },

        payoutAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            enum: [
                "BTC",
                "USDT",
                "USDC",
                "ETH",
            ],
            required: true,
        },

        network: {
            type: String,
            required: true,
            trim: true,
        },

        walletAddress: {
            type: String,
            required: true,
            trim: true,
        },

        note: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "declined",
            ],
            default: "pending",
        },

        declineReason: {
            type: String,
            default: "",
            trim: true,
        },

        transactionHash: {
            type: String,
            default: "",
            trim: true,
        },

        fxRate: {
            type: Number,
            default: 0,
        },

        reviewedBy: {
            type: Types.ObjectId,
            ref: "User",
        },

        reviewedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

WithdrawalSchema.index({
    userId: 1,
    createdAt: -1,
});

WithdrawalSchema.index({
    status: 1,
    createdAt: -1,
});

export default models.Withdrawal ||
    model("Withdrawal", WithdrawalSchema);