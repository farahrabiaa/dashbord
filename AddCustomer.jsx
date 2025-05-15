import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';

export default function AddCustomer() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // بيانات الزبون
    name: '',
    phone: '',
    email: '',
    password: '', // حقل كلمة المرور
    address: '',
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [customerId, setCustomerId] = useState(null);

  // التحقق من وجود بيانات للتعديل في localStorage
  useEffect(() => {
    const customerToEdit = localStorage.getItem('customerToEdit');
    if (customerToEdit) {
      try {
        const parsedCustomer = JSON.parse(customerToEdit);
        setFormData({
          name: parsedCustomer.name || '',
          phone: parsedCustomer.phone || '',
          email: parsedCustomer.email || '',
          password: '', // كلمة المرور فارغة عند التعديل
          address: parsedCustomer.address || '',
          notes: parsedCustomer.notes || ''
        });
        setCustomerId(parsedCustomer.id);
        setIsEditing(true);
        // حذف البيانات من localStorage بعد استخدامها
        localStorage.removeItem('customerToEdit');
      } catch (e) {
        console.error('Error parsing customer data:', e);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // التحقق من البيانات المطلوبة
      if (!formData.name || !formData.phone) {
        toast.error('الرجاء إدخال الاسم ورقم الهاتف');
        setLoading(false);
        return;
      }

      if (isEditing) {
        // تحديث بيانات الزبون الموجود
        const updateData = {
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          address: formData.address || null,
          notes: formData.notes || null
        };

        const { error } = await supabase
          .from('customers')
          .update(updateData)
          .eq('id', customerId);
        
        if (error) throw error;

        // إذا تم تقديم كلمة مرور جديدة، قم بتحديثها
        if (formData.password) {
          // الحصول على معرف المستخدم للزبون
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('user_id')
            .eq('id', customerId)
            .single();
          
          if (customerError) throw customerError;
          
          if (customerData.user_id) {
            // تحديث كلمة المرور
            const { error: passwordError } = await supabase.rpc(
              'change_custom_user_password',
              { 
                p_user_id: customerData.user_id,
                p_new_password: formData.password
              }
            );
            
            if (passwordError) throw passwordError;
          }
        }
        
        toast.success('تم تحديث بيانات الزبون بنجاح');
      } else {
        // إنشاء مستخدم جديد
        if (!formData.password) {
          toast.error('الرجاء إدخال كلمة مرور للزبون');
          setLoading(false);
          return;
        }
        
        // التحقق من صحة كلمة المرور
        if (formData.password.length < 6) {
          toast.error('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
          setLoading(false);
          return;
        }

        // إنشاء مستخدم جديد في نظام المصادقة
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email || `${formData.phone}@example.com`,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              phone: formData.phone,
              role: 'customer'
            }
          }
        });
        
        if (authError) {
          console.error('Error creating user:', authError);
          toast.error("خطأ في إنشاء المستخدم: " + authError.message);
          
          // محاولة إنشاء مستخدم مخصص بدلاً من استخدام نظام المصادقة
          try {
            // إنشاء مستخدم مخصص
            const { data: userId, error: userError } = await supabase.rpc(
              'add_custom_user',
              {
                p_username: formData.phone,
                p_password: formData.password,
                p_name: formData.name,
                p_email: formData.email,
                p_phone: formData.phone,
                p_role: 'customer'
              }
            );
            
            if (userError) throw userError;
            
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
            setIsEditing(false);
            setCustomerId(null);
            
            setLoading(false);
            return;
          } catch (customError) {
            console.error('Error creating custom user:', customError);
            toast.error("فشل في إنشاء مستخدم مخصص: " + customError.message);
            setLoading(false);
            return;
          }
        }
        
        // إضافة زبون جديد
        const { data, error } = await supabase
          .from('customers')
          .insert([{
            user_id: authData.user.id,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            notes: formData.notes
          }])
          .select();
        
        if (error) throw error;
        
        toast.success('تم إضافة الزبون بنجاح');
      }
      
      // إعادة تعيين النموذج
      setFormData({
        name: '',
        phone: '',
        email: '',
        password: '',
        address: '',
        notes: ''
      });
      setIsEditing(false);
      setCustomerId(null);
      
    } catch (error) {
      console.error('Error adding/updating customer:', error);
      toast.error(error.message || 'فشل في إضافة/تحديث الزبون');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{isEditing ? 'تعديل بيانات الزبون' : 'إضافة زبون جديد'}</h2>
      
      {!isEditing && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
          <p className="text-blue-700">
            سيتم إنشاء حساب للزبون باستخدام رقم الهاتف كاسم مستخدم وكلمة المرور المدخلة.
          </p>
        </div>
      )}
      
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
                  كلمة المرور {isEditing ? '' : <span className="text-red-600">*</span>}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required={!isEditing}
                    placeholder={isEditing ? "اتركه فارغاً للاحتفاظ بكلمة المرور الحالية" : ""}
                    minLength={6}
                  />
                </div>
                {isEditing && (
                  <p className="mt-1 text-sm text-gray-500">
                    اتركه فارغاً للاحتفاظ بكلمة المرور الحالية
                  </p>
                )}
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
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setCustomerId(null);
                  setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    password: '',
                    address: '',
                    notes: ''
                  });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 ml-2"
              >
                إلغاء
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'جاري الحفظ...' : (isEditing ? 'تحديث الزبون' : 'إضافة زبون جديد')}
            </button>
          </div>
        </form>
      </div>
      
      {!isEditing && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">ملاحظات هامة</h3>
          <ul className="list-disc list-inside space-y-2 text-blue-700">
            <li>يتم إنشاء حساب للزبون باستخدام رقم الهاتف كاسم مستخدم.</li>
            <li>يجب أن تكون كلمة المرور 6 أحرف على الأقل.</li>
            <li>يمكن للزبون تسجيل الدخول باستخدام رقم الهاتف وكلمة المرور.</li>
            <li>يمكن للزبون تغيير كلمة المرور لاحقًا من خلال حسابه.</li>
          </ul>
        </div>
      )}
    </div>
  );
}