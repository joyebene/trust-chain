import { Schema, model, models } from "mongoose";

const PaymentMethodSchema = new Schema(
    {
        /*
        ==========================================
        DISPLAY NAME
        ==========================================
        Example:
        USDT TRC20
        USDT BEP20
        Bitcoin
        */

        name: {
            type: String,
            required: true,
            trim: true,
        },

        /*
        ==========================================
        CRYPTOCURRENCY
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
        NETWORK / CHAIN
        ==========================================
        Example:
        TRC20
        ERC20
        BEP20
        Bitcoin
        */

        network: {
            type: String,
            required: true,
            trim: true,
        },

        /*
        ==========================================
        WALLET ADDRESS
        ==========================================
        This is the address the client/admin
        provides for users to send money to.
        */

        walletAddress: {
            type: String,
            required: true,
            trim: true,
        },

        /*
        ==========================================
        INSTRUCTIONS
        ==========================================
        */

        instructions: {
            type: String,
            default: "",
            trim: true,
        },

        /*
        ==========================================
        ACTIVE / INACTIVE
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

export default models.PaymentMethod ||
    model("PaymentMethod", PaymentMethodSchema);