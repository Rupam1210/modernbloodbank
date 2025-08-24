import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Activity, Calendar, Shield, Award } from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const [bloodAvailability, setBloodAvailability] = useState([]);
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalCamps: 0,
    unitsCollected: 0
  });

  useEffect(() => {
    fetchBloodAvailability();
  }, []);

  const fetchBloodAvailability = async () => {
    try {
      const response = await axios.get('/analytics/blood-availability');
      setBloodAvailability(response.data);
    } catch (error) {
      console.error('Error fetching blood availability:', error);
    }
  };

  const features = [
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Separate dashboards for donors, hospitals, organizations, and admins'
    },
    {
      icon: Activity,
      title: 'Real-Time Inventory',
      description: 'Live tracking of blood units across all participating organizations'
    },
    {
      icon: Calendar,
      title: 'Blood Camps',
      description: 'Organize and participate in community blood donation drives'
    },
    {
      icon: Shield,
      title: 'Secure & Verified',
      description: 'Blood group verification and secure handling of medical data'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-16 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl">
        <div className="blood-drop">
          <Heart className="h-20 w-20 text-red-600 mx-auto" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800">
          Save Lives with
          <span className="text-red-600"> Every Drop</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect with blood banks, hospitals, and donors in your community. 
          Making blood donation easier, faster, and more impactful.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition duration-300 font-semibold"
          >
            Become a Donor
          </Link>
          <Link
            to="/blood-camps"
            className="bg-white text-red-600 border-2 border-red-600 px-8 py-3 rounded-lg hover:bg-red-50 transition duration-300 font-semibold"
          >
            Find Blood Camps
          </Link>
        </div>
      </section>

      {/* Blood Availability Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Current Blood Availability</h2>
          <p className="text-gray-600">Real-time inventory across all partner organizations</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {bloodAvailability.map((blood) => (
            <div key={blood.bloodGroup} className="card-hover bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">{blood.bloodGroup}</div>
              <div className="text-3xl font-bold text-gray-800 mb-1">{blood.totalUnits}</div>
              <div className="text-sm text-gray-500">Units Available</div>
              <div className="text-xs text-gray-400 mt-2">
                {blood.organizationCount} Organizations
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Why Choose BloodBank+?</h2>
          <p className="text-gray-600">Comprehensive blood management system for the modern world</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="card-hover bg-white p-6 rounded-lg shadow-md text-center">
                <IconComponent className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-100 p-8 rounded-2xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">How It Works</h2>
          <p className="text-gray-600">Simple steps to start saving lives</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Register</h3>
            <p className="text-gray-600">Sign up as a donor, hospital, or organization with your details</p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Connect</h3>
            <p className="text-gray-600">Find nearby blood banks or donors based on your needs</p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Save Lives</h3>
            <p className="text-gray-600">Donate or receive blood and make a real difference</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 py-16 bg-red-600 text-white rounded-2xl">
        <Award className="h-16 w-16 mx-auto" />
        <h2 className="text-3xl font-bold">Ready to Make a Difference?</h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">
          Join thousands of donors and organizations working together to ensure no one goes without the blood they need.
        </p>
        <Link
          to="/register"
          className="inline-block bg-white text-red-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition duration-300 font-semibold"
        >
          Get Started Today
        </Link>
      </section>
    </div>
  );
};

export default Home;