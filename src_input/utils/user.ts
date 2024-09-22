import User from "../models/User";

import bcrypt from "bcrypt";
import { isEmail } from "validator";

export class CreateUser {
    private name: string = "";
    private email: string = "";
    private username: string = "";
    private password: string = "";
    private confirmPassword: string = "";
    private validation: { passed: boolean, errors?: { [key: string]: string } } = {
        passed: false,
        errors: {}
    }

    constructor(values?: { name?: string, username?: string, email?: string, password?: string, confirmPassword?: string }) {
        this.name = values?.name || "";
        this.email = values?.email || "";
        this.username = values?.username || "";
        this.password = values?.password || "";
        this.confirmPassword = values?.confirmPassword || "";
    }

    public getDetails(): {
        name?: string;
        email?: string;
        username?: string;
    } {
        return {
            name: this.name,
            email: this.email,
            username: this.username
        }
    }

    private async hashPassword(): Promise<string> {
        try {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(this.password, salt);
            return hashedPassword;
        } catch (error) {
            throw error;
        }
    }

    private validateName() {
        if (this.name) return;
        this.validation.passed = false;
        this.validation.errors = { ...this.validation.errors, name: "User must have a name" };
    }

    private async validateEmail() {
        let errorMessage: string | undefined;

        if (!this.email) {
            errorMessage = "User must have an email";
        } else {
            try {
                const emailIsValid = isEmail(this.email);
                const userCount = await User.countDocuments({ email: this.email });

                if (!emailIsValid) {
                    errorMessage = "Please use a valid email";
                } else if (userCount <= 0) {
                    errorMessage = "email already exists";
                }
            } catch (error) {
                errorMessage = (error as Error).message;
            }
        }

        if (errorMessage) {
            this.validation.passed = false;
            this.validation.errors = { ...this.validation.errors, email: errorMessage };
        }
    }

    private async validateUsername() {
        let errorMessage: undefined | string;

        if (!this.username) {
            errorMessage = "User must have a username";
        }
        else if (/[\s\*\+.,\&\(\)]/.test(this.username)) { 
            errorMessage = "username cannot have charaters like: white spaces, '*', '+', '.', '&', '(', or ')'";
        }
        else {
            try {
                const userCount = await User.countDocuments({ username: this.username });
                if (userCount <= 0) return;
                errorMessage = "username already exists";
            } catch (error) {
                errorMessage = (error as Error).message;
            }
        }

        if (errorMessage) {
            this.validation.passed = false;
            this.validation.errors = { ...this.validation.errors, username: errorMessage };
        }
    }

    private validatePassword() {
        let errorMessage: undefined | string;

        if (this.password.length < 8) errorMessage = "Password must be at least 8 characters long";
        else if (!/[a-z]/.test(this.password)) errorMessage = "Password must contain lowercase letters";
        else if (!/[A-Z]/.test(this.password)) errorMessage = "Password must contain uppercase letters";
        else if (!/\d/.test(this.password)) errorMessage = "Password must contain numbers";
        else if (!/^[a-zA-Z0-9]/.test(this.password)) errorMessage = "Password must contain symbols";
        
        if (errorMessage) {
            this.validation.passed = false;
            this.validation.errors = { ...this.validation.errors, password: errorMessage }
        }
    }

    private checkIfPasswordsMatch() {
        if (this.password !== this.confirmPassword) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                confirmPassword: "Passwords must match"
            }
        }
    }

    public async validate(): Promise<{
        passed: boolean;
        errors?: {
            [key: string]: string
        }
    }> {
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
    }

    public async save(): Promise<{
        failed: boolean;
        message: string;
        errors?: { [key: string]: string }
    }> {
        if (this.validation.passed) {
            try { 
                const hashedPassword = await this.hashPassword();
                await User.create({
                    name: this.name,
                    email: this.email,
                    username: this.username,
                    password: hashedPassword
                });

                return {
                    failed: false,
                    message: "New user created"
                }
            }
            catch (error) {
                return {
                    failed: true,
                    message: "Could not save user"
                }
            }
        }
        return {
            failed: true,
            message: "Validation error",
            errors: this.validation.errors
        }
    }
}