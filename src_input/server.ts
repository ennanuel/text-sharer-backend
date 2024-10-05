import express from "express";
import http from "http";
import { Server } from "socket.io"
import dotenv from "dotenv";
import cors from "cors";
import bp from "body-parser";
import cookieParser from "cookie-parser";

import userRoute from "./routes/user";
import textSpaceRoute from "./routes/space";
import authRoute from "./routes/auth";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: [String(process.env.FRONTEND_URL)],
    credentials: true
}));

app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/spaces", textSpaceRoute);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL
    }
})

export {
    io,
    server,
    app
};