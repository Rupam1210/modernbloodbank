import express from 'express';
import BloodRequest from '../models/BloodRequest.js';
import BloodCamp from '../models/BloodCamp.js';
import User from '../models/User.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get donor profile
router.get('/profile', authenticateToken, checkRole(['donor']), async (req, res) => {
  try {
    const donor = await User.findById(req.user.userId).select('-password');
    res.json(donor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update donor profile
router.put('/profile', authenticateToken, checkRole(['donor']), async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone', 'address', 'weight', 'medicalHistory'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const donor = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', donor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Make donation request
router.post('/donation-request', authenticateToken, checkRole(['donor']), async (req, res) => {
  try {
    const donor = await User.findById(req.user.userId);
    
    // Check if donor can donate (30-day gap)
    if (donor.lastDonation) {
      const daysSinceLastDonation = Math.floor((Date.now() - donor.lastDonation) / (1000 * 60 * 60 * 24));
      if (daysSinceLastDonation < 30) {
        return res.status(400).json({ 
          message: `You can donate again after ${30 - daysSinceLastDonation} days` 
        });
      }
    }

    // Check if blood group is verified
    if (!donor.isBloodGroupVerified) {
      return res.status(400).json({ 
        message: 'Your blood group needs to be verified before you can donate' 
      });
    }

    const donationRequest = new BloodRequest({
      requester: req.user.userId,
      requestType: 'donation',
      bloodGroup: donor.bloodGroup,
      units: req.body.units || 1,
      reason: req.body.reason,
      contactNumber: req.body.contactNumber || donor.phone
    });

    await donationRequest.save();
    
    res.status(201).json({ 
      message: 'Donation request submitted successfully', 
      request: donationRequest 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Make blood request
router.post('/blood-request', authenticateToken, checkRole(['donor']), async (req, res) => {
  try {
    const { bloodGroup, units, urgency, reason, patientName, hospitalName, contactNumber, requiredBy } = req.body;

    const bloodRequest = new BloodRequest({
      requester: req.user.userId,
      requestType: 'blood_request',
      bloodGroup,
      units,
      urgency,
      reason,
      patientName,
      hospitalName,
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

// Get donor's requests
router.get('/requests', authenticateToken, checkRole(['donor']), async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requester: req.user.userId })
      .populate('organization', 'name organizationName')
      .sort({ requestDate: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register for blood camp
router.post('/blood-camp/:campId/register', authenticateToken, checkRole(['donor']), async (req, res) => {
  try {
    const camp = await BloodCamp.findById(req.params.campId);
    if (!camp) {
      return res.status(404).json({ message: 'Blood camp not found' });
    }

    // Check if already registered
    const alreadyRegistered = camp.registrations.find(
      reg => reg.donor.toString() === req.user.userId
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this camp' });
    }

    camp.registrations.push({
      donor: req.user.userId,
      status: 'registered'
    });

    await camp.save();
    
    res.json({ message: 'Successfully registered for blood camp' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get registered blood camps
router.get('/blood-camps/registered', authenticateToken, checkRole(['donor']), async (req, res) => {
  try {
    const camps = await BloodCamp.find({ 
      'registrations.donor': req.user.userId 
    }).populate('organizer', 'name organizationName');
    
    res.json(camps);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get donation history
router.get('/donation-history', authenticateToken, checkRole(['donor']), async (req, res) => {
  try {
    const donationHistory = await BloodRequest.find({ 
      requester: req.user.userId,
      requestType: 'donation',
      status: 'completed'
    }).populate('organization', 'name organizationName')
    .sort({ requestDate: -1 });
    
    res.json(donationHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;