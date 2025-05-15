import React, { useState } from 'react';
import { toast } from 'react-toastify';
import MediaUpload from '../Products/MediaUpload';
import { BUCKETS } from '../../lib/supabaseStorage';

export default function UserSettings() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: 'مدير النظام',
    email: 'admin@example.com',
    phone: '0599123456',
    password: '',
    confirmPassword: '',
    avatar_url: '',
    role: 'admin',
    twoFactorAuth: false
  });
  const [errors, setErrors] = useState({
    password: null,
    avatar: null
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // التحقق من تطابق كلمة المرور
      if (formData.password && formData.password !== formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          password: 'كلمات المرور غير متطابقة'
        }));
        toast.error('كلمات المرور غير متطابقة');
        setLoading(false);
        return;
      }
      
      // هنا سيتم إرسال البيانات إلى الخادم
      // في بيئة حقيقية، ستقوم بتنفيذ طلب لتحديث بيانات المستخدم
      
      setTimeout(() => {
        toast.success('تم حفظ إعدادات المستخدم بنجاح');
        setLoading(false);
        // إعادة تعيين حقول كلمة المرور
        setFormData({
          ...formData,
          password: '',
          confirmPassword: ''
        });
        // إعادة تعيين الأخطاء
        setErrors({
          password: null,
          avatar: null
        });
      }, 1000);
    } catch (error) {
      console.error('Error saving user settings:', error);
      toast.error('فشل في حفظ إعدادات المستخدم');
      setLoading(false);
    }
  };

  const handleAvatarUpload = ({ preview }) => {
    setErrors({ ...errors, avatar: null });
    if (preview) {
      setFormData({ ...formData, avatar_url: preview });
    } else {
      setErrors({ ...errors, avatar: 'فشل في تحميل الصورة الشخصية' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إعدادات المستخدم</h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      {/* معلومات المستخدم */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">المعلومات الشخصية</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الصورة الشخصية
            </label>
            <MediaUpload
              type="image"
              preview={formData.avatar_url}
              onUpload={handleAvatarUpload}
              storeInSupabase={true}
              bucket={BUCKETS.PROFILES}
            />
            {errors.avatar && (
              <p className="mt-2 text-sm text-red-600">{errors.avatar}</p>
            )}
          </div>

          <div className="md:col-span-2 space-y-4">
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
                البريد الإلكتروني <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الصلاحية
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                disabled
              >
                <option value="admin">مدير</option>
                <option value="editor">محرر</option>
                <option value="viewer">مشاهد</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                لا يمكن تغيير صلاحيات المستخدم من هنا.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* أمان الحساب */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">أمان الحساب</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور الجديدة
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="اتركه فارغاً إذا كنت لا ترغب في التغيير"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تأكيد كلمة المرور الجديدة
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="تأكيد كلمة المرور الجديدة"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.twoFactorAuth}
                onChange={(e) => setFormData({ ...formData, twoFactorAuth: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>تفعيل المصادقة الثنائية (2FA)</span>
            </label>
            <p className="mt-1 text-sm text-gray-500 mr-7">
              سيتم إرسال رمز تحقق إلى هاتفك عند تسجيل الدخول
            </p>
          </div>
        </div>
      </div>

      {/* سجل النشاط */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">سجل النشاط</h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">آخر تسجيل دخول</h4>
            <div className="flex justify-between items-center text-sm">
              <div>
                <p className="text-gray-700">تاريخ ووقت تسجيل الدخول:</p>
                <p className="text-gray-500">18 أبريل 2025، 10:30 صباحًا</p>
              </div>
              <div>
                <p className="text-gray-700">عنوان IP:</p>
                <p className="text-gray-500">192.168.1.1</p>
              </div>
              <div>
                <p className="text-gray-700">الجهاز:</p>
                <p className="text-gray-500">Chrome على Windows</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">سجل النشاطات الأخيرة</h4>
            <ul className="space-y-3 mt-2">
              <li className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">تسجيل دخول ناجح</span>
                  <span className="text-gray-500 text-sm">18 أبريل 2025، 10:30 صباحًا</span>
                </div>
              </li>
              <li className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">تغيير إعدادات النظام</span>
                  <span className="text-gray-500 text-sm">17 أبريل 2025، 03:15 مساءً</span>
                </div>
              </li>
              <li className="border-b pb-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">إضافة بائع جديد</span>
                  <span className="text-gray-500 text-sm">15 أبريل 2025، 11:45 صباحًا</span>
                </div>
              </li>
              <li>
                <div className="flex justify-between">
                  <span className="text-gray-700">تسجيل دخول ناجح</span>
                  <span className="text-gray-500 text-sm">15 أبريل 2025، 09:20 صباحًا</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* الإشعارات والتفضيلات */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">تفضيلات الإخطارات</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={true}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>إشعارات البريد الإلكتروني للطلبات الجديدة</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={true}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>إشعارات متصفح للطلبات الجديدة</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={false}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>إشعارات عند تسجيل دخول جديد</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={true}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>تنبيهات أمان الحساب</span>
          </label>
          
          <div className="mt-4 pt-3 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اللغة المفضلة
            </label>
            <select
              value="ar"
              className="w-full md:w-64 border rounded-md px-3 py-2"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}