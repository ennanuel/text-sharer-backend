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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditTextSpace = exports.CreateTextSpace = exports.MAX_DESC_CHAR_LENGTH = exports.MAX_TITLE_CHAR_LENGTH = exports.MAX_LINKS_LENGTH = exports.MAX_CONTENT_CHAR_LENGTH = void 0;
exports.getURLLinksInText = getURLLinksInText;
exports.addTextSpaceToFavorites = addTextSpaceToFavorites;
exports.removeTextSpaceFromFavorites = removeTextSpaceFromFavorites;
exports.getOwnedAndFavoriteSpaces = getOwnedAndFavoriteSpaces;
exports.getUserSpaces = getUserSpaces;
exports.getSpacesOfOtherUsers = getSpacesOfOtherUsers;
exports.getSingleSpace = getSingleSpace;
exports.deleteTextAndEditUserDetailsSpace = deleteTextAndEditUserDetailsSpace;
const bcrypt_1 = __importDefault(require("bcrypt"));
const TextSpace_1 = __importDefault(require("../models/TextSpace"));
const User_1 = __importDefault(require("../models/User"));
const user_1 = require("./user");
exports.MAX_CONTENT_CHAR_LENGTH = 1024, exports.MAX_LINKS_LENGTH = 10, exports.MAX_TITLE_CHAR_LENGTH = 50, exports.MAX_DESC_CHAR_LENGTH = 300;
function getURLLinksInText(text) {
    const URLRegex = /(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@%_+.~#?&/=]*)/g;
    const links = text.match(URLRegex) || [];
    return links;
}
class CreateTextSpace {
    constructor(values) {
        this.validation = {
            passed: false,
            errors: {}
        };
        this.title = (values === null || values === void 0 ? void 0 : values.title) || "Untitled space";
        this.desc = (values === null || values === void 0 ? void 0 : values.desc) || "";
        this.content = (values === null || values === void 0 ? void 0 : values.content) || "";
        this.color = (values === null || values === void 0 ? void 0 : values.color) || "";
        this.secured = (values === null || values === void 0 ? void 0 : values.secured) || false;
        this.password = (values === null || values === void 0 ? void 0 : values.secured) ? values.password || "" : null;
        this.owner = (values === null || values === void 0 ? void 0 : values.owner) || null;
        this.links = getURLLinksInText((values === null || values === void 0 ? void 0 : values.content) || "");
    }
    hashPassword() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.password || !this.secured)
                return null;
            const salt = yield bcrypt_1.default.genSalt();
            const hashedPassword = yield bcrypt_1.default.hash(String(this.password), salt);
            return hashedPassword;
        });
    }
    validateValues() {
        if (this.title.length > exports.MAX_TITLE_CHAR_LENGTH) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { title: `Title should not exceed ${exports.MAX_TITLE_CHAR_LENGTH} characters` });
        }
        if (this.desc.length > exports.MAX_DESC_CHAR_LENGTH) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { desc: `Space description should not exceed ${exports.MAX_DESC_CHAR_LENGTH} characters` });
        }
        if (this.links.length > exports.MAX_LINKS_LENGTH) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { links: `URLs cannot exceed ${exports.MAX_LINKS_LENGTH} links` });
        }
        if (!this.content) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { content: "Text space must have content" });
        }
        if (this.content.length > 1024) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { content: `Content should not exceed ${exports.MAX_CONTENT_CHAR_LENGTH} characters` });
        }
    }
    ;
    validateSecurity() {
        if (this.secured && !this.password) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { password: "Secured Text spaces must have a password" });
        }
    }
    ;
    validateOwner() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.owner)
                    return;
                const userCount = yield User_1.default.countDocuments({ _id: this.owner });
                if (userCount <= 0)
                    throw new Error("No user found");
            }
            catch (error) {
                this.validation.passed = false;
                this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { owner: error.message });
            }
        });
    }
    ;
    validate() {
        return __awaiter(this, void 0, void 0, function* () {
            this.validation.passed = true;
            this.validateValues();
            this.validateSecurity();
            yield this.validateOwner();
            return this.validation;
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.validation.passed) {
                try {
                    const hashedPassword = yield this.hashPassword();
                    const createdTextSpace = yield TextSpace_1.default.create({
                        title: this.title,
                        desc: this.desc,
                        content: this.content,
                        color: this.color,
                        secured: this.secured,
                        password: hashedPassword,
                        links: this.links,
                        owner: this.owner
                    });
                    return {
                        failed: false,
                        textSpaceId: createdTextSpace._id,
                        message: "Text space saved"
                    };
                }
                catch (error) {
                    console.error(error);
                    return {
                        failed: true,
                        message: "Could not save new details"
                    };
                }
            }
            else {
                return {
                    failed: true,
                    message: "Validation error",
                    errors: this.validation.errors
                };
            }
        });
    }
}
exports.CreateTextSpace = CreateTextSpace;
;
class EditTextSpace {
    constructor(values) {
        this.validation = {
            passed: false,
            errors: {}
        };
        this.title = values === null || values === void 0 ? void 0 : values.title;
        this.desc = values === null || values === void 0 ? void 0 : values.desc;
        this.content = values === null || values === void 0 ? void 0 : values.content;
        this.color = values === null || values === void 0 ? void 0 : values.color;
        this.secured = (values === null || values === void 0 ? void 0 : values.secured) || false;
        this.password = (values === null || values === void 0 ? void 0 : values.secured) ? values.password || "" : null;
        this.textSpaceId = values === null || values === void 0 ? void 0 : values.textSpaceId;
        this.links = getURLLinksInText((values === null || values === void 0 ? void 0 : values.content) || "");
    }
    hashPassword() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.password || !this.secured)
                return null;
            const salt = yield bcrypt_1.default.genSalt();
            const hashedPassword = yield bcrypt_1.default.hash(String(this.password), salt);
            return hashedPassword;
        });
    }
    validateTextSpace() {
        return __awaiter(this, void 0, void 0, function* () {
            const textSpaceCount = yield TextSpace_1.default.countDocuments({ _id: this.textSpaceId });
            if (textSpaceCount <= 0) {
                this.validation.passed = false;
                this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { textSpace: "Text space does not exist" });
            }
        });
    }
    validateValues() {
        if (this.title && this.title.length > exports.MAX_TITLE_CHAR_LENGTH) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { title: `Title should not exceed ${exports.MAX_TITLE_CHAR_LENGTH} characters` });
        }
        if (this.desc && this.desc.length > exports.MAX_DESC_CHAR_LENGTH) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { desc: `Space description should not exceed ${exports.MAX_DESC_CHAR_LENGTH} characters` });
        }
        if (this.links.length > exports.MAX_LINKS_LENGTH) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { links: `URLs cannot exceed ${exports.MAX_LINKS_LENGTH} links` });
        }
        if (typeof this.content === "string" && !this.content) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { content: "Text space must have content" });
        }
        if (this.content && this.content.length > exports.MAX_CONTENT_CHAR_LENGTH) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { content: `Content should not exceed ${exports.MAX_CONTENT_CHAR_LENGTH} characters` });
        }
    }
    ;
    validateSecurity() {
        if (this.secured && !this.password) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { password: "Secured Text spaces must have a password" });
        }
    }
    ;
    validate() {
        return __awaiter(this, void 0, void 0, function* () {
            this.validation.passed = true;
            yield this.validateTextSpace();
            this.validateValues();
            this.validateSecurity();
            return this.validation;
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.validation.passed) {
                try {
                    const newValues = {};
                    newValues.secured = Boolean(this.secured);
                    newValues.password = yield this.hashPassword();
                    if (this.title) {
                        newValues.title = this.title;
                    }
                    if (this.desc) {
                        newValues.desc = this.desc;
                    }
                    if (this.content) {
                        newValues.content = this.content;
                        newValues.links = this.links;
                    }
                    if (this.color) {
                        newValues.color = this.color;
                    }
                    yield TextSpace_1.default.findByIdAndUpdate(this.textSpaceId, { $set: newValues });
                    return {
                        failed: false,
                        message: "Text space updated"
                    };
                }
                catch (error) {
                    console.error(error);
                    return {
                        failed: true,
                        message: error.message
                    };
                }
            }
            else {
                return {
                    failed: true,
                    message: "Validation error",
                    errors: this.validation.errors
                };
            }
        });
    }
}
exports.EditTextSpace = EditTextSpace;
;
function addTextSpaceToFavorites(_a) {
    return __awaiter(this, arguments, void 0, function* ({ userId, textSpaceId }) {
        try {
            const textSpaceExists = yield TextSpace_1.default.countDocuments({ _id: textSpaceId });
            if (!textSpaceExists)
                throw new Error("Text space does not exist");
            const user = yield User_1.default.findByIdAndUpdate(userId, { $addToSet: { favorites: textSpaceId } });
            return { failed: false, message: "Text space added to favorites!" };
        }
        catch (error) {
            return { failed: true, message: error.message };
        }
    });
}
;
function removeTextSpaceFromFavorites(_a) {
    return __awaiter(this, arguments, void 0, function* ({ userId, textSpaceId }) {
        try {
            yield User_1.default.findByIdAndUpdate(userId, { $pull: { favorites: textSpaceId } });
            return { failed: false, message: "Text space removed from favorites!" };
        }
        catch (error) {
            return { failed: true, message: error.message };
        }
    });
}
;
function getSortObject(sortBy) {
    if (sortBy === "timeCreated")
        return { createdAt: "desc" };
    else
        return { likes: "desc", views: "desc" };
}
;
function getFetchOptions(options) {
    var _a;
    ;
    const page = !/\D/.test(String(options.page)) ? Number(options.page) : 0;
    const limit = !/\D/.test(String(options.limit)) ? Number(options.limit) : 12;
    const offset = limit * page;
    const result = {
        page,
        limit,
        offset,
        sort: { createdAt: -1 }
    };
    if (typeof options.filter === "string" && Boolean((_a = options.filter) === null || _a === void 0 ? void 0 : _a.length))
        result.filter = options.filter;
    if (options.sortBy)
        result.sort = getSortObject(options.sortBy);
    return result;
}
;
function getOwnedAndFavoriteSpaces(userId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const user = yield User_1.default.findById(userId, 'favorites').lean();
        if (!user)
            return { textSpaces: [], totalPages: 0 };
        const query = {
            $or: [
                { owner: userId },
                { _id: {
                        $in: user.favorites
                    } }
            ]
        };
        if ((_a = options === null || options === void 0 ? void 0 : options.filter) === null || _a === void 0 ? void 0 : _a.length) {
            if ((_b = options.filter) === null || _b === void 0 ? void 0 : _b.includes('FAVORITES')) {
                query._id = { $in: user.favorites };
                delete query.$or;
            }
            if ((_c = options.filter) === null || _c === void 0 ? void 0 : _c.includes('OWNED')) {
                query.owner = userId;
                delete query.$or;
            }
            if ((_d = options.filter) === null || _d === void 0 ? void 0 : _d.includes("SECURED"))
                query.secured = true;
            if ((_e = options.filter) === null || _e === void 0 ? void 0 : _e.includes("UNSECURED"))
                query.secured = false;
        }
        const textSpaces = yield TextSpace_1.default
            .find(query)
            .sort({ createdAt: -1 })
            .limit(options.limit)
            .skip(options.offset)
            .lean();
        const totalTextSpaces = yield TextSpace_1.default.countDocuments(query);
        const totalPages = Math.ceil(totalTextSpaces / options.limit);
        return { textSpaces, totalPages };
    });
}
;
function getTextSpaceOwnerId(textSpaces) {
    return textSpaces.reduce((ownerIds, textSpace) => {
        var _a;
        return textSpace.owner && !ownerIds.includes((_a = textSpace === null || textSpace === void 0 ? void 0 : textSpace.owner) === null || _a === void 0 ? void 0 : _a.toString()) ?
            [...ownerIds, textSpace.owner.toString()] :
            ownerIds;
    }, []);
}
;
function getTextSpacesOwners(textSpaces, ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ownerIds = getTextSpaceOwnerId(textSpaces);
            const owners = yield User_1.default.find({ _id: { $in: ownerIds } }, "username profileImage").lean();
            const ownersInObjectFormat = owners
                .reduce((formattedOwners, owner) => (Object.assign(Object.assign({}, formattedOwners), { [owner._id.toString()]: owner._id.toString() === ownerId ? Object.assign(Object.assign({}, owner), { username: "You" }) :
                    owner })), {});
            return ownersInObjectFormat;
        }
        catch (error) {
            throw error;
        }
    });
}
function expandTextSpaceOwnerDetails(textSpaces, ownerId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const DEFAULT_USER_DETAIL = {
                username: "Annonymous",
                profileImage: null
            };
            const owners = yield getTextSpacesOwners(textSpaces, ownerId);
            const user = yield User_1.default.findById(ownerId, 'favorites').lean();
            const expandedTextSpaces = textSpaces.map((textSpace) => {
                var _a, _b, _c;
                return (Object.assign(Object.assign({}, textSpace), { isYours: ownerId && ((_a = textSpace === null || textSpace === void 0 ? void 0 : textSpace.owner) === null || _a === void 0 ? void 0 : _a.toString()) === ownerId, isInYourFavorites: Boolean((_c = (_b = user === null || user === void 0 ? void 0 : user.favorites) === null || _b === void 0 ? void 0 : _b.map((item) => item.toString())) === null || _c === void 0 ? void 0 : _c.includes(textSpace._id.toString())), owner: textSpace.owner ?
                        owners[textSpace.owner.toString()] :
                        DEFAULT_USER_DETAIL }));
            });
            return expandedTextSpaces;
        }
        catch (error) {
            throw error;
        }
    });
}
function getUserSpaces(userId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { limit, offset, page, filter } = getFetchOptions(options);
            const result = yield getOwnedAndFavoriteSpaces(userId, { offset, limit, filter });
            const expandedTextSpaces = yield expandTextSpaceOwnerDetails(result.textSpaces, userId);
            return {
                page,
                limit,
                filter,
                failed: false,
                totalPages: result.totalPages,
                textSpaces: expandedTextSpaces
            };
        }
        catch (error) {
            console.error(error);
            return {
                failed: true,
                message: error.message
            };
        }
    });
}
;
function getSpacesOfOtherUsers(userId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield User_1.default.findById(userId).lean();
            const query = {
                $or: [
                    { $and: [{ owner: { $ne: userId } }, { owner: { $ne: null } }, { owner: { $ne: undefined } }] },
                    { owner: { $ne: userId } },
                    { owner: null }
                ],
                _id: {
                    $not: { $in: user === null || user === void 0 ? void 0 : user.favorites }
                }
            };
            const { limit, page, offset, filter, sort } = getFetchOptions(options);
            if (filter === null || filter === void 0 ? void 0 : filter.length) {
                if (filter.includes("SECURED"))
                    query.secured = true;
                else if (filter.includes("UNSECURED"))
                    query.secured = false;
            }
            const textSpaces = yield TextSpace_1.default
                .find(query, { password: 0 })
                .sort(sort)
                .limit(limit)
                .skip(offset)
                .lean();
            const totalTextSpaces = yield TextSpace_1.default.countDocuments(query);
            const totalPages = Math.ceil(totalTextSpaces / limit);
            const expandedTextSpaces = yield expandTextSpaceOwnerDetails(textSpaces, userId);
            return {
                limit,
                page,
                failed: false,
                sortedBy: options.sortBy,
                totalPages,
                textSpaces: expandedTextSpaces,
            };
        }
        catch (error) {
            console.error(error);
            return {
                failed: true,
                message: error.message
            };
        }
    });
}
;
function getSingleSpace(textSpaceId, password, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const textSpace = yield TextSpace_1.default
                .findById(textSpaceId)
                .lean();
            const validation = yield validateResult(textSpace, password);
            if (!validation.passed)
                throw validation;
            const expandedTextSpace = yield expandTextSpaceOwnerDetails([textSpace], userId);
            const result = expandedTextSpace.map((_a) => {
                var { password } = _a, textSpace = __rest(_a, ["password"]);
                return textSpace;
            })[0];
            return {
                failed: false,
                textSpace: result
            };
        }
        catch (error) {
            return {
                failed: true,
                statusCode: error.statusCode,
                message: error.message
            };
        }
    });
}
;
function validateResult(textSpace, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const validation = { passed: true };
        if (!textSpace) {
            validation.message = "No text space found";
            validation.statusCode = 408;
        }
        if (textSpace.secured) {
            if (!password)
                validation.message = "Password required";
            const hashedPassword = textSpace.password;
            const comparison = yield (0, user_1.comparePasswords)(hashedPassword, password);
            if (!comparison)
                validation.message = "Incorrect password";
            if (Boolean(validation.message))
                validation.statusCode = 401;
        }
        if (validation.message)
            validation.passed = false;
        return validation;
    });
}
function deleteTextAndEditUserDetailsSpace(textSpaceId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const deletedTextSpace = yield TextSpace_1.default.findByIdAndDelete(textSpaceId);
            if (!deletedTextSpace)
                throw Error("Could not delete text space");
            yield User_1.default.updateMany({
                favorites: { $in: textSpaceId }
            }, {
                $pull: { favorites: textSpaceId }
            });
            return {
                failed: false,
                message: "Text space deleted"
            };
        }
        catch (error) {
            return {
                failed: true,
                message: error.message
            };
        }
    });
}
;
