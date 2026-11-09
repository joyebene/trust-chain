import {
    Schema,
    model,
    models,
    Types,
} from "mongoose";

const TransactionSchema = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: [
                "admin_topup",
            ],
            required: true,
        },

        amountUSD: {
            type: Number,
            required: true,
            min: 0.01,
        },

        balanceBeforeUSD: {
            type: Number,
            required: true,
            min: 0,
        },

        balanceAfterUSD: {
            type: Number,
            required: true,
            min: 0,
        },

        description: {
            type: String,
            default: "Administrator wallet top-up",
            trim: true,
        },

        performedBy: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["completed"],
            default: "completed",
        },
    },
    {
        timestamps: true,
    }
);

export default models.Transaction ||
    model("Transaction", TransactionSchema);