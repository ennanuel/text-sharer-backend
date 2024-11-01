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
exports.getOwnedSpaces = getOwnedSpaces;
exports.getFavoriteSpaces = getFavoriteSpaces;
exports.getOwnedAndFavoriteSpaces = getOwnedAndFavoriteSpaces;
exports.getUserSpaces = getUserSpaces;
exports.getSpacesOfOtherUsers = getSpacesOfOtherUsers;
exports.getSingleUnsecuredSpace = getSingleUnsecuredSpace;
exports.getSingleSecuredSpace = getSingleSecuredSpace;
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
                    yield TextSpace_1.default.create({
                        title: this.title,
                        desc: this.desc,
                        content: this.content,
                        secured: this.secured,
                        password: hashedPassword,
                        links: this.links,
                        owner: this.owner
                    });
                    return {
                        failed: false,
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
function getSortObject(sortBy) {
    if (sortBy === "timeCreated")
        return { createdAt: "desc" };
    else
        return { likes: "desc", views: "desc" };
}
;
function getFetchOptions(options) {
    ;
    const page = !/\D/.test(String(options.page)) ? Number(options.page) : 0;
    const limit = !/\D/.test(String(options.limit)) ? Number(options.limit) : 12;
    const offset = limit * page;
    const result = {
        page,
        limit,
        offset
    };
    if (options.filter)
        result.filter = options.filter !== "favorites" ? "owned" : options.filter;
    if (options.sortBy)
        result.sort = getSortObject(options.sortBy);
    return result;
}
;
function getOwnedSpaces(userId, options) {
    return TextSpace_1.default
        .find({ owner: userId })
        .sort({ name: "asc" })
        .limit(options.limit)
        .skip(options.offset)
        .lean();
}
;
function getFavoriteSpaces(userId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User_1.default.findById(userId, "favorites").lean();
        if (!user)
            return [];
        return TextSpace_1.default
            .find({ _id: { $in: user.favorites } }, "title desc content likes views owner secured")
            .sort({ name: "asc" })
            .limit(options.limit)
            .skip(options.offset)
            .lean();
    });
}
;
function getOwnedAndFavoriteSpaces(userId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User_1.default.findById(userId, 'favorites').lean();
        if (!user)
            return [];
        return TextSpace_1.default
            .find({
            $or: [
                { owner: userId },
                {
                    _id: {
                        $in: user.favorites
                    }
                }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(options.limit)
            .skip(options.offset)
            .lean();
    });
}
function getTextSpaceOwnerId(textSpaces) {
    return textSpaces.reduce((ownerIds, textSpace) => {
        var _a;
        return textSpace.owner && !ownerIds.includes((_a = textSpace === null || textSpace === void 0 ? void 0 : textSpace.owner) === null || _a === void 0 ? void 0 : _a.toString()) ?
            [...ownerIds, textSpace.owner.toString()] :
            ownerIds;
    }, []);
}
;
function getTextSpacesOwners(textSpaces) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ownerIds = getTextSpaceOwnerId(textSpaces);
            const owners = yield User_1.default.find({ _id: { $in: ownerIds } }, "username profileImage").lean();
            const ownersInObjectFormat = owners
                .reduce((formattedOwners, owner) => (Object.assign(Object.assign({}, formattedOwners), { [owner._id.toString()]: owner })), {});
            return ownersInObjectFormat;
        }
        catch (error) {
            throw error;
        }
    });
}
function expandTextSpaceOwnerDetails(textSpaces) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const owners = yield getTextSpacesOwners(textSpaces);
            const expandedTextSpaces = textSpaces.map((textSpace) => (Object.assign(Object.assign({}, textSpace), { owner: textSpace.owner ?
                    owners[textSpace.owner.toString()] :
                    {
                        username: "Annonymous",
                        profileImage: null
                    } })));
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
            let textSpaces;
            const { limit, offset, page, filter } = getFetchOptions(options);
            if (filter === 'favorites')
                textSpaces = yield getFavoriteSpaces(userId, { offset, limit });
            else if (filter === 'owned')
                textSpaces = yield getOwnedSpaces(userId, { offset, limit });
            else
                textSpaces = yield getOwnedAndFavoriteSpaces(userId, { offset, limit });
            const expandedTextSpaces = yield expandTextSpaceOwnerDetails(textSpaces);
            return {
                page,
                limit,
                filter,
                failed: false,
                textSpaces: expandedTextSpaces
            };
        }
        catch (error) {
            console.log(error);
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
            const { limit, page, offset, sort } = getFetchOptions(options);
            const textSpaces = yield TextSpace_1.default
                .find({
                $or: [
                    { owner: { $ne: userId } },
                    { owner: null }
                ]
            }, { password: 0 })
                .sort(sort)
                .limit(limit)
                .skip(offset)
                .lean();
            const expandedTextSpaces = yield expandTextSpaceOwnerDetails(textSpaces);
            return {
                limit,
                page,
                failed: false,
                sortedBy: options.sortBy,
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
function getSingleUnsecuredSpace(textSpaceId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const textSpace = yield TextSpace_1.default
                .findOne({ _id: textSpaceId, secured: false }, { password: 0 })
                .lean();
            if (!textSpace)
                throw Error("No text space found");
            const expandedTextSpace = yield expandTextSpaceOwnerDetails([textSpace]);
            return {
                failed: false,
                textSpace: expandedTextSpace[0]
            };
        }
        catch (error) {
            console.error(error);
            return {
                failed: true,
                message: error.message,
            };
        }
    });
}
function getSingleSecuredSpace(textSpaceId, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!password)
                throw Error("Password required");
            const result = yield TextSpace_1.default.findOne({ _id: textSpaceId, secured: true }).lean();
            if (!result)
                throw Error("No text space found");
            const { password: hashedPassword } = result, textSpace = __rest(result, ["password"]);
            const comparison = yield (0, user_1.comparePasswords)(String(hashedPassword), String(password));
            if (!comparison)
                throw Error("Incorrect password");
            const expandedTextSpace = yield expandTextSpaceOwnerDetails([textSpace]);
            return {
                failed: false,
                textSpace: expandedTextSpace[0]
            };
        }
        catch (error) {
            console.error(error);
            return {
                failed: true,
                message: error.message,
            };
        }
    });
}
function deleteTextAndEditUserDetailsSpace(textSpaceId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const deletedTextSpace = yield TextSpace_1.default.findByIdAndDelete(textSpaceId);
            if (!deletedTextSpace)
                throw Error("Could not delete text space");
            yield User_1.default.updateMany({
                favorites: {
                    $in: deletedTextSpace
                }
            }, {
                $pull: {
                    favorites: deletedTextSpace
                }
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
