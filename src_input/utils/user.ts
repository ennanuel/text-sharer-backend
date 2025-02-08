import User from "../models/User";
import TextSpace from "../models/TextSpace";

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
        this.name = values?.name?.replace(/\s/, " ") || "";
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
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(this.password, salt);
        return hashedPassword;
    }

    private validateName() {
        let errorMessage;
        if (this.name.length > 1024) errorMessage = "Name is too long";
        if (/([^a-zA-Z ])/.test(this.name)) errorMessage = "User's name must contain only letter"; 
        
        if(errorMessage) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                name: "User's name must contain only letters"
            };
        }
    }

    private async validateEmail() {
        let errorMessage;

        if (!this.email) errorMessage = "User must have an email";
        else if (this.email.length > 1024) errorMessage = "email is too long";
        else if (!isEmail(this.email)) errorMessage = "Please use a valid email";
        else {
            try {
                const userCount = await User.countDocuments({ email: this.email });
                if (userCount > 0) errorMessage = "email already exists";
            } catch (error) {
                console.error(error);
                errorMessage = (error as Error).message;
            }
        }

        if (errorMessage) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                email: errorMessage
            };
        }
    }

    private async validateUsername() {
        let errorMessage;

        if (!this.username) errorMessage = "User must have a username";
        else if(this.username.length > 1024) errorMessage = "username is too long";
        else if (/[\s\*\+.,\&\(\)]/.test(this.username)) errorMessage = "username cannot have charaters like: white spaces, '*', '+', '.', '&', '(', or ')'";
        else {
            try {
                const userCount = await User.countDocuments({ username: this.username });
                if (userCount > 0) errorMessage = "username already exists";
            } catch (error) {
                console.error(error);
                errorMessage = (error as Error).message;
            }
        }

        if (errorMessage) {
            this.validation.passed = false;
            this.validation.errors = { 
                ...this.validation.errors,
                username: errorMessage
            };
        }
    }

    private validatePassword() {
        let errorMessage: undefined | string;

        if (this.password.length < 8) errorMessage = "Password must be at least 8 characters long";
        else if (!/[a-z]/.test(this.password)) errorMessage = "Password must contain lowercase letters";
        else if (!/[A-Z]/.test(this.password)) errorMessage = "Password must contain uppercase letters";
        else if (!/\d/.test(this.password)) errorMessage = "Password must contain numbers";
        else if (!/[^a-zA-Z0-9]/.test(this.password)) errorMessage = "Password must contain symbols";
        
        if (errorMessage) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                password: errorMessage
            }
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
                    await this.validateEmail();
                    continue;
                case "username":
                    await this.validateUsername();
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
    }

    public async save(): Promise<{
        failed: boolean;
        message: string;
        userDetails?: {
            _id: string;
            isAdmin: boolean;
        }
        errors?: { [key: string]: string };
    }> {
        if (this.validation.passed) {
            try {
                const hashedPassword = await this.hashPassword();
                const user = new User({
                    name: this.name,
                    email: this.email,
                    username: this.username,
                    password: hashedPassword
                });
                const savedUser = await user.save();

                return {
                    failed: false,
                    message: "New user created",
                    userDetails: {
                        _id: savedUser._id.toString(),
                        isAdmin: false
                    }
                }
            }
            catch (error) {
                console.error(error);
                return {
                    failed: true,
                    message: "Could not save user"
                }
            }
        } else {
            return {
                failed: true,
                message: "Validation error",
                errors: this.validation.errors
            }
        }
    }
}

export class EditUser {
    private userId;
    private newDetails: {
        name?: string;
        email?: string;
        username?: string;
    } = {};
    private validation: { passed: boolean; errors: { [key: string]: string; } } = {
        passed: false,
        errors: {}
    };

    constructor(values ?: {
        id?: string;
        name?: string;
        username?: string;
        email?: string;
    }) {
        this.userId = values?.id || "";

        if (values?.name) this.newDetails.name = values.name.replace(/\s/, " ");
        if (values?.username) this.newDetails.username = values.username;
        if (values?.email) this.newDetails.email = values.email;
    }

    private async getUserDocument() {
        const user = await User.findById(String(this.userId), "_id name username email").lean();
        return user;
    }

    private async validateUserAndNewValues() {
        let errorMessage;
        const user = await this.getUserDocument();

        if (!user) {
            errorMessage = "User not found";
        } else if (Object.entries(this.newDetails).every(([key, value]) => user[key as keyof typeof user] === value)) {
            errorMessage = "There is no change in the new values";
        }

        if (errorMessage) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                user: errorMessage
            }
        }
    }
    
    private validateName() {
        let errorMessage;

        if (this.newDetails.name && this.newDetails.name.length > 1024) errorMessage = "New name too long";
        if (this.newDetails.name && /[^a-zA-Z ]/.test(this.newDetails.name)) errorMessage = "New user's name must contain only letters";
        
        if (errorMessage) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                name: "New user's name must contain only letters"
            };
        }
    }

    private async validateEmail() {
        let errorMessage;
        const emailIsValid = isEmail(String(this.newDetails?.email));

        if (!emailIsValid) {
            errorMessage = "New email isn't valid";
        } else if (this.newDetails?.email && this.newDetails.email.length > 1024) {
            errorMessage = "New email is too long";
        } else {
            const usersWithTheSameEmail = await User.countDocuments({ email: this.newDetails?.email, _id: { $ne: this.userId } });
            if (usersWithTheSameEmail > 0) errorMessage = "Email already exists";
        }

        if (errorMessage) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                email: errorMessage
            };
        }
    }

    private async validateUsername() {
        let errorMessage;
        const usernameIsInvalid = /[\s\*\+.,\&\(\)]/.test(String(this.newDetails?.username));

        if (this.newDetails?.username && this.newDetails.username.length > 1024) {
            errorMessage = "New username is too long";
        } else if (usernameIsInvalid) {
            errorMessage = "New username cannot have charaters like: white spaces, '*', '+', '.', '&', '(', or ')'";
        } else {
            const usersWithTheSameUsername =  await User.countDocuments({ username: this.newDetails?.username, _id: { $ne: this.userId } });
            if (usersWithTheSameUsername > 0) errorMessage = "Username already exists";
        }

        if (errorMessage) {
            this.validation.passed = false;
            this.validation.errors = { 
                ...this.validation.errors,
                username: errorMessage
            }
        }
    }

    public async validate() {
        this.validation.passed = true;

        await this.validateUserAndNewValues();
        if (this.newDetails.name) this.validateName();
        if (this.newDetails.email) await this.validateEmail();
        if (this.newDetails.username) await this.validateUsername();

        return this.validation;
    };

    public async save() { 
        if (this.validation.passed) {
            try {
                const newValues: { [key: string]: string; } = {};

                if (this.newDetails.name) newValues.name = this.newDetails.name;
                if (this.newDetails.email) newValues.email = this.newDetails.email;
                if (this.newDetails.username) newValues.username = this.newDetails.username;

                await User.findByIdAndUpdate(this.userId, { $set: newValues });

                return {
                    failed: false,
                    message: "User details updated"
                }
            } catch (error) {
                console.error(error);

                return {
                    failed: true,
                    message: "New user details could not be saved"
                }
            } 
        } else {
            return {
                failed: true,
                message: "Validation error",
                errors: this.validation.errors
            }
        }
    };
};

export async function getUserDetails(userId: string) {
    try {
        const user = await User.findById(userId, "name username email").lean();
        if (!user) throw new Error("User not found");

        const textSpaces = await TextSpace.countDocuments({ owner: user._id });
        const userDetails = { ...user, textSpaces };

        return {
            failed: false,
            userDetails
        }
    } catch (error) {
        console.error(error);
        return {
            failed: true,
            message: (error as Error).message
        }
    }
}

function findUserWithUsername(usernameOrEmail: string) {
    return User.findOne(
        {
            $or: [
                { username: usernameOrEmail },
                { email: usernameOrEmail }
            ]
        },
        "password"
    ).lean();
}

export function comparePasswords(hashedPassword: string, unhashedPasssword: string) {
    return bcrypt.compare(unhashedPasssword, hashedPassword);
}

export async function logUserIn(userDetails?: { usernameOrEmail?: string; password?: string; }) {
    try {
        if (!userDetails?.usernameOrEmail) throw new Error("Please provide username or email");
        if (!userDetails?.password) throw new Error("Please provide a password");
        const foundUser = await findUserWithUsername(userDetails.usernameOrEmail);

        if (!foundUser) throw new Error("username or email address does not exist");
        const passwordsMatch = await comparePasswords(String(foundUser.password), userDetails.password);

        if (!passwordsMatch) throw new Error("Incorrect password");

        return {
            failed: false,
            message: "Login successful",
            userDetails: {
                _id: foundUser._id.toString(),
                isAdmin: false
            }
        };
    } catch (error) {
        return {
            failed: true,
            message: (error as Error).message,
            statusCode: 401
        };
    }
};

async function getTextSpacesToDelete(userId: string) {
    const textSpaces = await TextSpace.find({ owner: userId }, "_id").lean();
    return textSpaces.map(({ _id }) => _id.toString());
}

function deleteUserTextSpaces(textSpaceIds: string[]) {
    return TextSpace.deleteMany({ _id: textSpaceIds });
};

function removeTextSpaceFromOtherUsersFavorites(textSpaceIds: string[]) {
    return User.updateMany({ favorites: { $in: textSpaceIds } }, { $pull: { favorites: { $in: textSpaceIds } } });
};

export async function deleteUserAndSpaces(userId: string, password: string) {
    try {
        // Deletes user and their spaces
        const user = await User.findById(userId);
        if (!user) throw new Error("No users found");

        const passwordsMatch = await comparePasswords(String(user.password), password);
        if (!passwordsMatch) throw new Error("Incorrect password");

        const textSpacesToDelete = await getTextSpacesToDelete(userId);
        await deleteUserTextSpaces(textSpacesToDelete);
        await removeTextSpaceFromOtherUsersFavorites(textSpacesToDelete);

        await user.deleteOne();

        return {
            failed: false,
            message: "User deleted"
        }
    } catch (error) {
        return {
            failed: true,
            message: (error as Error).message
        }
    }
}