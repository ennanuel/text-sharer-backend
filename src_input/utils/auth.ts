import { CookieOptions, RequestHandler, Response, Request } from "express";
import jwt from "jsonwebtoken";
import InvalidToken from "../models/InvalidToken";

const MAX_AGE = 259200;

export interface ModifiedRequest extends Request {
    auth: {
        id: string;
        isAdmin: boolean;
    }
}

export const authenticate: RequestHandler = async (req, res, next) => {
    try {
        const userToken = req.cookies.userToken;
        if (!userToken) throw new Error("No user token");

        const tokenIsInvalid = (await InvalidToken.countDocuments({ token: userToken })) > 0;
        if(tokenIsInvalid) throw new Error("Ivalid token");

        jwt.verify(userToken, String(process.env.JWT_SECRET_KEY), (error: any, result: any) => {
            if (error) throw error;
            (req as ModifiedRequest).auth = result;
            next();
        });
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: (error as Error).message });
    }
};

export const authenticateWithoutKickingout: RequestHandler = async (req, res, next) => {
    try {
        const userToken = req.cookies.userToken;
        if (userToken) {
            const invalidTokensFound = await InvalidToken.countDocuments({ token: userToken });
            const tokenIsInvalid = invalidTokensFound > 0;
            if (!tokenIsInvalid) {
                    jwt.verify(userToken, String(process.env.JWT_SECRET_KEY), (error: any, result: any) => {
                    if (error) throw error;
                    (req as ModifiedRequest).auth = result;
                });
            }
        };
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: (error as Error).message });
    }
};

export const checkToken: RequestHandler = async (req, res) => {
    return res.status(200).json({
        userId: (req as ModifiedRequest).auth.id
    });
};

function createUserToken(user: { _id: string; isAdmin?: boolean; }): { token: string; cookieOptions: CookieOptions; } {
    const token = jwt.sign({ id: user._id, isAdmin: Boolean(user?.isAdmin) }, String(process.env.JWT_SECRET_KEY), { expiresIn: MAX_AGE });
    const cookieOptions: CookieOptions = { httpOnly: true, secure: false, sameSite: 'strict', maxAge: MAX_AGE * 1000};
    return { token, cookieOptions };
};

export function assignUserToken(user: { _id: string; isAdmin?: boolean }, res: Response) {
    const { token, cookieOptions } = createUserToken(user);
    res.cookie('userToken', token, cookieOptions);
};

export const invalidateToken: RequestHandler = async (req, res) => {
    try {
        const userToken = req.cookies.userToken;
        
        await InvalidToken.create({
            token: userToken
        });

        res.cookie('userToken', "");
        return res.status(204).json(null);
    } catch (error) {
        console.error((error as Error).message);
        return res.status(500).json({ message: (error as Error).message });
    }
}