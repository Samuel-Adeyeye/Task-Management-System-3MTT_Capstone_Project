// src/routes/user.js
import express from 'express';
import { userValidationRules, validate } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import {
    register,
    login,
    logout,
    logoutAll,
    getProfile,
    updateProfile,
    deleteProfile
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', userValidationRules, validate, register);
router.post('/login', userValidationRules, validate, login);
router.post('/logout', authenticateToken, logout);
router.post('/logoutAll', authenticateToken, logoutAll);
router.get('/me', authenticateToken, getProfile);
router.patch('/me', authenticateToken, updateProfile);
router.delete('/me', authenticateToken, deleteProfile);

export default router;