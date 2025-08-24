import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, Droplet, Activity, Calendar, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';

const Analytics = () => {
  const [bloodAvailability, setBloodAvailability] = useState([]);
  const [donationTrends, setDonationTrends] = useState([]);
  const [requestStats, setRequestStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [availabilityRes, trendsRes, statsRes] = await Promise.all([
        axios.get('/analytics/blood-availability'),
        axios.get('/analytics/donation-trends'),
        axios.get('/analytics/request-stats')
      ]);

      setBloodAvailability(availabilityRes.data);
      setDonationTrends(trendsRes.data);
      setRequestStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  const bloodGroupColors = {
    'A+': '#ef4444',
    'A-': '#dc2626',
    'B+': '#f97316',
    'B-': '#ea580c',
    'AB+': '#eab308',
    'AB-': '#ca8a04',
    'O+': '#22c55e',
    'O-': '#16a34a'
  };

  const getTotalBloodUnits = () => {
    return bloodAvailability.reduce((total, item) => total + item.totalUnits, 0);
  };

  const getTotalOrganizations = () => {
    return bloodAvailability.reduce((total, item) => total + item.organizationCount, 0);
  };

  const getMostAvailableBloodGroup = () => {
    if (bloodAvailability.length === 0) return 'N/A';
    const max = bloodAvailability.reduce((prev, current) => 
      (prev.totalUnits > current.totalUnits) ? prev : current
    );
    return max.bloodGroup;
  };

  const getLeastAvailableBloodGroup = () => {
    if (bloodAvailability.length === 0) return 'N/A';
    const min = bloodAvailability.filter(item => item.totalUnits > 0)
                                   .reduce((prev, current) => 
                                     (prev.totalUnits < current.totalUnits) ? prev : current
                                   );
    return min ? min.bloodGroup : 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <TrendingUp className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Blood Bank Analytics</h1>
            <p className="text-gray-600">Real-time insights into blood availability and donation trends</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Total Blood Units</p>
                <p className="text-2xl font-bold text-red-700">{getTotalBloodUnits()}</p>
                <p className="text-xs text-red-500">Available in system</p>
              </div>
              <Droplet className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Active Organizations</p>
                <p className="text-2xl font-bold text-blue-700">{getTotalOrganizations()}</p>
                <p className="text-xs text-blue-500">Contributing blood banks</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Most Available</p>
                <p className="text-2xl font-bold text-green-700">{getMostAvailableBloodGroup()}</p>
                <p className="text-xs text-green-500">Blood group</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-700">{getLeastAvailableBloodGroup()}</p>
                <p className="text-xs text-yellow-500">Needs attention</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Blood Availability Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Group Availability Bar Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Blood Availability by Group</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bloodAvailability}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bloodGroup" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, name === 'totalUnits' ? 'Units Available' : name]}
              />
              <Bar 
                dataKey="totalUnits" 
                fill={(entry) => bloodGroupColors[entry?.bloodGroup] || '#8884d8'}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Blood Group Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Blood Group Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bloodAvailability.filter(item => item.totalUnits > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ bloodGroup, totalUnits, percent }) => 
                  `${bloodGroup}: ${totalUnits} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="totalUnits"
              >
                {bloodAvailability.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={bloodGroupColors[entry.bloodGroup] || COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [
                  value,
                  `Units Available (${props.payload.organizationCount} orgs)`
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donation Trends */}
      {donationTrends.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Donation Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={donationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="_id.month"
                tickFormatter={(month) => {
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  return monthNames[month - 1];
                }}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(month) => {
                  const monthNames = ["January", "February", "March", "April", "May", "June",
                                    "July", "August", "September", "October", "November", "December"];
                  return monthNames[month - 1];
                }}
                formatter={(value, name) => [
                  value,
                  name === 'totalDonations' ? 'Total Units Donated' : 'Number of Donations'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="totalDonations" 
                stroke="#ef4444" 
                fill="#fecaca" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="donationCount" 
                stroke="#3b82f6" 
                fill="#bfdbfe" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Request Status Stats */}
      {requestStats.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Request Status Pie Chart */}
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={requestStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, count, percent }) => 
                      `${_id}: ${count} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {requestStats.map((entry, index) => {
                      const colors = {
                        'pending': '#f59e0b',
                        'approved': '#10b981',
                        'completed': '#3b82f6',
                        'rejected': '#ef4444'
                      };
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={colors[entry._id] || COLORS[index % COLORS.length]} 
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Request Status List */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-700">Request Breakdown</h3>
              {requestStats.map((stat) => {
                const statusColors = {
                  'pending': 'bg-yellow-100 text-yellow-800',
                  'approved': 'bg-green-100 text-green-800',
                  'completed': 'bg-blue-100 text-blue-800',
                  'rejected': 'bg-red-100 text-red-800'
                };

                const statusIcons = {
                  'pending': '⏳',
                  'approved': '✅',
                  'completed': '🎉',
                  'rejected': '❌'
                };

                return (
                  <div key={stat._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{statusIcons[stat._id]}</span>
                      <div>
                        <p className="font-medium text-gray-800 capitalize">{stat._id} Requests</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[stat._id]}`}>
                          {stat._id.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Blood Availability Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Detailed Blood Availability</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Organizations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Availability Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urgency Level</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bloodAvailability.map((item) => {
                const urgencyLevel = item.totalUnits > 20 ? 'Good' : 
                                   item.totalUnits > 10 ? 'Moderate' : 
                                   item.totalUnits > 0 ? 'Low' : 'Critical';
                
                const urgencyColor = item.totalUnits > 20 ? 'bg-green-100 text-green-800' :
                                   item.totalUnits > 10 ? 'bg-yellow-100 text-yellow-800' :
                                   item.totalUnits > 0 ? 'bg-orange-100 text-orange-800' : 
                                   'bg-red-100 text-red-800';

                return (
                  <tr key={item.bloodGroup}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: bloodGroupColors[item.bloodGroup] }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">{item.bloodGroup}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.totalUnits} units
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.organizationCount} organizations
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3" style={{ width: '60px' }}>
                          <div 
                            className={`h-2 rounded-full ${item.totalUnits > 15 ? 'bg-green-500' : 
                                                           item.totalUnits > 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min((item.totalUnits / 30) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {item.totalUnits > 0 ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyColor}`}>
                        {urgencyLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Alert */}
      {bloodAvailability.some(item => item.totalUnits < 5) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            <div>
              <p className="font-bold">Low Stock Alert!</p>
              <p>The following blood groups are critically low: {
                bloodAvailability
                  .filter(item => item.totalUnits < 5)
                  .map(item => item.bloodGroup)
                  .join(', ')
              }</p>
              <p className="text-sm mt-1">Immediate action required to replenish stock.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;