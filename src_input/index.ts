import dotenv from "dotenv";
import cors from "cors";
import bp from "body-parser";
import cookieParser from "cookie-parser";

import { io, app, server } from "./server";

dotenv.config();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: [String(process.env.FRONTEND_URL)],
    credentials: true
}));

io.on("connection", (socket: { id: string }) => {
    console.log('Socket connected: %s', socket.id);
})

server.listen(process.env.PORT, () => {
    console.log('server running on port %s', process.env.PORT);
})