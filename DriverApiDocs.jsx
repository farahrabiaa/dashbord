import React from 'react';

export default function DriverApiDocs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">توثيق واجهة برمجة التطبيقات للسائقين</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">المصادقة</h3>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">المصادقة الأساسية</h4>
            <p className="text-gray-600 mb-2">
              يمكنك استخدام المصادقة الأساسية (Basic Authentication) مع مفتاح المستهلك وسر المستهلك:
            </p>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`const credentials = btoa(\`\${consumerKey}:\${consumerSecret}\`);

fetch('https://example.com/api/drivers', {
  headers: {
    'Authorization': \`Basic \${credentials}\`,
    'Content-Type': 'application/json'
  }
})`}
              </code>
            </pre>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">معلمات URL</h4>
            <p className="text-gray-600 mb-2">
              يمكنك أيضًا تمرير المفاتيح كمعلمات URL:
            </p>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`fetch('https://example.com/api/drivers?consumer_key=ck_xxxx&consumer_secret=cs_xxxx')`}
              </code>
            </pre>
            <p className="text-sm text-yellow-600 mt-2">
              ملاحظة: لا ينصح باستخدام هذه الطريقة في بيئة الإنتاج لأسباب أمنية.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">نقاط النهاية المتاحة</h3>
        
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-800 mb-2">الحصول على جميع السائقين</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">GET</span>
              <code className="text-sm">/drivers</code>
            </div>
            <p className="text-gray-600 mb-2">
              يعيد قائمة بجميع السائقين مع معلومات المستخدم المخصص.
            </p>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`// مثال الاستجابة
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "خالد أحمد",
    "phone": "0599123456",
    "email": "khaled@example.com",
    "status": "available",
    "rating": 4.8,
    "rating_count": 156,
    "commission_rate": 15,
    "vehicle_type": "motorcycle",
    "vehicle_model": "هوندا",
    "vehicle_year": "2022",
    "vehicle_plate": "1234-H",
    "working_areas": ["رام الله", "البيرة"],
    "user": {
      "id": "uuid",
      "username": "khaled123",
      "name": "خالد أحمد",
      "email": "khaled@example.com",
      "phone": "0599123456",
      "role": "driver"
    }
  }
]`}
              </code>
            </pre>
          </div>
          
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-800 mb-2">الحصول على سائق محدد</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">GET</span>
              <code className="text-sm">/drivers/{'{id}'}</code>
            </div>
            <p className="text-gray-600 mb-2">
              يعيد معلومات سائق محدد بواسطة المعرف.
            </p>
          </div>
          
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-800 mb-2">الحصول على السائقين المتاحين</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">GET</span>
              <code className="text-sm">/drivers/available</code>
            </div>
            <p className="text-gray-600 mb-2">
              يعيد قائمة بالسائقين المتاحين حاليًا.
            </p>
          </div>
          
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-800 mb-2">الحصول على السائقين حسب المنطقة</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">GET</span>
              <code className="text-sm">/drivers/by-area?area={'{area}'}</code>
            </div>
            <p className="text-gray-600 mb-2">
              يعيد قائمة بالسائقين المتاحين في منطقة محددة.
            </p>
          </div>
          
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-800 mb-2">تحديث موقع السائق</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">PUT</span>
              <code className="text-sm">/drivers/{'{id}'}/location</code>
            </div>
            <p className="text-gray-600 mb-2">
              تحديث موقع السائق.
            </p>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`// مثال الطلب
{
  "latitude": 31.5017,
  "longitude": 34.4668
}`}
              </code>
            </pre>
          </div>
          
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-800 mb-2">تحديث حالة السائق</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">PUT</span>
              <code className="text-sm">/drivers/{'{id}'}/status</code>
            </div>
            <p className="text-gray-600 mb-2">
              تحديث حالة السائق (متاح، مشغول، غير متصل).
            </p>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`// مثال الطلب
{
  "status": "available" // يمكن أن تكون "available", "busy", "offline"
}`}
              </code>
            </pre>
          </div>
          
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-800 mb-2">إنشاء سائق جديد</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">POST</span>
              <code className="text-sm">/drivers</code>
            </div>
            <p className="text-gray-600 mb-2">
              إنشاء سائق جديد مع مستخدم مخصص.
            </p>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`// مثال الطلب
{
  "username": "khaled123",
  "password": "password123",
  "name": "خالد أحمد",
  "phone": "0599123456",
  "email": "khaled@example.com",
  "status": "offline",
  "commission_rate": 15,
  "vehicle_type": "motorcycle",
  "vehicle_model": "هوندا",
  "vehicle_year": "2022",
  "vehicle_plate": "1234-H",
  "working_areas": ["رام الله", "البيرة"]
}`}
              </code>
            </pre>
          </div>
          
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-800 mb-2">تحديث سائق</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">PUT</span>
              <code className="text-sm">/drivers/{'{id}'}</code>
            </div>
            <p className="text-gray-600 mb-2">
              تحديث بيانات سائق موجود.
            </p>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`// مثال الطلب
{
  "name": "خالد أحمد",
  "phone": "0599123456",
  "email": "khaled@example.com",
  "status": "available",
  "commission_rate": 15,
  "vehicle_type": "motorcycle",
  "vehicle_model": "هوندا",
  "vehicle_year": "2022",
  "vehicle_plate": "1234-H",
  "working_areas": ["رام الله", "البيرة"],
  "password": "newpassword123" // اختياري، فقط إذا كنت تريد تغيير كلمة المرور
}`}
              </code>
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">حذف سائق</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">DELETE</span>
              <code className="text-sm">/drivers/{'{id}'}</code>
            </div>
            <p className="text-gray-600 mb-2">
              حذف سائق والمستخدم المخصص المرتبط به.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">أمثلة على الاستخدام</h3>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">الحصول على السائقين المتاحين في منطقة محددة</h4>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`// باستخدام fetch
const credentials = btoa(\`\${consumerKey}:\${consumerSecret}\`);

fetch('https://example.com/api/drivers/by-area?area=رام%20الله', {
  headers: {
    'Authorization': \`Basic \${credentials}\`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// باستخدام axios
import axios from 'axios';

const credentials = btoa(\`\${consumerKey}:\${consumerSecret}\`);

axios.get('https://example.com/api/drivers/by-area', {
  params: { area: 'رام الله' },
  headers: {
    'Authorization': \`Basic \${credentials}\`,
    'Content-Type': 'application/json'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error('Error:', error));`}
              </code>
            </pre>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">تحديث حالة السائق</h4>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`// باستخدام fetch
const credentials = btoa(\`\${consumerKey}:\${consumerSecret}\`);

fetch('https://example.com/api/drivers/123e4567-e89b-12d3-a456-426614174000/status', {
  method: 'PUT',
  headers: {
    'Authorization': \`Basic \${credentials}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ status: 'available' })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// باستخدام axios
import axios from 'axios';

const credentials = btoa(\`\${consumerKey}:\${consumerSecret}\`);

axios.put('https://example.com/api/drivers/123e4567-e89b-12d3-a456-426614174000/status', 
  { status: 'available' },
  {
    headers: {
      'Authorization': \`Basic \${credentials}\`,
      'Content-Type': 'application/json'
    }
  }
)
.then(response => console.log(response.data))
.catch(error => console.error('Error:', error));`}
              </code>
            </pre>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">ملاحظات هامة</h3>
        <ul className="list-disc list-inside space-y-2 text-blue-700">
          <li>تأكد من حماية مفاتيح API الخاصة بك وعدم مشاركتها.</li>
          <li>استخدم HTTPS دائمًا عند التعامل مع واجهة برمجة التطبيقات.</li>
          <li>يمكن للسائقين تحديث موقعهم وحالتهم فقط، ولا يمكنهم تعديل بيانات سائقين آخرين.</li>
          <li>يتم تخزين مناطق العمل كمصفوفة نصية، مما يسهل البحث عن السائقين حسب المنطقة.</li>
          <li>يتم تشفير كلمات المرور باستخدام خوارزمية SHA-256 لضمان الأمان.</li>
        </ul>
      </div>
    </div>
  );
}