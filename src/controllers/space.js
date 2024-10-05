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
exports.deleteTextSpace = exports.edit = exports.create = exports.getSingleSecuredTextSpace = exports.getSingleUnsecuredTextSpace = exports.exploreTextSpaces = exports.getUserTextSpaces = void 0;
const error_1 = require("../utils/error");
const spaces_1 = require("../utils/spaces");
const getUserTextSpaces = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, page } = req.params;
        const { limit, filter } = req.query;
        const options = { page, limit, filter };
        const result = yield (0, spaces_1.getUserSpaces)(userId, options);
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
exports.getUserTextSpaces = getUserTextSpaces;
const exploreTextSpaces = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, page } = req.params;
        const { limit, sortBy } = req.query;
        const options = { page, limit, sortBy };
        const result = yield (0, spaces_1.getSpacesOfOtherUsers)(userId, options);
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
exports.exploreTextSpaces = exploreTextSpaces;
const getSingleUnsecuredTextSpace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { textSpaceId } = req.params;
        const result = yield (0, spaces_1.getSingleUnsecuredSpace)(textSpaceId);
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
exports.getSingleUnsecuredTextSpace = getSingleUnsecuredTextSpace;
const getSingleSecuredTextSpace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { textSpaceId } = req.params;
        const { p } = req.query;
        const result = yield (0, spaces_1.getSingleSecuredSpace)(textSpaceId, p);
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
exports.getSingleSecuredTextSpace = getSingleSecuredTextSpace;
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, desc, content, secured, password, owner } = req.body;
        const newTextSpace = new spaces_1.CreateTextSpace({ title, desc, content, secured, password, owner });
        yield newTextSpace.validate();
        const result = yield newTextSpace.save();
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
exports.create = create;
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { textSpaceId } = req.params;
        const { title, desc, content, secured, password } = req.body;
        const edittedTextSpace = new spaces_1.EditTextSpace({ textSpaceId, title, desc, content, secured, password });
        yield edittedTextSpace.validate();
        const result = yield edittedTextSpace.save();
        if (result.failed)
            throw result;
        return res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        const _a = (0, error_1.handleError)(error), { statusCode } = _a, result = __rest(_a, ["statusCode"]);
        res.status(statusCode).json(result);
    }
});
exports.edit = edit;
const deleteTextSpace = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { textSpaceId } = req.params;
        const result = yield (0, spaces_1.deleteTextAndEditUserDetailsSpace)(textSpaceId);
        if (result.failed)
            throw result;
        return res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        const _a = (0, error_1.handleError)(error), { statusCode } = _a, result = __rest(_a, ["statusCode"]);
        res.status(statusCode).json(result);
    }
});
exports.deleteTextSpace = deleteTextSpace;
