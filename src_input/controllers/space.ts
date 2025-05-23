import { RequestHandler } from "express";
import { handleError, ModifiedError } from "../utils/error";
import { addTextSpaceToFavorites, CreateTextSpace, deleteTextAndEditUserDetailsSpace, EditTextSpace, findTextSpace, getSingleSpace, getSpacesOfOtherUsers, getUserSpaces, removeTextSpaceFromFavorites } from "../utils/spaces";
import { ModifiedRequest } from "../utils/auth";
import { io } from "../server";


export const getUserTextSpaces: RequestHandler = async (req, res) => {
    try {
        const userId = (req as ModifiedRequest)?.auth?.id;
        const { page } = req.params;
        const { limit = 9, filter } = req.query;
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
        const userId = (req as ModifiedRequest)?.auth?.id;
        const { page } = req.params;
        const { limit = 9, sortBy, filter } = req.query;
        const options = { page, limit, sortBy, filter };

        const result = await getSpacesOfOtherUsers(userId, options);

        if (result.failed) throw result;
        
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError((error as ModifiedError));
        return res.status(statusCode).json(result);
    }
};

export const searchTextSpace: RequestHandler = async (req, res) => {
    try {
        const { query } = req.params;
        const { limit, page, filter } = req.query;
        const userId = (req as ModifiedRequest)?.auth?.id;

        const { failed, ...result } = await findTextSpace(query, userId, { limit, page, filter });

        if(failed) throw result;

        return res.status(200).json(result);
    } catch (error) {
        const { statusCode, ...result } = handleError((error as ModifiedError));
        return res.status(statusCode).json(result);
    }
}

export const getSingleTextSpace: RequestHandler = async (req, res) => { 
    try {
        const userId = (req as ModifiedRequest)?.auth?.id;
        const { textSpaceId } = req.params;
        const { p = "" } = req.query;
        const { failed, textSpace, ...result } = await getSingleSpace(textSpaceId, p, userId);
        if (failed) throw result;
        
        return res.status(200).json(textSpace);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError((error as ModifiedError));
        return res.status(statusCode).json(result);
    }
};

export const create: RequestHandler = async (req, res) => { 
    try {
        const { title, desc, content, secured, password, color } = req.body;
        const owner = (req as ModifiedRequest)?.auth?.id;

        const newTextSpace = new CreateTextSpace({ title, desc, content, secured, password, owner, color });
        await newTextSpace.validate();
        const result = await newTextSpace.save();

        if (result.failed) throw result;

        io.emit('created', { userId: owner });
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError((error as ModifiedError));
        return res.status(statusCode).json(result);
    }
};

export const edit: RequestHandler = async (req, res) => {
    try {
        const userId = (req as ModifiedRequest)?.auth?.id;
        const { textSpaceId } = req.params;
        const { title, desc, content, color, secured, password } = req.body;
        const edittedTextSpace = new EditTextSpace({ textSpaceId, title, desc, content, secured, password, color });
        await edittedTextSpace.validate();
        const result = await edittedTextSpace.save();

        if (result.failed) throw result;

        io.emit('editted', { textSpaceId, userId });
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError((error as ModifiedError));
        res.status(statusCode).json(result);
    }
};

export const addToFavorites: RequestHandler = async (req, res) => {
    try {
        const userId = (req as ModifiedRequest)?.auth?.id;
        const textSpaceId = req.params.textSpaceId;

        const  { failed, ...result } = await addTextSpaceToFavorites({ userId, textSpaceId });

        if(failed) throw result;
        
        return res.status(200).json({ message: result.message });
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError((error as ModifiedError));
        res.status(statusCode).json(result);
    }
};

export const removeFromFavorites: RequestHandler = async (req, res) => {
    try {
        const userId = (req as ModifiedRequest)?.auth?.id;
        const textSpaceId = req.params.textSpaceId;

        const  { failed, ...result } = await removeTextSpaceFromFavorites({ userId, textSpaceId });

        if(failed) throw result;
        
        return res.status(200).json({ message: "Removed from favorites" });
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError((error as ModifiedError));
        res.status(statusCode).json(result);
    }
};

export const deleteTextSpace: RequestHandler = async (req, res) => {
    try {
        const userId = (req as ModifiedRequest)?.auth?.id
        const { textSpaceId } = req.params;
        const result = await deleteTextAndEditUserDetailsSpace(textSpaceId);

        if (result.failed) throw result;

        io.emit('deleted', { textSpaceId, userId });
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError((error as ModifiedError));
        res.status(statusCode).json(result);
    }
};