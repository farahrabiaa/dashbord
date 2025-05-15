import React from 'react';
import ApiKeyManager from '../ApiKeys/ApiKeyManager';

export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إدارة مفاتيح API</h2>
      
      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">ما هي مفاتيح API؟</h3>
        <p className="text-blue-700 mb-4">
          مفاتيح API هي وسيلة آمنة للسماح للتطبيقات الخارجية بالوصول إلى بيانات متجرك. كل مفتاح يتكون من جزأين:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-blue-800 mb-1">مفتاح المستهلك (Consumer Key)</h4>
            <p className="text-sm text-gray-600">
              يبدأ بـ <code className="bg-gray-100 px-1 py-0.5 rounded">ck_</code> ويستخدم لتحديد هوية التطبيق.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-blue-800 mb-1">سر المستهلك (Consumer Secret)</h4>
            <p className="text-sm text-gray-600">
              يبدأ بـ <code className="bg-gray-100 px-1 py-0.5 rounded">cs_</code> ويستخدم للتحقق من صحة الطلبات.
            </p>
          </div>
        </div>
      </div>
      
      <ApiKeyManager />
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">أمثلة على استخدام مفاتيح API</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">مثال باستخدام JavaScript</h4>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`// المصادقة الأساسية
const consumerKey = 'ck_xxxxxxxxxxxxxxxxxxxx';
const consumerSecret = 'cs_xxxxxxxxxxxxxxxxxxxx';
const credentials = btoa(\`\${consumerKey}:\${consumerSecret}\`);

// طلب الحصول على قائمة المنتجات
fetch('https://api.example.com/products', {
  method: 'GET',
  headers: {
    'Authorization': \`Basic \${credentials}\`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
              </code>
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">مثال باستخدام PHP</h4>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`<?php
$consumer_key = 'ck_xxxxxxxxxxxxxxxxxxxx';
$consumer_secret = 'cs_xxxxxxxxxxxxxxxxxxxx';

// طلب الحصول على قائمة المنتجات
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.example.com/products",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Content-Type: application/json",
    "Authorization: Basic " . base64_encode($consumer_key . ":" . $consumer_secret)
  ]
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "Error: " . $err;
} else {
  $products = json_decode($response, true);
  print_r($products);
}
?>`}
              </code>
            </pre>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-800 mb-2">مثال باستخدام Python</h4>
            <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
              <code>
{`import requests
import base64

consumer_key = 'ck_xxxxxxxxxxxxxxxxxxxx'
consumer_secret = 'cs_xxxxxxxxxxxxxxxxxxxx'

# المصادقة الأساسية
credentials = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()

# طلب الحصول على قائمة المنتجات
headers = {
    'Authorization': f'Basic {credentials}',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.example.com/products', headers=headers)

if response.status_code == 200:
    products = response.json()
    print(products)
else:
    print(f"Error: {response.status_code}")
    print(response.text)`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}