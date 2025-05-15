import React from 'react';

export default function CategoryApiDocs() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">توثيق واجهة برمجة التطبيقات للتصنيفات</h2>
      
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

fetch('https://example.com/api/categories', {
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
{`fetch('https://example.com/api/categories?consumer_key=ck_xxxx&consumer_secret=cs_xxxx')`}
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
            <h4 className="font-medium text-gray-800 mb-2">الحصول على جميع التصنيفات</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">GET</span>
              <code className="text-sm">/categories</code>
            </div>
            <p className="text-gray-600 mb-2">
              يعيد قائمة بجميع التصنيفات.
            </p>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`// مثال الاستجابة
[
  {
    "id": "uuid",
    "name": "مشروبات ساخنة",
    "slug": "hot-beverages",
    "parent_id": null,
    "description": "القهوة والشاي والمشروبات الساخنة",
    "created_at": "2025-04-20T10:30:00Z",
    "updated_at": "2025-04-20T10:30:00Z"
  },
  {
    "id": "uuid",
    "name": "عصائر",
    "slug": "juices",
    "parent_id": null,
    "description": "العصائر الطازجة والمشروبات الباردة",
    "created_at": "2025-04-20T10:30:00Z",
    "updated_at": "2025-04-20T10:30:00Z"
  }
]`}
              </code>
            </pre>
          </div>
          
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-800 mb-2">الحصول على تصنيف محدد</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">GET</span>
              <code className="text-sm">/categories/{'{id}'}</code>
            </div>
            <p className="text-gray-600 mb-2">
              يعيد معلومات تصنيف محدد بواسطة المعرف.
            </p>
          </div>
          
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-800 mb-2">الحصول على شجرة التصنيفات</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">GET</span>
              <code className="text-sm">/categories/tree</code>
            </div>
            <p className="text-gray-600 mb-2">
              يعيد شجرة التصنيفات مع التصنيفات الفرعية.
            </p>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`// مثال الاستجابة
[
  {
    "id": "uuid",
    "name": "مشروبات",
    "slug": "beverages",
    "parent_id": null,
    "description": "جميع أنواع المشروبات",
    "children": [
      {
        "id": "uuid",
        "name": "مشروبات ساخنة",
        "slug": "hot-beverages",
        "parent_id": "uuid",
        "description": "القهوة والشاي والمشروبات الساخنة",
        "children": []
      },
      {
        "id": "uuid",
        "name": "عصائر",
        "slug": "juices",
        "parent_id": "uuid",
        "description": "العصائر الطازجة والمشروبات الباردة",
        "children": []
      }
    ]
  }
]`}
              </code>
            </pre>
          </div>
          
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-800 mb-2">الحصول على منتجات تصنيف محدد</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">GET</span>
              <code className="text-sm">/categories/{'{id}'}/products</code>
            </div>
            <p className="text-gray-600 mb-2">
              يعيد قائمة بالمنتجات في تصنيف محدد.
            </p>
          </div>
          
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-800 mb-2">إنشاء تصنيف جديد</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">POST</span>
              <code className="text-sm">/categories</code>
            </div>
            <p className="text-gray-600 mb-2">
              إنشاء تصنيف جديد.
            </p>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`// مثال الطلب
{
  "name": "حلويات",
  "slug": "desserts",
  "description": "الحلويات والكيك",
  "parent_id": null
}`}
              </code>
            </pre>
          </div>
          
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-800 mb-2">تحديث تصنيف</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">PUT</span>
              <code className="text-sm">/categories/{'{id}'}</code>
            </div>
            <p className="text-gray-600 mb-2">
              تحديث بيانات تصنيف موجود.
            </p>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`// مثال الطلب
{
  "name": "حلويات وكيك",
  "slug": "desserts-and-cakes",
  "description": "الحلويات والكيك بأنواعها",
  "parent_id": null
}`}
              </code>
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">حذف تصنيف</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">DELETE</span>
              <code className="text-sm">/categories/{'{id}'}</code>
            </div>
            <p className="text-gray-600 mb-2">
              حذف تصنيف. لا يمكن حذف التصنيف إذا كان يحتوي على تصنيفات فرعية أو منتجات.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">أمثلة على الاستخدام</h3>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">الحصول على شجرة التصنيفات</h4>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`// باستخدام fetch
const credentials = btoa(\`\${consumerKey}:\${consumerSecret}\`);

fetch('https://example.com/api/categories/tree', {
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

axios.get('https://example.com/api/categories/tree', {
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
            <h4 className="font-medium text-gray-800 mb-2">إنشاء تصنيف جديد</h4>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`// باستخدام fetch
const credentials = btoa(\`\${consumerKey}:\${consumerSecret}\`);

fetch('https://example.com/api/categories', {
  method: 'POST',
  headers: {
    'Authorization': \`Basic \${credentials}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'حلويات',
    slug: 'desserts',
    description: 'الحلويات والكيك',
    parent_id: null
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// باستخدام axios
import axios from 'axios';

const credentials = btoa(\`\${consumerKey}:\${consumerSecret}\`);

axios.post('https://example.com/api/categories', 
  {
    name: 'حلويات',
    slug: 'desserts',
    description: 'الحلويات والكيك',
    parent_id: null
  },
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
          <li>لا يمكن حذف التصنيف إذا كان يحتوي على تصنيفات فرعية أو منتجات.</li>
          <li>يجب أن يكون الـ slug فريدًا لكل تصنيف.</li>
          <li>يمكن استخدام شجرة التصنيفات لعرض التصنيفات بشكل هرمي في واجهة المستخدم.</li>
        </ul>
      </div>
    </div>
  );
}