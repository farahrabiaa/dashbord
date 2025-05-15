import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import MediaUpload from '../Products/MediaUpload';
import { BUCKETS } from '../../lib/supabaseStorage';

export default function DirectVendorCreation() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // بيانات المتجر
    store_name: '',
    phone: '',
    address: '',
    description: '',
    delivery_type: 'distance',
    delivery_radius: 5,
    price_per_km: 2,
    status: 'active',
    logo_url: '',
    banner_url: '',
    commission_rate: 10,
    wallet_enabled: false,
    auto_charge: false,
    service_areas: [],
    // بيانات العضوية
    membership: {
      type: 'basic',
      expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // سنة من اليوم
      commission_rate: 10
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // التحقق من البيانات المطلوبة
      if (!formData.store_name || !formData.phone || !formData.address) {
        toast.error('الرجاء تعبئة جميع الحقول المطلوبة');
        setLoading(false);
        return;
      }

      // التحقق من الحقول الإجبارية حسب نوع التوصيل
      if (formData.delivery_type === 'distance') {
        if (!formData.delivery_radius || !formData.price_per_km) {
          toast.error('الرجاء تعبئة نطاق التوصيل وسعر الكيلومتر');
          setLoading(false);
          return;
        }
      }

      // التحقق من تاريخ انتهاء العضوية
      if (!formData.membership.expires_at) {
        toast.error('الرجاء تحديد تاريخ انتهاء العضوية');
        setLoading(false);
        return;
      }
      
      // إنشاء معرف مستخدم جديد
      const userId = uuidv4();
      
      // حفظ بيانات البائع في التخزين المحلي
      const vendorData = {
        id: userId,
        ...formData,
        created_at: new Date().toISOString()
      };
      
      // حفظ في التخزين المحلي
      localStorage.setItem('pendingVendor', JSON.stringify(vendorData));
      
      // إضافة بائع جديد
      const { data, error } = await supabase
        .from('vendors')
        .insert([{
          user_id: userId,
          store_name: formData.store_name,
          phone: formData.phone,
          address: formData.address,
          description: formData.description,
          delivery_type: formData.delivery_type,
          delivery_radius: formData.delivery_radius,
          price_per_km: formData.price_per_km,
          status: formData.status,
          logo_url: formData.logo_url,
          banner_url: formData.banner_url,
          commission_rate: formData.commission_rate,
          wallet_enabled: formData.wallet_enabled,
          auto_charge: formData.auto_charge,
          service_areas: formData.service_areas,
          membership: formData.membership
        }])
        .select();
      
      if (error) throw error;
      
      // إذا نجحت العملية، نحذف البيانات من التخزين المحلي
      localStorage.removeItem('pendingVendor');
      
      toast.success('تم إضافة البائع بنجاح');
      
      // إعادة تعيين النموذج
      setFormData({
        store_name: '',
        phone: '',
        address: '',
        description: '',
        delivery_type: 'distance',
        delivery_radius: 5,
        price_per_km: 2,
        status: 'active',
        logo_url: '',
        banner_url: '',
        commission_rate: 10,
        wallet_enabled: false,
        auto_charge: false,
        service_areas: [],
        membership: {
          type: 'basic',
          expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
          commission_rate: 10
        }
      });
      
    } catch (error) {
      console.error('Error adding vendor:', error);
      toast.error(error.message || 'فشل في إضافة البائع');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = ({ preview }) => {
    if (preview) {
      setFormData({ ...formData, logo_url: preview });
    }
  };

  const handleBannerUpload = ({ preview }) => {
    if (preview) {
      setFormData({ ...formData, banner_url: preview });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إضافة بائع مباشرة</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">بيانات المتجر</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المتجر <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
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
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف المتجر
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة اللوجو
                </label>
                <MediaUpload
                  type="image"
                  preview={formData.logo_url}
                  onUpload={handleLogoUpload}
                  storeInSupabase={true}
                  bucket={BUCKETS.VENDORS}
                  folder="logos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة البانر
                </label>
                <MediaUpload
                  type="image"
                  preview={formData.banner_url}
                  onUpload={handleBannerUpload}
                  storeInSupabase={true}
                  bucket={BUCKETS.VENDORS}
                  folder="banners"
                />
              </div>
            </div>
          </div>
          
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">إعدادات التوصيل</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع التوصيل <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.delivery_type}
                  onChange={(e) => setFormData({ ...formData, delivery_type: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="distance">حسب المسافة</option>
                  <option value="fixed">سعر ثابت</option>
                  <option value="zones">مناطق</option>
                </select>
              </div>
              
              {formData.delivery_type === 'distance' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نطاق التوصيل (كم) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.delivery_radius}
                      onChange={(e) => setFormData({ ...formData, delivery_radius: Number(e.target.value) })}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سعر الكيلومتر (₪) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price_per_km}
                      onChange={(e) => setFormData({ ...formData, price_per_km: Number(e.target.value) })}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">منطقة الخدمة</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
              {areas.map(area => (
                <label key={area} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.service_areas.includes(area)}
                    onChange={(e) => {
                      const newAreas = e.target.checked
                        ? [...formData.service_areas, area]
                        : formData.service_areas.filter(a => a !== area);
                      setFormData({ ...formData, service_areas: newAreas });
                    }}
                    className="rounded text-blue-600"
                  />
                  <span>{area}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">إعدادات العضوية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع العضوية <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.membership.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    membership: { ...formData.membership, type: e.target.value }
                  })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="basic">أساسية</option>
                  <option value="premium">مميزة</option>
                  <option value="gold">ذهبية</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نسبة العمولة (%) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={formData.membership.commission_rate}
                  onChange={(e) => setFormData({
                    ...formData,
                    membership: { ...formData.membership, commission_rate: Number(e.target.value) }
                  })}
                  className="w-full border rounded-md px-3 py-2"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ انتهاء العضوية <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={formData.membership.expires_at}
                  onChange={(e) => setFormData({
                    ...formData,
                    membership: { ...formData.membership, expires_at: e.target.value }
                  })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">إعدادات إضافية</h3>
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
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="pending">معلق</option>
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
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.wallet_enabled}
                    onChange={(e) => setFormData({ ...formData, wallet_enabled: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>تفعيل المحفظة</span>
                </label>
              </div>
              
              {formData.wallet_enabled && (
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.auto_charge}
                      onChange={(e) => setFormData({ ...formData, auto_charge: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span>تفعيل الشحن التلقائي</span>
                  </label>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'جاري الإضافة...' : 'إضافة بائع جديد'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">ملاحظات هامة</h3>
        <ul className="list-disc list-inside space-y-2 text-blue-700">
          <li>هذه الطريقة تقوم بإنشاء بائع جديد مباشرة بدون إنشاء حساب مستخدم في نظام المصادقة.</li>
          <li>يتم إنشاء معرف مستخدم عشوائي (UUID) وربطه بالبائع.</li>
          <li>يتم حفظ بيانات البائع في التخزين المحلي مؤقتًا حتى يتم ربطه بقاعدة البيانات.</li>
          <li>لا يمكن للبائع تسجيل الدخول باستخدام هذه الطريقة، ولكن يمكن إدارته من لوحة التحكم.</li>
          <li>هذه الطريقة مفيدة للإعداد السريع أو للاختبار.</li>
          <li>للاستخدام في بيئة الإنتاج، يفضل استخدام نظام المستخدمين المخصص.</li>
        </ul>
      </div>
    </div>
  );
}