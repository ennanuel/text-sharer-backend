import { Router } from "express";
import { create, edit, deleteTextSpace, getSingleTextSpace, getUserTextSpaces, exploreTextSpaces, searchTextSpace, addToFavorites, removeFromFavorites } from "../controllers/space"
import { authenticate, authenticateWithoutKickingout } from '../utils/auth';

const route = Router();

route.get("/user/:page", authenticate, getUserTextSpaces);
route.get("/explore/:page", authenticateWithoutKickingout, exploreTextSpaces);
route.get("/space/:textSpaceId", authenticateWithoutKickingout, getSingleTextSpace);
route.get("/search/:query", authenticateWithoutKickingout, searchTextSpace);
route.post("/create", authenticateWithoutKickingout, create);
route.put("/edit/:textSpaceId", authenticate, edit);
route.put("/add/favorite/:textSpaceId", authenticate, addToFavorites);
route.put("/remove/favorite/:textSpaceId", authenticate, removeFromFavorites);
route.delete("/delete/:textSpaceId", authenticate, deleteTextSpace);

export default route