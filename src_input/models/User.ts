import mongoose from "mongoose";

const Schema = mongoose.Schema;


const UserSchema = new Schema({
    name: {
        type: String,
    },
    username: {
        type: String,
        required: [true, "User must have a username"],
        unique: true
    },
    email: {
        type: String,
        required: [true, "User must have an email"],
        unique: true
    },
    textSpaces: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: "TextSpace"
            }
        ],
        default: []
    }
}, { timestamps: true });

export default mongoose.model("User", UserSchema)