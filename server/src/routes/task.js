import express from 'express';
import auth from '../middleware/auth.js';
import { taskValidationRules, validate } from '../middleware/validation.js';
import Task from '../models/task.js';

const router = express.Router()

// Get all tasks with filtering and sorting
router.get('/', auth, async (req, res) => {
  try {
      const { search, priority, sortBy } = req.query;
      const query = { userId: req.user.userId };

      if (priority) {
          query.priority = priority;
      }

      if (search) {
          query.$or = [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } }
          ];
      }

      let sort = {};
      if (sortBy === 'deadline') {
          sort.deadline = 1;
      } else if (sortBy === 'priority') {
          sort.priority = -1;
      }

      const tasks = await Task.find(query).sort(sort);
      res.json(tasks);
  } catch (error) {
      res.status(500).json({ error: 'Server error' });
  }
});

// Create new task
router.post('/', [auth, taskValidationRules, validate], async (req, res) => {
  try {
      const task = new Task({
          ...req.body,
          userId: req.user.userId
      });
      await task.save();
      res.status(201).json(task);
  } catch (error) {
      res.status(500).json({ error: 'Server error' });
  }
});

// Update task
router.put('/:id', [auth, taskValidationRules, validate], async (req, res) => {
  try {
      const task = await Task.findOne({
          _id: req.params.id,
          userId: req.user.userId
      });

      if (!task) {
          return res.status(404).json({ error: 'Task not found' });
      }

      Object.assign(task, req.body);
      await task.save();
      res.json(task);
  } catch (error) {
      res.status(500).json({ error: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
      const result = await Task.deleteOne({
          _id: req.params.id,
          userId: req.user.userId
      });

      if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Task not found' });
      }

      res.json({ message: 'Task deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: 'Server error' });
  }
});

export default router;