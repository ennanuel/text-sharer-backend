"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const server_1 = require("./server");
dotenv_1.default.config();
mongoose_1.default
    .connect(String(process.env.DB_URL))
    .then(() => server_1.server.listen(process.env.PORT, () => {
    server_1.io.on("connection", (socket) => {
        console.log('Socket connected: %s', socket.id);
    });
    console.log('server running on port %s', process.env.PORT);
}));
