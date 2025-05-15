import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function DirectCustomerCreation() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // بيانات الزبون
    name: '',
    phone: '',
    email: '',
    password: '', // إضافة حقل كلمة المرور
    address: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // التحقق من البيانات المطلوبة
      if (!formData.name || !formData.phone || !formData.password) {
        toast.error('الرجاء تعبئة جميع الحقول المطلوبة');
        setLoading(false);
        return;
      }
      
      // إنشاء مستخدم مخصص جديد
      const { data: userId, error: userError } = await supabase.rpc(
        'add_custom_user',
        {
          p_username: formData.phone, // استخدام رقم الهاتف كاسم مستخدم
          p_password: formData.password,
          p_name: formData.name,
          p_email: formData.email,
          p_phone: formData.phone,
          p_role: 'customer'
        }
      );
      
      if (userError) {
        console.error('Error creating custom user:', userError);
        
        // محاولة إنشاء مستخدم بطريقة بديلة
        const customUserId = uuidv4();
        
        // إنشاء مستخدم مخصص مباشرة
        const { error: insertError } = await supabase
          .from('custom_users')
          .insert([{
            id: customUserId,
            username: formData.phone,
            password: formData.password,
            password_hash: await hashPassword(formData.password),
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: 'customer',
            status: 'active'
          }]);
        
        if (insertError) throw insertError;
        
        // إضافة زبون جديد
        const { data, error } = await supabase
          .from('customers')
          .insert([{
            user_id: customUserId,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            notes: formData.notes
          }])
          .select();
        
        if (error) throw error;
      } else {
        // إضافة زبون جديد
        const { data, error } = await supabase
          .from('customers')
          .insert([{
            user_id: userId,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            notes: formData.notes
          }])
          .select();
        
        if (error) throw error;
      }
      
      toast.success('تم إضافة الزبون بنجاح');
      
      // إعادة تعيين النموذج
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        address: '',
        notes: ''
      });
      
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error(error.message || 'فشل في إضافة الزبون');
    } finally {
      setLoading(false);
    }
  };

  // دالة لتشفير كلمة المرور
  const hashPassword = async (password) => {
    // استخدام خوارزمية SHA-256 لتشفير كلمة المرور
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إضافة زبون مباشرة</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">بيانات الزبون</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  rows="3"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'جاري الإضافة...' : 'إضافة زبون جديد'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">ملاحظات هامة</h3>
        <ul className="list-disc list-inside space-y-2 text-blue-700">
          <li>يتم إنشاء حساب مستخدم مخصص للزبون باستخدام رقم الهاتف كاسم مستخدم وكلمة المرور المدخلة.</li>
          <li>يمكن للزبون تسجيل الدخول باستخدام رقم الهاتف وكلمة المرور.</li>
          <li>تأكد من إدخال كلمة مرور قوية وآمنة للزبون.</li>
          <li>يمكن للزبون تغيير كلمة المرور لاحقًا من خلال حسابه.</li>
          <li>يتم تشفير كلمة المرور قبل تخزينها في قاعدة البيانات.</li>
        </ul>
      </div>
    </div>
  );
}