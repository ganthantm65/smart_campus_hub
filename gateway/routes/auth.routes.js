import express from 'express';
import authProxy from '../proxy/auth.proxy.js';

const authRouter=express.Router()

authRouter.use("/",authProxy);

export default authRouter;