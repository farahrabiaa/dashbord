import React, { useState } from 'react';
import { toast } from 'react-toastify';
import MediaUpload from '../Products/MediaUpload';
import { useSettings } from '../../contexts/SettingsContext';
import { BUCKETS } from '../../lib/supabaseStorage';

export default function GeneralSettings() {
  const { settings: globalSettings, saveSettings, updateStoreName } = useSettings();
  const [settings, setSettings] = useState({
    store: {
      ...globalSettings.store
    },
    social: {
      ...globalSettings.social
    },
    notifications: {
      ...globalSettings.notifications
    }
  });
  const [errors, setErrors] = useState({
    logo: null
  });

  const handleSave = async () => {
    try {
      // Save all settings
      const success = await saveSettings(settings);
      if (success) {
        // Update document title with new store name
        document.title = `لوحة تحكم ${settings.store.name}`;
        toast.success('تم حفظ الإعدادات بنجاح');
      }
    } catch (error) {
      toast.error('فشل في حفظ الإعدادات');
    }
  };

  const handleLogoUpload = ({ preview, path, isSupabaseFile }) => {
    setErrors({ ...errors, logo: null });
    if (preview) {
      setSettings({
        ...settings,
        store: { 
          ...settings.store, 
          logo: preview,
          logo_path: isSupabaseFile ? path : null
        }
      });
    } else {
      setErrors({ ...errors, logo: 'فشل في تحميل الشعار' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الإعدادات العامة</h2>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          حفظ التغييرات
        </button>
      </div>

      {/* Store Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">معلومات المتجر</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم المتجر
            </label>
            <input
              type="text"
              value={settings.store.name}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, name: e.target.value }
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
              value={settings.store.email}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, email: e.target.value }
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
              value={settings.store.phone}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, phone: e.target.value }
              })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العملة
            </label>
            <select
              value={settings.store.currency}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, currency: e.target.value }
              })}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="ILS">₪ شيكل</option>
              <option value="USD">$ دولار</option>
              <option value="JOD">د.أ دينار</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              العنوان
            </label>
            <input
              type="text"
              value={settings.store.address}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, address: e.target.value }
              })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف المتجر
            </label>
            <textarea
              value={settings.store.description}
              onChange={(e) => setSettings({
                ...settings,
                store: { ...settings.store, description: e.target.value }
              })}
              rows="3"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              شعار المتجر
            </label>
            <MediaUpload
              type="image"
              preview={settings.store.logo}
              onUpload={handleLogoUpload}
              storeInSupabase={true}
              bucket={BUCKETS.GENERAL}
              folder="logos"
            />
            {errors.logo && (
              <p className="mt-2 text-sm text-red-600">{errors.logo}</p>
            )}
          </div>
        </div>
      </div>

      {/* Social Media Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">روابط التواصل الاجتماعي</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              فيسبوك
            </label>
            <input
              type="url"
              value={settings.social.facebook}
              onChange={(e) => setSettings({
                ...settings,
                social: { ...settings.social, facebook: e.target.value }
              })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="https://facebook.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تويتر
            </label>
            <input
              type="url"
              value={settings.social.twitter}
              onChange={(e) => setSettings({
                ...settings,
                social: { ...settings.social, twitter: e.target.value }
              })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="https://twitter.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              انستغرام
            </label>
            <input
              type="url"
              value={settings.social.instagram}
              onChange={(e) => setSettings({
                ...settings,
                social: { ...settings.social, instagram: e.target.value }
              })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="https://instagram.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              واتساب
            </label>
            <input
              type="tel"
              value={settings.social.whatsapp}
              onChange={(e) => setSettings({
                ...settings,
                social: { ...settings.social, whatsapp: e.target.value }
              })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="رقم الواتساب"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">إعدادات الإشعارات</h3>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, email: e.target.checked }
              })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>إشعارات البريد الإلكتروني</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications.sms}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, sms: e.target.checked }
              })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>إشعارات الرسائل النصية</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications.push}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, push: e.target.checked }
              })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>إشعارات التطبيق</span>
          </label>
        </div>
      </div>
    </div>
  );
}