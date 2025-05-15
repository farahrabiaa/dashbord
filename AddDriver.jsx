import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function AddDriver() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // بيانات السائق
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // التحقق من البيانات المطلوبة
      if (!formData.name || !formData.phone) {
        toast.error('الرجاء تعبئة جميع الحقول المطلوبة');
        return;
      }
      
      // محاكاة إضافة سائق
      setTimeout(() => {
        toast.success('تم إضافة السائق بنجاح');
        
        // إعادة تعيين النموذج
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
        
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error adding driver:', error);
      toast.error(error.message || 'فشل في إضافة السائق');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إضافة سائق جديد</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">بيانات السائق</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'جاري الإضافة...' : 'إضافة سائق جديد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}