const bcrypt = require("bcrypt");

const { getURLLinksInText, CreateTextSpace, EditTextSpace, MAX_CONTENT_CHAR_LENGTH, MAX_TITLE_CHAR_LENGTH, MAX_DESC_CHAR_LENGTH, MAX_LINKS_LENGTH } = require("../src/utils/spaces");
const { default: User } = require("../src/models/User");
const { default: TextSpace } = require("../src/models/TextSpace");


jest.mock("../src/models/User");
jest.mock("../src/models/TextSpace");
jest.mock("bcrypt");

bcrypt.genSalt.mockImplementation(() => jest.fn().mockResolvedValue(Math.ceil(Math.random() * 1000))());
bcrypt.hash.mockImplementation((password, salt) => jest.fn().mockResolvedValue(password + salt)());

describe("Test for 'getURLLinksInText' function", () => {
    it("Should return array contaning URL links", () => {
        const text = "http://www.google.com https://google.com ezema.netlify.app google.com/search?q=value http://website.nany?value=novocane&another=100 not_a_website https://card-store.netlify.app link.com/search?q=value%20%anothervalue+twenty&something-else=titan emmanuelezema6@gmail.com";
        const linksToReturn = [
            "http://www.google.com",
            "https://google.com",
            "ezema.netlify.app",
            "google.com/search?q=value",
            "http://website.nany?value=novocane&another=100",
            "https://card-store.netlify.app",
            "link.com/search?q=value%20%anothervalue+twenty&something-else=titan",
            "emmanuelezema6@gmail.com"
        ];

        const linksReturned = getURLLinksInText(text);
        expect(linksReturned).toEqual(linksToReturn);
    })
});

describe("Tests 'CreateTextSpace' class", () => {
    const MOCK_DETAILS = {
        title: "A title",
        desc: "A description",
        content: "Text space content",
        secured: true,
        password: "abc123",
        owner: "user123"
    };

    it("Creates and saves a text space with ideal values", async () => {
        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(1)());
        TextSpace.create.mockImplementation((values) => jest.fn().mockResolvedValue(values)());

        const textSpace = new CreateTextSpace(MOCK_DETAILS);
        const validation = await textSpace.validate();
        const savedTextSpace = await textSpace.save();

        expect(validation).toEqual({
            passed: true,
            errors: {}
        });

        expect(savedTextSpace).toEqual({
            failed: false,
            message: "Text space saved"
        });

        expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
        expect(bcrypt.hash).toHaveBeenCalledTimes(1);
    });

    it("Tests if 'getURLLinksInText' functions runs properly before text space is saved", async () => {
        let numberOfLinksFound;
        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(1)());
        TextSpace.create.mockImplementation((values) => {
            numberOfLinksFound = values.links.length;
            return jest.fn().mockResolvedValue(values)();
        });

        const content = "This will test if these links will be recognized: https://this.is.a/link google.com anotherlink@email.com";
        const textSpace = new CreateTextSpace({ ...MOCK_DETAILS, content });
        const validation = await textSpace.validate();
        const savedTextSpace = await textSpace.save();

        expect(validation).toEqual({
            passed: true,
            errors: {}
        });
        expect(savedTextSpace).toEqual({
            failed: false,
            message: "Text space saved"
        });
        expect(numberOfLinksFound).toBe(3)
    });

    it("Creates and saves a text space without security", async () => {
        let passwordWasChanged = false;

        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(1)());
        TextSpace.create.mockImplementation((values) => {
            passwordWasChanged = !values.password;
            return jest.fn().mockResolvedValue(values)();
        });

        const textSpace = new CreateTextSpace({ ...MOCK_DETAILS, secured: false });
        const validation = await textSpace.validate();
        const savedTextSpace = await textSpace.save();

        expect(validation).toEqual({
            passed: true,
            errors: {}
        });
        expect(savedTextSpace).toEqual({
            failed: false,
            message: "Text space saved"
        })
        expect(passwordWasChanged).toBe(true);
    });

    it("Validates values in text space class (When some values are ommitted)", async () => {
        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(1)());
        TextSpace.create.mockImplementation((values) => jest.fn().mockResolvedValue(values)());

        const textSpace = new CreateTextSpace({ secured: true });
        const validation = await textSpace.validate();
        const savedTextSpace = await textSpace.save();

        expect(validation).toEqual({
            passed: false,
            errors: {
                content: "Text space must have content",
                password: "Secured Text spaces must have a password",
            }
        });
        expect(savedTextSpace).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                content: "Text space must have content",
                password: "Secured Text spaces must have a password",
            }
        })
    })

    it("Validates values in text space class (When some values exceed character limit)", async () => {
        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(1)());
        TextSpace.create.mockImplementation((values) => jest.fn().mockResolvedValue(values)());

        const TOO_MUCH_TEXT = "I want this text to be too much: https://google.com ezema.netlif.app a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link"
        
        const textSpace = new CreateTextSpace({ ...MOCK_DETAILS, title: TOO_MUCH_TEXT, desc: TOO_MUCH_TEXT, content: TOO_MUCH_TEXT });
        const validation = await textSpace.validate();
        const savedTextSpace = await textSpace.save();

        expect(validation).toEqual({
            passed: false,
            errors: {
                title: "Title should not exceed 50 characters",
                desc: "Space description should not exceed 300 characters",
                links: "URLs cannot exceed 10 links",
                content: "Content should not exceed 1024 characters",
            }
        });
        expect(savedTextSpace).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                title: "Title should not exceed 50 characters",
                desc: "Space description should not exceed 300 characters",
                links: "URLs cannot exceed 10 links",
                content: "Content should not exceed 1024 characters",
            }
        })
    })

    it("Validates text space class (When user doesn't exitst)", async () => {
        User.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(0)());
        TextSpace.create.mockImplementation((values) => jest.fn().mockResolvedValue(values)());

        
        const textSpace = new CreateTextSpace(MOCK_DETAILS);
        const validation = await textSpace.validate();
        const savedTextSpace = await textSpace.save();

        expect(validation).toEqual({
            passed: false,
            errors: {
                owner: "No user found"
            }
        });
        expect(savedTextSpace).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                owner: "No user found"
            }
        })
    })
})

describe("Tests 'EditTextSpace' class", () => {
    const MOCK_DETAILS = {
        title: "A title",
        desc: "A description",
        content: "Text space content",
        secured: true,
        password: "abc123",
        owner: "user123"
    };

    it("Edits and saves a text space with ideal values", async () => {
        TextSpace.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(1)());
        TextSpace.findByIdAndUpdate.mockImplementation((id, values) => jest.fn().mockResolvedValue(values)());

        const textSpace = new EditTextSpace(MOCK_DETAILS);
        const validation = await textSpace.validate();
        const savedTextSpace = await textSpace.save();

        expect(validation).toEqual({
            passed: true,
            errors: {}
        });

        expect(savedTextSpace).toEqual({
            failed: false,
            message: "Text space updated"
        });
    });

    it("Edits and saves a text space without security", async () => {
        let passwordWasChanged = false;

        TextSpace.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(1)());
        TextSpace.findByIdAndUpdate.mockImplementation((id, { $set: values }) => {
            passwordWasChanged = !values.password;
            return jest.fn().mockResolvedValue(values)();
        });


        const textSpace = new EditTextSpace({ ...MOCK_DETAILS, secured: false });
        const validation = await textSpace.validate();
        const savedTextSpace = await textSpace.save();

        expect(validation).toEqual({
            passed: true,
            errors: {}
        });
        expect(savedTextSpace).toEqual({
            failed: false,
            message: "Text space updated"
        });
        console.log()
        expect(passwordWasChanged).toBe(true);
    });

    it("Validates values (When some values are ommitted)", async () => {
        TextSpace.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(1)());
        TextSpace.findByIdAndUpdate.mockImplementation((id, values) => jest.fn().mockResolvedValue(values)());

        const textSpace = new EditTextSpace({ content: "", secured: true });
        const validation = await textSpace.validate();
        const savedTextSpace = await textSpace.save();

        expect(validation).toEqual({
            passed: false,
            errors: {
                content: "Text space must have content",
                password: "Secured Text spaces must have a password",
            }
        });
        expect(savedTextSpace).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                content: "Text space must have content",
                password: "Secured Text spaces must have a password",
            }
        })
    })

    it("Validates values (When some values exceed character limit)", async () => {
        TextSpace.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(1)());
        TextSpace.findByIdAndUpdate.mockImplementation((id, values) => jest.fn().mockResolvedValue(values)());

        const TOO_MUCH_TEXT = "I want this text to be too much: https://google.com ezema.netlif.app a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link a.repeating.link"
        
        const textSpace = new EditTextSpace({ ...MOCK_DETAILS, title: TOO_MUCH_TEXT, desc: TOO_MUCH_TEXT, content: TOO_MUCH_TEXT });
        const validation = await textSpace.validate();
        const savedTextSpace = await textSpace.save();

        expect(validation).toEqual({
            passed: false,
            errors: {
                title: `Title should not exceed ${MAX_TITLE_CHAR_LENGTH} characters`,
                desc: `Space description should not exceed ${MAX_DESC_CHAR_LENGTH} characters`,
                links: `URLs cannot exceed ${MAX_LINKS_LENGTH} links`,
                content: `Content should not exceed ${MAX_CONTENT_CHAR_LENGTH} characters`,
            }
        });
        expect(savedTextSpace).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                title: `Title should not exceed ${MAX_TITLE_CHAR_LENGTH} characters`,
                desc: `Space description should not exceed ${MAX_DESC_CHAR_LENGTH} characters`,
                links: `URLs cannot exceed ${MAX_LINKS_LENGTH} links`,
                content: `Content should not exceed ${MAX_CONTENT_CHAR_LENGTH} characters`,
            }
        })
    })

    it("Validates values (When user doesn't exist)", async () => {
        
        TextSpace.countDocuments.mockImplementation(() => jest.fn().mockResolvedValue(0)());
        TextSpace.findByIdAndUpdate.mockImplementation((id, values) => jest.fn().mockResolvedValue(values)());
        
        const textSpace = new EditTextSpace(MOCK_DETAILS);
        const validation = await textSpace.validate();
        const savedTextSpace = await textSpace.save();

        expect(validation).toEqual({
            passed: false,
            errors: {
                textSpace: "Text space does not exist"
            }
        });
        expect(savedTextSpace).toEqual({
            failed: true,
            message: "Validation error",
            errors: {
                textSpace: "Text space does not exist"
            }
        })
    })
})