import express from 'express';
import courseProxy from '../proxy/course.proxy.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const courseRouter=express.Router();

userRouter.use(verifyToken);
userRouter.use("/",courseProxy);

export default userRouter;