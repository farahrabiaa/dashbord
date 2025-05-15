import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function MenuSettings() {
  const [menuItems, setMenuItems] = useState([
    { 
      id: 'overview', 
      label: 'الإحصائيات', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/stats', description: 'إحصائيات عامة للنظام' },
        { method: 'GET', path: '/stats/sales', description: 'إحصائيات المبيعات' }
      ]
    },
    { 
      id: 'financial-dashboard', 
      label: 'لوحة المعلومات المالية', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/financial/summary', description: 'ملخص مالي للنظام' },
        { method: 'GET', path: '/financial/commissions', description: 'عمولات الإدارة' },
        { method: 'GET', path: '/financial/vendor-balances', description: 'أرصدة البائعين' },
        { method: 'GET', path: '/financial/driver-balances', description: 'أرصدة السائقين' }
      ]
    },
    { 
      id: 'orders', 
      label: 'الطلبات', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/orders', description: 'قائمة الطلبات' },
        { method: 'POST', path: '/orders/update-status', description: 'تحديث حالة الطلب' }
      ]
    },
    { 
      id: 'products', 
      label: 'المنتجات', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/products', description: 'قائمة المنتجات' },
        { method: 'POST', path: '/products', description: 'إضافة منتج جديد' },
        { method: 'PUT', path: '/products/{id}', description: 'تحديث منتج' },
        { method: 'DELETE', path: '/products/{id}', description: 'حذف منتج' }
      ]
    },
    { 
      id: 'categories', 
      label: 'التصنيفات', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/categories', description: 'قائمة التصنيفات' },
        { method: 'POST', path: '/categories', description: 'إضافة تصنيف جديد' },
        { method: 'PUT', path: '/categories/{id}', description: 'تحديث تصنيف' },
        { method: 'DELETE', path: '/categories/{id}', description: 'حذف تصنيف' }
      ]
    },
    { 
      id: 'vendors', 
      label: 'البائعين', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/vendors', description: 'قائمة البائعين' },
        { method: 'POST', path: '/vendors', description: 'إضافة بائع جديد' },
        { method: 'PUT', path: '/vendors/{id}', description: 'تحديث بائع' },
        { method: 'DELETE', path: '/vendors/{id}', description: 'حذف بائع' }
      ]
    },
    { 
      id: 'drivers', 
      label: 'السائقين', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/drivers', description: 'قائمة السائقين' },
        { method: 'GET', path: '/drivers/available', description: 'السائقين المتاحين' },
        { method: 'GET', path: '/drivers/location', description: 'مواقع السائقين' },
        { method: 'POST', path: '/drivers/location', description: 'تحديث موقع السائق' }
      ]
    },
    { 
      id: 'delivery', 
      label: 'التوصيل', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/delivery/methods', description: 'طرق التوصيل المتاحة' },
        { method: 'POST', path: '/delivery/calculate', description: 'حساب تكلفة التوصيل' }
      ]
    },
    { 
      id: 'payments', 
      label: 'طرق الدفع', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/payment/methods', description: 'طرق الدفع المتاحة' },
        { method: 'POST', path: '/payment/process', description: 'معالجة عملية الدفع' }
      ]
    },
    { 
      id: 'customers', 
      label: 'الزبائن', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/customers', description: 'قائمة الزبائن' },
        { method: 'DELETE', path: '/customers/{id}', description: 'حذف زبون' }
      ]
    },
    { 
      id: 'wholesale', 
      label: 'عملاء الجملة', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/wholesale/customers', description: 'قائمة عملاء الجملة' },
        { method: 'POST', path: '/wholesale/approve', description: 'اعتماد عميل جملة' }
      ]
    },
    { 
      id: 'users', 
      label: 'المستخدمين', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/auth/users', description: 'قائمة المستخدمين' },
        { method: 'POST', path: '/auth/users', description: 'إضافة مستخدم جديد' }
      ]
    },
    { 
      id: 'media', 
      label: 'الوسائط', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/storage/list/{bucket}', description: 'قائمة الوسائط' },
        { method: 'POST', path: '/storage/upload/{bucket}', description: 'رفع ملف جديد' },
        { method: 'DELETE', path: '/storage/remove/{bucket}/{path}', description: 'حذف ملف' }
      ]
    },
    { 
      id: 'ratings', 
      label: 'التقييمات', 
      enabled: true, 
      subItems: [
        { id: 'vendor-ratings', label: 'تقييمات المتاجر', enabled: true },
        { id: 'driver-ratings', label: 'تقييمات السائقين', enabled: true },
        { id: 'customer-ratings', label: 'تقييمات الزبائن', enabled: true },
        { id: 'ratings-report', label: 'تقرير التقييمات الشهري', enabled: true }
      ],
      endpoints: [
        { method: 'GET', path: '/ratings/{type}/{id}', description: 'عرض تقييمات محددة' },
        { method: 'POST', path: '/ratings', description: 'إضافة تقييم جديد' },
        { method: 'GET', path: '/ratings/report/{type}/{year}', description: 'تقرير التقييمات الشهري' }
      ]
    },
    { 
      id: 'advertisements', 
      label: 'الإعلانات', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/advertisements', description: 'قائمة الإعلانات' },
        { method: 'POST', path: '/advertisements', description: 'إضافة إعلان جديد' },
        { method: 'PUT', path: '/advertisements/{id}', description: 'تحديث إعلان' },
        { method: 'DELETE', path: '/advertisements/{id}', description: 'حذف إعلان' }
      ]
    },
    { 
      id: 'coupons', 
      label: 'كوبونات الخصم', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/coupons', description: 'قائمة الكوبونات' },
        { method: 'POST', path: '/coupons/validate', description: 'التحقق من صلاحية كوبون' }
      ]
    },
    { 
      id: 'points-rewards', 
      label: 'النقاط والمكافآت', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/points/balance', description: 'رصيد النقاط' },
        { method: 'POST', path: '/points/redeem', description: 'استبدال النقاط' }
      ]
    },
    { 
      id: 'referral', 
      label: 'نظام الإحالة', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/referral/code', description: 'كود الإحالة' },
        { method: 'POST', path: '/referral/apply', description: 'تطبيق كود إحالة' }
      ]
    },
    { 
      id: 'notifications', 
      label: 'الإشعارات', 
      enabled: true,
      endpoints: [
        { method: 'GET', path: '/notifications', description: 'قائمة الإشعارات' },
        { method: 'POST', path: '/notifications/send', description: 'إرسال إشعار' }
      ]
    },
    { 
      id: 'settings', 
      label: 'الإعدادات', 
      enabled: true, 
      subItems: [
        { id: 'general', label: 'إعدادات عامة', enabled: true },
        { id: 'menu', label: 'إعدادات القائمة', enabled: true },
        { id: 'wallet', label: 'إعدادات المحفظة', enabled: true },
        { id: 'login', label: 'إعدادات تسجيل الدخول', enabled: true }
      ],
      endpoints: [
        { method: 'GET', path: '/app_settings', description: 'إعدادات النظام' },
        { method: 'PUT', path: '/app_settings/{id}', description: 'تحديث الإعدادات' }
      ]
    }
  ]);

  const handleToggle = (itemId, subItemId = null) => {
    setMenuItems(menuItems.map(item => {
      if (subItemId) {
        if (item.id === itemId && item.subItems) {
          return {
            ...item,
            subItems: item.subItems.map(subItem => 
              subItem.id === subItemId ? { ...subItem, enabled: !subItem.enabled } : subItem
            )
          };
        }
        return item;
      }
      
      if (item.id === itemId) {
        return { ...item, enabled: !item.enabled };
      }
      return item;
    }));
    toast.success('تم حفظ التغييرات بنجاح');
  };

  const handleSaveAll = () => {
    toast.success('تم حفظ جميع التغييرات بنجاح');
  };

  const renderEndpoints = (endpoints) => {
    if (!endpoints || endpoints.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-1 text-sm">
        <p className="font-medium text-gray-700">نقاط النهاية:</p>
        <div className="bg-gray-50 p-2 rounded-md">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="mb-1 last:mb-0">
              <span className={`inline-block w-16 px-1 py-0.5 rounded text-xs font-medium ${
                endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {endpoint.method}
              </span>
              <code className="mx-2 text-xs bg-gray-100 px-1 py-0.5 rounded">{endpoint.path}</code>
              <span className="text-gray-600 text-xs">{endpoint.description}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMenuItem = (item) => (
    <div key={item.id} className="space-y-2">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">{item.label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={item.enabled}
                onChange={() => handleToggle(item.id)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          {renderEndpoints(item.endpoints)}
        </div>
      </div>

      {item.subItems && item.enabled && (
        <div className="mr-8 space-y-2">
          {item.subItems.map(subItem => (
            <div
              key={subItem.id}
              className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{subItem.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={subItem.enabled}
                      onChange={() => handleToggle(item.id, subItem.id)}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">إعدادات القائمة</h2>
          <button
            onClick={handleSaveAll}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            حفظ التغييرات
          </button>
        </div>

        <div className="space-y-4">
          {menuItems.map(renderMenuItem)}
        </div>
      </div>
    </div>
  );
}