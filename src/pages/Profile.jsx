import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { User, Edit, Save, X, Shield, Calendar, MapPin, Phone, Mail, Building, Heart } from 'lucide-react';

const Profile = () => {
  const { user, fetchUser } = useAuth();
  const [profile, setProfile] = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalProfile, setOriginalProfile] = useState({});

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      let endpoint = '';
      switch (user?.role) {
        case 'donor':
          endpoint = '/donor/profile';
          break;
        case 'hospital':
          endpoint = '/hospital/profile';
          break;
        case 'organization':
          endpoint = '/organization/profile';
          break;
        default:
          setProfile(user);
          setOriginalProfile(user);
          setLoading(false);
          return;
      }

      const response = await axios.get(endpoint);
      setProfile(response.data);
      setOriginalProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to user data from context
      setProfile(user);
      setOriginalProfile(user);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let endpoint = '';
      switch (user?.role) {
        case 'donor':
          endpoint = '/donor/profile';
          break;
        case 'hospital':
          endpoint = '/hospital/profile';
          break;
        case 'organization':
          endpoint = '/organization/profile';
          break;
        default:
          alert('Profile update not available for this role');
          return;
      }

      const response = await axios.put(endpoint, profile);
      setProfile(response.data[user.role] || response.data);
      setOriginalProfile(response.data[user.role] || response.data);
      setEditing(false);
      alert('Profile updated successfully!');
      
      // Refresh user data in context
      await fetchUser();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setEditing(false);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'donor': return <Heart className="h-6 w-6 text-red-600" />;
      case 'hospital': return <Building className="h-6 w-6 text-blue-600" />;
      case 'organization': return <Building className="h-6 w-6 text-green-600" />;
      case 'admin': return <Shield className="h-6 w-6 text-purple-600" />;
      default: return <User className="h-6 w-6 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'donor': return 'bg-red-100 text-red-800';
      case 'hospital': return 'bg-blue-100 text-blue-800';
      case 'organization': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              {getRoleIcon(profile.role)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(profile.role)}`}>
                  {profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1)}
                </span>
                {profile.role === 'organization' && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profile.isApproved ? 'Approved' : 'Pending Approval'}
                  </span>
                )}
                {profile.role === 'donor' && profile.isBloodGroupVerified !== undefined && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile.isBloodGroupVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Blood Group {profile.isBloodGroupVerified ? 'Verified' : 'Unverified'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Profile Information</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="inline h-4 w-4 mr-1" />
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{profile.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="inline h-4 w-4 mr-1" />
                Email Address
              </label>
              <p className="text-gray-900">{profile.email}</p>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="input-field"
                />
              ) : (
                <p className="text-gray-900">{profile.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline h-4 w-4 mr-1" />
                Address
              </label>
              {editing ? (
                <textarea
                  value={profile.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="input-field"
                  rows="3"
                />
              ) : (
                <p className="text-gray-900">{profile.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline h-4 w-4 mr-1" />
                Member Since
              </label>
              <p className="text-gray-900">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Role-Specific Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700 border-b pb-2">
              {profile.role === 'donor' && 'Donor Information'}
              {profile.role === 'hospital' && 'Hospital Information'}
              {profile.role === 'organization' && 'Organization Information'}
              {profile.role === 'admin' && 'Admin Information'}
            </h3>

            {/* Donor Specific Fields */}
            {profile.role === 'donor' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-red-600">{profile.bloodGroup}</span>
                    {profile.isBloodGroupVerified ? (
                      <span className="text-green-600 text-sm">✓ Verified</span>
                    ) : (
                      <span className="text-yellow-600 text-sm">⚠ Unverified</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    {editing ? (
                      <input
                        type="number"
                        min="18"
                        max="65"
                        value={profile.age || ''}
                        onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.age} years</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                    {editing ? (
                      <input
                        type="number"
                        min="50"
                        value={profile.weight || ''}
                        onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-gray-900">{profile.weight} kg</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Donation</label>
                  <p className="text-gray-900">
                    {profile.lastDonation 
                      ? new Date(profile.lastDonation).toLocaleDateString()
                      : 'Never donated'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                  {editing ? (
                    <textarea
                      value={profile.medicalHistory || ''}
                      onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                      className="input-field"
                      rows="3"
                      placeholder="Any relevant medical history..."
                    />
                  ) : (
                    <p className="text-gray-900">{profile.medicalHistory || 'No medical history provided'}</p>
                  )}
                </div>
              </>
            )}

            {/* Hospital Specific Fields */}
            {profile.role === 'hospital' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.hospitalName || ''}
                      onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.hospitalName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.licenseNumber || ''}
                      onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.licenseNumber}</p>
                  )}
                </div>
              </>
            )}

            {/* Organization Specific Fields */}
            {profile.role === 'organization' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <p className="text-gray-900">{profile.organizationName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type</label>
                  <p className="text-gray-900">
                    {profile.organizationType?.replace('_', ' ').toUpperCase()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      profile.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {profile.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Admin Information */}
            {profile.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <p className="text-gray-900">System Administrator</p>
                <p className="text-sm text-gray-500">Full system access and management privileges</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Account Security</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Password</h3>
              <p className="text-sm text-gray-600">Last changed: Not available</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Change Password
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
              Enable 2FA
            </button>
          </div>

          {profile.role === 'organization' && !profile.isApproved && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="font-medium text-yellow-800">Pending Verification</p>
                  <p className="text-sm text-yellow-700">
                    Your organization account is pending admin approval. Some features may be limited until verification is complete.
                  </p>
                </div>
              </div>
            </div>
          )}

          {profile.role === 'donor' && !profile.isBloodGroupVerified && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <Heart className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="font-medium text-yellow-800">Blood Group Verification Needed</p>
                  <p className="text-sm text-yellow-700">
                    Your blood group needs to be verified by an organization before you can make donation requests.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;