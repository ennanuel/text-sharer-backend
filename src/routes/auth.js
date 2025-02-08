"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../utils/auth");
const route = (0, express_1.Router)();
route.get("/check", auth_1.authenticate, auth_1.checkToken);
route.post("/logout", auth_1.invalidateToken);
exports.default = route;
