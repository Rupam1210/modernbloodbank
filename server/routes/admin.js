import express from 'express';
import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import Inventory from '../models/Inventory.js';
import Transaction from '../models/Transaction.js';
import BloodCamp from '../models/BloodCamp.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const [
      totalDonors,
      totalHospitals,
      totalOrganizations,
      pendingOrganizations,
      totalBloodRequests,
      pendingRequests,
      totalInventory,
      totalTransactions,
      totalBloodCamps
    ] = await Promise.all([
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'hospital' }),
      User.countDocuments({ role: 'organization' }),
      User.countDocuments({ role: 'organization', isApproved: false }),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: 'pending' }),
      Inventory.aggregate([{ $group: { _id: null, total: { $sum: '$units' } } }]),
      Transaction.countDocuments(),
      BloodCamp.countDocuments()
    ]);

    const stats = {
      totalUsers: totalDonors + totalHospitals + totalOrganizations,
      totalDonors,
      totalHospitals,
      totalOrganizations,
      pendingOrganizations,
      totalBloodRequests,
      pendingRequests,
      totalBloodUnits: totalInventory[0]?.total || 0,
      totalTransactions,
      totalBloodCamps
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users
router.get('/users', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const query = role ? { role } : {};
    
    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve/Reject organization
router.put('/organizations/:orgId/approval', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { isApproved } = req.body;
    
    const organization = await User.findByIdAndUpdate(
      req.params.orgId,
      { isApproved },
      { new: true }
    ).select('-password');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({ 
      message: `Organization ${isApproved ? 'approved' : 'rejected'} successfully`, 
      organization 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all blood requests
router.get('/blood-requests', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};
    
    const requests = await BloodRequest.find(query)
      .populate('requester', 'name email role hospitalName')
      .populate('organization', 'name organizationName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ requestDate: -1 });

    const total = await BloodRequest.countDocuments(query);
    
    res.json({
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all transactions
router.get('/transactions', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const transactions = await Transaction.find()
      .populate('organization', 'name organizationName')
      .populate('donor', 'name bloodGroup')
      .populate('recipient', 'name hospitalName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const total = await Transaction.countDocuments();
    
    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get system analytics
router.get('/analytics', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    // Blood group distribution
    const bloodGroupStats = await User.aggregate([
      { $match: { role: 'donor' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
    ]);

    // Monthly registrations
    const monthlyRegistrations = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Blood inventory by organization
    const inventoryStats = await Inventory.aggregate([
      {
        $group: {
          _id: '$bloodGroup',
          totalUnits: { $sum: '$units' }
        }
      }
    ]);

    res.json({
      bloodGroupDistribution: bloodGroupStats,
      monthlyRegistrations,
      inventoryByBloodGroup: inventoryStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user
router.delete('/users/:userId', authenticateToken, checkRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;