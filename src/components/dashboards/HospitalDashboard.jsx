import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Building2, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const HospitalDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newRequest, setNewRequest] = useState({
    bloodGroup: '',
    units: 1,
    urgency: 'medium',
    reason: '',
    patientName: '',
    contactNumber: '',
    requiredBy: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/hospital/requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/hospital/blood-request', newRequest);
      alert('Blood request submitted successfully!');
      setNewRequest({
        bloodGroup: '',
        units: 1,
        urgency: 'medium',
        reason: '',
        patientName: '',
        contactNumber: '',
        requiredBy: ''
      });
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting request');
    }
  };

  const getStatusCounts = () => {
    return {
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      completed: requests.filter(r => r.status === 'completed').length,
      rejected: requests.filter(r => r.status === 'rejected').length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hospital Dashboard</h1>
            <p className="text-gray-600">
              {user.hospitalName} - License: {user.licenseNumber}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-700">{statusCounts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-700">{statusCounts.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-blue-700">{statusCounts.completed}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Total Requests</p>
                <p className="text-2xl font-bold text-red-700">{requests.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'make-request', 'my-requests', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
              <h3 className="text-lg font-semibold text-gray-800">Recent Requests</h3>
              <div className="space-y-4">
                {requests.slice(0, 5).map((request) => (
                  <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">Blood Request</h4>
                        <p className="text-sm text-gray-600">
                          {request.bloodGroup} - {request.units} units
                          {request.patientName && ` for ${request.patientName}`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Requested: {new Date(request.requestDate).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded ${
                        request.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                        request.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                        request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {request.urgency.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'make-request' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Request Blood</h3>
              <form onSubmit={handleSubmitRequest} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group *
                    </label>
                    <select
                      value={newRequest.bloodGroup}
                      onChange={(e) => setNewRequest({ ...newRequest, bloodGroup: e.target.value })}
                      className="select-field"
                      required
                    >
                      <option value="">Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Units Required *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newRequest.units}
                      onChange={(e) => setNewRequest({ ...newRequest, units: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level *
                  </label>
                  <select
                    value={newRequest.urgency}
                    onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
                    className="select-field"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name
                    </label>
                    <input
                      type="text"
                      value={newRequest.patientName}
                      onChange={(e) => setNewRequest({ ...newRequest, patientName: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      value={newRequest.contactNumber}
                      onChange={(e) => setNewRequest({ ...newRequest, contactNumber: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required By
                  </label>
                  <input
                    type="date"
                    value={newRequest.requiredBy}
                    onChange={(e) => setNewRequest({ ...newRequest, requiredBy: e.target.value })}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Request *
                  </label>
                  <textarea
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                    className="input-field"
                    rows="4"
                    placeholder="Please provide details about the medical necessity..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full md:w-auto"
                >
                  Submit Blood Request
                </button>
              </form>
            </div>
          )}

          {activeTab === 'my-requests' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Active Requests</h3>
              <div className="space-y-4">
                {requests.filter(r => ['pending', 'approved'].includes(r.status)).map((request) => (
                  <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">Blood Request</h4>
                        <p className="text-sm text-gray-600">
                          {request.bloodGroup} - {request.units} units
                          {request.patientName && ` for ${request.patientName}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {request.requiredBy && `Due: ${new Date(request.requiredBy).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Requested: {new Date(request.requestDate).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded ${
                        request.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                        request.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                        request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {request.urgency.toUpperCase()}
                      </span>
                    </div>
                    {request.adminNotes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Organization Notes:</span> {request.adminNotes}
                        </p>
                      </div>
                    )}
                    {request.organization && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          Handled by: {request.organization.organizationName || request.organization.name}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Request History</h3>
              <div className="space-y-4">
                {requests.filter(r => ['completed', 'rejected'].includes(r.status)).map((request) => (
                  <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">Blood Request</h4>
                        <p className="text-sm text-gray-600">
                          {request.bloodGroup} - {request.units} units
                          {request.patientName && ` for ${request.patientName}`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Requested: {new Date(request.requestDate).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded ${
                        request.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                        request.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                        request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {request.urgency.toUpperCase()}
                      </span>
                    </div>
                    {request.adminNotes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Organization Notes:</span> {request.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;