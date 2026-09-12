import {
    Schema,
    model,
    models,
    Types,
} from "mongoose";

const PaymentSchema = new Schema(
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
        PAYMENT METHOD
        ==========================================
        Which Trust Chain wallet address
        did the user send the money to?
        */

        paymentMethodId: {
            type: Types.ObjectId,
            ref: "PaymentMethod",
            required: true,
        },

        /*
        ==========================================
        AMOUNT SENT
        ==========================================
        */

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        /*
        ==========================================
        CRYPTOCURRENCY
        ==========================================
        Example:
        BTC
        USDT
        USDC
        ETH
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
        BLOCKCHAIN TRANSACTION HASH
        ==========================================
        
        This is much better than calling it
        simply "payment reference".

        Example:
        0x8f91.......
        */

        transactionHash: {
            type: String,
            required: true,
            trim: true,
        },

        /*
        ==========================================
        OPTIONAL PROOF
        ==========================================
        If the user uploads a screenshot.
        */

        proofUrl: {
            type: String,
            default: "",
        },

        /*
        ==========================================
        USER NOTE
        ==========================================
        */

        note: {
            type: String,
            default: "",
            trim: true,
        },

        /*
        ==========================================
        PAYMENT STATUS
        ==========================================
        */

        status: {
            type: String,
            enum: [
                "pending",
                "approved",
                "declined",
            ],
            default: "pending",
        },

        /*
        ==========================================
        DECLINE REASON
        ==========================================
        */

        declineReason: {
            type: String,
            default: "",
        },

        /*
        ==========================================
        USD CONVERSION
        ==========================================
        
        Your platform can use USD as the
        canonical accounting currency.

        Example:

        100 USDT
        =
        $100 USD
        */

        creditedAmountUSD: {
            type: Number,
            default: 0,
        },

        /*
        ==========================================
        CONVERSION RATE
        ==========================================
        
        For BTC/ETH/etc.

        Example:

        1 BTC = $110,000
        */

        fxRate: {
            type: Number,
            default: 0,
        },

        /*
        ==========================================
        ADMIN REVIEW
        ==========================================
        */

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

export default models.Payment ||
    model("Payment", PaymentSchema);