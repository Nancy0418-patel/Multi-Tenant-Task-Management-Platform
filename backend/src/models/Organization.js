const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  settings: {
    theme: {
      type: String,
      default: 'light'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  inviteCode: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate invite code before saving
organizationSchema.pre('save', async function(next) {
  if (!this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Method to get public profile
organizationSchema.methods.getPublicProfile = function() {
  const orgObject = this.toObject();
  delete orgObject.inviteCode;
  return orgObject;
};

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization; 