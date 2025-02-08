import { Router } from "express";
import { register, login, edit, deleteUser, getUser } from "../controllers/user";

const route = Router();

route.get("/details/:userId", getUser)
route.post('/register', register);
route.post('/login', login);
route.put('/edit/:userId', edit);
route.delete('/delete/:userId', deleteUser);

export default route;