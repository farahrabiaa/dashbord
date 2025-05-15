import React, { useState, Suspense } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { toast } from 'react-toastify';

// Properly use React.lazy by assigning it to a variable
const UserSettings = React.lazy(() => import('./UserSettings'));

export default function Settings() {
  const { settings: globalSettings, saveSettings } = useSettings();
  const [settings, setSettings] = useState({
    store: {
      ...globalSettings.store
    },
    social: {
      ...globalSettings.social
    },
    notifications: {
      ...globalSettings.notifications
    },
    login: {
      ...globalSettings.login
    }
  });

  const [activeTab, setActiveTab] = useState('general');

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

  const renderGeneralSettings = () => (
    <div className="space-y-6">
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
    </div>
  );

  const renderNotificationSettings = () => (
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
  );

  const renderLoginSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">إعدادات صفحة تسجيل الدخول</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رابط شعار صفحة تسجيل الدخول
            </label>
            <input
              type="url"
              value={settings.login.logo}
              onChange={(e) => setSettings({
                ...settings,
                login: { ...settings.login, logo: e.target.value }
              })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رابط خلفية صفحة تسجيل الدخول
            </label>
            <input
              type="url"
              value={settings.login.background}
              onChange={(e) => setSettings({
                ...settings,
                login: { ...settings.login, background: e.target.value }
              })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="https://example.com/background.jpg"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">معاينة صفحة تسجيل الدخول</h3>
        <div className="border rounded-lg overflow-hidden">
          <div className="relative" style={{
            background: settings.login.background 
              ? `url(${settings.login.background}) center/cover no-repeat`
              : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            padding: '2rem',
            minHeight: '400px'
          }}>
            <div className="relative z-10 flex items-center justify-center">
              <div className="bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-200">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    {settings.login.logo ? (
                      <img 
                        src={settings.login.logo} 
                        alt="Logo" 
                        className="h-20 w-20 rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-lg shadow-lg bg-blue-600 text-white flex items-center justify-center text-3xl">
                        🛒
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">تسجيل الدخول</h2>
                  <p className="text-gray-600 mt-2">مرحباً بك في نظام {settings.store.name}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500 shadow-sm"
                        placeholder="أدخل البريد الإلكتروني"
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-yellow-500 focus:border-yellow-500 shadow-sm"
                        placeholder="أدخل كلمة المرور"
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div>
                    <button
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-slate-900 py-2 rounded-md hover:from-yellow-600 hover:to-yellow-700 transition-colors shadow-md font-bold opacity-70 cursor-not-allowed"
                      disabled
                    >
                      تسجيل الدخول
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Add user settings renderer - fixed to use Suspense properly
  const renderUserSettings = () => (
    <div id="userSettings">
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <UserSettings />
      </Suspense>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الإعدادات</h2>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          حفظ التغييرات
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex gap-4 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              إعدادات عامة
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              إعدادات الإشعارات
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`py-4 px-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'login'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              إعدادات تسجيل الدخول
            </button>
            <button
              onClick={() => setActiveTab('user')}
              className={`py-4 px-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'user'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              إعدادات المستخدم
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'login' && renderLoginSettings()}
          {activeTab === 'user' && renderUserSettings()}
        </div>
      </div>
    </div>
  );
}