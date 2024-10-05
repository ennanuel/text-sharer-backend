const request = require("supertest");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config();

const { default: User } = require("../src/models/User");

const { CreateUser, EditUser } = require("../src/utils/user");
const { describe } = require("node:test");


jest.mock("../src/models/User");
jest.mock("bcrypt");

bcrypt.genSalt.mockImplementation(() => jest.fn().mockResolvedValue(Math.ceil(Math.random() * 1000))());
bcrypt.hash.mockImplementation((password, salt) => jest.fn().mockResolvedValue(password + salt)());


describe("Testing 'CreateUser' class", () => {
    const USER_DETAILS = {
        name: "Ezema Emmanuel",
        email: "emmanuelezema6@gmail.com",
        username: "ennanuel",
        password: "SuperMan!3",
        confirmPassword: "SuperMan!3"
    }

    it("Creates a new user class", async () => {
        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(0)());
        User.mockImplementation((values) => ({
            save: jest.fn().mockResolvedValue({
                _id: "user123",
                _doc: {
                    _id:
                        "user123",
                    ...values
                }
            })
        }));

        const newUser = new CreateUser(USER_DETAILS);
        const validation = await newUser.validate();
        const savedUser = await newUser.save();

        expect(validation).toEqual({ passed: true, errors: {} });
        expect(newUser.getDetails()).toEqual({
            name: USER_DETAILS.name,
            email: USER_DETAILS.email,
            username: USER_DETAILS.username
        });
        expect(savedUser).toEqual({
            failed: false,
            message: "New user created",
            userDetails: {
                _id: "user123",
                isAdmin: false
            }
        });
        expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
        expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    });

    it("Validate user details", async () => {
        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(0)());
        User.mockImplementation((values) => ({
            save: jest.fn().mockResolvedValue({
                _id: 'user123',
                _doc: {
                    _id:
                        "user123",
                    ...values
                }
            })
        }));

        const newUser = new CreateUser();

        const validation = await newUser.validate();
        const savedUser = await newUser.save();
        
        expect(validation).toEqual({
            passed: false,
            errors: {
                email: "User must have an email",
                username: "User must have a username",
                password: "Password must be at least 8 characters long"
            }
        });
        expect(savedUser).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                email: "User must have an email",
                username: "User must have a username",
                password: "Password must be at least 8 characters long"
            }
        });
    });

})


describe("Name, username and email validation", () => {

    const USER_DETAILS = {
        name: "Ezema Emmanuel",
        email: "emmanuelezema6@gmail.com",
        username: "ennanuel",
        password: "TheFlash!3",
        confirmPassword: "TheFlash!3"
    }

    it("Validates if email and username already exists", async () => {
        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(1)());
        User.mockImplementation((values) => ({
            save: jest.fn().mockResolvedValue({
                _id: "user123",
                _doc: {
                    _id:
                        "user123",
                    ...values
                }
            })
        }));

        const newUser = new CreateUser({ name: "", ...USER_DETAILS });
        const validation = await newUser.validate();
        const savedUser = await newUser.save();
        
        expect(validation).toEqual({
            passed: false,
            errors: {
                email: "email already exists",
                username: "username already exists"
            }
        });
        expect(savedUser).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                email: "email already exists",
                username: "username already exists"
            }
        });

    })

    it("Validates if name, email or username is invalid", async () => {
        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(1)());
        User.mockImplementation((values) => ({
            save: jest.fn().mockResolvedValue({
                _id: "user123",
                _doc: {
                    _id:
                        "user123",
                    ...values
                }
            })
        }));

        const newUser = new CreateUser({ 
            ...USER_DETAILS, 
            name: "Bad Name1", 
            email: "this_is_not_an_email.com", 
            username: "Invalid Username"
        });
        const validation = await newUser.validate();
        const savedUser = await newUser.save();

        expect(validation).toEqual({
            passed: false,
            errors: {
                name: "User's name must contain only letters",
                email: "Please use a valid email",
                username: "username cannot have charaters like: white spaces, '*', '+', '.', '&', '(', or ')'"
            }
        })
        expect(savedUser).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                name: "User's name must contain only letters",
                email: "Please use a valid email",
                username: "username cannot have charaters like: white spaces, '*', '+', '.', '&', '(', or ')'"
            }
        })
    })
});

describe("Testing password verification", () => {

    const USER_DETAILS = {
        name: "Emmanuel Ezema",
        email: "emmanuelezema6@gmail.com",
        username: "ennanuel",
        password: "SuperMan!3",
        confirmPassword: "SuperMan!3"
    };
    
    it("Should check password length", async () => {
        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(0)());
        User.mockImplementation((values) => ({
            save: jest.fn().mockResolvedValue({
                _id: "user123",
                _doc: {
                    _id:
                        "user123",
                    ...values
                }
            })
        }));

        const newUser = new CreateUser({ ...USER_DETAILS, password: "abc123" });
        const validation = await newUser.validate();

        expect(validation).toEqual({
            passed: false,
            errors: {
                password: "Password must be at least 8 characters long",
                confirmPassword: "Passwords must match"
            }
        })
    });

    it("Should check for lowercase alphabets in password", async () => {
        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(0)());
        User.mockImplementation((values) => ({
            save: jest.fn().mockResolvedValue({
                _id: "user123",
                _doc: {
                    _id:
                        "user123",
                    ...values
                }
            })
        }));
        
        const newUser = new CreateUser({ ...USER_DETAILS, password: "1234ABCD" });
        const validation = await newUser.validate();

        expect(validation).toEqual({
            passed: false,
            errors: {
                password: "Password must contain lowercase letters",
                confirmPassword: "Passwords must match"
            }
        })
    });

    it("Should check for uppercase letters in password", async () => {
        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(0)());
        User.mockImplementation((values) => ({
            save: jest.fn().mockResolvedValue({
                _id: "user123",
                _doc: {
                    _id:
                        "user123",
                    ...values
                }
            })
        }));
        
        const newUser = new CreateUser({ ...USER_DETAILS, password: "1234abcd" });
        const validation = await newUser.validate();

        expect(validation).toEqual({
            passed: false,
            errors: {
                password: "Password must contain uppercase letters",
                confirmPassword: "Passwords must match"
            }
        })
    });

    it("Should check for numbers in password", async () => {
        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(0)());
        User.mockImplementation((values) => ({
            save: jest.fn().mockResolvedValue({
                _id: "user123",
                _doc: {
                    _id:
                        "user123",
                    ...values
                }
            })
        }));
        
        const newUser = new CreateUser({ ...USER_DETAILS, password: "abcdEFGH" });
        const validation = await newUser.validate();

        expect(validation).toEqual({
            passed: false,
            errors: {
                password: "Password must contain numbers",
                confirmPassword: "Passwords must match"
            }
        })
    });

    it("Should check for symbols in password", async () => {
        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(0)());
        User.mockImplementation((values) => ({
            save: jest.fn().mockResolvedValue({
                _id: "user123",
                _doc: {
                    _id:
                        "user123",
                    ...values
                }
            })
        }));
        
        const newUser = new CreateUser({ ...USER_DETAILS, password: "abcDEF12" });
        const validation = await newUser.validate();

        expect(validation).toEqual({
            passed: false,
            errors: {
                password: "Password must contain symbols",
                confirmPassword: "Passwords must match"
            }
        })
    });

    it("Should check if password and password confirmation match", async () => {
        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(0)());
        User.mockImplementation((values) => ({
            save: jest.fn().mockResolvedValue({
                _id: "user123",
                _doc: {
                    _id:
                        "user123",
                    ...values
                }
            })
        }));
        
        const newUser = new CreateUser({ ...USER_DETAILS, password: "abcDEF12$" });
        const validation = await newUser.validate();

        expect(validation).toEqual({
            passed: false,
            errors: {
                confirmPassword: "Passwords must match"
            }
        })
    });
});

describe("Testing user details editing class", () => {
    const USER_DETAILS = {
        id: 1234,
        name: "Ezema Emmanuel",
        email: "emmanuelezema6@gmail.com",
        username: "ennanuel"
    };

    const USER_FIND_RESULT = {
        id: 1234,
        name: "Nnanna Emmanuel",
        email: "emmanuelezema2@gmail.com",
        username: "ennanuel1"
    }

    it("Validates the values to update", async () => {
        User.countDocuments.mockImplementation((values) => jest.fn().mockResolvedValue(0)());
        User.findById.mockImplementation(() => ({ lean: jest.fn().mockResolvedValue(USER_FIND_RESULT) }));
        User.findByIdAndUpdate.mockImplementation((values) => jest.fn().mockResolvedValue(values)());
        
        const user = new EditUser(USER_DETAILS);
        const validation = await user.validate();
        const updatedUser = await user.save();

        expect(validation.passed).toBe(true);
        expect(validation.errors).toEqual({});
        expect(updatedUser).toEqual({
            failed: false,
            message: "User details updated"
        })
    });

    it("Validate 'EditUser' class initialized without details", async () => { 
        User.countDocuments.mockImplementation((values) => jest.fn().mockResolvedValue(0)());
        User.findById.mockImplementation(() => ({ lean: jest.fn().mockResolvedValue(null) }));
        
        const user = new EditUser();
        const validation = await user.validate();
        const savedUser = await user.save();

        expect(validation.passed).toBe(false);
        expect(validation.errors).toEqual({ user: "User not found" });
        expect(savedUser.failed).toBe(true);
        expect(savedUser.message).toBe("Validation error");
        expect(savedUser.errors).toEqual({ user: "User not found" });
    })

    it("Validation for invalid email and username", async () => {
        User.countDocuments.mockImplementation((values) => jest.fn().mockResolvedValue(0)());
        User.findById.mockImplementation(() => ({ lean: jest.fn().mockResolvedValue(USER_FIND_RESULT) }));
        
        const user = new EditUser({ ...USER_DETAILS, email: "not_an_email.com", username: "bad username" });
        const validation = await user.validate();

        expect(validation.passed).toBe(false);
        expect(validation.errors).toEqual({
            email: "New email isn't valid",
            username: "New username cannot have charaters like: white spaces, '*', '+', '.', '&', '(', or ')'"
        })
    })

    it("Checks if email and username already exists", async () => {
        User.countDocuments.mockImplementation((values) => jest.fn().mockResolvedValue(1)());
        User.findById.mockImplementation(() => ({ lean: jest.fn().mockResolvedValue(USER_FIND_RESULT) }));

        const user = new EditUser(USER_DETAILS);
        const validation = await user.validate();

        expect(validation.passed).toBe(false);
        expect(validation.errors).toEqual({
            email: "Email already exists",
            username: "Username already exists"
        })
    })

    it("Checks if new values are the same with the previous values", async () => {
        User.countDocuments.mockImplementation((values) => jest.fn().mockResolvedValue(0)());
        User.findById.mockImplementation(() => ({ lean: jest.fn().mockResolvedValue(USER_DETAILS) }));

        const user = new EditUser(USER_DETAILS);
        const validation = await user.validate();
        const savedUser = await user.save();

        expect(validation.passed).toBe(false);
        expect(validation.errors).toEqual({
            user: "There is no change in the new values"
        });
        expect(savedUser.failed).toBe(true);
        expect(savedUser.message).toBe("Validation error");
        expect(savedUser.errors).toEqual({
            user: "There is no change in the new values"
        });
    })
})