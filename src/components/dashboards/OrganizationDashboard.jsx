import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Building, Users, Package, Activity, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const OrganizationDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [unverifiedDonors, setUnverifiedDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newInventory, setNewInventory] = useState({
    bloodGroup: '',
    units: '',
    expiryDate: '',
    donorId: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [requestsRes, inventoryRes, transactionsRes, donorsRes] = await Promise.all([
        axios.get('/organization/requests/pending'),
        axios.get('/organization/inventory'),
        axios.get('/organization/transactions'),
        axios.get('/organization/donors/unverified')
      ]);

      setRequests(requestsRes.data);
      setInventory(inventoryRes.data);
      setTransactions(transactionsRes.data);
      setUnverifiedDonors(donorsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, status, notes = '') => {
    try {
      await axios.put(`/organization/requests/${requestId}/status`, {
        status,
        adminNotes: notes
      });
      alert(`Request ${status} successfully!`);
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || `Error ${status}ing request`);
    }
  };

  const handleVerifyDonor = async (donorId, bloodGroup, isVerified) => {
    try {
      await axios.put(`/organization/donors/${donorId}/verify`, {
        bloodGroup,
        isVerified
      });
      alert('Donor verification updated successfully!');
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating donor verification');
    }
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/organization/inventory', newInventory);
      alert('Inventory added successfully!');
      setNewInventory({
        bloodGroup: '',
        units: '',
        expiryDate: '',
        donorId: ''
      });
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding inventory');
    }
  };

  const handleUpdateInventory = async (inventoryId, updates) => {
    try {
      await axios.put(`/organization/inventory/${inventoryId}`, updates);
      alert('Inventory updated successfully!');
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating inventory');
    }
  };

  const handleDeleteInventory = async (inventoryId) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await axios.delete(`/organization/inventory/${inventoryId}`);
        alert('Inventory deleted successfully!');
        fetchDashboardData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting inventory');
      }
    }
  };

  const getInventoryStats = () => {
    const stats = {};
    inventory.forEach(item => {
      if (item.status === 'available') {
        stats[item.bloodGroup] = (stats[item.bloodGroup] || 0) + item.units;
      }
    });
    return stats;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user.isApproved) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Your organization is pending approval. Please wait for admin verification.</span>
        </div>
      </div>
    );
  }

  const inventoryStats = getInventoryStats();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Building className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Organization Dashboard</h1>
            <p className="text-gray-600">
              {user.organizationName}
              {user.organizationType ? ` - ${user.organizationType.replace('_', ' ').toUpperCase()}` : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-700">{requests.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Inventory</p>
                <p className="text-2xl font-bold text-green-700">
                  {Object.values(inventoryStats).reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Transactions</p>
                <p className="text-2xl font-bold text-blue-700">{transactions.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Unverified Donors</p>
                <p className="text-2xl font-bold text-red-700">{unverifiedDonors.length}</p>
              </div>
              <Users className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-2 overflow-x-auto scrollbar-hide md:space-x-8 md:px-6">
            {['overview', 'requests', 'inventory', 'verify-donors', 'transactions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.replace('-', ' ').replace(/^\w/, (c) => c.toUpperCase())}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Current Blood Inventory</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                  <div key={group} className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-xl font-bold text-red-600">{group}</div>
                    <div className="text-2xl font-bold text-gray-800">{inventoryStats[group] || 0}</div>
                    <div className="text-sm text-gray-500">Units</div>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Pending Requests</h4>
                  <div className="space-y-3">
                    {requests.slice(0, 3).map((request) => (
                      <div key={request._id} className="border border-gray-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-800">
                          {request.requestType === 'donation' ? 'Donation' : 'Blood Request'} - {request.bloodGroup}
                        </p>
                        <p className="text-xs text-gray-500">
                          By: {request.requester?.name} ({request.requester?.role})
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Recent Transactions</h4>
                  <div className="space-y-3">
                    {transactions.slice(0, 3).map((transaction) => (
                      <div key={transaction._id} className="border border-gray-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-800">
                          {transaction.type.toUpperCase()} - {transaction.bloodGroup}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.units} units - {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Pending Requests</h3>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {request.requestType === 'donation' ? 'Donation Request' : 'Blood Request'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          By: {request.requester?.name} ({request.requester?.email})
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.bloodGroup} - {request.units} units
                        </p>
                        {request.urgency && (
                          <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                            request.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                            request.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                            request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {request.urgency.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{request.reason}</p>

                    {request.patientName && (
                      <p className="text-sm text-gray-600 mb-2">
                        Patient: {request.patientName}
                        {request.hospitalName && ` at ${request.hospitalName}`}
                      </p>
                    )}

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleRequestAction(request._id, 'approved', 'Request approved and processed.')}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Reason for rejection (optional):');
                          handleRequestAction(request._id, 'rejected', notes || 'Request rejected.');
                        }}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Inventory</h3>
                <form onSubmit={handleAddInventory} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={newInventory.bloodGroup}
                    onChange={(e) => setNewInventory({ ...newInventory, bloodGroup: e.target.value })}
                    className="select-field"
                    required
                  >
                    <option value="">Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    placeholder="Units"
                    value={newInventory.units}
                    onChange={(e) => setNewInventory({ ...newInventory, units: e.target.value })}
                    className="input-field"
                    required
                  />
                  <input
                    type="date"
                    placeholder="Expiry Date"
                    value={newInventory.expiryDate}
                    onChange={(e) => setNewInventory({ ...newInventory, expiryDate: e.target.value })}
                    className="input-field"
                    required
                  />
                  <button type="submit" className="btn-primary">Add Inventory</button>
                </form>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Inventory</h3>
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Expiry</th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Donor</th>
                        <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventory.map((item) => (
                        <tr key={item._id}>
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                            {item.bloodGroup}
                          </td>
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                            {item.units}
                          </td>
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.status === 'available' ? 'bg-green-100 text-green-800' :
                              item.status === 'expired' ? 'bg-red-100 text-red-800' :
                              item.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden md:table-cell">
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </td>
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden lg:table-cell">
                            {item.donorId?.name || 'N/A'}
                          </td>
                          <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium">
                            <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => {
                                const newUnits = prompt('New units count:', item.units);
                                if (newUnits) handleUpdateInventory(item._id, { units: parseInt(newUnits) });
                              }}
                              className="text-blue-600 hover:text-blue-900 text-left"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteInventory(item._id)}
                              className="text-red-600 hover:text-red-900 text-left"
                            >
                              Delete
                            </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verify-donors' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Unverified Donors</h3>
              <div className="space-y-4">
                {unverifiedDonors.map((donor) => (
                  <div key={donor._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{donor.name}</h4>
                        <p className="text-sm text-gray-600">{donor.email}</p>
                        <p className="text-sm text-gray-600">Phone: {donor.phone}</p>
                        <p className="text-sm text-gray-600">
                          Blood Group: <span className="font-medium">{donor.bloodGroup}</span>
                        </p>
                        <p className="text-sm text-gray-600">Age: {donor.age}, Weight: {donor.weight}kg</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVerifyDonor(donor._id, donor.bloodGroup, true)}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Verify</span>
                        </button>
                        <button
                          onClick={() => {
                            const newBloodGroup = prompt('Correct blood group:', donor.bloodGroup);
                            if (newBloodGroup) {
                              handleVerifyDonor(donor._id, newBloodGroup, true);
                            }
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                        >
                          Correct & Verify
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Transaction History</h3>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Donor</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Recipient</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction._id}>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            transaction.type === 'donation' ? 'bg-green-100 text-green-800' :
                            transaction.type === 'distribution' ? 'bg-blue-100 text-blue-800' :
                            transaction.type === 'transfer' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                          {transaction.bloodGroup}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                          {transaction.units}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden md:table-cell">
                          {transaction.donor?.name || 'N/A'}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden lg:table-cell">
                          {transaction.recipient?.name || transaction.recipient?.hospitalName || 'N/A'}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-500 hidden xl:table-cell">
                          {transaction.notes || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboard;