import express from 'express';
import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get hospital profile
router.get('/profile', authenticateToken, checkRole(['hospital']), async (req, res) => {
  try {
    const hospital = await User.findById(req.user.userId).select('-password');
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update hospital profile
router.put('/profile', authenticateToken, checkRole(['hospital']), async (req, res) => {
  try {
    const allowedUpdates = ['name', 'hospitalName', 'phone', 'address', 'licenseNumber'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const hospital = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', hospital });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Make blood request
router.post('/blood-request', authenticateToken, checkRole(['hospital']), async (req, res) => {
  try {
    const { bloodGroup, units, urgency, reason, patientName, contactNumber, requiredBy } = req.body;
    const hospital = await User.findById(req.user.userId);

    const bloodRequest = new BloodRequest({
      requester: req.user.userId,
      requestType: 'blood_request',
      bloodGroup,
      units,
      urgency,
      reason,
      patientName,
      hospitalName: hospital.hospitalName,
      contactNumber,
      requiredBy
    });

    await bloodRequest.save();
    
    res.status(201).json({ 
      message: 'Blood request submitted successfully', 
      request: bloodRequest 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get hospital's requests
router.get('/requests', authenticateToken, checkRole(['hospital']), async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requester: req.user.userId })
      .populate('organization', 'name organizationName')
      .sort({ requestDate: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get blood request history
router.get('/request-history', authenticateToken, checkRole(['hospital']), async (req, res) => {
  try {
    const requests = await BloodRequest.find({ 
      requester: req.user.userId,
      status: { $in: ['completed', 'rejected'] }
    }).populate('organization', 'name organizationName')
    .sort({ requestDate: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;