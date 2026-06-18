import jwt from 'jsonwebtoken';

export const validateToken = (req, res, next)=>{
    const authHeader =req.headers['authorization'];
    if(!authHeader){
        return res.status(401).json({success:false,message:"No token provided"});
    }

    const token=authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({success:false,message:"No token provided"});
    }
    try{
        const decode=jwt.verify(token,"supersecretkeyforjwt");
        req.user=decode;
        req.userId = decode.user_id;
        next()
    }catch(err){
        console.error("Token validation error:", err);
        return res.status(401).json({success:false,message:"Invalid token"});
    }
}