import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      consumer_key: 'ck_1234567890abcdef1234567890abcdef',
      description: 'مفتاح API للتطبيق',
      permissions: ['read', 'write'],
      created_at: '2025-01-15T10:30:00Z',
      last_used: '2025-04-17T14:20:00Z',
      status: 'active'
    },
    {
      id: 2,
      consumer_key: 'ck_abcdef1234567890abcdef1234567890',
      description: 'مفتاح API للموقع',
      permissions: ['read'],
      created_at: '2025-02-10T09:15:00Z',
      last_used: '2025-04-15T11:45:00Z',
      status: 'active'
    },
    {
      id: 3,
      consumer_key: 'ck_0987654321fedcba0987654321fedcba',
      description: 'مفتاح API للتطبيق الجوال',
      permissions: ['read', 'write', 'delete'],
      created_at: '2025-03-05T14:30:00Z',
      last_used: null,
      status: 'revoked'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    permissions: ['read']
  });

  const handleCreateKey = () => {
    if (!formData.description) {
      toast.error('الرجاء إدخال وصف للمفتاح');
      return;
    }

    // Generate a mock key
    const consumerKey = 'ck_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const consumerSecret = 'cs_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const newApiKey = {
      id: Math.max(...apiKeys.map(key => key.id)) + 1,
      consumer_key: consumerKey,
      description: formData.description,
      permissions: formData.permissions,
      created_at: new Date().toISOString(),
      last_used: null,
      status: 'active'
    };
    
    setApiKeys([...apiKeys, newApiKey]);
    setNewKey({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret
    });
    setShowNewKey(true);
    setShowForm(false);
    setFormData({
      description: '',
      permissions: ['read']
    });
    
    toast.success('تم إنشاء مفتاح API بنجاح');
  };

  const handleRevokeKey = (id) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, status: 'revoked' } : key
    ));
    toast.success('تم تعطيل المفتاح بنجاح');
  };

  const handleActivateKey = (id) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, status: 'active' } : key
    ));
    toast.success('تم تفعيل المفتاح بنجاح');
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      
      return { ...prev, permissions: newPermissions };
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'لم يستخدم بعد';
    
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">مفاتيح API</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          إنشاء مفتاح جديد
        </button>
      </div>

      {showNewKey && (
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-green-800">تم إنشاء مفتاح API جديد</h3>
            <button
              onClick={() => setShowNewKey(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">مفتاح المستهلك (Consumer Key):</p>
              <div className="flex items-center">
                <code className="bg-white p-2 rounded border flex-1 text-sm font-mono overflow-x-auto">
                  {newKey.consumer_key}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newKey.consumer_key);
                    toast.success('تم نسخ مفتاح المستهلك');
                  }}
                  className="mr-2 p-2 text-blue-600 hover:text-blue-800"
                >
                  نسخ
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">سر المستهلك (Consumer Secret):</p>
              <div className="flex items-center">
                <code className="bg-white p-2 rounded border flex-1 text-sm font-mono overflow-x-auto">
                  {newKey.consumer_secret}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newKey.consumer_secret);
                    toast.success('تم نسخ سر المستهلك');
                  }}
                  className="mr-2 p-2 text-blue-600 hover:text-blue-800"
                >
                  نسخ
                </button>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 font-medium">تنبيه هام!</p>
              <p className="text-yellow-700 text-sm mt-1">
                هذه هي المرة الوحيدة التي سيتم فيها عرض سر المستهلك. يرجى حفظه في مكان آمن.
              </p>
            </div>
          </div>
        </div>
      )}

      {showForm ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">إنشاء مفتاح API جديد</h3>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                placeholder="مثال: تطبيق الجوال، موقع الويب، إلخ"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                أدخل وصفًا يساعدك على تذكر الغرض من هذا المفتاح
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الصلاحيات
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes('read')}
                    onChange={() => handlePermissionChange('read')}
                    className="rounded text-blue-600 focus:ring-blue-500 ml-2"
                  />
                  <span>قراءة (Read)</span>
                  <span className="mr-2 text-sm text-gray-500">- الوصول للقراءة فقط</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes('write')}
                    onChange={() => handlePermissionChange('write')}
                    className="rounded text-blue-600 focus:ring-blue-500 ml-2"
                  />
                  <span>كتابة (Write)</span>
                  <span className="mr-2 text-sm text-gray-500">- إنشاء وتحديث البيانات</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes('delete')}
                    onChange={() => handlePermissionChange('delete')}
                    className="rounded text-blue-600 focus:ring-blue-500 ml-2"
                  />
                  <span>حذف (Delete)</span>
                  <span className="mr-2 text-sm text-gray-500">- حذف البيانات</span>
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                حدد الصلاحيات التي تريد منحها لهذا المفتاح
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleCreateKey}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                إنشاء مفتاح
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المفتاح</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصلاحيات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الإنشاء</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">آخر استخدام</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map(key => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{key.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {key.consumer_key}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(key.consumer_key);
                            toast.success('تم نسخ المفتاح');
                          }}
                          className="mr-2 text-blue-600 hover:text-blue-800"
                        >
                          نسخ
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.includes('read') && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            قراءة
                          </span>
                        )}
                        {key.permissions.includes('write') && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            كتابة
                          </span>
                        )}
                        {key.permissions.includes('delete') && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            حذف
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(key.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(key.last_used)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        key.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {key.status === 'active' ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {key.status === 'active' ? (
                        <button
                          onClick={() => handleRevokeKey(key.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          تعطيل
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateKey(key.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          تفعيل
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">كيفية استخدام مفاتيح API</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">المصادقة الأساسية</h4>
            <p className="text-gray-600 mb-2">
              يمكنك استخدام المصادقة الأساسية (Basic Authentication) مع مفتاح المستهلك وسر المستهلك:
            </p>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`const credentials = btoa(\`\${consumerKey}:\${consumerSecret}\`);

fetch('https://api.example.com/endpoint', {
  headers: {
    'Authorization': \`Basic \${credentials}\`,
    'Content-Type': 'application/json'
  }
})`}
              </code>
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">معلمات URL</h4>
            <p className="text-gray-600 mb-2">
              يمكنك أيضًا تمرير المفاتيح كمعلمات URL:
            </p>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`fetch('https://api.example.com/endpoint?consumer_key=ck_xxxx&consumer_secret=cs_xxxx')`}
              </code>
            </pre>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">ملاحظة أمنية</h4>
            <p className="text-blue-700 text-sm">
              يفضل استخدام المصادقة الأساسية عبر HTTPS لضمان أمان المفاتيح. تجنب استخدام معلمات URL في بيئة الإنتاج.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}