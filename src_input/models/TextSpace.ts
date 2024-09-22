import mongoose from "mongoose";

const Schema = mongoose.Schema

const TextSpaceSchema = new Schema({
    title: { 
        type: String,
        required: [true, "Text space must have a title"]
    },
    description: {
        type: String
    },
    content: {
        type: String,
        required: [true, "Your space must contain something"]
    },
    links: {
        type: [String],
        default: []
    },
    views: {
        type: Number,
        default: 0
    },
    secured: {
        type: Boolean,
        default: false
    },
    password: {
        type: String
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    autoDelete: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model("TextSpace", TextSpaceSchema);