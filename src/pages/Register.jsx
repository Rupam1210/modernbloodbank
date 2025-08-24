import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'donor',
    phone: '',
    address: '',
    // Donor specific fields
    bloodGroup: '',
    age: '',
    weight: '',
    medicalHistory: '',
    // Hospital specific fields
    hospitalName: '',
    licenseNumber: '',
    // Organization specific fields
    organizationName: '',
    organizationType: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const organizationTypes = [
    { value: 'blood_bank', label: 'Blood Bank' },
    { value: 'red_cross', label: 'Red Cross' },
    { value: 'ngo', label: 'NGO' },
    { value: 'hospital_affiliated', label: 'Hospital Affiliated' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Role-specific validations
    if (formData.role === 'donor') {
      if (!formData.bloodGroup || !formData.age || !formData.weight) {
        setError('Please fill in all donor-specific fields');
        return;
      }
      if (formData.age < 18 || formData.age > 65) {
        setError('Donor age must be between 18 and 65');
        return;
      }
      if (formData.weight < 50) {
        setError('Donor weight must be at least 50kg');
        return;
      }
    }

    if (formData.role === 'hospital') {
      if (!formData.hospitalName || !formData.licenseNumber) {
        setError('Please fill in all hospital-specific fields');
        return;
      }
    }

    if (formData.role === 'organization') {
      if (!formData.organizationName || !formData.organizationType) {
        setError('Please fill in all organization-specific fields');
        return;
      }
    }

    setLoading(true);

    // Prepare data based on role
    const { confirmPassword, ...submitData } = formData;
    
    const result = await register(submitData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'donor':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700">
                  Blood Group *
                </label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  required
                  className="select-field mt-1"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Age *
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  required
                  min="18"
                  max="65"
                  className="input-field mt-1"
                  placeholder="Age (18-65)"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Weight (kg) *
              </label>
              <input
                id="weight"
                name="weight"
                type="number"
                required
                min="50"
                className="input-field mt-1"
                placeholder="Weight in kg (minimum 50kg)"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
                Medical History (Optional)
              </label>
              <textarea
                id="medicalHistory"
                name="medicalHistory"
                rows="3"
                className="input-field mt-1"
                placeholder="Any relevant medical history..."
                value={formData.medicalHistory}
                onChange={handleChange}
              />
            </div>
          </>
        );

      case 'hospital':
        return (
          <>
            <div>
              <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700">
                Hospital Name *
              </label>
              <input
                id="hospitalName"
                name="hospitalName"
                type="text"
                required
                className="input-field mt-1"
                placeholder="Enter hospital name"
                value={formData.hospitalName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                License Number *
              </label>
              <input
                id="licenseNumber"
                name="licenseNumber"
                type="text"
                required
                className="input-field mt-1"
                placeholder="Enter license number"
                value={formData.licenseNumber}
                onChange={handleChange}
              />
            </div>
          </>
        );

      case 'organization':
        return (
          <>
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                Organization Name *
              </label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                required
                className="input-field mt-1"
                placeholder="Enter organization name"
                value={formData.organizationName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="organizationType" className="block text-sm font-medium text-gray-700">
                Organization Type *
              </label>
              <select
                id="organizationType"
                name="organizationType"
                required
                className="select-field mt-1"
                value={formData.organizationType}
                onChange={handleChange}
              >
                <option value="">Select Organization Type</option>
                {organizationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <Heart className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our community and start saving lives
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  I am a *
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="select-field mt-1"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="donor">Donor</option>
                  <option value="hospital">Hospital</option>
                  <option value="organization">Organization</option>
                </select>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="input-field mt-1"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field mt-1"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password *
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="input-field pr-10"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password *
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="input-field pr-10"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="input-field mt-1"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows="3"
                  className="input-field mt-1"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Role-specific fields */}
            {renderRoleSpecificFields() && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {formData.role === 'donor' && 'Donor Information'}
                  {formData.role === 'hospital' && 'Hospital Information'}
                  {formData.role === 'organization' && 'Organization Information'}
                </h3>
                {renderRoleSpecificFields()}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-red-600 hover:text-red-500"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;