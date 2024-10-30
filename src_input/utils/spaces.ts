import bcrypt from "bcrypt";

import TextSpace from "../models/TextSpace";
import User from "../models/User";
import { FlattenMaps, SortOrder, Types } from "mongoose";
import { comparePasswords } from "./user";

export const MAX_CONTENT_CHAR_LENGTH = 1024, MAX_LINKS_LENGTH = 10, MAX_TITLE_CHAR_LENGTH = 50, MAX_DESC_CHAR_LENGTH = 300;

export function getURLLinksInText(text: string): string[] {
    const URLRegex = /(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@%_+.~#?&/=]*)/g;
    const links = text.match(URLRegex) || [];

    return links;
}

export class CreateTextSpace { 
    private title;
    private desc;
    private content;
    private secured;
    private password: string | null;
    private links;
    private owner;
    private validation: { passed: boolean; errors: { [key: string]: string; } } = {
        passed: false,
        errors: {}
    }

    constructor(values?: { title?: string; content?: string; desc?: string; secured?: boolean; password?: string; owner?: string }) {
        this.title = values?.title || "Untitled space";
        this.desc = values?.desc || "";
        this.content = values?.content || "";
        this.secured = values?.secured || false;
        this.password = values?.secured ? values.password || "" : null;
        this.owner = values?.owner || null;
        this.links = getURLLinksInText(values?.content || "");
    }

    private async hashPassword() {
        if (!this.password || !this.secured) return null;
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(String(this.password), salt);
        return hashedPassword
    }

    private validateValues() { 
        if (this.title.length > MAX_TITLE_CHAR_LENGTH) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                title: `Title should not exceed ${MAX_TITLE_CHAR_LENGTH} characters`
            }
        }
        if (this.desc.length > MAX_DESC_CHAR_LENGTH) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                desc: `Space description should not exceed ${MAX_DESC_CHAR_LENGTH} characters`
            }
        }
        if (this.links.length > MAX_LINKS_LENGTH) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                links: `URLs cannot exceed ${MAX_LINKS_LENGTH} links`
            }
        }
        if (!this.content) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                content: "Text space must have content"
            }
        }
        if (this.content.length > 1024) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                content: `Content should not exceed ${MAX_CONTENT_CHAR_LENGTH} characters`
            }
        }
    };

    private validateSecurity() { 
        if (this.secured && !this.password) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                password: "Secured Text spaces must have a password"
            }
        }
    };

    private async validateOwner() { 
        try {
            if (!this.owner) return;
            const userCount = await User.countDocuments({ _id: this.owner });
            if (userCount <= 0) throw new Error("No user found");
        } catch (error) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                owner: (error as Error).message
            }
        }
    };

    public async validate() {
        this.validation.passed = true;

        this.validateValues();
        this.validateSecurity();
        await this.validateOwner();
        return this.validation;
    }

    public async save() {
        if (this.validation.passed) {
            try {
                const hashedPassword = await this.hashPassword();
                await TextSpace.create({
                    title: this.title,
                    desc: this.desc,
                    content: this.content,
                    secured: this.secured,
                    password: hashedPassword,
                    links: this.links,
                    owner: this.owner
                });

                return {
                    failed: false,
                    message: "Text space saved"
                }
            } catch (error) {
                console.error(error);

                return {
                    failed: true,
                    message: "Could not save new details"
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
};

export class EditTextSpace {
    private textSpaceId;
    private title;
    private desc;
    private content;
    private secured;
    private password: string | null;
    private links;
    private validation: { passed: boolean; errors: { [key: string]: string; } } = {
        passed: false,
        errors: {}
    }

    constructor(values?: { title?: string; content?: string; desc?: string; secured?: boolean; password?: string; textSpaceId?: string }) {
        this.title = values?.title;
        this.desc = values?.desc;
        this.content = values?.content;
        this.secured = values?.secured || false;
        this.password = values?.secured ? values.password || "" : null;
        this.textSpaceId = values?.textSpaceId;
        this.links = getURLLinksInText(values?.content || "");
    }

    private async hashPassword() {
        if (!this.password || !this.secured) return null;
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(String(this.password), salt);
        return hashedPassword
    }

    private async validateTextSpace() {
        const textSpaceCount = await TextSpace.countDocuments({ _id: this.textSpaceId });
        if (textSpaceCount <= 0) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                textSpace: "Text space does not exist"
            }
        }
    }

    private validateValues() { 
        if (this.title && this.title.length > MAX_TITLE_CHAR_LENGTH) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                title: `Title should not exceed ${MAX_TITLE_CHAR_LENGTH} characters`
            }
        }
        if (this.desc && this.desc.length > MAX_DESC_CHAR_LENGTH) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                desc: `Space description should not exceed ${MAX_DESC_CHAR_LENGTH} characters`
            }
        }
        if (this.links.length > MAX_LINKS_LENGTH) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                links: `URLs cannot exceed ${MAX_LINKS_LENGTH} links`
            }
        }
        if (typeof this.content === "string" && !this.content) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                content: "Text space must have content"
            }
        }
        if (this.content && this.content.length > MAX_CONTENT_CHAR_LENGTH) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                content: `Content should not exceed ${MAX_CONTENT_CHAR_LENGTH} characters`
            }
        }
    };

    private validateSecurity() { 
        if (this.secured && !this.password) {
            this.validation.passed = false;
            this.validation.errors = {
                ...this.validation.errors,
                password: "Secured Text spaces must have a password"
            }
        }
    };

    public async validate() {
        this.validation.passed = true;

        await this.validateTextSpace();
        this.validateValues();
        this.validateSecurity();

        return this.validation;
    }

    public async save() {
        if (this.validation.passed) {
            try {
                const newValues: { [key: string]: string | boolean | null | string[]; } = {};
                
                newValues.secured = Boolean(this.secured);
                newValues.password = await this.hashPassword();

                if (this.title) {
                    newValues.title = this.title;
                }
                if (this.desc) {
                    newValues.desc = this.desc;
                }
                if (this.content) {
                    newValues.content = this.content;
                    newValues.links = this.links;
                }

                await TextSpace.findByIdAndUpdate(this.textSpaceId, { $set: newValues });

                return {
                    failed: false,
                    message: "Text space updated"
                }
            } catch (error) {
                console.error(error);
                return {
                    failed: true,
                    message: (error as Error).message
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
};

function getSortObject(sortBy?: "popularity" | "timeCreated"): { [key: string]: SortOrder; } {
    if (sortBy === "timeCreated") return { createdAt: "desc" };
    else return { likes: "desc", views: "desc" };
};

function getFetchOptions(options: { page?: any, limit?: any; filter?: any; sortBy?: any; }) {
    ;
    const page = !/\D/.test(String(options.page)) ? Number(options.page) : 0;
    const limit = !/\D/.test(String(options.limit)) ? Number(options.limit): 12;
    const offset = limit * page;

    const result: {
        page: number;
        limit: number;
        offset: number;
        filter?: "favorites" | "owned";
        sort?: { [key: string]: SortOrder }
    } = {
        page,
        limit,
        offset
    };

    if (options.filter) result.filter = options.filter !== "favorites" ? "owned" : options.filter;
    if (options.sortBy) result.sort = getSortObject(options.sortBy);

    return result;
};

export function getOwnedSpaces(userId: string, options: { offset: number; limit: number; }) { 

    return TextSpace
        .find({ owner: userId })
        .sort({ name: "asc" })
        .limit(options.limit)
        .skip(options.offset)
        .lean();
};

export async function getFavoriteSpaces(userId: string, options: { offset: number; limit: number; }) { 
    const user = await User.findById(userId, "favorites").lean();
    if (!user) return [];

    return TextSpace
        .find({ _id: { $in: user.favorites } }, "title desc content likes views owner secured")
        .sort({ name: "asc" })
        .limit(options.limit)
        .skip(options.offset)
        .lean();
};

export async function getOwnedAndFavoriteSpaces(userId: string, options: { offset: number; limit: number; }) {
    const user = await User.findById(userId, 'favorites').lean();

    if (!user) return [];

    return TextSpace
        .find({
            $or: [
                { owner: userId },
                {
                    _id: {
                        $in: user.favorites
                    }
                }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(options.limit)
        .skip(options.offset)
        .lean();
}

function getTextSpaceOwnerId(textSpaces: { owner: Types.ObjectId }[]) {
    return textSpaces.reduce((ownerIds: string[], textSpace) => textSpace.owner && !ownerIds.includes(textSpace?.owner?.toString()) ?
        [...ownerIds, textSpace.owner.toString()] :
        ownerIds
    , []);
};

async function getTextSpacesOwners(textSpaces: FlattenMaps<({
    _id: Types.ObjectId;
    title: string;
    desc?: string;
    content: string;
    password: string;
    links: string[];
    views: number;
    likes: number;
    owner: Types.ObjectId;
    secured: boolean;
    autoDelete: boolean;
})>[]) {
    try {
        
        const ownerIds = getTextSpaceOwnerId(textSpaces);
        const owners = await User.find({ _id: { $in: ownerIds } }, "username profileImage").lean();

        const ownersInObjectFormat = owners
            .reduce((formattedOwners, owner) => (
                {
                    ...formattedOwners,
                    [owner._id.toString()]: owner
                }
            ), {});

    return ownersInObjectFormat;
    } catch (error) {
        throw error;
    }
}

async function expandTextSpaceOwnerDetails(textSpaces: FlattenMaps<(
    {
        createdAt: NativeDate;
        updatedAt: NativeDate;
    } &
    {
        _id: Types.ObjectId;
        title: string;
        desc?: string;
        content: string;
        password: string;
        links: string[];
        views: number;
        likes: number;
        owner: Types.ObjectId;
        secured: boolean;
        autoDelete: boolean;
    }
)>[]) {
    type OwnerType = {
        [key: string]: {
            _id: Types.ObjectId;
            username: string;
            profileImage: string;
        }
    };
    try {
        const owners = await getTextSpacesOwners(textSpaces);

        const expandedTextSpaces = textSpaces.map((textSpace) => ({
            ...textSpace,
            owner: textSpace.owner ?
                (owners as OwnerType)[textSpace.owner.toString()] :
                {
                    username: "Annonymous",
                    profileImage: null
                }
        }));
            
        return expandedTextSpaces;
    } catch (error) {
        throw error;
    }
}

export async function getUserSpaces(userId: string, options: { limit?: any; page?: any; filter?: any; }) {
    try {
        let textSpaces;
        const { limit, offset, page, filter } = getFetchOptions(options);

        if (filter === 'favorites') textSpaces = await getFavoriteSpaces(userId, { offset, limit });
        else if (filter === 'owned') textSpaces = await getOwnedSpaces(userId, { offset, limit });
        else textSpaces = await getOwnedAndFavoriteSpaces(userId, { offset, limit });

        const expandedTextSpaces = await expandTextSpaceOwnerDetails(textSpaces as any[]);

        return {
            page,
            limit,
            filter,
            failed: false,
            textSpaces: expandedTextSpaces
        };
    } catch (error) {
        console.log(error);

        return {
            failed: true,
            message: (error as Error).message
        }
    }
};

export async function getSpacesOfOtherUsers(
    userId: string,
    options: {
        limit?: any;
        page?: any;
        sortBy?: any;
    }) { 
    try {
        const { limit, page, offset, sort } = getFetchOptions(options);

        const textSpaces = await TextSpace
            .find(
                {
                    $or: [
                        { owner: { $ne: userId } },
                        { owner: null }
                    ]
                },
                { password: 0 }
            )
            .sort(sort)
            .limit(limit)
            .skip(offset)
            .lean();
        
        const expandedTextSpaces = await expandTextSpaceOwnerDetails(textSpaces as any[]);
        
        return {
            limit,
            page,
            failed: false,
            sortedBy: options.sortBy,
            textSpaces: expandedTextSpaces,
        }
    } catch (error) {
        console.error(error);

        return {
            failed: true,
            message: (error as Error).message
        }
    }
};

export async function getSingleUnsecuredSpace(textSpaceId: string) {
    try {
        const textSpace = await TextSpace
            .findOne({ _id: textSpaceId, secured: false }, { password: 0 })
            .lean();
        
        if (!textSpace) throw Error("No text space found");

        const expandedTextSpace = await expandTextSpaceOwnerDetails([(textSpace as any)]);

        return {
            failed: false,
            textSpace: expandedTextSpace[0]
        }
    } catch (error) {
        console.error(error);
        return {
            failed: true,
            message: (error as Error).message,
        }
    }
}

export async function getSingleSecuredSpace(textSpaceId: string, password: any) {
    try {
        if (!password) throw Error("Password required");

        const result = await TextSpace.findOne({ _id: textSpaceId, secured: true }).lean();
        
        if (!result) throw Error("No text space found");

        const { password: hashedPassword, ...textSpace } = result;
        const comparison = await comparePasswords(String(hashedPassword), String(password));

        if (!comparison) throw Error("Incorrect password");

        const expandedTextSpace = await expandTextSpaceOwnerDetails([textSpace as any]);

        return {
            failed: false,
            textSpace: expandedTextSpace[0]
        }
    } catch (error) {
        console.error(error);
        return {
            failed: true,
            message: (error as Error).message,
        }
    }
}

export async function deleteTextAndEditUserDetailsSpace(textSpaceId: string) {
    try {
        const deletedTextSpace = await TextSpace.findByIdAndDelete(textSpaceId);
        if (!deletedTextSpace) throw Error("Could not delete text space");

        await User.updateMany(
            {
                favorites: {
                    $in: deletedTextSpace
                }
            },
            {
                $pull: {
                    favorites: deletedTextSpace
                }
            }
        );

        return { 
            failed: false,
            message: "Text space deleted"
        }
    } catch (error) {
        return {
            failed: true,
            message: (error as Error).message
        }
    }
};