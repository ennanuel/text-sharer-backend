
import { Router } from "express";
import { authenticate, checkToken } from "../utils/auth";


const route = Router();

route.get("/check", authenticate, checkToken);

export default route;