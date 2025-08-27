import express from 'express';
import BloodRequest from '../models/BloodRequest.js';
import Inventory from '../models/Inventory.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import BloodCamp from '../models/BloodCamp.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get organization profile
router.get('/profile', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const organization = await User.findById(req.user.userId).select('-password');
    res.json(organization);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all pending requests
router.get('/requests/pending', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: 'pending' })
      .populate('requester', 'name email phone bloodGroup hospitalName')
      .sort({ requestDate: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Accept/Reject request
router.put('/requests/:requestId/status', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const request = await BloodRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    request.organization = req.user.userId;
    request.adminNotes = adminNotes;
    
    await request.save();

    // If donation request is approved, update last donation date
    if (status === 'approved' && request.requestType === 'donation') {
      await User.findByIdAndUpdate(request.requester, {
        lastDonation: new Date()
      });

      // Create transaction record
      const transaction = new Transaction({
        organization: req.user.userId,
        type: 'donation',
        bloodGroup: request.bloodGroup,
        units: request.units,
        donor: request.requester,
        requestId: request._id
      });
      
      await transaction.save();

      // Update inventory
      let inventory = await Inventory.findOne({
        organization: req.user.userId,
        bloodGroup: request.bloodGroup,
        status: 'available'
      });

      if (inventory) {
        inventory.units += request.units;
      } else {
        inventory = new Inventory({
          organization: req.user.userId,
          bloodGroup: request.bloodGroup,
          units: request.units,
          expiryDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000), // 42 days from now
          donorId: request.requester
        });
      }
      
      await inventory.save();
    }

    // If blood request is approved, reduce inventory
    if (status === 'approved' && request.requestType === 'blood_request') {
      // Find available inventory for the requested blood group
      const inventory = await Inventory.findOne({
        organization: req.user.userId,
        bloodGroup: request.bloodGroup,
        status: 'available',
        units: { $gte: request.units }
      });

      if (!inventory) {
        return res.status(400).json({ 
          message: `Insufficient ${request.bloodGroup} blood units available. Cannot approve request.` 
        });
      }

      // Reduce inventory units
      inventory.units -= request.units;
      
      // If units become 0, mark as used
      if (inventory.units === 0) {
        inventory.status = 'used';
      }
      
      await inventory.save();

      // Create transaction record for blood distribution
      const transaction = new Transaction({
        organization: req.user.userId,
        type: 'distribution',
        bloodGroup: request.bloodGroup,
        units: request.units,
        recipient: request.requester,
        requestId: request._id,
        notes: `Blood distributed to ${request.hospitalName || 'hospital'} for ${request.patientName || 'patient'}`
      });
      
      await transaction.save();
    }
    res.json({ message: `Request ${status} successfully`, request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get inventory
router.get('/inventory', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const inventory = await Inventory.find({ 
      organization: req.user.userId,
      $or: [
        { status: 'available' },
        { status: 'reserved' },
        { status: 'expired' }
      ]
    })
      .populate('donorId', 'name bloodGroup')
      .sort({ collectionDate: -1 });
    
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add inventory
router.post('/inventory', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const { bloodGroup, units, expiryDate, donorId } = req.body;

    const inventory = new Inventory({
      organization: req.user.userId,
      bloodGroup,
      units,
      expiryDate,
      donorId
    });

    await inventory.save();
    
    res.status(201).json({ message: 'Inventory added successfully', inventory });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update inventory
router.put('/inventory/:inventoryId', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const { units, status, expiryDate } = req.body;
    
    const inventory = await Inventory.findOneAndUpdate(
      { _id: req.params.inventoryId, organization: req.user.userId },
      { units, status, expiryDate },
      { new: true }
    );

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory updated successfully', inventory });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete inventory
router.delete('/inventory/:inventoryId', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const inventory = await Inventory.findOneAndDelete({
      _id: req.params.inventoryId,
      organization: req.user.userId
    });

    if (!inventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transactions
router.get('/transactions', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const transactions = await Transaction.find({ organization: req.user.userId })
      .populate('donor', 'name bloodGroup')
      .populate('recipient', 'name hospitalName')
      .sort({ date: -1 });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get unverified donors
router.get('/donors/unverified', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const unverifiedDonors = await User.find({ 
      role: 'donor', 
      isBloodGroupVerified: false 
    }).select('-password');
    
    res.json(unverifiedDonors);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify donor blood group
router.put('/donors/:donorId/verify', authenticateToken, checkRole(['organization']), async (req, res) => {
  try {
    const { bloodGroup, isVerified } = req.body;
    
    const donor = await User.findByIdAndUpdate(
      req.params.donorId,
      { 
        bloodGroup,
        isBloodGroupVerified: isVerified 
      },
      { new: true }
    ).select('-password');

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    res.json({ message: 'Donor blood group verification updated', donor });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router; 