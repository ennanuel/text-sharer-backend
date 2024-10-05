import { RequestHandler } from "express";
import { CreateUser, deleteUserAndSpaces, EditUser, getUserDetails, logUserIn } from "../utils/user";
import { handleError, ModifiedError } from "../utils/error";
import { assignUserToken, invalidateToken } from "../utils/auth";

export const getUser: RequestHandler = async (req, res) => {
    try { 
        const { userId } = req.params;
        const result = await getUserDetails(userId);

        if (result.failed) throw result;

        return res.status(200).json(result.userDetails);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError(error as ModifiedError);
        return res.status(statusCode).json(result);
    }
}

export const register: RequestHandler = async (req, res) => { 
    try {
        const user = {
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        };

        const newUser = new CreateUser(user);
        await newUser.validate();
        
        const { userDetails, ...result } = await newUser.save();

        if (result.failed) throw result;
        if (userDetails) assignUserToken(userDetails, res);
        
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError(error as ModifiedError);
        return res.status(statusCode).json(result);
    }
};


export const login: RequestHandler = async (req, res) => { 
    try {
        const { password, usernameOrEmail } = req.body;
        const { userDetails, ...result } = await logUserIn({ password, usernameOrEmail });
        
        if (result.failed) throw result;

        if (userDetails) assignUserToken(userDetails, res);

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError(error as ModifiedError);
        return res.status(statusCode).json(result);
    }
};

export const logout: RequestHandler = async (req, res) => {
    try {
        invalidateToken(res);

        return res.status(204).json();
    } catch (error) {
        return res.status(500).json({
            failed: true,
            message: "Could not log out"
        })
    }
}


export const edit: RequestHandler = async (req, res) => { 
    try {
        const user = {
            id: req.params.id,
            name: req.body.name,
            email: req.body.email,
            username: req.body.username
        };

        const editUser = new EditUser(user);
        await editUser.validate();

        const result = await editUser.save();

        if (result.failed) throw result;

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError(error as ModifiedError);
        return res.status(statusCode).json(result);
    }
};


export const deleteUser: RequestHandler = async (req, res) => {
    try {
        const { userId } = req.params;
        const { password } = req.body;

        const result = await deleteUserAndSpaces(userId, password);

        if (result.failed) throw result;

        invalidateToken(res);
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        const { statusCode, ...result } = handleError(error as ModifiedError);
        return res.status(statusCode).json(result);
    }
}