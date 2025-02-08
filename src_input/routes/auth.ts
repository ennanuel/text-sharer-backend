
import { Router } from "express";
import { authenticate, checkToken, invalidateToken } from '../utils/auth';


const route = Router();

route.get("/check", authenticate, checkToken);
route.post("/logout", invalidateToken);

export default route;