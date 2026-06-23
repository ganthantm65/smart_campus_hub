import jwt from 'jsonwebtoken';

export const validateToken=(req,res,next)=>{
    const authentication=req.headers['authorization'];
    if(!authentication){
        throw new Error("No token is specified");
    }
    const token=authentication.split(' ')[0];
    if(!token){
        throw new Error("No token provided")
    }
    try {
        const decoded=await jwt.sign(token,"supersecretkeyforjwt");
        req.user=decoded;
        req.userId=decoded.user_id;
        next();
    } catch (error) {
        console.error("Token validation error:", err);
        return res.status(401).json({success:false,message:"Invalid token"});
    }
}