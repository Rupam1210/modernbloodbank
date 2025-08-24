import mongoose from 'mongoose';

const bloodCampSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  contactPerson: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  targetUnits: {
    type: Number,
    default: 50
  },
  collectedUnits: {
    type: Number,
    default: 0
  },
  registrations: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'donated', 'cancelled'],
      default: 'registered'
    }
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  requirements: {
    type: String,
    default: 'Age 18-65, Weight >50kg, Good health'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('BloodCamp', bloodCampSchema);