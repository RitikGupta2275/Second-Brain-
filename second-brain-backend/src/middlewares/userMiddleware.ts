import type{NextFunction, Request, Response} from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import "dotenv/config";
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
}

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"];
    if(!token) {
        return res.status(401).json({
            message: "token is not provided"
        });
    }
    
    try {
        const decoded = jwt.verify(token,jwtSecret) as JwtPayload;
        
        req.userId = decoded.id;
        next();
    
    } catch (error) {
        return res.status(401).json({
            message: "Invalid Token"
        })
    }
}