import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import VendorForm from '../Vendors/VendorForm';
import { v4 as uuidv4 } from 'uuid';

export default function AddVendor() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e, formData) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // إنشاء مستخدم مخصص جديد
      const userId = await addCustomUser({
        username: formData.store_name.replace(/\s+/g, '_').toLowerCase(),
        password: 'password123', // كلمة مرور افتراضية، يجب تغييرها لاحقًا
        name: formData.store_name,
        email: formData.email || null,
        phone: formData.phone,
        role: 'vendor'
      });
      
      if (!userId) {
        throw new Error('فشل في إنشاء المستخدم المخصص');
      }
      
      // إنشاء بائع جديد
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .insert([{
          user_id: userId,
          store_name: formData.store_name,
          phone: formData.phone,
          address: formData.address,
          description: formData.description,
          delivery_type: formData.delivery_type,
          delivery_radius: formData.delivery_radius,
          price_per_km: formData.price_per_km,
          min_delivery_fee: formData.min_delivery_fee,
          delivery_fee_per_km: formData.delivery_fee_per_km,
          latitude: formData.latitude,
          longitude: formData.longitude,
          status: formData.status,
          logo_url: formData.logo_url,
          banner_url: formData.banner_url,
          commission_rate: formData.commission_rate,
          wallet_enabled: formData.wallet_enabled,
          auto_charge: formData.auto_charge,
          service_areas: formData.service_areas,
          membership: formData.membership
        }])
        .select();
      
      if (vendorError) throw vendorError;
      
      // ربط البائع بالتصنيفات
      if (formData.categories.length > 0) {
        const vendorId = vendorData[0].id;
        const vendorCategories = formData.categories.map(categoryId => ({
          vendor_id: vendorId,
          category_id: categoryId
        }));
        
        const { error: categoriesError } = await supabase
          .from('vendor_categories')
          .insert(vendorCategories);
        
        if (categoriesError) {
          console.error('Error linking categories:', categoriesError);
          // نستمر حتى لو فشل ربط التصنيفات
        }
      }
      
      toast.success('تم إضافة البائع بنجاح');
      
      // إعادة تعيين النموذج (سيتم التعامل معه في المكون الأب)
    } catch (error) {
      console.error('Error adding vendor:', error);
      toast.error(error.message || 'فشل في إضافة البائع');
    } finally {
      setLoading(false);
    }
  };

  // دالة لإضافة مستخدم مخصص
  const addCustomUser = async (userData) => {
    try {
      // التحقق من وجود اسم المستخدم
      const { data: existingUser, error: checkError } = await supabase
        .from('custom_users')
        .select('id')
        .eq('username', userData.username)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingUser) {
        // إذا كان اسم المستخدم موجودًا، أضف رقمًا عشوائيًا
        userData.username = `${userData.username}_${Math.floor(Math.random() * 1000)}`;
      }
      
      // استخدام دالة RPC لإضافة مستخدم مخصص
      const { data, error } = await supabase.rpc(
        'add_custom_user',
        {
          p_username: userData.username,
          p_password: userData.password,
          p_name: userData.name,
          p_email: userData.email,
          p_phone: userData.phone,
          p_role: userData.role
        }
      );
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error adding custom user:', error);
      
      // محاولة إنشاء مستخدم بطريقة بديلة
      try {
        const userId = uuidv4();
        
        // إنشاء مستخدم مخصص مباشرة
        const { error: insertError } = await supabase
          .from('custom_users')
          .insert([{
            id: userId,
            username: userData.username,
            password: userData.password,
            password_hash: await hashPassword(userData.password),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            status: 'active'
          }]);
        
        if (insertError) throw insertError;
        
        return userId;
      } catch (fallbackError) {
        console.error('Fallback error adding custom user:', fallbackError);
        throw fallbackError;
      }
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
      <h2 className="text-2xl font-bold">إضافة بائع جديد</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <VendorForm onSubmit={handleSubmit} />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">ملاحظات هامة</h3>
        <ul className="list-disc list-inside space-y-2 text-blue-700">
          <li>سيتم إنشاء حساب مستخدم مخصص للبائع تلقائيًا.</li>
          <li>كلمة المرور الافتراضية هي "password123" ويجب تغييرها بعد الإنشاء.</li>
          <li>تأكد من تحديد موقع المتجر بدقة على الخريطة لضمان دقة حسابات التوصيل.</li>
          <li>يمكن للبائع تحديث بياناته لاحقًا من خلال لوحة التحكم الخاصة به.</li>
          <li>تأكد من اختيار مناطق الخدمة المناسبة للبائع.</li>
          <li>يجب اختيار تصنيف واحد على الأقل للبائع.</li>
        </ul>
      </div>
    </div>
  );
}