"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const space_1 = require("../controllers/space");
const auth_1 = require("../utils/auth");
const route = (0, express_1.Router)();
route.get("/user/:page", auth_1.authenticate, space_1.getUserTextSpaces);
route.get("/explore/:page", auth_1.authenticateWithoutKickingout, space_1.exploreTextSpaces);
route.get("/space/:textSpaceId", auth_1.authenticateWithoutKickingout, space_1.getSingleTextSpace);
route.get("/search/:query", auth_1.authenticateWithoutKickingout, space_1.searchTextSpace);
route.post("/create", auth_1.authenticateWithoutKickingout, space_1.create);
route.put("/edit/:textSpaceId", auth_1.authenticate, space_1.edit);
route.put("/add/favorite/:textSpaceId", auth_1.authenticate, space_1.addToFavorites);
route.put("/remove/favorite/:textSpaceId", auth_1.authenticate, space_1.removeFromFavorites);
route.delete("/delete/:textSpaceId", auth_1.authenticate, space_1.deleteTextSpace);
exports.default = route;
