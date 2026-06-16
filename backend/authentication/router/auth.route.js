import express from 'express';
import authController from '../controller/auth.controller.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;