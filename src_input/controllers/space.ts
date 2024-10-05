import { RequestHandler } from "express";
import { handleError, ModifiedError } from "../utils/error";
import { CreateTextSpace, deleteTextAndEditUserDetailsSpace, EditTextSpace, getSingleSecuredSpace, getSingleUnsecuredSpace, getSpacesOfOtherUsers, getUserSpaces } from "../utils/spaces";
import { ModifiedRequest } from "../utils/auth";


export const getUserTextSpaces: RequestHandler = async (req, res) => {
    try {

        const { userId, page } = req.params;
        const { limit, filter } = req.query;
        const options = { page, limit, filter };

        const result = await getUserSpaces(userId, options);

        if (result.failed) throw result;
        
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError((error as ModifiedError));
        return res.status(statusCode).json(result);
    }
};

export const exploreTextSpaces: RequestHandler = async (req, res) => { 
    try {
        const { userId, page } = req.params;
        const { limit, sortBy } = req.query;
        const options = { page, limit, sortBy };

        const result = await getSpacesOfOtherUsers(userId, options);

        if (result.failed) throw result;
        
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError((error as ModifiedError));
        return res.status(statusCode).json(result);
    }
};

export const getSingleUnsecuredTextSpace: RequestHandler = async (req, res) => { 
    try {
        const { textSpaceId } = req.params;
        const result = await getSingleUnsecuredSpace(textSpaceId);
        if (result.failed) throw result;
        
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError((error as ModifiedError));
        return res.status(statusCode).json(result);
    }
};

export const getSingleSecuredTextSpace: RequestHandler = async (req, res) => { 
    try {
        const { textSpaceId } = req.params;
        const { p } = req.query;
        const result = await getSingleSecuredSpace(textSpaceId, p);
        if (result.failed) throw result;
        
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError((error as ModifiedError));
        return res.status(statusCode).json(result);
    }
};

export const create: RequestHandler = async (req, res) => { 
    try {
        const { title, desc, content, secured, password, owner } = req.body;

        const newTextSpace = new CreateTextSpace({ title, desc, content, secured, password, owner });
        await newTextSpace.validate();
        const result = await newTextSpace.save();

        if (result.failed) throw result;
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError((error as ModifiedError));
        return res.status(statusCode).json(result);
    }
};

export const edit: RequestHandler = async (req, res) => {
    try {
        const { textSpaceId } = req.params;
        const { title, desc, content, secured, password } = req.body;
        const edittedTextSpace = new EditTextSpace({ textSpaceId, title, desc, content, secured, password });
        await edittedTextSpace.validate();
        const result = await edittedTextSpace.save();

        if (result.failed) throw result;
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError((error as ModifiedError));
        res.status(statusCode).json(result);
    }
};

export const deleteTextSpace: RequestHandler = async (req, res) => {
    try {
        const { textSpaceId } = req.params;
        const result = await deleteTextAndEditUserDetailsSpace(textSpaceId);

        if (result.failed) throw result;

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError((error as ModifiedError));
        res.status(statusCode).json(result);
    }
};