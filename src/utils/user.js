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
exports.CreateUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = require("validator");
class CreateUser {
    constructor(values) {
        this.name = "";
        this.email = "";
        this.username = "";
        this.password = "";
        this.confirmPassword = "";
        this.validation = {
            passed: false,
            errors: {}
        };
        this.name = (values === null || values === void 0 ? void 0 : values.name) || "";
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
            try {
                const salt = yield bcrypt_1.default.genSalt();
                const hashedPassword = yield bcrypt_1.default.hash(this.password, salt);
                return hashedPassword;
            }
            catch (error) {
                throw error;
            }
        });
    }
    validateName() {
        if (this.name)
            return;
        this.validation.passed = false;
        this.validation.errors = Object.assign(Object.assign({}, this.validation.errors), { name: "User must have a name" });
    }
    validateEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            let errorMessage;
            if (!this.email) {
                errorMessage = "User must have an email";
            }
            else {
                try {
                    const emailIsValid = (0, validator_1.isEmail)(this.email);
                    const userCount = yield User_1.default.countDocuments({ email: this.email });
                    if (!emailIsValid) {
                        errorMessage = "Please use a valid email";
                    }
                    else if (userCount <= 0) {
                        errorMessage = "email already exists";
                    }
                }
                catch (error) {
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
            if (!this.username) {
                errorMessage = "User must have a username";
            }
            else if (/[\s\*\+.,\&\(\)]/.test(this.username)) {
                errorMessage = "username cannot have charaters like: white spaces, '*', '+', '.', '&', '(', or ')'";
            }
            else {
                try {
                    const userCount = yield User_1.default.countDocuments({ username: this.username });
                    if (userCount <= 0)
                        return;
                    errorMessage = "username already exists";
                }
                catch (error) {
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
        else if (!/^[a-zA-Z0-9]/.test(this.password))
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
                    case "confirmPasword":
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
                    yield User_1.default.create({
                        name: this.name,
                        email: this.email,
                        username: this.username,
                        password: hashedPassword
                    });
                    return {
                        failed: false,
                        message: "New user created"
                    };
                }
                catch (error) {
                    return {
                        failed: true,
                        message: "Could not save user"
                    };
                }
            }
            return {
                failed: true,
                message: "Validation error",
                errors: this.validation.errors
            };
        });
    }
}
exports.CreateUser = CreateUser;
