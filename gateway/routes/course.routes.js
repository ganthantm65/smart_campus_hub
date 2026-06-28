import express from 'express';
import courseProxy from '../proxy/course.proxy.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const courseRouter=express.Router();

courseRouter.use(verifyToken);
courseRouter.use("/",courseProxy);

export default courseRouter;