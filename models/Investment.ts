import {
    Schema,
    model,
    models,
    Types,
} from "mongoose";

const InvestmentSchema = new Schema(
    {
        /*
        ==========================================
        USER
        ==========================================
        */

        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },

        /*
        ==========================================
        ORIGINAL PAYMENT
        ==========================================
        */

        paymentId: {
            type: Types.ObjectId,
            ref: "Payment",
            required: true,
        },

        /*
        ==========================================
        INVESTMENT AMOUNT
        ==========================================
        
        Stored in USD because USD is the
        canonical accounting currency.
        */

        amountUSD: {
            type: Number,
            required: true,
            min: 0,
        },

        /*
        ==========================================
        ORIGINAL CRYPTO AMOUNT
        ==========================================
        
        Example:

        100 USDT
        */

        originalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        /*
        ==========================================
        ORIGINAL CURRENCY
        ==========================================
        */

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

        /*
        ==========================================
        EXPECTED RETURN
        ==========================================
        */

        targetReturnPercent: {
            type: Number,
            default: 300,
        },

        /*
        ==========================================
        INVESTMENT PERIOD
        ==========================================
        */

        cycleDaysMin: {
            type: Number,
            default: 3,
        },

        cycleDaysMax: {
            type: Number,
            default: 5,
        },

        /*
        ==========================================
        INVESTMENT STATUS
        ==========================================
        */

        status: {
            type: String,
            enum: [
                "active",
                "completed",
                "declined",
            ],
            default: "active",
        },

        /*
        ==========================================
        DATES
        ==========================================
        */

        startedAt: {
            type: Date,
            default: Date.now,
        },

        endsAt: {
            type: Date,
        },

        /*
        ==========================================
        COMPLETION
        ==========================================
        */

        completedAt: {
            type: Date,
        },

        /*
        ==========================================
        PROFIT
        ==========================================
        */

        profitUSD: {
            type: Number,
            default: 0,
        },

        /*
        ==========================================
        TOTAL PAYOUT
        ==========================================
        */

        payoutUSD: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export default models.Investment ||
    model("Investment", InvestmentSchema);