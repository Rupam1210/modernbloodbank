import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import DonorDashboard from '../components/dashboards/DonorDashboard';
import HospitalDashboard from '../components/dashboards/HospitalDashboard';
import OrganizationDashboard from '../components/dashboards/OrganizationDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'donor':
        return <DonorDashboard />;
      case 'hospital':
        return <HospitalDashboard />;
      case 'organization':
        return <OrganizationDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome to BloodBank+
            </h2>
            <p className="text-gray-600 mt-4">
              Your dashboard is being prepared...
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;