import express from 'express';
import BloodCamp from '../models/BloodCamp.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Add CORS headers for all blood camp routes
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
// Get all blood camps (public)
router.get('/', async (req, res) => {
  try {
    const { status = 'upcoming' } = req.query;
    const camps = await BloodCamp.find({ status })
      .populate('organizer', 'name organizationName')
      .sort({ date: 1 });

    res.json(camps);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get blood camp by ID
router.get('/:id', async (req, res) => {
  try {
    const camp = await BloodCamp.findById(req.params.id)
      .populate('organizer', 'name organizationName')
      .populate('registrations.donor', 'name email phone bloodGroup');

    if (!camp) {
      return res.status(404).json({ message: 'Blood camp not found' });
    }

    res.json(camp);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get blood camp registrations with detailed donor info (organization only)
router.get('/:id/registrations', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const camp = await BloodCamp.findOne({
      _id: req.params.id,
      organizer: req.user.userId
    }).populate({
      path: 'registrations.donor',
      select: 'name email phone bloodGroup age weight isBloodGroupVerified lastDonation medicalHistory'
    });

    if (!camp) {
      return res.status(404).json({ message: 'Blood camp not found or unauthorized' });
    }

    res.json(camp.registrations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update registration status (organization only)
router.put('/:campId/registrations/:donorId/status', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const { status } = req.body;
    
    const camp = await BloodCamp.findOne({
      _id: req.params.campId,
      organizer: req.user.userId
    });

    if (!camp) {
      return res.status(404).json({ message: 'Blood camp not found or unauthorized' });
    }

    const registration = camp.registrations.find(
      reg => reg.donor.toString() === req.params.donorId
    );

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    registration.status = status;
    await camp.save();

    // If marked as donated, update camp's collected units
    if (status === 'donated') {
      camp.collectedUnits = (camp.collectedUnits || 0) + 1;
      await camp.save();
    }

    res.json({ message: 'Registration status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// Create blood camp (organization only)
router.post('/', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const campData = {
      ...req.body,
      organizer: req.user.userId
    };

    const camp = new BloodCamp(campData);
    await camp.save();

    res.status(201).json({ message: 'Blood camp created successfully', camp });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update blood camp (organization only)
router.put('/:id', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const camp = await BloodCamp.findOneAndUpdate(
      { _id: req.params.id, organizer: req.user.userId },
      req.body,
      { new: true }
    );

    if (!camp) {
      return res.status(404).json({ message: 'Blood camp not found or unauthorized' });
    }

    res.json({ message: 'Blood camp updated successfully', camp });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete blood camp (organization only)
router.delete('/:id', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const camp = await BloodCamp.findOneAndDelete({
      _id: req.params.id,
      organizer: req.user.userId
    });

    if (!camp) {
      return res.status(404).json({ message: 'Blood camp not found or unauthorized' });
    }

    res.json({ message: 'Blood camp deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get organization's blood camps
router.get('/organization/my-camps', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const camps = await BloodCamp.find({ organizer: req.user.userId })
      .populate('registrations.donor', 'name email phone bloodGroup')
      .sort({ date: 1 });

    res.json(camps);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;