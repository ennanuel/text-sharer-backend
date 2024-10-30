import { Router } from "express";
import { create, edit, deleteTextSpace, getSingleUnsecuredTextSpace, getSingleSecuredTextSpace, getUserTextSpaces, exploreTextSpaces } from "../controllers/space"

const route = Router();

route.get("/user/:userId/:page", getUserTextSpaces);
route.get("/explore/:page/:userId?", exploreTextSpaces);
route.get("/space/unsecured/:textSpaceId", getSingleUnsecuredTextSpace);
route.get("/space/secured/:textSpaceId", getSingleSecuredTextSpace);
route.post("/create", create);
route.put("/edit/:textSpaceId", edit);
route.delete("/delete/:textSpaceId", deleteTextSpace);

export default route