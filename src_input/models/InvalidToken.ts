import mongoose, { Schema } from "mongoose";

const TokenSchema = new Schema({
    token: {
        type: String,
        unique: true,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Token', TokenSchema);