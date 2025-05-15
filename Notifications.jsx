import React, { useState } from 'react';

export default function Notifications() {
  const [notifications] = useState([
    { id: 1, title: 'طلب جديد', message: 'تم استلام طلب جديد من متجر كوفي', time: '10:30', read: false },
    { id: 2, title: 'اكتمال طلب', message: 'تم اكتمال الطلب رقم #123', time: '09:45', read: true },
    { id: 3, title: 'تسجيل سائق', message: 'سائق جديد بحاجة للموافقة', time: '09:00', read: false }
  ]);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">الإشعارات</h2>
        <div className="space-y-4">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{notification.title}</h3>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                </div>
                <span className="text-sm text-gray-500">{notification.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}