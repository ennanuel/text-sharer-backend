"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.edit = exports.login = exports.register = exports.getUser = void 0;
const user_1 = require("../utils/user");
const error_1 = require("../utils/error");
const auth_1 = require("../utils/auth");
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const result = yield (0, user_1.getUserDetails)(userId);
        if (result.failed)
            throw result;
        return res.status(200).json(result.userDetails);
    }
    catch (error) {
        console.error(error);
        const _a = (0, error_1.handleError)(error), { statusCode } = _a, result = __rest(_a, ["statusCode"]);
        return res.status(statusCode).json(result);
    }
});
exports.getUser = getUser;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = {
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        };
        const newUser = new user_1.CreateUser(user);
        yield newUser.validate();
        const _a = yield newUser.save(), { userDetails } = _a, result = __rest(_a, ["userDetails"]);
        if (result.failed)
            throw result;
        if (userDetails)
            (0, auth_1.assignUserToken)(userDetails, res);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        const _b = (0, error_1.handleError)(error), { statusCode } = _b, result = __rest(_b, ["statusCode"]);
        return res.status(statusCode).json(result);
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password, usernameOrEmail } = req.body;
        const _a = yield (0, user_1.logUserIn)({ password, usernameOrEmail }), { userDetails } = _a, result = __rest(_a, ["userDetails"]);
        if (result.failed)
            throw result;
        if (userDetails)
            (0, auth_1.assignUserToken)(userDetails, res);
        return res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        const _b = (0, error_1.handleError)(error), { statusCode } = _b, result = __rest(_b, ["statusCode"]);
        return res.status(statusCode).json(result);
    }
});
exports.login = login;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = {
            id: req.params.id,
            name: req.body.name,
            email: req.body.email,
            username: req.body.username
        };
        const editUser = new user_1.EditUser(user);
        yield editUser.validate();
        const result = yield editUser.save();
        if (result.failed)
            throw result;
        return res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        const _a = (0, error_1.handleError)(error), { statusCode } = _a, result = __rest(_a, ["statusCode"]);
        return res.status(statusCode).json(result);
    }
});
exports.edit = edit;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { password } = req.body;
        const result = yield (0, user_1.deleteUserAndSpaces)(userId, password);
        if (result.failed)
            throw result;
        return res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        const _a = (0, error_1.handleError)(error), { statusCode } = _a, result = __rest(_a, ["statusCode"]);
        return res.status(statusCode).json(result);
    }
});
exports.deleteUser = deleteUser;
