import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['donor', 'hospital', 'organization', 'admin'],
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  // Donor specific fields
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',''],
    required: function() { return this.role === 'donor'; }
  },
  age: {
    type: Number,
    required: function() { return this.role === 'donor'; }
  },
  weight: {
    type: Number,
    required: function() { return this.role === 'donor'; }
  },
  lastDonation: {
    type: Date,
    default: null
  },
  isBloodGroupVerified: {
    type: Boolean,
    default: false
  },
  medicalHistory: {
    type: String,
    default: ''
  },
  // Hospital specific fields
  hospitalName: {
    type: String,
    required: function() { return this.role === 'hospital'; }
  },
  licenseNumber: {
    type: String,
    required: function() { return this.role === 'hospital'; }
  },
  // Organization specific fields
  organizationName: {
    type: String,
    required: function() { return this.role === 'organization'; }
  },
  organizationType: {
    type: String,
    enum: ['blood_bank', 'red_cross', 'ngo', 'hospital_affiliated',''],
    required: function() { return this.role === 'organization'; }
  },
  isApproved: {
    type: Boolean,
    default: function() { return this.role !== 'organization'; }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);