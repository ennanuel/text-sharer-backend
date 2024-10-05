const request = require("supertest");
const jwt = require("jsonwebtoken");

const { app } = require("../../src/server");

jest.mock("jsonwebtoken");


describe("Tests cookie authentication route", () => {

    it("Should return status code 204 when authentication is successful", async () => {
        jwt.verify.mockImplementation((token, secret_key, callBack) => callBack(null, { id: "user_id", isAdmin: false }));

        request
            .agent(app)
            .post("/auth/check")
            .set('Cookie', [
                "userToken=abc123"
            ])
            .send({})
            .expect(204);
    })
})