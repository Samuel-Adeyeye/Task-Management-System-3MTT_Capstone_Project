import express from 'express';
import auth from '../middleware/auth.js';
import { taskValidationRules, taskUpdateValidationRules, validate } from '../middleware/validation.js';
import {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask
} from '../controllers/taskController.js';

const router = express.Router();

// Get all tasks with filtering and sorting
router.get('/', auth, getAllTasks);

// Create new task - use full validation
router.post('/', [auth, taskValidationRules, validate], createTask);

// Update task - use update validation
router.put('/:id', [auth, taskUpdateValidationRules, validate], updateTask);

// Delete task
router.delete('/:id', auth, deleteTask);

export default router;