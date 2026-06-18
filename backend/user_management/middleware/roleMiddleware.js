import pool from "../util/db";

export const checkRole = (...roles)=>{
    return (req,res,next)=>{
        if(!req.user || !roles.includes(req.user.role_name)){
            return res.status(403).json({success:false,message:"Access denied"});
        }
        next();
    }
}