import React from 'react';
import { Heart, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-red-600" />
              <span className="text-xl font-bold">BloodBank+</span>
            </div>
            <p className="text-gray-300 mb-4">
              Connecting donors with those in need. Every drop counts in saving lives.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <Heart className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="/" className="hover:text-red-400 transition duration-200">
                  Home
                </a>
              </li>
              <li>
                <a href="/blood-camps" className="hover:text-red-400 transition duration-200">
                  Blood Camps
                </a>
              </li>
              <li>
                <a href="/analytics" className="hover:text-red-400 transition duration-200">
                  Analytics
                </a>
              </li>
              <li>
                <a href="/register" className="hover:text-red-400 transition duration-200">
                  Join Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@bloodbankplus.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>123 Health Street, Medical City</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 BloodBank+. All rights reserved. Saving lives, one donation at a time.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;