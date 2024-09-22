const request = require("supertest");
const User = require("../src/models/User");

const { CreateUser } = require("../src/utils/user");

jest.mock("../src/models/User");

describe("Testing 'CreateUser' class", () => {
    const USER_DETAILS = {
        name: "Ezema Emmanuel",
        email: "emmanuelezema6@gmail.com",
        username: "ennanuel",
        password: "TheFlash!3",
        confirmPassword: "TheFlash!3"
    }

    it("Creates a new user class", async () => {
        User.create.mockImplementation((values) => jest.fn().mockResolvedValue({ _id: Date.now(), _doc: { _id: Date.now(), ...values } }));
        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(0));
        
        const newUser = new CreateUser(USER_DETAILS);
        const validation = await newUser.validate();
        const savedUser = await newUser.save();

        expect(validation).toEqual({ passed: true, errors: {} });
        expect(newUser.getDetails()).toEqual({
            name: USER_DETAILS.name,
            email: USER_DETAILS.email,
            username: USER_DETAILS.username
        });
        expect(savedUser).toEqual({ failed: false, message: "New user saved" });
    });

    it("Validate user details", async () => {
        const newUser = new CreateUser();

        const validation = await newUser.validate();
        const savedUser = await newUser.save();
        
        expect(validation).toEqual({
            passed: false,
            errors: {
                name: "User must have a name",
                email: "User must have an email",
                username: "User must have a username",
                password: "Password must be at least 8 characters long",
            }
        });
        expect(savedUser).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                name: "User must have a name",
                email: "User must have an email",
                username: "User must have a username",
                password: "Password must be at least 8 characters long",
            }
        });
    });

    it("Validates if email and username already exists", async () => {
        const mockUsers = [];

        User.countDocuments.mockImplementation(({ [field]: value }) => jest
            .fn()
            .mockResolvedValue(
                mockUsers.filter(user => user[field] === value).length
            )
        );
        User.create.mockImplementation((values) => {
            mockUsers.push(values);
            return jest.fn().mockResolvedValue({
                _id: Date.now(),
                _doc: {
                    _id: Date.now(),
                    ...values
                }
            });
        });

        const newUser = new CreateUser(USER_DETAILS);
        const validation1 = await newUser.validate();
        const savedUser1 = await newUser.save();

        const newUser2 = new CreateUser({ ...USER_DETAILS, name: "John Stones" });
        const validation2 = await newUser2.validate();

        expect(validation1).toEqual({
            passed: true,
            errors: {}
        });
        expect(savedUser1).toEqual({
            failed: false,
            message: "New user saved"
        });
        expect(validation2).toEqual({
            passed: false,
            errors: {
                email: "Email already exists",
                username: "Username already exists"
            }
        });
    })
});

describe("Testing password verification", () => {
    const USER_DETAILS = {
        name: "Emmanuel Ezema",
        email: "emmanuelezema6@gmail.com",
        username: "ennanuel",
        password: "TheFlash!3",
        confirmPassword: "TheFlash!3"
    };
    
    it("Should check password length", async () => {
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


// describe("Testing user registration route");


// describe("Testing user login route");


// describe("Testing user authentication route");


// describe("Testing user details update route");


// describe("Testing user delete route");