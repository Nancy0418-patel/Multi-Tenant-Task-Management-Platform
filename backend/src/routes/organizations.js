const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Organization = require('../models/Organization');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

// Get organization details
router.get('/', auth, async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.json({
      success: true,
      organization: organization.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching organization',
      error: error.message
    });
  }
});

// Update organization settings
router.patch('/', auth, checkRole(['admin']), [
  body('name').optional().trim().notEmpty(),
  body('settings.theme').optional().isIn(['light', 'dark']),
  body('settings.timezone').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const organization = await Organization.findById(req.user.organization);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'settings'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates'
      });
    }

    if (req.body.name) {
      organization.slug = req.body.name.toLowerCase().replace(/\s+/g, '-');
    }

    updates.forEach(update => {
      if (update === 'settings') {
        organization.settings = {
          ...organization.settings,
          ...req.body.settings
        };
      } else {
        organization[update] = req.body[update];
      }
    });

    await organization.save();
    res.json({
      success: true,
      organization: organization.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating organization',
      error: error.message
    });
  }
});

// Get organization members
router.get('/members', auth, async (req, res) => {
  try {
    const members = await User.find({ organization: req.user.organization })
      .select('-password')
      .sort({ role: 1, firstName: 1 });

    res.json({
      success: true,
      members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching members',
      error: error.message
    });
  }
});

// Update member role
router.patch('/members/:userId/role', auth, checkRole(['admin']), [
  body('role').isIn(['admin', 'manager', 'member'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const member = await User.findOne({
      _id: req.params.userId,
      organization: req.user.organization
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Prevent changing role of the last admin
    if (member.role === 'admin') {
      const adminCount = await User.countDocuments({
        organization: req.user.organization,
        role: 'admin'
      });

      if (adminCount === 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change role of the last admin'
        });
      }
    }

    member.role = req.body.role;
    await member.save();

    res.json({
      success: true,
      member: member.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating member role',
      error: error.message
    });
  }
});

// Remove member from organization
router.delete('/members/:userId', auth, checkRole(['admin']), async (req, res) => {
  try {
    const member = await User.findOne({
      _id: req.params.userId,
      organization: req.user.organization
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Prevent removing the last admin
    if (member.role === 'admin') {
      const adminCount = await User.countDocuments({
        organization: req.user.organization,
        role: 'admin'
      });

      if (adminCount === 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot remove the last admin'
        });
      }
    }

    await member.remove();
    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing member',
      error: error.message
    });
  }
});

// Generate new invite code
router.post('/invite-code', auth, checkRole(['admin', 'manager']), async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Generate new invite code
    organization.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await organization.save();

    res.json({
      success: true,
      inviteCode: organization.inviteCode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating invite code',
      error: error.message
    });
  }
});

module.exports = router;