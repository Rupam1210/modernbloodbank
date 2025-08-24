import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Heart, Calendar, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [bloodCamps, setBloodCamps] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newRequest, setNewRequest] = useState({
    type: 'donation',
    bloodGroup: '',
    units: 1,
    reason: '',
    urgency: 'medium',
    patientName: '',
    hospitalName: '',
    contactNumber: '',
    requiredBy: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [requestsRes, campsRes, historyRes] = await Promise.all([
        axios.get('/donor/requests'),
        axios.get('/donor/blood-camps/registered'),
        axios.get('/donor/donation-history')
      ]);

      setRequests(requestsRes.data);
      setBloodCamps(campsRes.data);
      setDonationHistory(historyRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      const endpoint = newRequest.type === 'donation' 
        ? '/donor/donation-request'
        : '/donor/blood-request';

      await axios.post(endpoint, newRequest);
      alert('Request submitted successfully!');
      setNewRequest({
        type: 'donation',
        bloodGroup: '',
        units: 1,
        reason: '',
        urgency: 'medium',
        patientName: '',
        hospitalName: '',
        contactNumber: '',
        requiredBy: ''
      });
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting request');
    }
  };

  const canDonate = () => {
    if (!user.lastDonation) return true;
    const daysSince = Math.floor((Date.now() - new Date(user.lastDonation).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince >= 30;
  };

  const getDaysUntilNextDonation = () => {
    if (!user.lastDonation) return 0;
    const daysSince = Math.floor((Date.now() - new Date(user.lastDonation).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysSince);
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Heart className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.name}!</h1>
            <p className="text-gray-600">
              Blood Group: <span className="font-semibold text-red-600">{user.bloodGroup}</span>
              {user.isBloodGroupVerified ? (
                <CheckCircle className="inline h-4 w-4 text-green-500 ml-2" />
              ) : (
                <AlertCircle className="inline h-4 w-4 text-yellow-500 ml-2" />
              )}
            </p>
          </div>
        </div>

        {!user.isBloodGroupVerified && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>Your blood group needs to be verified before you can donate.</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Donation Status</p>
                <p className="text-2xl font-bold text-red-700">
                  {canDonate() ? 'Ready' : `${getDaysUntilNextDonation()} days left`}
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Requests</p>
                <p className="text-2xl font-bold text-blue-700">{requests.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Donations Made</p>
                <p className="text-2xl font-bold text-green-700">{donationHistory.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'make-request', 'my-requests', 'blood-camps'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-red-500 text-red-600'
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
              <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Recent Requests</h4>
                  <div className="space-y-3">
                    {requests.slice(0, 3).map((request) => (
                      <div key={request._id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {request.requestType === 'donation' ? 'Donation Request' : 'Blood Request'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(request.requestDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Upcoming Blood Camps</h4>
                  <div className="space-y-3">
                    {bloodCamps.slice(0, 3).map((camp) => (
                      <div key={camp._id} className="border border-gray-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-800">{camp.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(camp.date).toLocaleDateString()} at {camp.startTime}
                        </p>
                        <p className="text-xs text-gray-600">{camp.venue}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'make-request' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Make a Request</h3>
              <form onSubmit={handleSubmitRequest} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Type
                  </label>
                  <select
                    value={newRequest.type}
                    onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value })}
                    className="select-field"
                  >
                    <option value="donation">Donation Request</option>
                    <option value="blood_request">Blood Request</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group
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
                      Units
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={newRequest.units}
                      onChange={(e) => setNewRequest({ ...newRequest, units: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                {newRequest.type === 'blood_request' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency Level
                      </label>
                      <select
                        value={newRequest.urgency}
                        onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
                        className="select-field"
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
                          Hospital Name
                        </label>
                        <input
                          type="text"
                          value={newRequest.hospitalName}
                          onChange={(e) => setNewRequest({ ...newRequest, hospitalName: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Number
                        </label>
                        <input
                          type="tel"
                          value={newRequest.contactNumber}
                          onChange={(e) => setNewRequest({ ...newRequest, contactNumber: e.target.value })}
                          className="input-field"
                        />
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
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                    className="input-field"
                    rows="3"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={newRequest.type === 'donation' && (!canDonate() || !user.isBloodGroupVerified)}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
              </form>
            </div>
          )}

          {activeTab === 'my-requests' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">My Requests</h3>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {request.requestType === 'donation' ? 'Donation Request' : 'Blood Request'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {request.bloodGroup} - {request.units} units
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
                      {request.urgency && (
                        <span className={`px-2 py-1 rounded ${
                          request.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                          request.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                          request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {request.urgency.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {request.adminNotes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Admin Notes:</span> {request.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'blood-camps' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Registered Blood Camps</h3>
              <div className="space-y-4">
                {bloodCamps.map((camp) => (
                  <div key={camp._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-800">{camp.title}</h4>
                        <p className="text-sm text-gray-600">
                          Organized by: {camp.organizer?.organizationName || camp.organizer?.name}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        camp.status === 'completed' ? 'bg-green-100 text-green-800' :
                        camp.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                        camp.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {camp.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{camp.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><span className="font-medium">Date:</span> {new Date(camp.date).toLocaleDateString()}</p>
                        <p><span className="font-medium">Time:</span> {camp.startTime} - {camp.endTime}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Venue:</span> {camp.venue}</p>
                        <p><span className="font-medium">Contact:</span> {camp.contactNumber}</p>
                      </div>
                    </div>
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

export default DonorDashboard;