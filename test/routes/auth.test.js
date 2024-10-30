const request = require("supertest");
const jwt = require("jsonwebtoken");

const { app } = require("../../src/server");

jest.mock("jsonwebtoken");


describe("Tests cookie authentication route", () => {

    it("Should return status code 204 when authentication is successful", async () => {
        jwt.verify.mockImplementation((token, secret_key, callBack) => callBack(null, { id: "user_id", isAdmin: false }));

        const response = await request
            .agent(app)
            .get("/auth/check")
            .set('Cookie', [
                "userToken=abc123"
            ])
            .send({})
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            userId: "user_id"
        })
    })
})