
import { Schema, model, models } from "mongoose";

const PasswordResetTokenSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        tokenHash: {
            type: String,
            required: true,
            unique: true,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },

        usedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export default models.PasswordResetToken ||
    model("PasswordResetToken", PasswordResetTokenSchema);
