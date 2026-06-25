import jwt from "jsonwebtoken";

export const validateToken = (req, res, next) => {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            "supersecretkeyforjwt"
        );

        req.user = decoded;
        req.userId = decoded.user_id;
        req.role = decoded.role;

        next();

    } catch (error) {
        console.error(error)
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });

    }
};