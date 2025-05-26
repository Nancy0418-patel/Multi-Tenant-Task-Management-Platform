const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const { auth, checkRole, checkOrganization } = require('../middleware/auth');

// Validation middleware
const validateTask = [
  body('title').trim().notEmpty(),
  body('dueDate').isISO8601(),
  body('category').isIn(['bug', 'feature', 'improvement']),
  body('priority').isIn(['low', 'medium', 'high'])
];

// Create task
router.post('/', auth, checkRole(['admin', 'manager']), validateTask, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const task = new Task({
      ...req.body,
      organization: req.user.organization,
      createdBy: req.user._id
    });

    await task.save();
    res.status(201).json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
});

// Get all tasks for organization
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, priority, assignedTo } = req.query;
    const query = { organization: req.user.organization };

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      organization: req.user.organization
    })
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
});

// Update task
router.patch('/:id', auth, checkRole(['admin', 'manager']), validateTask, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'category', 'priority', 'status', 'dueDate', 'assignedTo'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates'
      });
    }

    updates.forEach(update => task[update] = req.body[update]);
    await task.save();

    res.json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
});

// Delete task
router.delete('/:id', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
});

// Update task status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['todo', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      organization: req.user.organization
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is assigned to the task
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    task.status = status;
    if (status === 'completed') {
      task.completedAt = new Date();
    }

    await task.save();
    res.json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating task status',
      error: error.message
    });
  }
});

module.exports = router; 