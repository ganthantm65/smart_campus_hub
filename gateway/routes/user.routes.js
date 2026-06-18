import express from 'express';
import userProxy from '../proxy/user.proxy.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const userRouter=express.Router();

userRouter.use(verifyToken);
userRouter.use("/",userProxy);

export default userRouter;