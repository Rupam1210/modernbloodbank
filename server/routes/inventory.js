import express from 'express';
import Inventory from '../models/Inventory.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get blood inventory summary (public)
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
router.get('/summary', async (req, res) => {
  try {
    const inventory = await Inventory.aggregate([
      { $match: { status: 'available' } },
      {
        $group: {
          _id: '$bloodGroup',
          totalUnits: { $sum: '$units' }
        }
      }
    ]);

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get detailed inventory (authenticated)
router.get('/detailed', authenticateToken, async (req, res) => {
  try {
    const inventory = await Inventory.find({ status: 'available' })
      .populate('organization', 'name organizationName')
      .populate('donorId', 'name bloodGroup')
      .sort({ expiryDate: 1 });

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;