"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const space_1 = require("../controllers/space");
const route = (0, express_1.Router)();
route.get("/user/:userId/:page", space_1.getUserTextSpaces);
route.get("/explore/:page/?:userId", space_1.exploreTextSpaces);
route.get("/space/unsecured/:textSpaceId", space_1.getSingleUnsecuredTextSpace);
route.get("/space/secured/:textSpaceId", space_1.getSingleSecuredTextSpace);
route.post("/create", space_1.create);
route.put("/edit/:textSpaceId", space_1.edit);
route.delete("/delete/:textSpaceId", space_1.deleteTextSpace);
exports.default = route;
