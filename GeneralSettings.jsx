import React, { useState } from 'react';
import { toast } from 'react-toastify';
import MediaUpload from './Products/MediaUpload';

export default function GeneralSettings() {
  const [settings, setSettings] = useState({
    store_name: 'متجر خدماتكم',
    logo: '/logo.png',
    admin: {
      name: 'مدير النظام',
      email: 'admin@example.com',
      phone: '0599123456',
      address: 'غزة، فلسطين'
    }
  });
  const [errors, setErrors] = useState({
    logo: null
  });

  const handleSave = () => {
    // Here you would typically save to backend
    toast.success('تم حفظ الإعدادات بنجاح');
  };

  const handleLogoUpload = ({ preview }) => {
    setErrors({ ...errors, logo: null });
    if (preview) {
      setSettings({ ...settings, logo: preview });
    } else {
      setErrors({ ...errors, logo: 'فشل في تحميل الشعار' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Store Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">إعدادات المتجر</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المتجر
            </label>
            <input
              type="text"
              value={settings.store_name}
              onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              شعار المتجر
            </label>
            <MediaUpload
              type="image"
              preview={settings.logo}
              onUpload={handleLogoUpload}
            />
            {errors.logo && (
              <p className="mt-2 text-sm text-red-600">{errors.logo}</p>
            )}
          </div>
        </div>
      </div>

      {/* Admin Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">معلومات المدير</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المدير
            </label>
            <input
              type="text"
              value={settings.admin.name}
              onChange={(e) => setSettings({
                ...settings,
                admin: { ...settings.admin, name: e.target.value }
              })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={settings.admin.email}
              onChange={(e) => setSettings({
                ...settings,
                admin: { ...settings.admin, email: e.target.value }
              })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الهاتف
            </label>
            <input
              type="tel"
              value={settings.admin.phone}
              onChange={(e) => setSettings({
                ...settings,
                admin: { ...settings.admin, phone: e.target.value }
              })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان
            </label>
            <input
              type="text"
              value={settings.admin.address}
              onChange={(e) => setSettings({
                ...settings,
                admin: { ...settings.admin, address: e.target.value }
              })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}