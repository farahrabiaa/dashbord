import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import VendorForm from '../Vendors/VendorForm';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';
import { deleteVendor, updateVendor } from '../../lib/vendorsApi';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [formData, setFormData] = useState({
    store_name: '',
    phone: '',
    address: '',
    delivery_type: 'distance',
    delivery_radius: 5,
    price_per_km: 2,
    status: 'active',
    logo_url: '',
    banner_url: '',
    categories: [],
    wallet_enabled: false,
    auto_charge: false,
    service_areas: [],
    // بيانات الموقع
    latitude: null,
    longitude: null,
    // بيانات العضوية
    membership: {
      type: 'basic',
      expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // سنة من اليوم
      commission_rate: 10
    },
    // بيانات المتجر المميز
    featured: false,
    featured_until: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], // شهر من اليوم
    featured_order: 1,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // جلب البائعين
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (vendorsError) throw vendorsError;
      setVendors(vendorsData || []);

      // جلب التصنيفات
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('فشل في تحميل البيانات. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const initialFilters = {
    store_name: {
      type: 'text',
      label: 'اسم المتجر',
      placeholder: 'البحث باسم المتجر',
      value: ''
    },
    status: {
      type: 'select',
      label: 'الحالة',
      placeholder: 'جميع الحالات',
      options: [
        { value: 'active', label: 'مفتوح' },
        { value: 'inactive', label: 'مغلق' },
        { value: 'busy', label: 'مشغول' },
        { value: 'pending', label: 'معلق' },
        { value: 'suspended', label: 'موقوف' }
      ],
      value: ''
    },
    delivery_type: {
      type: 'select',
      label: 'نوع التوصيل',
      placeholder: 'جميع الأنواع',
      options: [
        { value: 'distance', label: 'حسب المسافة' },
        { value: 'fixed', label: 'سعر ثابت' },
        { value: 'zones', label: 'مناطق' }
      ],
      value: ''
    },
    featured: {
      type: 'select',
      label: 'التمييز',
      placeholder: 'الكل',
      options: [
        { value: 'true', label: 'مميز' },
        { value: 'false', label: 'غير مميز' }
      ],
      value: ''
    }
  };

  const { filters, filterData, handleFilterChange } = useFilters(initialFilters);

  const handleSubmit = async (e, vendorData) => {
    e.preventDefault();
    try {
      if (!vendorData.store_name || !vendorData.phone || !vendorData.address) {
        toast.error('الرجاء تعبئة جميع الحقول المطلوبة');
        return;
      }

      // التحقق من الحقول الإجبارية حسب نوع التوصيل
      if (vendorData.delivery_type === 'distance') {
        if (!vendorData.delivery_radius || !vendorData.price_per_km) {
          toast.error('الرجاء تعبئة نطاق التوصيل وسعر الكيلومتر');
          return;
        }
      }

      // التحقق من اختيار تصنيف واحد على الأقل
      if (vendorData.categories.length === 0) {
        toast.error('الرجاء اختيار تصنيف واحد على الأقل');
        return;
      }

      // التحقق من تاريخ انتهاء العضوية
      if (!vendorData.membership.expires_at) {
        toast.error('الرجاء تحديد تاريخ انتهاء العضوية');
        return;
      }

      if (editingVendor) {
        // استخدام دالة تحديث البائع من ملف vendorsApi
        await updateVendor(editingVendor.id, vendorData);
        toast.success('تم تحديث البائع بنجاح');
      } else {
        // إضافة بائع جديد
        const { data, error } = await supabase
          .from('vendors')
          .insert([vendorData])
          .select();
        
        if (error) throw error;
        toast.success('تم إضافة البائع بنجاح');
      }

      // إعادة تحميل البيانات
      fetchData();

      // إغلاق النموذج وإعادة تعيين البيانات
      setShowModal(false);
      setEditingVendor(null);
      setFormData({
        store_name: '',
        phone: '',
        address: '',
        delivery_type: 'distance',
        delivery_radius: 5,
        price_per_km: 2,
        status: 'active',
        logo_url: '',
        banner_url: '',
        categories: [],
        wallet_enabled: false,
        auto_charge: false,
        service_areas: [],
        latitude: null,
        longitude: null,
        membership: {
          type: 'basic',
          expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          commission_rate: 10
        },
        featured: false,
        featured_until: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        featured_order: 1
      });
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error(editingVendor ? 'فشل في تحديث البائع' : 'فشل في إضافة البائع');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا البائع؟')) return;

    try {
      setLoading(true);
      
      // استخدام دالة حذف البائع من ملف vendorsApi
      await deleteVendor(id);
      
      // تحديث قائمة البائعين في واجهة المستخدم
      setVendors(vendors.filter(v => v.id !== id));
      
      toast.success('تم حذف البائع بنجاح');
      
      // إعادة تحميل البيانات للتأكد من التحديث
      fetchData();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('فشل في حذف البائع');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (vendorId, newStatus) => {
    try {
      setLoading(true);
      
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
    } finally {
      setLoading(false);
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

  const getMembershipColor = (type) => {
    if (!type) return 'bg-gray-100 text-gray-800';
    
    switch (type) {
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMembershipText = (type) => {
    if (!type) return 'أساسية';
    
    switch (type) {
      case 'gold': return 'ذهبية';
      case 'premium': return 'مميزة';
      case 'basic': return 'أساسية';
      default: return type;
    }
  };

  const filteredVendors = filterData(vendors);

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredVendors.map(vendor => (
        <div 
          key={vendor.id} 
          className={`bg-white rounded-lg shadow-md overflow-hidden ${
            vendor.featured ? 'ring-2 ring-yellow-500' : ''
          }`}
        >
          {vendor.featured && (
            <div className="bg-yellow-500 text-white px-4 py-1 text-sm text-center">
              متجر مميز حتى {new Date(vendor.featured_until).toLocaleDateString('ar-SA')}
            </div>
          )}
          {vendor.banner_url && (
            <img
              src={vendor.banner_url}
              alt={`${vendor.store_name} banner`}
              className="w-full h-32 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/400x150?text=Banner';
              }}
            />
          )}
          <div className="p-4">
            <div className="flex items-center space-x-4">
              {vendor.logo_url && (
                <img
                  src={vendor.logo_url}
                  alt={`${vendor.store_name} logo`}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/80?text=Logo';
                  }}
                />
              )}
              <div>
                <h3 className="text-xl font-semibold">{vendor.store_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative inline-block">
                    <select
                      value={vendor.status}
                      onChange={(e) => handleStatusChange(vendor.id, e.target.value)}
                      className={`px-2 py-1 text-sm rounded-full ${getStatusColor(vendor.status)} appearance-none pr-8 cursor-pointer`}
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
                  <span className={`px-2 py-1 text-sm rounded-full ${getMembershipColor(vendor.membership?.type)}`}>
                    {getMembershipText(vendor.membership?.type)}
                  </span>
                  <span className="text-yellow-500">★ {vendor.rating}</span>
                  <span className="text-gray-500">({vendor.rating_count})</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <p className="text-gray-600">{vendor.address}</p>
              <p className="text-gray-600">{vendor.phone}</p>
              <div className="flex flex-wrap gap-2">
                {vendor.categories?.map(categoryId => {
                  const category = categories.find(c => c.id === categoryId);
                  return category ? (
                    <span
                      key={category.id}
                      className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                    >
                      {category.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">نوع التوصيل</p>
                  <p className="font-medium">
                    {getDeliveryTypeText(vendor.delivery_type)}
                  </p>
                </div>
                {vendor.delivery_type === 'distance' && (
                  <>
                    <div>
                      <p className="text-gray-500">سعر الكيلومتر</p>
                      <p className="font-medium">₪{vendor.price_per_km}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">نطاق التوصيل</p>
                      <p className="font-medium">{vendor.delivery_radius} كم</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">المحفظة</p>
                  <p className="font-medium">
                    {vendor.wallet_enabled ? (
                      <>
                        <span className="text-green-600">مفعلة</span>
                        <span className="text-gray-600 mr-2">
                          (₪{vendor.wallet_balance || 0})
                        </span>
                      </>
                    ) : (
                      <span className="text-red-600">غير مفعلة</span>
                    )}
                  </p>
                </div>
                {vendor.wallet_enabled && (
                  <div>
                    <p className="text-gray-500">الشحن التلقائي</p>
                    <p className="font-medium">
                      {vendor.auto_charge ? (
                        <span className="text-green-600">مفعل</span>
                      ) : (
                        <span className="text-red-600">غير مفعل</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">مناطق الخدمة</h4>
              <div className="flex flex-wrap gap-1">
                {vendor.service_areas && vendor.service_areas.length > 0 ? (
                  vendor.service_areas.map((area, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                    >
                      {area}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">لا توجد مناطق خدمة محددة</span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditingVendor(vendor);
                  setFormData({
                    ...vendor,
                    categories: vendor.categories || []
                  });
                  setShowModal(true);
                }}
                className="text-blue-600 hover:text-blue-800 ml-2"
              >
                تعديل
              </button>
              <button
                onClick={() => handleDelete(vendor.id)}
                className="text-red-600 hover:text-red-800"
              >
                حذف
              </button>
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التصنيفات</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التوصيل</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المحفظة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العضوية</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مناطق الخدمة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVendors.map(vendor => (
              <tr key={vendor.id} className={vendor.featured ? 'bg-yellow-50' : ''}>
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
                      <div className="font-medium text-gray-900">
                        {vendor.store_name}
                        {vendor.featured && (
                          <span className="mr-2 text-yellow-500 text-sm">
                            (مميز)
                          </span>
                        )}
                      </div>
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
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {vendor.categories?.map(categoryId => {
                      const category = categories.find(c => c.id === categoryId);
                      return category ? (
                        <span
                          key={category.id}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {category.name}
                        </span>
                      ) : null;
                    })}
                  </div>
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
                  <div>
                    <div className="text-sm font-medium">
                      {vendor.wallet_enabled ? (
                        <>
                          <span className="text-green-600">مفعلة</span>
                          <div className="text-sm text-gray-500">
                            ₪{vendor.wallet_balance || 0}
                          </div>
                        </>
                      ) : (
                        <span className="text-red-600">غير مفعلة</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getMembershipColor(vendor.membership?.type)}`}>
                      {getMembershipText(vendor.membership?.type)}
                    </span>
                    <div className="text-sm text-gray-500 mt-1">
                      {vendor.membership?.commission_rate || 10}%
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {vendor.service_areas && vendor.service_areas.length > 0 ? (
                      vendor.service_areas.slice(0, 3).map((area, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                        >
                          {area}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                    {vendor.service_areas && vendor.service_areas.length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{vendor.service_areas.length - 3}
                      </span>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingVendor(vendor);
                      setFormData({
                        ...vendor,
                        categories: vendor.categories || []
                      });
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 ml-2"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(vendor.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    حذف
                  </button>
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

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <h3 className="text-lg font-semibold mb-2">خطأ</h3>
        <p>{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
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
          <button
            onClick={() => {
              setEditingVendor(null);
              setFormData({
                store_name: '',
                phone: '',
                address: '',
                delivery_type: 'distance',
                delivery_radius: 5,
                price_per_km: 2,
                status: 'active',
                logo_url: '',
                banner_url: '',
                categories: [],
                wallet_enabled: false,
                auto_charge: false,
                service_areas: [],
                latitude: null,
                longitude: null,
                membership: {
                  type: 'basic',
                  expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                  commission_rate: 10
                },
                featured: false,
                featured_until: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
                featured_order: 1
              });
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            إضافة بائع جديد
          </button>
        </div>
      </div>

      <SearchFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {viewMode === 'grid' ? renderGridView() : renderTableView()}

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowModal(false)}></div>

            <div className="relative bg-white w-full min-h-screen">
              <div className="sticky top-0 bg-white border-b z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {editingVendor ? 'تعديل بائع' : 'إضافة بائع جديد'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingVendor(null);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <VendorForm 
                  onSubmit={handleSubmit} 
                  initialData={editingVendor}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}