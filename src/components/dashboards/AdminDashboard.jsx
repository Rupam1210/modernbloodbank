import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Users, Building, Activity, TrendingUp, CheckCircle, XCircle, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, requestsRes, analyticsRes] = await Promise.all([
        axios.get('/admin/dashboard'),
        axios.get('/admin/users?role=organization'),
        axios.get('/admin/blood-requests'),
        axios.get('/admin/analytics')
      ]);

      setStats(statsRes.data);
      setOrganizations(usersRes.data.users);
      setBloodRequests(requestsRes.data.requests);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrganization = async (orgId, isApproved) => {
    try {
      await axios.put(`/admin/organizations/${orgId}/approval`, {
        isApproved
      });
      alert(`Organization ${isApproved ? 'approved' : 'rejected'} successfully!`);
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating organization status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/admin/users/${userId}`);
        alert('User deleted successfully!');
        fetchDashboardData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting user');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">System Overview & Management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Users</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalUsers}</p>
                <p className="text-xs text-blue-500">
                  {stats.totalDonors} Donors, {stats.totalHospitals} Hospitals
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Organizations</p>
                <p className="text-2xl font-bold text-green-700">{stats.totalOrganizations}</p>
                <p className="text-xs text-green-500">
                  {stats.pendingOrganizations} Pending Approval
                </p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Blood Requests</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.totalBloodRequests}</p>
                <p className="text-xs text-yellow-500">
                  {stats.pendingRequests} Pending
                </p>
              </div>
              <Activity className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Blood Units</p>
                <p className="text-2xl font-bold text-red-700">{stats.totalBloodUnits}</p>
                <p className="text-xs text-red-500">Available in Inventory</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'organizations', 'users', 'requests', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">System Analytics</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Blood Group Distribution</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analytics.bloodGroupDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="_id"
                      >
                        {analytics.bloodGroupDistribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Monthly User Registrations</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={analytics.monthlyRegistrations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="_id.month"
                        tickFormatter={(month) => `Month ${month}`}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'organizations' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Organizations</h3>
              <div className="space-y-4">
                {organizations.map((org) => (
                  <div key={org._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-800">{org.organizationName}</h4>
                        <p className="text-sm text-gray-600">{org.name} - {org.email}</p>
                        <p className="text-sm text-gray-600">
                          Type: {org.organizationType?.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600">Phone: {org.phone}</p>
                        <p className="text-sm text-gray-600">Address: {org.address}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          org.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {org.isApproved ? 'Approved' : 'Pending'}
                        </span>
                        <div className="flex space-x-2">
                          {!org.isApproved && (
                            <>
                              <button
                                onClick={() => handleApproveOrganization(org._id, true)}
                                className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition"
                              >
                                <CheckCircle className="h-3 w-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleApproveOrganization(org._id, false)}
                                className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
                              >
                                <XCircle className="h-3 w-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteUser(org._id)}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Blood Requests</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organization</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bloodRequests.map((request) => (
                      <tr key={request._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(request.requestDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.requester?.name}
                          <br />
                          <span className="text-xs text-gray-500">
                            ({request.requester?.role})
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.requestType === 'donation' ? 'Donation' : 'Blood Request'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {request.bloodGroup}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.units}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {request.urgency && (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              request.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                              request.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                              request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {request.urgency.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.organization?.organizationName || request.organization?.name || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Detailed Analytics</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Blood Inventory by Type</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.inventoryByBloodGroup}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalUnits" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-700 mb-4">User Growth Trend</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.monthlyRegistrations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="_id.month"
                        tickFormatter={(month) => `Month ${month}`}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h4 className="text-lg font-semibold text-gray-800">Total Blood Camps</h4>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalBloodCamps}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h4 className="text-lg font-semibold text-gray-800">Total Transactions</h4>
                  <p className="text-3xl font-bold text-green-600">{stats.totalTransactions}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <h4 className="text-lg font-semibold text-gray-800">System Health</h4>
                  <p className="text-3xl font-bold text-green-600">Good</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">All Users</h3>
              <div className="text-center py-8 text-gray-500">
                <p>User management interface - Click on specific user types in other tabs</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;