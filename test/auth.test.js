const { authenticate } = require("../src/utils/auth.js");
const jwt = require("jsonwebtoken");

jest.mock("jsonwebtoken");


describe("Test 'authenticate' function", () => {

    it("runs next function if request is authentication", async () => {
        jwt.verify.mockImplementation((token, secretKey, callBack) => callBack(null, { id: 1234, isAdmin: false }));
        
        const process = {
            env: {
                JWT_SECRET_TOKEN: "secret_token"
            }
        };
        const req = {
            body: {},
            cookies: {
                userToken: "123abc"
            }
        };
        const res = {
            status: jest.fn((statusCode) => ({
                json: jest.fn((result) => ({
                    statusCode,
                    result
                }))
            }))
        };

        const nextFunction = jest.fn();

        await authenticate(req, res, nextFunction);
        expect(nextFunction).toHaveBeenCalledTimes(1);
        expect(req.auth).toEqual({
            id: 1234,
            isAdmin: false
        })
    })

    it("Returns error because request has no cookies", async () => {
        jwt.verify.mockImplementation((token, secretKey, callBack) => callBack(null, { id: 1234, isAdmin: false }));
        
        const process = {
            env: {
                JWT_SECRET_TOKEN: "secret_token"
            }
        };
        const req = {
            cookies: {},
            body: {}
        };
        const res = {
            status: jest.fn((statusCode) => ({
                json: jest.fn((result) => ({
                    statusCode,
                    result
                }))
            }))
        };

        const nextFunction = jest.fn();
        const auth = await authenticate(req, res, nextFunction);

        expect(nextFunction).toHaveBeenCalledTimes(0);
        expect(auth.statusCode).toBe(401);
        expect(auth.result).toEqual({
            message: "No user token"
        });
    })

    it("Returns error because jwt 'verify' function encounters an error", async () => {
        const error = { message: "Encountered an error" };
        jwt.verify.mockImplementation((token, secretKey, callBack) => callBack(error, null));
        
        const process = {
            env: {
                JWT_SECRET_TOKEN: "secret_token"
            }
        };
        const req = {
            body: {},
            cookies: {
                userToken: "123abc"
            }
        };
        const res = {
            status: jest.fn((statusCode) => ({
                json: jest.fn((result) => ({
                    statusCode,
                    result
                }))
            }))
        };

        const nextFunction = jest.fn();
        const auth = await authenticate(req, res, nextFunction);

        expect(nextFunction).toHaveBeenCalledTimes(0);
        expect(auth.statusCode).toBe(401);
        expect(auth.result).toEqual({
            message: "Encountered an error"
        })
    })
});