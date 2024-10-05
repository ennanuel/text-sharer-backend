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
exports.EditUser = exports.CreateUser = void 0;
exports.getUserDetails = getUserDetails;
exports.comparePasswords = comparePasswords;
exports.logUserIn = logUserIn;
exports.deleteUserAndSpaces = deleteUserAndSpaces;
const User_1 = __importDefault(require("../models/User"));
const TextSpace_1 = __importDefault(require("../models/TextSpace"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = require("validator");
class CreateUser {
    constructor(values) {
        var _a;
        this.name = "";
        this.email = "";
        this.username = "";
        this.password = "";
        this.confirmPassword = "";
        this.validation = {
            passed: false,
            errors: {}
        };
        this.name = ((_a = values === null || values === void 0 ? void 0 : values.name) === null || _a === void 0 ? void 0 : _a.replace(/\s/, " ")) || "";
        this.email = (values === null || values === void 0 ? void 0 : values.email) || "";
        this.username = (values === null || values === void 0 ? void 0 : values.username) || "";
        this.password = (values === null || values === void 0 ? void 0 : values.password) || "";
        this.confirmPassword = (values === null || values === void 0 ? void 0 : values.confirmPassword) || "";
    }
    getDetails() {
        return {
            name: this.name,
            email: this.email,
            username: this.username
        };
    }
    hashPassword() {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcrypt_1.default.genSalt();
            const hashedPassword = yield bcrypt_1.default.hash(this.password, salt);
            return hashedPassword;
        });
    }
    validateName() {
        let errorMessage;
        if (this.name.length > 1024)
            errorMessage = "Name is too long";
        if (/([^a-zA-Z ])/.test(this.name))
            errorMessage = "User's name must contain only letter";
        if (errorMessage) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { name: "User's name must contain only letters" });
        }
    }
    validateEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            let errorMessage;
            if (!this.email)
                errorMessage = "User must have an email";
            else if (this.email.length > 1024)
                errorMessage = "email is too long";
            else if (!(0, validator_1.isEmail)(this.email))
                errorMessage = "Please use a valid email";
            else {
                try {
                    const userCount = yield User_1.default.countDocuments({ email: this.email });
                    if (userCount > 0)
                        errorMessage = "email already exists";
                }
                catch (error) {
                    console.error(error);
                    errorMessage = error.message;
                }
            }
            if (errorMessage) {
                this.validation.passed = false;
                this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { email: errorMessage });
            }
        });
    }
    validateUsername() {
        return __awaiter(this, void 0, void 0, function* () {
            let errorMessage;
            if (!this.username)
                errorMessage = "User must have a username";
            else if (this.username.length > 1024)
                errorMessage = "username is too long";
            else if (/[\s\*\+.,\&\(\)]/.test(this.username))
                errorMessage = "username cannot have charaters like: white spaces, '*', '+', '.', '&', '(', or ')'";
            else {
                try {
                    const userCount = yield User_1.default.countDocuments({ username: this.username });
                    if (userCount > 0)
                        errorMessage = "username already exists";
                }
                catch (error) {
                    console.error(error);
                    errorMessage = error.message;
                }
            }
            if (errorMessage) {
                this.validation.passed = false;
                this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { username: errorMessage });
            }
        });
    }
    validatePassword() {
        let errorMessage;
        if (this.password.length < 8)
            errorMessage = "Password must be at least 8 characters long";
        else if (!/[a-z]/.test(this.password))
            errorMessage = "Password must contain lowercase letters";
        else if (!/[A-Z]/.test(this.password))
            errorMessage = "Password must contain uppercase letters";
        else if (!/\d/.test(this.password))
            errorMessage = "Password must contain numbers";
        else if (!/[^a-zA-Z0-9]/.test(this.password))
            errorMessage = "Password must contain symbols";
        if (errorMessage) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { password: errorMessage });
        }
    }
    checkIfPasswordsMatch() {
        if (this.password !== this.confirmPassword) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { confirmPassword: "Passwords must match" });
        }
    }
    validate() {
        return __awaiter(this, void 0, void 0, function* () {
            this.validation.passed = true;
            const valuesToCheck = ["name", "email", "username", "password", "confirmPassword"];
            for (let value of valuesToCheck) {
                switch (value) {
                    case "name":
                        this.validateName();
                        continue;
                    case "email":
                        this.validateEmail();
                        continue;
                    case "username":
                        this.validateUsername();
                        continue;
                    case "password":
                        this.validatePassword();
                        continue;
                    case "confirmPassword":
                        this.checkIfPasswordsMatch();
                        continue;
                }
            }
            return this.validation;
        });
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.validation.passed) {
                try {
                    const hashedPassword = yield this.hashPassword();
                    const user = new User_1.default({
                        name: this.name,
                        email: this.email,
                        username: this.username,
                        password: hashedPassword
                    });
                    const savedUser = yield user.save();
                    return {
                        failed: false,
                        message: "New user created",
                        userDetails: {
                            _id: savedUser._id.toString(),
                            isAdmin: false
                        }
                    };
                }
                catch (error) {
                    console.error(error);
                    return {
                        failed: true,
                        message: "Could not save user"
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
exports.CreateUser = CreateUser;
class EditUser {
    constructor(values) {
        this.newDetails = {};
        this.validation = {
            passed: false,
            errors: {}
        };
        this.userId = (values === null || values === void 0 ? void 0 : values.id) || "";
        if (values === null || values === void 0 ? void 0 : values.name)
            this.newDetails.name = values.name.replace(/\s/, " ");
        if (values === null || values === void 0 ? void 0 : values.username)
            this.newDetails.username = values.username;
        if (values === null || values === void 0 ? void 0 : values.email)
            this.newDetails.email = values.email;
    }
    getUserDocument() {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.default.findById(String(this.userId), "_id name username email").lean();
            return user;
        });
    }
    validateUserAndNewValues() {
        return __awaiter(this, void 0, void 0, function* () {
            let errorMessage;
            const user = yield this.getUserDocument();
            if (!user) {
                errorMessage = "User not found";
            }
            else if (Object.entries(this.newDetails).every(([key, value]) => user[key] === value)) {
                errorMessage = "There is no change in the new values";
            }
            if (errorMessage) {
                this.validation.passed = false;
                this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { user: errorMessage });
            }
        });
    }
    validateName() {
        let errorMessage;
        if (this.newDetails.name && this.newDetails.name.length > 1024)
            errorMessage = "New name too long";
        if (this.newDetails.name && /[^a-zA-Z ]/.test(this.newDetails.name))
            errorMessage = "New user's name must contain only letters";
        if (errorMessage) {
            this.validation.passed = false;
            this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { name: "New user's name must contain only letters" });
        }
    }
    validateEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            let errorMessage;
            const emailIsValid = (0, validator_1.isEmail)(String((_a = this.newDetails) === null || _a === void 0 ? void 0 : _a.email));
            if (!emailIsValid) {
                errorMessage = "New email isn't valid";
            }
            else if (((_b = this.newDetails) === null || _b === void 0 ? void 0 : _b.email) && this.newDetails.email.length > 1024) {
                errorMessage = "New email is too long";
            }
            else {
                const usersWithTheSameEmail = yield User_1.default.countDocuments({ email: (_c = this.newDetails) === null || _c === void 0 ? void 0 : _c.email, _id: { $ne: this.userId } });
                if (usersWithTheSameEmail > 0)
                    errorMessage = "Email already exists";
            }
            if (errorMessage) {
                this.validation.passed = false;
                this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { email: errorMessage });
            }
        });
    }
    validateUsername() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            let errorMessage;
            const usernameIsInvalid = /[\s\*\+.,\&\(\)]/.test(String((_a = this.newDetails) === null || _a === void 0 ? void 0 : _a.username));
            if (((_b = this.newDetails) === null || _b === void 0 ? void 0 : _b.username) && this.newDetails.username.length > 1024) {
                errorMessage = "New username is too long";
            }
            else if (usernameIsInvalid) {
                errorMessage = "New username cannot have charaters like: white spaces, '*', '+', '.', '&', '(', or ')'";
            }
            else {
                const usersWithTheSameUsername = yield User_1.default.countDocuments({ username: (_c = this.newDetails) === null || _c === void 0 ? void 0 : _c.username, _id: { $ne: this.userId } });
                if (usersWithTheSameUsername > 0)
                    errorMessage = "Username already exists";
            }
            if (errorMessage) {
                this.validation.passed = false;
                this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { username: errorMessage });
            }
        });
    }
    validate() {
        return __awaiter(this, void 0, void 0, function* () {
            this.validation.passed = true;
            yield this.validateUserAndNewValues();
            if (this.newDetails.name)
                this.validateName();
            if (this.newDetails.email)
                yield this.validateEmail();
            if (this.newDetails.username)
                yield this.validateUsername();
            return this.validation;
        });
    }
    ;
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.validation.passed) {
                try {
                    const newValues = {};
                    if (this.newDetails.name)
                        newValues.name = this.newDetails.name;
                    if (this.newDetails.email)
                        newValues.email = this.newDetails.email;
                    if (this.newDetails.username)
                        newValues.username = this.newDetails.username;
                    yield User_1.default.findByIdAndUpdate(this.userId, { $set: newValues });
                    return {
                        failed: false,
                        message: "User details updated"
                    };
                }
                catch (error) {
                    console.error(error);
                    return {
                        failed: true,
                        message: "New user details could not be saved"
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
    ;
}
exports.EditUser = EditUser;
;
function getUserDetails(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield User_1.default.findById(userId, "name username email").lean();
            if (!user)
                throw new Error("User not found");
            const textSpaces = yield TextSpace_1.default.countDocuments({ owner: user._id });
            const userDetails = Object.assign(Object.assign({}, user), { textSpaces });
            return {
                failed: false,
                userDetails
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
function findUserWithUsername(usernameOrEmail) {
    return User_1.default.findOne({
        $or: [{
                username: usernameOrEmail,
                email: usernameOrEmail
            }]
    }, "password").lean();
}
function comparePasswords(hashedPassword, unhashedPasssword) {
    return bcrypt_1.default.compare(hashedPassword, unhashedPasssword);
}
function logUserIn(userDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!(userDetails === null || userDetails === void 0 ? void 0 : userDetails.usernameOrEmail))
                throw new Error("Please provide username or email");
            if (!(userDetails === null || userDetails === void 0 ? void 0 : userDetails.password))
                throw new Error("Please provide a password");
            const foundUser = yield findUserWithUsername(userDetails.usernameOrEmail);
            if (!foundUser)
                throw new Error("username or email address does not exist");
            const passwordsMatch = yield comparePasswords(String(foundUser.password), userDetails.password);
            if (!passwordsMatch)
                throw new Error("Incorrect password");
            return {
                failed: false,
                message: "Login successful",
                userDetails: {
                    _id: foundUser._id.toString(),
                    isAdmin: false
                }
            };
        }
        catch (error) {
            return {
                failed: true,
                message: error.message,
                statusCode: 401
            };
        }
    });
}
;
function getTextSpacesToDelete(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const textSpaces = yield TextSpace_1.default.find({ owner: userId }, "_id").lean();
        return textSpaces.map(({ _id }) => _id.toString());
    });
}
function deleteUserTextSpaces(textSpaceIds) {
    return TextSpace_1.default.deleteMany({ _id: textSpaceIds });
}
;
function removeTextSpaceFromOtherUsersFavorites(textSpaceIds) {
    return User_1.default.updateMany({ favorites: { $in: textSpaceIds } }, { $pull: { favorites: { $in: textSpaceIds } } });
}
;
function deleteUserAndSpaces(userId, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Deletes user and their spaces
            const user = yield User_1.default.findById(userId);
            if (!user)
                throw new Error("No users found");
            const passwordsMatch = yield comparePasswords(String(user.password), password);
            if (!passwordsMatch)
                throw new Error("Incorrect password");
            const textSpacesToDelete = yield getTextSpacesToDelete(userId);
            yield deleteUserTextSpaces(textSpacesToDelete);
            yield removeTextSpaceFromOtherUsersFavorites(textSpacesToDelete);
            yield user.deleteOne();
            return {
                failed: false,
                message: "User deleted"
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
