const request = require("supertest");
const bcrypt = require("bcrypt");

const { app } = require("../../src/server");

const { default: User } = require("../../src/models/User");
const { default: TextSpace } = require("../../src/models/TextSpace");

const textSpaceUtils = require("../../src/utils/spaces");
const userUtils = require("../../src/utils/user");


jest.mock("../../src/models/User");
jest.mock("../../src/models/TextSpace");
jest.mock("bcrypt");

const MOCK_TEXT_SPACES = [
    {
        _id: "text-space-123",
        title: "Text Space Title",
        desc: "Text space description",
        content: "This a text space content, it contains some links too https://google.com",
        likes: 0,
        views: 0,
        secured: false,
        links: [
            "https://google.com"
        ],
        owner: "user1"
    },
    {
        _id: "text-space-123",
        title: "Text Space Title",
        desc: "Text space description",
        content: "This a text space content, it contains some links too https://google.com",
        likes: 0,
        views: 0,
        secured: false,
        links: [
            "https://google.com"
        ],
        owner: "user2"
    },
    {
        _id: "text-space-123",
        title: "Text Space Title",
        desc: "Text space description",
        content: "This a text space content, it contains some links too https://google.com",
        likes: 0,
        views: 0,
        secured: false,
        links: [
            "https://google.com"
        ],
        owner: null
    }
];

const MOCK_USERS = [
    {
        _id: "user1",
        username: "username1",
        favorites: ["favorite1", "favorite2", "favorite3"],
        profileImage: "url_to_user_image_1"
    },
    {
        _id: "user2",
        username: "username2",
        favorites: ["favorite1", "favorite2", "favorite3"],
        profileImage: "url_to_user_image_2"
    },
];

describe("Tests get Text Spaces route for a user", () => {

    it("Should successfully return text spaces owned by a user", async () => {
        TextSpace.find.mockImplementation((filters) => ({
            sort: () => ({
                limit: () => ({
                    skip: () => ({
                        lean: jest.fn().mockResolvedValue(MOCK_TEXT_SPACES)
                    })
                })
            })
        }));
        TextSpace.countDocuments.mockImplementation((userId) => jest.fn().mockResolvedValue(1));
        User.findById.mockImplementation((userId) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS[0])
        }));
        User.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS)
        }));

        const RESULT = [
            { ...MOCK_TEXT_SPACES[0], owner: MOCK_USERS[0] },
            { ...MOCK_TEXT_SPACES[1], owner: MOCK_USERS[1] },
            { ...MOCK_TEXT_SPACES[2], owner: { username: "Annonymous", profileImage: null } }
        ];


        const response = await request
            .agent(app)
            .get("/spaces/user/0")
            .set("Cookie", ["userToken=the_user_token"])
            .set("Accept", "application/json")
            .set("Content-Type", "application/json")

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            failed: false,
            filter: undefined,
            page: 0,
            limit: 12,
            textSpaces: RESULT
        })
    });

    it("Checks if the page and limit options work", async () => {
        TextSpace.find.mockImplementation((filters) => ({
            sort: () => ({
                limit: () => ({
                    skip: () => ({
                        lean: jest.fn().mockResolvedValue(MOCK_TEXT_SPACES)
                    })
                })
            })
        }));        
        TextSpace.countDocuments.mockImplementation((userId) => jest.fn().mockResolvedValue(1));

        User.findById.mockImplementation((userId) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS[0])
        }));
        User.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS)
        }));

        const RESULT = [
            { ...MOCK_TEXT_SPACES[0], owner: MOCK_USERS[0] },
            { ...MOCK_TEXT_SPACES[1], owner: MOCK_USERS[1] },
            { ...MOCK_TEXT_SPACES[2], owner: { username: "Annonymous", profileImage: null } }
        ];


        const response = await request
            .agent(app)
            .get("/spaces/user/1?limit=20")
            .set("Cookie", ["userToken=the_user_token"])
            .set("Accept", "application/json")
            .set("Content-Type", "application/json")

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            failed: false,
            page: 1,
            filter: undefined,
            limit: 20,
            totalPages: 1,
            textSpaces: RESULT
        })
    })

    it("Checks if the filter option work", async () => {

        TextSpace.find.mockImplementation((filters) => ({
            sort: () => ({
                limit: () => ({
                    skip: () => ({
                        lean: jest.fn().mockResolvedValue(MOCK_TEXT_SPACES)
                    })
                })
            })
        }));
        TextSpace.countDocuments.mockImplementation((userId) => jest.fn().mockResolvedValue(1));
        User.findById.mockImplementation((userId) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS[0])
        }));
        User.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS)
        }));

        const RESULT = [
            { ...MOCK_TEXT_SPACES[0], owner: MOCK_USERS[0] },
            { ...MOCK_TEXT_SPACES[1], owner: MOCK_USERS[1] },
            { ...MOCK_TEXT_SPACES[2], owner: { username: "Annonymous", profileImage: null } }
        ];


        const response = await request
            .agent(app)
            .get("/spaces/user/1?limit=20&filter=owned")
            .set("Cookie", ["userToken=the_user_token"])
            .set("Accept", "application/json")
            .set("Content-Type", "application/json")

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            failed: false,
            page: 1,
            limit: 20,
            filter: "owned",
            totalPages: 1,
            textSpaces: RESULT
        });
    })
});

describe("Tests explore Text Spaces route for a user", () => {

    it("Should successfully return text spaces owned by a user", async () => {
        TextSpace.find.mockImplementation((filters) => ({
            sort: () => ({
                limit: () => ({
                    skip: () => ({
                        lean: jest.fn().mockResolvedValue(MOCK_TEXT_SPACES)
                    })
                })
            })
        }));
        TextSpace.countDocuments.mockImplementation((query) => jest.fn().mockResolvedValue(1));
        User.findById.mockImplementation((userId) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS[0])
        }));
        User.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS)
        }));

        const RESULT = [
            { ...MOCK_TEXT_SPACES[0], owner: MOCK_USERS[0] },
            { ...MOCK_TEXT_SPACES[1], owner: MOCK_USERS[1] },
            { ...MOCK_TEXT_SPACES[2], owner: { username: "Annonymous", profileImage: null } }
        ];


        const response = await request
            .agent(app)
            .get("/spaces/explore/0")
            .set("Cookie", ["userToken=the_user_token"])
            .set("Accept", "application/json")
            .set("Content-Type", "application/json")

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            failed: false,
            sortedBy: undefined,
            page: 0,
            limit: 12,
            totalPages: 1,
            textSpaces: RESULT
        })
    });

    it("Checks if the page and limit options work", async () => {
        TextSpace.find.mockImplementation((filters) => ({
            sort: () => ({
                limit: () => ({
                    skip: () => ({
                        lean: jest.fn().mockResolvedValue(MOCK_TEXT_SPACES)
                    })
                })
            })
        }));
        TextSpace.countDocuments.mockImplementation((query) => jest.fn().mockResolvedValue(1));
        User.findById.mockImplementation((userId) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS[0])
        }));
        User.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS)
        }));

        const RESULT = [
            { ...MOCK_TEXT_SPACES[0], owner: MOCK_USERS[0] },
            { ...MOCK_TEXT_SPACES[1], owner: MOCK_USERS[1] },
            { ...MOCK_TEXT_SPACES[2], owner: { username: "Annonymous", profileImage: null } }
        ];


        const response = await request
            .agent(app)
            .get("/spaces/explore/1?limit=20")
            .set("Cookie", ["userToken=the_user_token"])
            .set("Accept", "application/json")
            .set("Content-Type", "application/json");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            failed: false,
            page: 1,
            sortedBy: undefined,
            limit: 20,
            totalPages: 1,
            textSpaces: RESULT
        })
    })

    it("Checks if the filter option work", async () => {

        TextSpace.find.mockImplementation((filters) => ({
            sort: () => ({
                limit: () => ({
                    skip: () => ({
                        lean: jest.fn().mockResolvedValue(MOCK_TEXT_SPACES)
                    })
                })
            })
        }));
        TextSpace.countDocuments.mockImplementation((query) => jest.fn().mockResolvedValue(1));

        User.findById.mockImplementation((userId) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS[0])
        }));
        User.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS)
        }));

        const RESULT = [
            { ...MOCK_TEXT_SPACES[0], owner: MOCK_USERS[0] },
            { ...MOCK_TEXT_SPACES[1], owner: MOCK_USERS[1] },
            { ...MOCK_TEXT_SPACES[2], owner: { username: "Annonymous", profileImage: null } }
        ];


        const response = await request
            .agent(app)
            .get("/spaces/explore/1?limit=20&sortBy=popularity")
            .set("Cookie", ["userToken=the_user_token"])
            .set("Accept", "application/json")
            .set("Content-Type", "application/json")

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            failed: false,
            page: 1,
            limit: 20,
            sortedBy: "popularity",
            totalPages: 1,
            textSpaces: RESULT
        });
    })
});

describe("Tests get single Text Space route for unsecured Text Space", () => {
    
    it("Successfully returns Text space that was found", async () => {

        TextSpace.findOne.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_TEXT_SPACES[0])
        }));
        User.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS)
        }));

        const RESULT = { ...MOCK_TEXT_SPACES[0], owner: MOCK_USERS[0] };

        const response = await request
            .agent(app)
            .get("/space/space_id")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            failed: false,
            textSpace: RESULT
        });
    });
    
    it("Throws error if Text Space is not found", async () => {

        TextSpace.findOne.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(null)
        }));
        User.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS)
        }));

        const response = await request
            .agent(app)
            .get("/space/space_id")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "No text space found"
        });
    });
    
    it("Throws error if error occurs", async () => {

        TextSpace.findOne.mockImplementation((filters) => ({
            lean: jest.fn().mockRejectedValue(new Error("An error occured"))
        }));
        User.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS)
        }));

        const response = await request
            .agent(app)
            .get("/space/space_id")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "An error occured"
        });
    });
});

describe("Tests get single Text Space route for secured Text Space", () => {
    
    it("Successfully returns Text space that was found", async () => {
        jest.mock("../../src/utils/user");

        userUtils.comparePasswords = jest.fn((password, hashedPassword) => jest.fn().mockResolvedValue(true)());

        TextSpace.findOne.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_TEXT_SPACES[0])
        }));
        User.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS)
        }));

        const RESULT = { ...MOCK_TEXT_SPACES[0], owner: MOCK_USERS[0] };

        const response = await request
            .agent(app)
            .get("/space/space_id?p=text_space_password")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            failed: false,
            textSpace: RESULT
        });
    });
    
    it("Throws error if password is not given", async () => {
        jest.mock("../../src/utils/user");

        userUtils.comparePasswords = jest.fn((hashedPassword, password) => jest.fn().mockResolvedValue(false)());

        TextSpace.findOne.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_TEXT_SPACES[0])
        }));
        User.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS)
        }));

        const response = await request
            .agent(app)
            .get("/space/space_id")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "Password required"
        });
    });
    
    it("Throws error if password is incorrect", async () => {
        jest.mock("../../src/utils/user");

        userUtils.comparePasswords = jest.fn((hashedPassword, password) => jest.fn().mockResolvedValue(false)());

        TextSpace.findOne.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_TEXT_SPACES[0])
        }));
        User.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS)
        }));

        const response = await request
            .agent(app)
            .get("/space/space_id?p=text_space_password")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "Incorrect password"
        });
    });
    
    it("Throws error if Text Space is not found", async () => {
        jest.mock("../../src/utils/user");

        userUtils.comparePasswords = jest.fn((hashedPassword, password) => jest.fn().mockResolvedValue(true)());

        TextSpace.findOne.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(null)
        }));
        User.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS)
        }));

        const response = await request
            .agent(app)
            .get("/space/space_id?p=text_space_password")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "No text space found"
        });
    });
    
    it("Throws error if error occurs", async () => {

        TextSpace.findOne.mockImplementation((filters) => ({
            lean: jest.fn().mockRejectedValue(new Error("An error occured"))
        }));
        User.find.mockImplementation((filters) => ({
            lean: jest.fn().mockResolvedValue(MOCK_USERS)
        }));

        const response = await request
            .agent(app)
            .get("/space/space_id?p=text_space_password")
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "An error occured"
        });
    });
});

describe("Tests create Text Space route", () => {

    it("Successfully creates a secured Text Space", async () => { 
        let savedTextSpaceValues = {};

        bcrypt.genSalt.mockImplementation(() => jest.fn().mockResolvedValue("salt")());
        bcrypt.hash.mockImplementation((password, salt) => jest.fn().mockResolvedValue("hashed_password")());

        TextSpace.create.mockImplementation((values) => {
            savedTextSpaceValues = values;
            return jest.fn().mockResolvedValue(values)();
        });
        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(1)());

        const REQUEST_BODY = {
            title: "Text Space Title",
            desc: "This is a description",
            content: "This is a content https://link.com",
            secured: true,
            password: "This is a password",
            owner: "user_id"
        };

        const response = await request
            .agent(app)
            .post("/spaces/create")
            .set("Cookie", ["userToken=the_user_token"])
            .set("Accept", "application/json")
            .set("Content-Type", "application/json")
            .send(REQUEST_BODY);
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            failed: false,
            message: "Text space saved"
        });
        expect(savedTextSpaceValues).toEqual({
            ...REQUEST_BODY,
            links: [
                "https://link.com"
            ],
            password: "hashed_password"
        })
    });

    it("Successfully creates a secured Text Space", async () => { 
        let savedTextSpaceValues = {};

        bcrypt.genSalt.mockImplementation(() => jest.fn().mockResolvedValue("salt")());
        bcrypt.hash.mockImplementation((password, salt) => jest.fn().mockResolvedValue("hashed_password")());

        TextSpace.create.mockImplementation((values) => {
            savedTextSpaceValues = values;
            return jest.fn().mockResolvedValue(values)();
        });
        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(1)());

        const REQUEST_BODY = {
            title: "Text Space Title",
            desc: "This is a description",
            content: "This is a content https://link.com",
            secured: false,
            password: "This is a password",
            owner: "user_id"
        };

        const response = await request
            .agent(app)
            .post("/spaces/create")
            .set("Cookie", ["userToken=the_user_token"])
            .set("Accept", "application/json")
            .set("Content-Type", "application/json")
            .send(REQUEST_BODY);
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            failed: false,
            message: "Text space saved"
        });
        expect(savedTextSpaceValues).toEqual({
            ...REQUEST_BODY,
            links: [
                "https://link.com"
            ],
            password: null
        })
    });

    it("Throws error if value could not be validated", async () => { 
        let savedTextSpaceValues = {};

        bcrypt.genSalt.mockImplementation(() => jest.fn().mockResolvedValue("salt")());
        bcrypt.hash.mockImplementation((password, salt) => jest.fn().mockResolvedValue("hashed_password")());

        TextSpace.create.mockImplementation((values) => {
            savedTextSpaceValues = values;
            return jest.fn().mockResolvedValue(values)();
        });
        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(1)());

        const REQUEST_BODY = {
            title: "Text Space Title",
            desc: "This is a description",
            content: "This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com This is a content https://link.com",
            secured: true,
            password: "",
            owner: "user_id"
        };

        const response = await request
            .agent(app)
            .post("/spaces/create")
            .set("Cookie", ["userToken=the_user_token"])
            .set("Accept", "application/json")
            .set("Content-Type", "application/json")
            .send(REQUEST_BODY);
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                content: "Content should not exceed 1024 characters",
                links: "URLs cannot exceed 10 links",
                password: "Secured Text spaces must have a password",
            }
        });
    });

    it("Throws error if changes could not be saved", async () => { 
        let savedTextSpaceValues = {};

        bcrypt.genSalt.mockImplementation(() => jest.fn().mockResolvedValue("salt")());
        bcrypt.hash.mockImplementation((password, salt) => jest.fn().mockResolvedValue("hashed_password")());

        TextSpace.create.mockImplementation((values) => {
            savedTextSpaceValues = values;
            return jest.fn().mockRejectedValue(new Error("An error occured"))();
        });
        User.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(1)());

        const REQUEST_BODY = {
            title: "Text Space Title",
            desc: "This is a description",
            content: "This is a content https://link.com",
            secured: true,
            password: "This is a password",
            owner: "user_id"
        };

        const response = await request
            .agent(app)
            .post("/spaces/create")
            .set("Cookie", ["userToken=the_user_token"])
            .set("Accept", "application/json")
            .set("Content-Type", "application/json")
            .send(REQUEST_BODY);
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "Could not save new details"
        });
    });
});

describe("Tests edit Text Space route", () => { 

    it("Successfully edits Text Space details", async () => {
        let previousValues = MOCK_TEXT_SPACES[0];

        const REQUEST_BODY = {
            title: "New Title",
            desc: "New description",
            content: "This is a new content link: http://google.com",
            secured: true,
            password: "new_password"
        };

        bcrypt.genSalt.mockImplementation(() => jest.fn().mockResolvedValue("Salt")());
        bcrypt.hash.mockImplementation((salt, password) => jest.fn().mockResolvedValue("hashed_password")());

        TextSpace.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(1)());
        TextSpace.findByIdAndUpdate.mockImplementation((id, values) => {
            previousValues = {
                ...previousValues,
                ...values.$set
            };

            return jest.fn().mockResolvedValue(null)();
        });

        const response = await request
            .agent(app)
            .put("/spaces/edit/text_space_id")
            .set("Cookie", ["userToken=auth_token"])
            .set("Accept", "application/json")
            .set("Content-Type", "application/json")
            .send(REQUEST_BODY);
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            failed: false,
            message: "Text space updated"
        })
        expect(previousValues).toEqual({
            ...MOCK_TEXT_SPACES[0],
            ...REQUEST_BODY,
            links: ["http://google.com"],
            password: "hashed_password"
        })
    });

    it("Throws error if values could not be validated", async () => {

        const REQUEST_BODY = {
            title: "New TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew TitleNew Title",
            desc: "New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description New description ",
            content: "This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com This is a new content link: http://google.com ",
            secured: true,
            password: ""
        };

        bcrypt.genSalt.mockImplementation(() => jest.fn().mockResolvedValue("Salt")());
        bcrypt.hash.mockImplementation((salt, password) => jest.fn().mockResolvedValue("hashed_password")());

        TextSpace.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(1)());
        TextSpace.findByIdAndUpdate.mockImplementation((id, values) => jest.fn().mockResolvedValue(null)());

        const response = await request
            .agent(app)
            .put("/spaces/edit/text_space_id")
            .set("Cookie", ["userToken=auth_token"])
            .set("Accept", "application/json")
            .set("Content-Type", "application/json")
            .send(REQUEST_BODY);
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                title: `Title should not exceed ${textSpaceUtils.MAX_TITLE_CHAR_LENGTH} characters`,
                desc: `Space description should not exceed ${textSpaceUtils.MAX_DESC_CHAR_LENGTH} characters`,
                content: `Content should not exceed ${textSpaceUtils.MAX_CONTENT_CHAR_LENGTH} characters`,
                links: `URLs cannot exceed ${textSpaceUtils.MAX_LINKS_LENGTH} links`,
                password: "Secured Text spaces must have a password"
            }
        })
    });

    it("Throws error if Text space could not be found", async () => {
        
        const REQUEST_BODY = {
            title: "New Title",
            desc: "New description",
            content: "This is a new content link: http://google.com",
            secured: true,
            password: "new_password"
        };

        bcrypt.genSalt.mockImplementation(() => jest.fn().mockResolvedValue("Salt")());
        bcrypt.hash.mockImplementation((salt, password) => jest.fn().mockResolvedValue("hashed_password")());

        TextSpace.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(0)());
        TextSpace.findByIdAndUpdate.mockImplementation((id, values) => jest.fn().mockResolvedValue(null)());

        const response = await request
            .agent(app)
            .put("/spaces/edit/text_space_id")
            .set("Cookie", ["userToken=auth_token"])
            .set("Accept", "application/json")
            .set("Content-Type", "application/json")
            .send(REQUEST_BODY);
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                textSpace: "Text space does not exist"
            }
        })
    });

    it("Throws error if Text space update throws error", async () => {
        
        const REQUEST_BODY = {
            title: "New Title",
            desc: "New description",
            content: "This is a new content link: http://google.com",
            secured: true,
            password: "new_password"
        };

        bcrypt.genSalt.mockImplementation(() => jest.fn().mockResolvedValue("Salt")());
        bcrypt.hash.mockImplementation((salt, password) => jest.fn().mockResolvedValue("hashed_password")());

        TextSpace.countDocuments.mockImplementation((filters) => jest.fn().mockResolvedValue(1)());
        TextSpace.findByIdAndUpdate.mockImplementation((id, values) => jest.fn().mockRejectedValue(new Error("An error occured"))());

        const response = await request
            .agent(app)
            .put("/spaces/edit/text_space_id")
            .set("Cookie", ["userToken=auth_token"])
            .set("Accept", "application/json")
            .set("Content-Type", "application/json")
            .send(REQUEST_BODY);
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "An error occured"
        })
    });
});

describe("Tests delete Text Space route", () => { 

    it("Successfully deletes a text space", async () => {

        TextSpace.findByIdAndDelete.mockImplementation((id) => jest.fn().mockResolvedValue(MOCK_TEXT_SPACES[0])());
        User.updateMany.mockImplementation((filter, update) => jest.fn().mockResolvedValue(null)());

        const response = await request
            .agent(app)
            .delete("/spaces/delete/text_space_id")
            .set("Cookie", ["userToken=auth_token"]);
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            failed: false,
            message: "Text space deleted"
        });
        expect(TextSpace.findByIdAndDelete).toHaveBeenCalledTimes(1);
        expect(User.updateMany).toHaveBeenCalledTimes(1);
    });

    it("Throws error if Text space could not be deleted", async () => {

        TextSpace.findByIdAndDelete.mockImplementation((id) => jest.fn().mockResolvedValue(null)());
        User.updateMany.mockImplementation((filter, update) => jest.fn().mockResolvedValue(null)());

        const response = await request
            .agent(app)
            .delete("/spaces/delete/text_space_id")
            .set("Cookie", ["userToken=auth_token"]);
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "Could not delete text space"
        });
    });

    it("Throws error if error occurs", async () => {

        TextSpace.findByIdAndDelete.mockImplementation((id) => jest.fn().mockRejectedValue(new Error("An error occured"))());
        User.updateMany.mockImplementation((filter, update) => jest.fn().mockResolvedValue(null)());

        const response = await request
            .agent(app)
            .delete("/spaces/delete/text_space_id")
            .set("Cookie", ["userToken=auth_token"]);
        
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            failed: true,
            message: "An error occured"
        });;
    });
});