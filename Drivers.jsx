import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'offline',
    commission_rate: 15,
    vehicle_type: 'motorcycle',
    vehicle_model: '',
    vehicle_year: '',
    vehicle_plate: '',
    working_areas: []
  });

  // قائمة المناطق المتاحة
  const areas = [
    'رام الله', 'البيرة', 'نابلس', 'جنين', 'طولكرم', 'قلقيلية', 'طوباس', 'سلفيت', 'أريحا', 'بيت لحم', 'الخليل',
    'بيت جالا', 'بيت ساحور', 'بيرزيت', 'الظاهرية', 'دورا', 'يطا', 'عنبتا', 'بيت فجار', 'بديا', 'عزون'
  ];

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // جلب بيانات السائقين من قاعدة البيانات
      const { data, error } = await supabase
        .from('drivers')
        .select(`
          *,
          user:user_id(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError('فشل في تحميل بيانات السائقين. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل بيانات السائقين');
      
      // بيانات تجريبية في حالة الفشل
      setDrivers([
        {
          id: 1,
          name: 'خالد أحمد',
          phone: '0599123456',
          email: 'khaled@example.com',
          status: 'active',
          rating: 4.8,
          rating_count: 156,
          total_orders: 230,
          completed_orders: 220,
          cancelled_orders: 10,
          commission_rate: 15,
          wallet_balance: 450,
          vehicle: {
            type: 'motorcycle',
            model: 'هوندا',
            year: '2022',
            plate_number: '1234-H'
          },
          working_areas: ['رام الله', 'البيرة', 'نابلس']
        },
        {
          id: 2,
          name: 'محمد علي',
          phone: '0599234567',
          email: 'mohammad@example.com',
          status: 'active',
          rating: 4.5,
          rating_count: 98,
          total_orders: 180,
          completed_orders: 170,
          cancelled_orders: 10,
          commission_rate: 15,
          wallet_balance: 320,
          vehicle: {
            type: 'car',
            model: 'تويوتا',
            year: '2020',
            plate_number: '5678-T'
          },
          working_areas: ['جنين', 'طولكرم', 'قلقيلية']
        },
        {
          id: 3,
          name: 'أحمد محمود',
          phone: '0599345678',
          email: 'ahmad@example.com',
          status: 'inactive',
          rating: 4.2,
          rating_count: 75,
          total_orders: 120,
          completed_orders: 110,
          cancelled_orders: 10,
          commission_rate: 15,
          wallet_balance: 200,
          vehicle: {
            type: 'motorcycle',
            model: 'سوزوكي',
            year: '2021',
            plate_number: '9012-S'
          },
          working_areas: ['بيت لحم', 'الخليل']
        }
      ]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // التحقق من البيانات المطلوبة
      if (!formData.name || !formData.phone) {
        toast.error('الرجاء تعبئة جميع الحقول المطلوبة');
        return;
      }

      if (editingDriver) {
        // Update existing driver
        const { error } = await supabase
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
            working_areas: formData.working_areas
          })
          .eq('id', editingDriver.id);
        
        if (error) throw error;
        toast.success('تم تحديث السائق بنجاح');
      } else {
        // Add new driver
        const { error } = await supabase
          .from('drivers')
          .insert([{
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            status: formData.status,
            commission_rate: formData.commission_rate,
            vehicle_type: formData.vehicle_type,
            vehicle_model: formData.vehicle_model,
            vehicle_year: formData.vehicle_year,
            vehicle_plate: formData.vehicle_plate,
            working_areas: formData.working_areas
          }]);
        
        if (error) throw error;
        toast.success('تم إضافة السائق بنجاح');
      }

      // Refresh drivers list
      fetchDrivers();
      
      // Reset form and close modal
      setShowModal(false);
      setEditingDriver(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        status: 'offline',
        commission_rate: 15,
        vehicle_type: 'motorcycle',
        vehicle_model: '',
        vehicle_year: '',
        vehicle_plate: '',
        working_areas: []
      });
    } catch (error) {
      console.error('Error saving driver:', error);
      toast.error(editingDriver ? 'فشل في تحديث السائق' : 'فشل في إضافة السائق');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السائق؟')) return;
    
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('تم حذف السائق بنجاح');
      fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error('فشل في حذف السائق');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
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
        <h2 className="text-2xl font-bold">السائقين</h2>
        <button
          onClick={() => {
            setEditingDriver(null);
            setFormData({
              name: '',
              phone: '',
              email: '',
              status: 'offline',
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التقييم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطلبات</th>
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
                      <div>
                        <div className="font-medium text-gray-900">{driver.name}</div>
                        <div className="text-sm text-gray-500">
                          <div>{driver.phone}</div>
                          <div>{driver.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{driver.rating}</span>
                        <span className="text-gray-500 ml-1">({driver.rating_count})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm">الكل: {driver.total_orders || 0}</div>
                        <div className="text-sm text-green-600">مكتمل: {driver.completed_orders || 0}</div>
                        <div className="text-sm text-red-600">ملغي: {driver.cancelled_orders || 0}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium">{driver.commission_rate}%</div>
                        <div className="text-sm text-gray-500">
                          الرصيد: ₪{driver.wallet_balance || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium">
                          {getVehicleTypeText(driver.vehicle_type)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {driver.vehicle_model} {driver.vehicle_year}
                        </div>
                        <div className="text-sm text-gray-500">
                          {driver.vehicle_plate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {driver.working_areas && driver.working_areas.length > 0 ? (
                          driver.working_areas.map((area, index) => (
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
                            name: driver.name,
                            phone: driver.phone,
                            email: driver.email,
                            status: driver.status,
                            commission_rate: driver.commission_rate,
                            vehicle_type: driver.vehicle_type,
                            vehicle_model: driver.vehicle_model,
                            vehicle_year: driver.vehicle_year,
                            vehicle_plate: driver.vehicle_plate,
                            working_areas: driver.working_areas || []
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 ml-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(driver.id)}
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

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-black opacity-30"></div>

            <div className="relative bg-white rounded-lg p-8 max-w-3xl w-full mx-4">
              <h2 className="text-2xl font-bold mb-6">
                {editingDriver ? 'تعديل سائق' : 'إضافة سائق جديد'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم السائق
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
                      رقم الهاتف
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الحالة
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                    >
                      <option value="offline">غير متصل</option>
                      <option value="available">متاح</option>
                      <option value="busy">مشغول</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نسبة العمولة (%)
                    </label>
                    <input
                      type="number"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData({ ...formData, commission_rate: Number(e.target.value) })}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">معلومات المركبة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع المركبة
                      </label>
                      <select
                        value={formData.vehicle_type}
                        onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                        className="w-full border rounded-md px-3 py-2"
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

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">مناطق العمل</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
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
                  >
                    {editingDriver ? 'تحديث' : 'إضافة'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}