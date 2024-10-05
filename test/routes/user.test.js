const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { app } = require("../../src/server");
const { default: User } = require("../../src/models/User");
const { default: TextSpace } = require("../../src/models/TextSpace");

const auth = require("../../src/utils/auth");

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../src/models/User");
jest.mock("../../src/models/TextSpace");

describe("Testing user registration route", () => {
    const USER_DETAILS = {
        name: "Ezema Emmanuel",
        email: "emmanuelezema6@gmail.com",
        username: "ennanuel",
        password: "SuperMan!3",
        confirmPassword: "SuperMan!3"
    };

    it("Successfully creates and saves a new user", async () => {

        bcrypt.genSalt.mockImplementation(() => jest.fn().mockResolvedValue("abc123")());
        bcrypt.hash.mockImplementation((password, salt) => jest.fn().mockResolvedValue(`${password}_${salt}`)());

        jwt.sign.mockImplementation((values, secret_key, options) => "user_cookie_token");

        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(0)());
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

        const response = await request
            .agent(app)
            .post("/user/register")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(USER_DETAILS);
        
        const cookies = response.headers['set-cookie'];

        expect(response.status).toBe(200);
        expect(jwt.sign).toHaveBeenCalledTimes(1);

        expect(cookies[0]).toMatch(/userToken=user_cookie_token/);

        expect(response.body).toEqual({
            failed: false,
            message: "New user created"
        });
    });

    it ("Throws error if new user could not be saved", async () => {
        bcrypt.genSalt.mockImplementation(() => jest.fn().mockResolvedValue("abc123")());
        bcrypt.hash.mockImplementation((password, salt) => jest.fn().mockResolvedValue(`${password}_${salt}`)());

        jwt.sign.mockImplementation((values, secret_key, options) => "user_cookie_token");

        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(0)());
        User.mockImplementation((values) => ({
            save: jest.fn().mockRejectedValue(new Error("Error occured"))
        }));

        const response = await request
            .agent(app)
            .post("/user/register")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(USER_DETAILS);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "Could not save user"
        })
    });

    it("Wouldn't save the new user details because username, email or password values weren't validated", async () => {
        let { assignUserToken } = require("../../src/utils/auth");

        const INVALID_USER_DETAILS = {
            name: "Bad Name1",
            username: "bad username1",
            email: "BAD-EMAIL.com",
            password: "SuperMan@2",
            confirmPassword: "123"
        }

        bcrypt.genSalt.mockImplementation(() => jest.fn().mockResolvedValue("abc123")());
        bcrypt.hash.mockImplementation((password, salt) => jest.fn().mockResolvedValue(`${password}_${salt}`)());

        jwt.sign.mockImplementationOnce((values, secret_key, options) => "user_cookie_token");
        assignUserToken = jest.fn();

        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(0)());
        User.mockImplementation((values) => ({
            save: jest.fn().mockResolvedValue({
                _id: "user123"
                , _doc: {
                    _id:
                        "user123",
                    ...values
                }
            })
        }));

        const response = await request
            .agent(app)
            .post("/user/register")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(INVALID_USER_DETAILS);
        
        const cookies = response.headers['set-cookie'];

        expect(response.status).toBe(500);
        expect(assignUserToken).not.toHaveBeenCalled();

        expect(response.body).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                name: "User's name must contain only letters",
                username: "username cannot have charaters like: white spaces, '*', '+', '.', '&', '(', or ')'",
                email: "Please use a valid email",
                confirmPassword: "Passwords must match"
            }
        });
        expect(cookies).toBe(undefined);
    })

    it("Wouldn't save the new user details because username or email already exist", async () => {
        let { assignUserToken } = require("../../src/utils/auth");
        assignUserToken = jest.fn();

        bcrypt.genSalt.mockImplementation(() => jest.fn().mockResolvedValue("abc123")());
        bcrypt.hash.mockImplementation((password, salt) => jest.fn().mockResolvedValue(`${password}_${salt}`)());

        jwt.sign.mockImplementationOnce((values, secret_key, options) => "user_cookie_token");

        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(1)());
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

        const response = await request
            .agent(app)
            .post("/user/register")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(USER_DETAILS);
        
        const cookies = response.headers['set-cookie'];

        expect(response.status).toBe(500);
        expect(assignUserToken).not.toHaveBeenCalled();

        expect(response.body).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                username: "username already exists",
                email: "email already exists"
            }
        });
        expect(cookies).toBe(undefined);
    })

    it ("Returns error if user could not be saved", async () => {
        bcrypt.genSalt.mockImplementation(() => jest.fn().mockResolvedValue("abc123")());
        bcrypt.hash.mockImplementation((password, salt) => jest.fn().mockResolvedValue(`${password}_${salt}`)());

        jwt.sign.mockImplementation((values, secret_key, options) => "user_cookie_token");

        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(0)());
        User.mockImplementation((values) => ({
            save: jest.fn().mockRejectedValue(new Error("Error saving user"))
        }));

        const response = await request
            .agent(app)
            .post("/user/register")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(USER_DETAILS);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "Could not save user"
        })
    });
});

describe("Testing user login route", () => { 

    it("Should succesfully update user details", async () => {

        bcrypt.compare.mockImplementation((hashedPassword, password) => jest.fn().mockResolvedValue(true)());
        jwt.sign.mockImplementation((values, secret_key, options) => "user_cookie_token");

        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(0)());
        User.findOne.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue({
                _id: "user123",
                password: "this_password_will_be_hashed"
            })
        }));

        const REQUEST_BODY = {
            usernameOrEmail: "emmanuelezema6@gmail.com",
            password: "TheFlash!3"
        };

        const response = await request
            .agent(app)
            .post("/user/login")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(REQUEST_BODY);
        
        const cookies = response.headers['set-cookie'];
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            failed: false,
            message: "Login successful"
        });
        expect(cookies[0]).toMatch(/userToken=user_cookie_token/);
    });


    it("Should throw an error if username or email isn't provided", async () => {

        bcrypt.compare.mockImplementation((hashedPassword, password) => jest.fn().mockResolvedValue(true)());
        jwt.sign.mockImplementation((values, secret_key, options) => "user_cookie_token");

        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(0)());
        User.findOne.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue({
                _id: "user123",
                password: "this_password_will_be_hashed"
            })
        }));

        const REQUEST_BODY = { password: "SuperMan!3" };

        const response = await request
            .agent(app)
            .post("/user/login")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(REQUEST_BODY);
        
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            failed: true,
            message: "Please provide username or email"
        })
    });


    it("Should throw an error if password isn't provided", async () => {

        bcrypt.compare.mockImplementation((hashedPassword, password) => jest.fn().mockResolvedValue(true)());
        jwt.sign.mockImplementation((values, secret_key, options) => "user_cookie_token");

        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(0)());
        User.findOne.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue({
                _id: "user123",
                password: "this_password_will_be_hashed"
            })
        }));

        const REQUEST_BODY = { usernameOrEmail: "a_username" };

        const response = await request
            .agent(app)
            .post("/user/login")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(REQUEST_BODY);
        
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            failed: true,
            message: "Please provide a password"
        })
    });


    it("Should throw an error if no user is found", async () => {

        bcrypt.compare.mockImplementation((hashedPassword, password) => jest.fn().mockResolvedValue(true)());
        jwt.sign.mockImplementation((values, secret_key, options) => "user_cookie_token");

        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(0)());
        User.findOne.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(null)
        }));

        const REQUEST_BODY = {
            usernameOrEmail: "a_username",
            password: "SuperMan!3"
        };

        const response = await request
            .agent(app)
            .post("/user/login")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(REQUEST_BODY);
        
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            failed: true,
            message: "username or email address does not exist"
        })
    });


    it("Should throw an error if passwords don't match", async () => {

        bcrypt.compare.mockImplementation((hashedPassword, password) => jest.fn().mockResolvedValue(false)());
        jwt.sign.mockImplementation((values, secret_key, options) => "user_cookie_token");

        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(0)());
        User.findOne.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue({
                _id: "user123",
                password: "this_password_will_be_hashed"
            })
        }));

        const REQUEST_BODY = {
            usernameOrEmail: "a_username",
            password: "SuperMan!3"
        };

        const response = await request
            .agent(app)
            .post("/user/login")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(REQUEST_BODY);
        
        expect(response.status).toBe(401);
        expect(response.body).toEqual({
            failed: true,
            message: "Incorrect password"
        })
    });
});

describe("Testing user edit route", () => { 
    
    it("Should successfully update user's details", async () => {
        User.findById.mockImplementation((userId) => ({
            lean: jest.fn().mockResolvedValue({
                _id: "user123",
                name: "Emmanuel Ezema",
                email: "emmanuelezema6@gmail.com",
                username: "ennanuel"
            })
        }));
        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(0)());
        User.findByIdAndUpdate.mockImplementation((values) => jest.fn().mockResolvedValue(values)());

        const REQUEST_BODY = {
            username: "new_username",
            email: "new_email@email.com",
            name: "New Name"
        };

        const response = await request
            .agent(app)
            .put("/user/edit/user123")
            .set("Cookie", ["userToken=the_users_token"])
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(REQUEST_BODY);
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            failed: false,
            message: "User details updated"
        });
    });
    
    it("Should throw an error if user details could not be saved", async () => {
        User.findById.mockImplementation((userId) => ({
            lean: jest.fn().mockResolvedValue({
                _id: "user123",
                name: "Ezema Emmanuel",
                email: "emmanuelezema21@gmail.com",
                username: "ennanuel"
            })
        }));
        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(0)());
        User.findByIdAndUpdate.mockImplementation((values) => jest.fn().mockRejectedValue(new Error("Error occured"))());

        const REQUEST_BODY = {
            username: "new_username",
            email: "new_email@email.com",
            name: "New Name"
        };

        const response = await request
            .agent(app)
            .put("/user/edit/user123")
            .set("Cookie", ["userToken=the_users_token"])
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(REQUEST_BODY);
    
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "New user details could not be saved"
        })
    });

    it("Should throw an error if no user was found", async () => {
        User.findById.mockImplementation((userId) => ({
            lean: jest.fn().mockResolvedValue(null)
        }));
        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(1)());
        User.findByIdAndUpdate.mockImplementation((values) => jest.fn().mockResolvedValue(vlaues)());

        const REQUEST_BODY = {
            username: "new_username",
            email: "new_email@email.com",
            name: "New Name"
        };

        const response = await request
            .agent(app)
            .put("/user/edit/user123")
            .set("Cookie", ["userToken=the_users_token"])
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(REQUEST_BODY);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                user: "User not found",
                email: "Email already exists",
                username: "Username already exists"
            }
        })
    })

    it("Should throw an error if the new values are the same with the previous values", async () => {

        const REQUEST_BODY = {
            username: "new_username",
            email: "new_email@email.com",
            name: "New Name"
        };

        User.findById.mockImplementation((userId) => ({
            lean: jest.fn().mockResolvedValue(REQUEST_BODY)
        }));
        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(0)());
        User.findByIdAndUpdate.mockImplementation((values) => jest.fn().mockResolvedValue(vlaues)());

        const response = await request
            .agent(app)
            .put("/user/edit/user123")
            .set("Cookie", ["userToken=the_users_token"])
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(REQUEST_BODY);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                user: "There is no change in the new values"
            }
        })
    })

    it("Should throw an error if the new username or email already exist", async () => {
        User.findById.mockImplementation((userId) => ({
            lean: jest.fn().mockResolvedValue({
                _id: "user123",
                name: "Emmanuel Ezema",
                email: "emmanuelezema6@gmail.com",
                username: "ennanuel"
            })
        }));
        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(1)());
        User.findByIdAndUpdate.mockImplementation((values) => jest.fn().mockResolvedValue(vlaues)());

        const REQUEST_BODY = {
            username: "new_username",
            email: "new_email@email.com",
            name: "New Name"
        };

        const response = await request
            .agent(app)
            .put("/user/edit/user123")
            .set("Cookie", ["userToken=the_users_token"])
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(REQUEST_BODY);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                username: "Username already exists",
                email: "Email already exists"
            }
        })
    })

    it("Should throw an error if the username, name or email is invalid", async () => {
        User.findById.mockImplementation((userId) => ({
            lean: jest.fn().mockResolvedValue({
                _id: "user123",
                name: "Emmanuel Ezema",
                email: "emmanuelezema6@gmail.com",
                username: "ennanuel"
            })
        }));
        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(1)());
        User.findByIdAndUpdate.mockImplementation((values) => jest.fn().mockResolvedValue(vlaues)());

        const REQUEST_BODY = {
            username: "bad username!",
            email: "BAD-EMAIL-ADDRESS",
            name: "Bad Name1"
        };

        const response = await request
            .agent(app)
            .put("/user/edit/user123")
            .set("Cookie", ["userToken=the_users_token"])
            .set("Content-Type", "application/json")
            .set("Accept", "application/json")
            .send(REQUEST_BODY);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                name: "New user's name must contain only letters",
                username: "New username cannot have charaters like: white spaces, '*', '+', '.', '&', '(', or ')'",
                email: "New email isn't valid"
            }
        });
    })
});

describe("Testing get user details route", () => { 

    it("Should return details of user", async () => {
        const RESULT = {
            _id: "userId",
            name: "My Name",
            email: "my-email@email.com",
            username: "myusername"
        };
        const textSpaces = 4

        User.findById.mockImplementation((id) => ({
            lean: jest.fn().mockResolvedValue(RESULT)
        }));
        TextSpace.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(textSpaces)());


        const response = await request
            .agent(app)
            .get("/user/details/userId")
            .set("Cookie", ["userToken=this_user_token"])
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");


        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            ...RESULT,
            textSpaces
        })
    });

    it("Should throw error if user wasn't found", async () => {

        const RESULT = null;
        const textSpaces = 4

        User.findById.mockImplementation((id) => ({
            lean: jest.fn().mockResolvedValue(RESULT)
        }));
        TextSpace.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(textSpaces))


        const response = await request
            .agent(app)
            .get("/user/details/userId")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");


        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "User not found"
        })
    });

    it("Should throw error if user search returns error", async () => {

        const RESULT = new Error("An error occured")
        const textSpaces = 4

        User.findById.mockImplementation((id) => ({
            lean: jest.fn().mockRejectedValue(RESULT)
        }));
        TextSpace.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(textSpaces)());


        const response = await request
            .agent(app)
            .get("/user/details/userId")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");


        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "An error occured"
        })
    });
});

describe("Testing user delete route", () => { 

    it("Successfully delete a user", async () => {
        jest.mock("../../src/utils/auth");

        auth.invalidateToken = jest.fn();

        bcrypt.compare.mockImplementation((hashedPassword, password) => jest.fn().mockResolvedValue(true)());

        User.findById.mockImplementation((id) => jest.fn().mockResolvedValue({
            _id: "abc123",
            password: "hashedPassword",
            deleteOne: jest.fn().mockResolvedValue(null)
        })());
        User.updateMany.mockImplementation((filters, values) => jest.fn().mockResolvedValue(null)());
        TextSpace.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue([])
        }));
        TextSpace.deleteMany.mockImplementation((filters) => jest.fn().mockResolvedValue(null)());
        
        const response = await request
            .agent(app)
            .set("Cookie", ["userToken=the_users_token"])
            .delete("/user/delete/userid")
            .send({ password: "SuperMan@2" });
                    
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            failed: false,
            message: "User deleted"
        });
        expect(auth.invalidateToken).toHaveBeenCalledTimes(1);
    })

    it("throws error if user isn't found", async () => {
        jest.mock("../../src/utils/auth");
        auth.invalidateToken = jest.fn();

        bcrypt.compare.mockImplementation((hashedPassword, password) => jest.fn().mockResolvedValue(true)());

        User.findById.mockImplementation((id) => jest.fn().mockResolvedValue(null)());
        User.updateMany.mockImplementation((filters, values) => jest.fn().mockResolvedValue(null)());
        TextSpace.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue([])
        }));
        TextSpace.deleteMany.mockImplementation((filters) => jest.fn().mockResolvedValue(null)());
        
        const response = await request
            .agent(app)
            .set("Cookie", ["userToken=the_users_token"])
            .delete("/user/delete/userid")
            .send({ password: "SuperMan@2" });
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "No users found"
        });
        expect(auth.invalidateToken).not.toHaveBeenCalled();
    })

    it("throws error if password doesn't match", async () => {
        jest.mock("../../src/utils/auth");
        
        auth.invalidateToken = jest.fn();

        bcrypt.compare.mockImplementation((hashedPassword, password) => jest.fn().mockResolvedValue(false)());

        User.findById.mockImplementation((id) => jest.fn().mockResolvedValue({
            _id: "user123",
            password: "hashed_password",
            deleteOne: jest.fn().mockResolvedValue(null)
        })());
        User.updateMany.mockImplementation((filters, values) => jest.fn().mockResolvedValue(null)());
        TextSpace.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue([])
        }));
        TextSpace.deleteMany.mockImplementation((filters) => jest.fn().mockResolvedValue(null)());
        
        const response = await request
            .agent(app)
            .set("Cookie", ["userToken=the_users_token"])
            .delete("/user/delete/userid")
            .send({ password: "SuperMan@2" });
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "Incorrect password"
        });
        expect(auth.invalidateToken).not.toHaveBeenCalled();
    })
});