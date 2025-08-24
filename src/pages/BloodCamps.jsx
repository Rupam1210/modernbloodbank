import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Calendar, MapPin, Users, Clock, Plus, Edit2, Trash2, User, Phone } from 'lucide-react';

const BloodCamps = () => {
  const { user } = useAuth();
  const [bloodCamps, setBloodCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCamp, setEditingCamp] = useState(null);
  const [newCamp, setNewCamp] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    address: '',
    contactPerson: '',
    contactNumber: '',
    targetUnits: 50,
    requirements: 'Age 18-65, Weight >50kg, Good health'
  });

  useEffect(() => {
    fetchBloodCamps();
  }, []);

  const fetchBloodCamps = async () => {
    try {
      const response = await axios.get('/blood-camps');
      setBloodCamps(response.data);
    } catch (error) {
      console.error('Error fetching blood camps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCamp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/blood-camps', newCamp);
      alert('Blood camp created successfully!');
      setNewCamp({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        venue: '',
        address: '',
        contactPerson: '',
        contactNumber: '',
        targetUnits: 50,
        requirements: 'Age 18-65, Weight >50kg, Good health'
      });
      setShowCreateForm(false);
      fetchBloodCamps();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating blood camp');
    }
  };

  const handleUpdateCamp = async (campId, updates) => {
    try {
      await axios.put(`/blood-camps/${campId}`, updates);
      alert('Blood camp updated successfully!');
      setEditingCamp(null);
      fetchBloodCamps();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating blood camp');
    }
  };

  const handleDeleteCamp = async (campId) => {
    if (window.confirm('Are you sure you want to delete this blood camp?')) {
      try {
        await axios.delete(`/blood-camps/${campId}`);
        alert('Blood camp deleted successfully!');
        fetchBloodCamps();
      } catch (error) {
        alert(error.response?.data?.message || 'Error deleting blood camp');
      }
    }
  };

  const handleRegisterForCamp = async (campId) => {
    try {
      await axios.post(`/donor/blood-camp/${campId}/register`);
      alert('Successfully registered for the blood camp!');
      fetchBloodCamps();
    } catch (error) {
      alert(error.response?.data?.message || 'Error registering for blood camp');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const isUserRegistered = (camp) => {
    if (!user || user.role !== 'donor') return false;
    return camp.registrations?.some(reg => reg.donor === user.id);
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Blood Donation Camps</h1>
            <p className="text-gray-600">Join upcoming blood donation drives in your community</p>
          </div>
          {user && user.role === 'organization' && user.isApproved && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              <Plus className="h-5 w-5" />
              <span>Create Blood Camp</span>
            </button>
          )}
        </div>

        {/* Create/Edit Form Modal */}
        {(showCreateForm || editingCamp) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  {editingCamp ? 'Edit Blood Camp' : 'Create New Blood Camp'}
                </h2>
                <form onSubmit={editingCamp ? 
                  (e) => {
                    e.preventDefault();
                    handleUpdateCamp(editingCamp._id, editingCamp);
                  } : handleCreateCamp
                } className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Camp Title *
                    </label>
                    <input
                      type="text"
                      value={editingCamp ? editingCamp.title : newCamp.title}
                      onChange={(e) => editingCamp ? 
                        setEditingCamp({...editingCamp, title: e.target.value}) :
                        setNewCamp({...newCamp, title: e.target.value})
                      }
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={editingCamp ? editingCamp.description : newCamp.description}
                      onChange={(e) => editingCamp ? 
                        setEditingCamp({...editingCamp, description: e.target.value}) :
                        setNewCamp({...newCamp, description: e.target.value})
                      }
                      className="input-field"
                      rows="3"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={editingCamp ? 
                          editingCamp.date?.split('T')[0] : 
                          newCamp.date
                        }
                        onChange={(e) => editingCamp ? 
                          setEditingCamp({...editingCamp, date: e.target.value}) :
                          setNewCamp({...newCamp, date: e.target.value})
                        }
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={editingCamp ? editingCamp.startTime : newCamp.startTime}
                        onChange={(e) => editingCamp ? 
                          setEditingCamp({...editingCamp, startTime: e.target.value}) :
                          setNewCamp({...newCamp, startTime: e.target.value})
                        }
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time *
                      </label>
                      <input
                        type="time"
                        value={editingCamp ? editingCamp.endTime : newCamp.endTime}
                        onChange={(e) => editingCamp ? 
                          setEditingCamp({...editingCamp, endTime: e.target.value}) :
                          setNewCamp({...newCamp, endTime: e.target.value})
                        }
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue *
                    </label>
                    <input
                      type="text"
                      value={editingCamp ? editingCamp.venue : newCamp.venue}
                      onChange={(e) => editingCamp ? 
                        setEditingCamp({...editingCamp, venue: e.target.value}) :
                        setNewCamp({...newCamp, venue: e.target.value})
                      }
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Address *
                    </label>
                    <textarea
                      value={editingCamp ? editingCamp.address : newCamp.address}
                      onChange={(e) => editingCamp ? 
                        setEditingCamp({...editingCamp, address: e.target.value}) :
                        setNewCamp({...newCamp, address: e.target.value})
                      }
                      className="input-field"
                      rows="2"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        value={editingCamp ? editingCamp.contactPerson : newCamp.contactPerson}
                        onChange={(e) => editingCamp ? 
                          setEditingCamp({...editingCamp, contactPerson: e.target.value}) :
                          setNewCamp({...newCamp, contactPerson: e.target.value})
                        }
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        value={editingCamp ? editingCamp.contactNumber : newCamp.contactNumber}
                        onChange={(e) => editingCamp ? 
                          setEditingCamp({...editingCamp, contactNumber: e.target.value}) :
                          setNewCamp({...newCamp, contactNumber: e.target.value})
                        }
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Units
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editingCamp ? editingCamp.targetUnits : newCamp.targetUnits}
                      onChange={(e) => editingCamp ? 
                        setEditingCamp({...editingCamp, targetUnits: parseInt(e.target.value)}) :
                        setNewCamp({...newCamp, targetUnits: parseInt(e.target.value)})
                      }
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requirements
                    </label>
                    <textarea
                      value={editingCamp ? editingCamp.requirements : newCamp.requirements}
                      onChange={(e) => editingCamp ? 
                        setEditingCamp({...editingCamp, requirements: e.target.value}) :
                        setNewCamp({...newCamp, requirements: e.target.value})
                      }
                      className="input-field"
                      rows="2"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingCamp(null);
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      {editingCamp ? 'Update Camp' : 'Create Camp'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Blood Camps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bloodCamps.map((camp) => (
            <div key={camp._id} className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{camp.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(camp.status)}`}>
                      {camp.status.toUpperCase()}
                    </span>
                  </div>
                  {user && user.role === 'organization' && camp.organizer._id === user.id && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingCamp(camp)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCamp(camp._id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{camp.description}</p>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(camp.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{camp.startTime} - {camp.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{camp.venue}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{camp.registrations?.length || 0} registered / {camp.targetUnits} target</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{camp.contactPerson}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{camp.contactNumber}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-3">
                    <span className="font-medium">Requirements:</span> {camp.requirements}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    <span className="font-medium">Organized by:</span> {camp.organizer?.organizationName || camp.organizer?.name}
                  </p>

                  {user && user.role === 'donor' && camp.status === 'upcoming' && (
                    <button
                      onClick={() => handleRegisterForCamp(camp._id)}
                      disabled={isUserRegistered(camp)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                        isUserRegistered(camp)
                          ? 'bg-green-100 text-green-800 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {isUserRegistered(camp) ? 'Already Registered' : 'Register Now'}
                    </button>
                  )}
                  
                  {camp.status === 'completed' && (
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Units Collected:</span> {camp.collectedUnits} / {camp.targetUnits}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min((camp.collectedUnits / camp.targetUnits) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {bloodCamps.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Blood Camps Available</h3>
            <p className="text-gray-500">
              {user && user.role === 'organization' 
                ? 'Create your first blood donation camp to get started.'
                : 'Check back soon for upcoming blood donation camps in your area.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodCamps;