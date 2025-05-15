import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useSettings } from '../../contexts/SettingsContext';
import MediaUpload from '../Products/MediaUpload';

export default function LoginSettings() {
  const { settings: globalSettings, saveSettings } = useSettings();
  const [settings, setSettings] = useState({
    login: {
      ...globalSettings.login
    }
  });
  const [errors, setErrors] = useState({
    logo: null,
    background: null
  });

  const handleSave = async () => {
    try {
      // Save settings
      const newSettings = {
        ...globalSettings,
        login: settings.login
      };
      
      const success = await saveSettings(newSettings);
      if (success) {
        toast.success('تم حفظ إعدادات صفحة تسجيل الدخول بنجاح');
      }
    } catch (error) {
      console.error('Error saving login settings:', error);
      toast.error('فشل في حفظ إعدادات صفحة تسجيل الدخول');
    }
  };

  const handleLogoUpload = ({ preview }) => {
    setErrors({ ...errors, logo: null });
    if (preview) {
      setSettings({
        ...settings,
        login: { ...settings.login, logo: preview }
      });
    } else {
      setErrors({ ...errors, logo: 'فشل في تحميل الشعار' });
    }
  };

  const handleBackgroundUpload = ({ preview }) => {
    setErrors({ ...errors, background: null });
    if (preview) {
      setSettings({
        ...settings,
        login: { ...settings.login, background: preview }
      });
    } else {
      setErrors({ ...errors, background: 'فشل في تحميل الخلفية' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إعدادات صفحة تسجيل الدخول</h2>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          حفظ التغييرات
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">الشعار والخلفية</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              شعار صفحة تسجيل الدخول
            </label>
            <div className="mb-4">
              <MediaUpload
                type="image"
                preview={settings.login.logo}
                onUpload={handleLogoUpload}
              />
              {errors.logo && (
                <p className="mt-2 text-sm text-red-600">{errors.logo}</p>
              )}
            </div>
            <p className="text-sm text-gray-500">
              الشعار الذي سيظهر في صفحة تسجيل الدخول. يفضل أن يكون بحجم 200×200 بكسل.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              خلفية صفحة تسجيل الدخول
            </label>
            <div className="mb-4">
              <MediaUpload
                type="image"
                preview={settings.login.background}
                onUpload={handleBackgroundUpload}
              />
              {errors.background && (
                <p className="mt-2 text-sm text-red-600">{errors.background}</p>
              )}
            </div>
            <p className="text-sm text-gray-500">
              صورة الخلفية التي ستظهر في صفحة تسجيل الدخول. يفضل أن تكون بحجم 1920×1080 بكسل.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">معاينة</h3>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="relative" style={{
            background: settings.login.background 
              ? `url(${settings.login.background}) center/cover no-repeat`
              : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            padding: '2rem',
            minHeight: '400px'
          }}>
            {/* Overlay with yellow accents */}
            <div 
              className="absolute inset-0" 
              style={{
                background: 'radial-gradient(circle at top right, rgba(250, 204, 21, 0.1) 0%, rgba(15, 23, 42, 0.9) 70%)',
                boxShadow: 'inset 0 0 100px rgba(250, 204, 21, 0.2)'
              }}
            ></div>
            
            {/* Yellow decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full filter blur-3xl opacity-10 -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400 rounded-full filter blur-3xl opacity-10 -ml-32 -mb-32"></div>
            
            <div className="relative z-10 flex items-center justify-center">
              <div className="bg-white bg-opacity-95 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-full max-w-md border border-gray-200">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    {settings.login.logo ? (
                      <img 
                        src={settings.login.logo} 
                        alt="Logo" 
                        className="h-20 w-20 rounded-lg shadow-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/200?text=Logo';
                        }}
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-lg shadow-lg bg-gray-200 flex items-center justify-center text-gray-400">
                        شعار
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">تسجيل الدخول</h2>
                  <p className="text-gray-600 mt-2">مرحباً بك في نظام {globalSettings.store.name}</p>
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
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
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
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                        disabled
                      />
                      <label className="mr-2 block text-sm text-gray-700">
                        تذكرني
                      </label>
                    </div>
                    
                    <div className="text-sm">
                      <a href="#" className="text-yellow-600 hover:text-yellow-500 font-medium">
                        نسيت كلمة المرور؟
                      </a>
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
}