import express from 'express';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import BloodRequest from '../models/BloodRequest.js';
import Transaction from '../models/Transaction.js';
import mongoose from 'mongoose';

const router = express.Router();
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
// Get all organizations (public)
router.get('/organizations', async (req, res) => {
  try {
    const organizations = await User.find({ 
      role: 'organization', 
      isApproved: true 
    }).select('name organizationName');
    
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific organization inventory (public)
router.get('/organization/:orgId/inventory', async (req, res) => {
  try {
    const inventory = await Inventory.aggregate([
      { 
        $match: { 
          organization: new mongoose.Types.ObjectId(req.params.orgId),
          status: 'available' 
        } 
      },
      {
        $group: {
          _id: '$bloodGroup',
          totalUnits: { $sum: '$units' },
          nearestExpiry: { $min: '$expiryDate' }
        }
      },
      {
        $project: {
          bloodGroup: '$_id',
          totalUnits: 1,
          nearestExpiry: 1,
          _id: 0
        }
      }
    ]);

    // Add blood groups with zero availability
    const allBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const result = allBloodGroups.map(group => {
      const found = inventory.find(item => item.bloodGroup === group);
      return found || { bloodGroup: group, totalUnits: 0, nearestExpiry: null };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get blood availability analytics (public)
router.get('/blood-availability', async (req, res) => {
  try {
    const availability = await Inventory.aggregate([
      { $match: { status: 'available' } },
      {
        $group: {
          _id: '$bloodGroup',
          totalUnits: { $sum: '$units' },
          organizationCount: { $addToSet: '$organization' }
        }
      },
      {
        $project: {
          bloodGroup: '$_id',
          totalUnits: 1,
          organizationCount: { $size: '$organizationCount' },
          _id: 0
        }
      }
    ]);

    // Add blood groups with zero availability
    const allBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const result = allBloodGroups.map(group => {
      const found = availability.find(item => item.bloodGroup === group);
      return found || { bloodGroup: group, totalUnits: 0, organizationCount: 0 };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get donation trends
router.get('/donation-trends', async (req, res) => {
  try {
    const trends = await Transaction.aggregate([
      { $match: { type: 'donation' } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalDonations: { $sum: '$units' },
          donationCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get request statistics
router.get('/request-stats', async (req, res) => {
  try {
    const stats = await BloodRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;