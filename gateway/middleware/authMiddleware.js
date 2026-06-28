import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {

    const token = req.headers.authorization?.split(" ")[1];

    if(req.method==="OPTIONS"){
        return next();
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY
        );

        req.user = decoded;
        req.userId = decoded.user_id;
        req.role = decoded.role;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });

    }
};