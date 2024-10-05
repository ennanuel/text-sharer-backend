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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkToken = exports.authenticate = void 0;
exports.assignUserToken = assignUserToken;
exports.invalidateToken = invalidateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const MAX_AGE = 259200;
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userToken = req.cookies.userToken;
        if (!userToken)
            throw new Error("No user token");
        jsonwebtoken_1.default.verify(userToken, String(process.env.JWT_SECRET_KEY), (error, result) => {
            if (error)
                throw error;
            req.auth = result;
            next();
        });
    }
    catch (error) {
        console.error(error);
        return res.status(401).json({ message: error.message });
    }
});
exports.authenticate = authenticate;
const checkToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(204).json();
});
exports.checkToken = checkToken;
function createUserToken(user) {
    const token = jsonwebtoken_1.default.sign({ id: user._id, isAdmin: Boolean(user === null || user === void 0 ? void 0 : user.isAdmin) }, String(process.env.JWT_SEC_KEY), { expiresIn: MAX_AGE });
    const cookieOptions = { httpOnly: true, secure: true, sameSite: 'none', maxAge: MAX_AGE * 1000 };
    return { token, cookieOptions };
}
;
function assignUserToken(user, res) {
    const { token, cookieOptions } = createUserToken(user);
    res.cookie('userToken', token, cookieOptions);
}
;
function invalidateToken(res) {
}
