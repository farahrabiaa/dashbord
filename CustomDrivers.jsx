import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';
import { supabase } from '../../lib/supabase';
import { addCustomUser, getCustomUserById } from '../../lib/customUsers';

export default function CustomDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    // بيانات المستخدم
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    
    // بيانات السائق
    status: 'offline',
    rating: 5,
    rating_count: 0,
    commission_rate: 15,
    vehicle_type: 'motorcycle',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_plate: '',
    
    // مناطق العمل
    working_areas: []
  });

  // قائمة المناطق المتاحة
  const areas = [
    // مدن الضفة الغربية الرئيسية
    'رام الله',
    'البيرة',
    'نابلس',
    'جنين',
    'طولكرم',
    'قلقيلية',
    'طوباس',
    'سلفيت',
    'أريحا',
    'بيت لحم',
    'الخليل',
    // مناطق ومدن إضافية
    'بيت جالا',
    'بيت ساحور',
    'بيرزيت',
    'الظاهرية',
    'دورا',
    'يطا',
    'عنبتا',
    'بيت فجار',
    'بديا',
    'عزون',
    'بيت أمر',
    'حلحول',
    'سعير',
    'ترقوميا',
    'عرابة',
    'يعبد',
    'قباطية',
    'طمون',
    'عقابا',
    'بيت فوريك',
    'عصيرة الشمالية',
    'بيتا',
    'حوارة',
    'سبسطية',
    'عقربا'
  ];

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // جلب بيانات السائقين من قاعدة البيانات
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select(`
          *,
          user:user_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (driversError) throw driversError;
      
      // جلب بيانات المستخدمين المخصصين
      const { data: customUsersData, error: customUsersError } = await supabase
        .from('custom_users')
        .select('*')
        .in('id', driversData.map(driver => driver.user_id));
      
      if (customUsersError) throw customUsersError;
      
      // دمج بيانات السائقين مع بيانات المستخدمين المخصصين
      const driversWithUsers = driversData.map(driver => {
        const customUser = customUsersData.find(user => user.id === driver.user_id);
        return {
          ...driver,
          custom_user: customUser
        };
      });
      
      setDrivers(driversWithUsers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError('فشل في تحميل بيانات السائقين. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل بيانات السائقين');
    } finally {
      setLoading(false);
    }
  };

  const initialFilters = {
    name: {
      type: 'text',
      label: 'اسم السائق',
      placeholder: 'البحث باسم السائق',
      value: ''
    },
    phone: {
      type: 'text',
      label: 'رقم الهاتف',
      placeholder: 'البحث برقم الهاتف',
      value: ''
    },
    status: {
      type: 'select',
      label: 'الحالة',
      placeholder: 'جميع الحالات',
      options: [
        { value: 'offline', label: 'غير متصل' },
        { value: 'available', label: 'متاح' },
        { value: 'busy', label: 'مشغول' }
      ],
      value: ''
    },
    vehicle_type: {
      type: 'select',
      label: 'نوع المركبة',
      placeholder: 'جميع الأنواع',
      options: [
        { value: 'motorcycle', label: 'دراجة نارية' },
        { value: 'car', label: 'سيارة' },
        { value: 'bicycle', label: 'دراجة هوائية' }
      ],
      value: ''
    }
  };

  const { filters, filterData, handleFilterChange } = useFilters(initialFilters);

  // التحقق من وجود البريد الإلكتروني
  const checkEmailExists = async (email, excludeUserId = null) => {
    if (!email) return false;
    
    try {
      let query = supabase
        .from('custom_users')
        .select('*', { count: 'exact' })
        .eq('email', email);
      
      // استثناء المستخدم الحالي عند التحديث
      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }
      
      const { count, error } = await query;
      
      if (error) throw error;
      
      // إذا كان هناك مستخدم بنفس البريد الإلكتروني
      return count > 0;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  };

  // التحقق من وجود اسم المستخدم
  const checkUsernameExists = async (username) => {
    if (!username) return false;
    
    try {
      const { data, error, count } = await supabase
        .from('custom_users')
        .select('*', { count: 'exact' })
        .eq('username', username);
      
      if (error) throw error;
      
      // إذا كان هناك مستخدم بنفس اسم المستخدم
      return count > 0;
    } catch (error) {
      console.error('Error checking username existence:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // التحقق من البيانات المطلوبة
      if (!formData.username || (!editingDriver && !formData.password) || !formData.name || !formData.phone) {
        toast.error('الرجاء تعبئة جميع الحقول المطلوبة');
        setLoading(false);
        return;
      }
      
      if (editingDriver) {
        // تحديث بيانات السائق الموجود
        
        // التحقق من البريد الإلكتروني إذا تم تغييره
        if (formData.email && formData.email !== editingDriver.email) {
          const emailExists = await checkEmailExists(formData.email, editingDriver.user_id);
          if (emailExists) {
            toast.error('البريد الإلكتروني مستخدم بالفعل');
            setLoading(false);
            return;
          }
        }
        
        // 1. تحديث بيانات المستخدم المخصص
        const { error: userError } = await supabase
          .from('custom_users')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingDriver.user_id);
        
        if (userError) throw userError;
        
        // إذا تم تغيير كلمة المرور، قم بتحديثها
        if (formData.password) {
          const { data: hashData, error: hashError } = await supabase.rpc(
            'hash_password',
            { password: formData.password }
          );
          
          if (hashError) throw hashError;
          
          const { error: passwordError } = await supabase
            .from('custom_users')
            .update({ password_hash: hashData })
            .eq('id', editingDriver.user_id);
          
          if (passwordError) throw passwordError;
        }
        
        // 2. تحديث بيانات السائق
        const { error: driverError } = await supabase
          .from('drivers')
          .update({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            status: formData.status,
            commission_rate: formData.commission_rate,
            vehicle_type: formData.vehicle_type,
            vehicle_model: formData.vehicle_model,
            vehicle_year: formData.vehicle_year,
            vehicle_plate: formData.vehicle_plate,
            working_areas: formData.working_areas,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingDriver.id);
        
        if (driverError) throw driverError;
        
        toast.success('تم تحديث بيانات السائق بنجاح');
      } else {
        // إضافة سائق جديد
        
        // التحقق من اسم المستخدم
        const usernameExists = await checkUsernameExists(formData.username);
        if (usernameExists) {
          toast.error('اسم المستخدم مستخدم بالفعل');
          setLoading(false);
          return;
        }
        
        // التحقق من البريد الإلكتروني
        if (formData.email) {
          const emailExists = await checkEmailExists(formData.email);
          if (emailExists) {
            toast.error('البريد الإلكتروني مستخدم بالفعل');
            setLoading(false);
            return;
          }
        }
        
        // 1. إنشاء مستخدم مخصص جديد
        const userId = await addCustomUser({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: 'driver'
        });
        
        if (!userId) {
          throw new Error('فشل في إنشاء المستخدم المخصص');
        }
        
        // 2. إنشاء سائق جديد
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .insert([{
            user_id: userId,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            status: formData.status,
            rating: formData.rating,
            rating_count: formData.rating_count,
            commission_rate: formData.commission_rate,
            vehicle_type: formData.vehicle_type,
            vehicle_model: formData.vehicle_model,
            vehicle_year: formData.vehicle_year,
            vehicle_plate: formData.vehicle_plate,
            working_areas: formData.working_areas
          }])
          .select();
        
        if (driverError) throw driverError;
        
        toast.success('تم إضافة السائق بنجاح');
      }
      
      // إعادة تحميل بيانات السائقين
      fetchDrivers();
      
      // إغلاق النموذج وإعادة تعيين البيانات
      setShowModal(false);
      setEditingDriver(null);
      setFormData({
        username: '',
        password: '',
        name: '',
        email: '',
        phone: '',
        status: 'offline',
        rating: 5,
        rating_count: 0,
        commission_rate: 15,
        vehicle_type: 'motorcycle',
        vehicle_model: '',
        vehicle_year: '',
        vehicle_plate: '',
        working_areas: []
      });
    } catch (error) {
      console.error('Error saving driver:', error);
      
      // استخراج رسالة الخطأ من الاستجابة
      let errorMessage = 'فشل في حفظ بيانات السائق';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        errorMessage = error.error;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, userId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السائق؟')) return;
    
    try {
      setLoading(true);
      
      // 1. حذف السائق
      const { error: driverError } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id);
      
      if (driverError) throw driverError;
      
      // 2. حذف المستخدم المخصص
      const { error: userError } = await supabase
        .from('custom_users')
        .delete()
        .eq('id', userId);
      
      if (userError) throw userError;
      
      toast.success('تم حذف السائق بنجاح');
      
      // إعادة تحميل بيانات السائقين
      fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error('فشل في حذف السائق');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'متاح';
      case 'busy': return 'مشغول';
      case 'offline': return 'غير متصل';
      default: return status;
    }
  };

  const getVehicleTypeText = (type) => {
    switch (type) {
      case 'motorcycle': return 'دراجة نارية';
      case 'car': return 'سيارة';
      case 'bicycle': return 'دراجة هوائية';
      default: return type;
    }
  };

  const filteredDrivers = filterData(drivers);

  if (loading && drivers.length === 0) {
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
          onClick={fetchDrivers}
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
        <h2 className="text-2xl font-bold">السائقين المخصصين</h2>
        <button
          onClick={() => {
            setEditingDriver(null);
            setFormData({
              username: '',
              password: '',
              name: '',
              email: '',
              phone: '',
              status: 'offline',
              rating: 5,
              rating_count: 0,
              commission_rate: 15,
              vehicle_type: 'motorcycle',
              vehicle_model: '',
              vehicle_year: '',
              vehicle_plate: '',
              working_areas: []
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          إضافة سائق جديد
        </button>
      </div>

      <SearchFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السائق</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">بيانات الاتصال</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التقييم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العمولة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المركبة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مناطق العمل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    لا يوجد سائقين متطابقين مع معايير البحث
                  </td>
                </tr>
              ) : (
                filteredDrivers.map(driver => (
                  <tr key={driver.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{driver.name}</div>
                      <div className="text-sm text-gray-500">
                        {driver.custom_user?.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div>{driver.phone}</div>
                        <div className="text-gray-500">{driver.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{driver.rating}</span>
                        <span className="text-gray-500 ml-1">({driver.rating_count})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {driver.commission_rate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium">{getVehicleTypeText(driver.vehicle_type)}</div>
                        {driver.vehicle_model && (
                          <div className="text-gray-500">
                            {driver.vehicle_model} {driver.vehicle_year}
                          </div>
                        )}
                        {driver.vehicle_plate && (
                          <div className="text-gray-500">
                            {driver.vehicle_plate}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {driver.working_areas && driver.working_areas.length > 0 ? (
                          driver.working_areas.slice(0, 3).map((area, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                            >
                              {area}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                        {driver.working_areas && driver.working_areas.length > 3 && (
                          <span className="text-gray-500 text-xs">
                            +{driver.working_areas.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(driver.status)}`}>
                        {getStatusText(driver.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingDriver(driver);
                          setFormData({
                            username: driver.custom_user?.username || '',
                            password: '',
                            name: driver.name,
                            email: driver.email || '',
                            phone: driver.phone || '',
                            status: driver.status,
                            rating: driver.rating,
                            rating_count: driver.rating_count,
                            commission_rate: driver.commission_rate,
                            vehicle_type: driver.vehicle_type,
                            vehicle_model: driver.vehicle_model || '',
                            vehicle_year: driver.vehicle_year || '',
                            vehicle_plate: driver.vehicle_plate || '',
                            working_areas: driver.working_areas || []
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 ml-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(driver.id, driver.user_id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingDriver(null);
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-3xl w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              {editingDriver ? 'تعديل بيانات السائق' : 'إضافة سائق جديد'}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">بيانات المستخدم</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المستخدم <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      required
                      disabled={editingDriver}
                    />
                    {editingDriver && (
                      <p className="text-sm text-gray-500 mt-1">
                        لا يمكن تغيير اسم المستخدم بعد الإنشاء
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      كلمة المرور {!editingDriver && <span className="text-red-600">*</span>}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      required={!editingDriver}
                      placeholder={editingDriver ? "اتركه فارغاً للاحتفاظ بكلمة المرور الحالية" : ""}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">بيانات السائق</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الحالة <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    >
                      <option value="offline">غير متصل</option>
                      <option value="available">متاح</option>
                      <option value="busy">مشغول</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نسبة العمولة (%) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData({ ...formData, commission_rate: Number(e.target.value) })}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      max="100"
                      step="0.1"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">معلومات المركبة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع المركبة <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.vehicle_type}
                      onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    >
                      <option value="motorcycle">دراجة نارية</option>
                      <option value="car">سيارة</option>
                      <option value="bicycle">دراجة هوائية</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموديل
                    </label>
                    <input
                      type="text"
                      value={formData.vehicle_model}
                      onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سنة الصنع
                    </label>
                    <input
                      type="text"
                      value={formData.vehicle_year}
                      onChange={(e) => setFormData({ ...formData, vehicle_year: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم اللوحة
                    </label>
                    <input
                      type="text"
                      value={formData.vehicle_plate}
                      onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold mb-4">مناطق العمل</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                  {areas.map(area => (
                    <label key={area} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.working_areas.includes(area)}
                        onChange={(e) => {
                          const newAreas = e.target.checked
                            ? [...formData.working_areas, area]
                            : formData.working_areas.filter(a => a !== area);
                          setFormData({ ...formData, working_areas: newAreas });
                        }}
                        className="rounded text-blue-600"
                      />
                      <span>{area}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDriver(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'جاري الحفظ...' : (editingDriver ? 'تحديث' : 'إضافة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
      
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">ملاحظات هامة</h3>
        <ul className="list-disc list-inside space-y-2 text-blue-700">
          <li>يتم إنشاء حساب مستخدم مخصص لكل سائق جديد.</li>
          <li>يمكن للسائق تسجيل الدخول باستخدام اسم المستخدم وكلمة المرور.</li>
          <li>يتم تعيين دور المستخدم تلقائيًا كـ "سائق".</li>
          <li>يمكن للسائق تحديث موقعه وحالته من خلال التطبيق.</li>
          <li>يتم احتساب العمولة بناءً على نسبة العمولة المحددة.</li>
          <li>يمكن تحديد مناطق العمل للسائق لتسهيل عملية تعيين السائقين للطلبات.</li>
        </ul>
      </div>
    </div>
  );
}