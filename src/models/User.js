"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
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
exports.default = mongoose_1.default.model("User", UserSchema);
