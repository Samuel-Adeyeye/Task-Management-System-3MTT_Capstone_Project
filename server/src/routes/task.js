import express from 'express';
import auth from '../middleware/auth.js';
import { taskValidationRules, validate } from '../middleware/validation.js';
import {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask
} from '../controllers/taskController.js';

const router = express.Router();

// Get all tasks with filtering and sorting
router.get('/', auth, getAllTasks);

// Create new task
router.post('/', [auth, taskValidationRules, validate], createTask);

// Update task
router.put('/:id', [auth, taskValidationRules, validate], updateTask);

// Delete task
router.delete('/:id', auth, deleteTask);

export default router;