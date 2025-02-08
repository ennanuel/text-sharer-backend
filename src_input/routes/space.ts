import { Router } from "express";
import { create, edit, deleteTextSpace, getSingleTextSpace, getUserTextSpaces, exploreTextSpaces } from "../controllers/space"
import { authenticate, authenticateWithoutKickingout } from '../utils/auth';

const route = Router();

route.get("/user/:page", authenticate, getUserTextSpaces);
route.get("/explore/:page", authenticateWithoutKickingout, exploreTextSpaces);
route.get("/space/:textSpaceId", authenticateWithoutKickingout, getSingleTextSpace);
route.post("/create", authenticateWithoutKickingout, create);
route.put("/edit/:textSpaceId", authenticate, edit);
route.delete("/delete/:textSpaceId", authenticate, deleteTextSpace);

export default route