import dotenv from "dotenv";
import mongoose from "mongoose";

import { io, server } from "./server";

dotenv.config();

mongoose
    .connect(String(process.env.DB_URL))
    .then(() => server.listen(process.env.PORT, () => {

        io.on("connection", (socket: { id: string }) => {
            console.log('Socket connected: %s', socket.id);
        })
        console.log('server running on port %s', process.env.PORT);
    }));

