import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getVendors } from '../../lib/vendorsApi';
import { supabase } from '../../lib/supabase';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      // Fetch real data from Supabase
      const data = await getVendors();
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('فشل في تحميل البائعين');
      
      // Fallback to mock data if API fails
      setVendors([
        {
          id: 1,
          store_name: 'متجر كوفي',
          phone: '0599123456',
          address: 'غزة - الرمال',
          description: 'متجر متخصص في القهوة والمشروبات الساخنة',
          rating: 4.8,
          rating_count: 156,
          status: 'active',
          logo_url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=100&auto=format&fit=crop',
          banner_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop',
          delivery_type: 'distance',
          delivery_radius: 5,
          price_per_km: 2
        },
        {
          id: 2,
          store_name: 'متجر الشاي',
          phone: '0599234567',
          address: 'غزة - النصر',
          description: 'متجر متخصص في الشاي والأعشاب',
          rating: 4.5,
          rating_count: 98,
          status: 'active',
          logo_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=100&auto=format&fit=crop',
          banner_url: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=400&auto=format&fit=crop',
          delivery_type: 'fixed',
          delivery_radius: null,
          price_per_km: null
        },
        {
          id: 3,
          store_name: 'متجر العصائر',
          phone: '0599345678',
          address: 'غزة - التفاح',
          description: 'متجر متخصص في العصائر الطازجة',
          rating: 4.7,
          rating_count: 120,
          status: 'active',
          logo_url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=100&auto=format&fit=crop',
          banner_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=400&auto=format&fit=crop',
          delivery_type: 'distance',
          delivery_radius: 3,
          price_per_km: 3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (vendorId, newStatus) => {
    try {
      // تحديث حالة البائع
      const { error } = await supabase.rpc('update_vendor_status', {
        p_vendor_id: vendorId,
        p_status: newStatus
      });
      
      if (error) throw error;
      
      // تحديث قائمة البائعين في واجهة المستخدم
      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, status: newStatus } : v
      ));
      
      toast.success(`تم تغيير حالة البائع إلى ${getStatusText(newStatus)}`);
    } catch (error) {
      console.error('Error updating vendor status:', error);
      toast.error('فشل في تحديث حالة البائع');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'مفتوح';
      case 'inactive': return 'مغلق';
      case 'busy': return 'مشغول';
      case 'pending': return 'معلق';
      case 'suspended': return 'موقوف';
      default: return status;
    }
  };

  const getDeliveryTypeText = (type) => {
    switch (type) {
      case 'distance': return 'حسب المسافة';
      case 'fixed': return 'سعر ثابت';
      case 'zones': return 'مناطق';
      default: return type;
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {vendors.map(vendor => (
        <div key={vendor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          {vendor.banner_url && (
            <img 
              src={vendor.banner_url} 
              alt={`${vendor.store_name} banner`}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
              }}
            />
          )}
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                {vendor.logo_url && (
                  <img 
                    src={vendor.logo_url} 
                    alt={vendor.store_name}
                    className="w-10 h-10 rounded-full object-cover ml-3"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/40?text=Logo';
                    }}
                  />
                )}
                <h3 className="text-lg font-semibold">{vendor.store_name}</h3>
              </div>
              <div className="relative inline-block">
                <select
                  value={vendor.status}
                  onChange={(e) => handleStatusChange(vendor.id, e.target.value)}
                  className={`px-2 py-1 text-xs rounded-full ${getStatusColor(vendor.status)} appearance-none pr-8 cursor-pointer`}
                >
                  <option value="active">مفتوح</option>
                  <option value="inactive">مغلق</option>
                  <option value="busy">مشغول</option>
                  <option value="pending">معلق</option>
                  <option value="suspended">موقوف</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-yellow-500">★</span>
              <span className="ml-1">{vendor.rating}</span>
              <span className="text-gray-500 ml-1">({vendor.rating_count})</span>
            </div>
            <p className="text-gray-600 text-sm mt-2">{vendor.description}</p>
            <div className="mt-4 space-y-1 text-sm">
              <p className="text-gray-500">{vendor.address}</p>
              <p className="text-gray-500">{vendor.phone}</p>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {getDeliveryTypeText(vendor.delivery_type)}
                </div>
                {vendor.delivery_type === 'distance' && (
                  <div className="text-sm text-gray-500">
                    {vendor.delivery_radius} كم - ₪{vendor.price_per_km}/كم
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المتجر</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التقييم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العنوان</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التوصيل</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vendors.map(vendor => (
              <tr key={vendor.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {vendor.logo_url && (
                      <img 
                        src={vendor.logo_url} 
                        alt={vendor.store_name}
                        className="w-10 h-10 rounded-full object-cover ml-3"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/40?text=Logo';
                        }}
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{vendor.store_name}</div>
                      <div className="text-gray-500">{vendor.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{vendor.rating}</span>
                    <span className="text-gray-500 ml-1">({vendor.rating_count})</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {vendor.address}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {getDeliveryTypeText(vendor.delivery_type)}
                    </div>
                    {vendor.delivery_type === 'distance' && (
                      <div className="text-sm text-gray-500">
                        {vendor.delivery_radius} كم - ₪{vendor.price_per_km}/كم
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative inline-block">
                    <select
                      value={vendor.status}
                      onChange={(e) => handleStatusChange(vendor.id, e.target.value)}
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(vendor.status)} appearance-none pr-8 cursor-pointer`}
                    >
                      <option value="active">مفتوح</option>
                      <option value="inactive">مغلق</option>
                      <option value="busy">مشغول</option>
                      <option value="pending">معلق</option>
                      <option value="suspended">موقوف</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                      <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">البائعين</h2>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded ${
                viewMode === 'grid' 
                  ? 'bg-white shadow' 
                  : 'hover:bg-gray-200'
              }`}
            >
              عرض شبكي
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded ${
                viewMode === 'table' 
                  ? 'bg-white shadow' 
                  : 'hover:bg-gray-200'
              }`}
            >
              عرض جدول
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? renderGridView() : renderTableView()}
    </div>
  );
}