"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const server_1 = require("./server");
dotenv_1.default.config();
server_1.app.use(body_parser_1.default.json());
server_1.app.use(body_parser_1.default.urlencoded({ extended: true }));
server_1.app.use((0, cookie_parser_1.default)());
server_1.app.use((0, cors_1.default)({
    origin: [String(process.env.FRONTEND_URL)],
    credentials: true
}));
server_1.io.on("connection", (socket) => {
    console.log('Socket connected: %s', socket.id);
});
server_1.server.listen(process.env.PORT, () => {
    console.log('server running on port %s', process.env.PORT);
});
