import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NotFound() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!isAuthenticated()) return '/login';
    
    if (user) {
      switch (user.role) {
        case 'admin': return '/admin-dashboard';
        default: return '/login';
      }
    }
    
    return '/login';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">الصفحة غير موجودة</h2>
        <p className="text-gray-600 mb-6">
          عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="space-y-3">
          <Link
            to={getDashboardLink()}
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة إلى لوحة التحكم
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            العودة للصفحة السابقة
          </button>
        </div>
      </div>
    </div>
  );
}