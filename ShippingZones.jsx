import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function ShippingZones() {
  const { user } = useAuth();
  const [zones, setZones] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    vendor_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // جلب البائعين
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('id, store_name')
        .order('store_name');

      if (vendorsError) throw vendorsError;
      setVendors(vendorsData || []);

      // جلب مناطق الشحن
      const { data: zonesData, error: zonesError } = await supabase
        .from('shipping_zones')
        .select(`
          *,
          vendor:vendor_id(store_name)
        `)
        .order('name');

      if (zonesError) throw zonesError;
      setZones(zonesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('فشل في تحميل البيانات. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const initialFilters = {
    name: {
      type: 'text',
      label: 'اسم المنطقة',
      placeholder: 'البحث باسم المنطقة',
      value: ''
    },
    vendor_id: {
      type: 'select',
      label: 'البائع',
      placeholder: 'جميع البائعين',
      options: vendors.map(vendor => ({
        value: vendor.id,
        label: vendor.store_name
      })),
      value: ''
    }
  };

  const { filters, filterData, handleFilterChange } = useFilters(initialFilters);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // التحقق من البيانات المطلوبة
      if (!formData.name) {
        toast.error('الرجاء إدخال اسم المنطقة');
        return;
      }

      // تحويل البيانات إلى الشكل المناسب
      const zoneData = {
        name: formData.name,
        vendor_id: formData.vendor_id || user?.id
      };

      if (editingZone) {
        // تحديث منطقة شحن موجودة
        const { error } = await supabase
          .from('shipping_zones')
          .update(zoneData)
          .eq('id', editingZone.id);

        if (error) throw error;
        toast.success('تم تحديث منطقة الشحن بنجاح');
      } else {
        // إضافة منطقة شحن جديدة
        const { error } = await supabase
          .from('shipping_zones')
          .insert([zoneData]);

        if (error) throw error;
        toast.success('تم إضافة منطقة الشحن بنجاح');
      }

      // إعادة تحميل البيانات
      fetchData();

      // إغلاق النموذج وإعادة تعيين البيانات
      setShowModal(false);
      setEditingZone(null);
      setFormData({
        name: '',
        vendor_id: ''
      });
    } catch (error) {
      console.error('Error saving shipping zone:', error);
      toast.error(editingZone ? 'فشل في تحديث منطقة الشحن' : 'فشل في إضافة منطقة الشحن');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف منطقة الشحن هذه؟ سيتم حذف جميع طرق الشحن المرتبطة بها.')) return;

    try {
      const { error } = await supabase
        .from('shipping_zones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم حذف منطقة الشحن بنجاح');
      fetchData();
    } catch (error) {
      console.error('Error deleting shipping zone:', error);
      toast.error('فشل في حذف منطقة الشحن');
    }
  };

  const filteredZones = filterData(zones);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <h3 className="text-lg font-semibold mb-2">خطأ</h3>
        <p>{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">مناطق الشحن</h2>
        <button
          onClick={() => {
            setEditingZone(null);
            setFormData({
              name: '',
              vendor_id: ''
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          إضافة منطقة شحن
        </button>
      </div>

      <SearchFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المنطقة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">البائع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الإنشاء</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredZones.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    لا توجد مناطق شحن متطابقة مع معايير البحث
                  </td>
                </tr>
              ) : (
                filteredZones.map(zone => (
                  <tr key={zone.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{zone.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {zone.vendor || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(zone.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingZone(zone);
                          setFormData({
                            name: zone.name,
                            vendor_id: zone.vendor_id || ''
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 ml-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(zone.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingZone(null);
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              {editingZone ? 'تعديل منطقة الشحن' : 'إضافة منطقة شحن جديدة'}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المنطقة <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              {user?.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البائع
                  </label>
                  <select
                    value={formData.vendor_id}
                    onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  >
                    <option value="">اختر البائع</option>
                    {vendors.map(vendor => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.store_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingZone(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingZone ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}