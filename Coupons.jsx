import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';

export default function Coupons() {
  const [coupons, setCoupons] = useState([
    {
      id: 1,
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      min_order: 50,
      max_discount: 20,
      usage_limit: 100,
      used_count: 45,
      start_date: '2025-01-01',
      end_date: '2025-12-31',
      status: 'active',
      description: 'خصم 10% للطلب الأول'
    },
    {
      id: 2,
      code: 'FREEDEL',
      type: 'fixed',
      value: 15,
      min_order: 100,
      usage_limit: 50,
      used_count: 20,
      start_date: '2025-01-01',
      end_date: '2025-06-30',
      status: 'active',
      description: 'توصيل مجاني'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_order: '',
    max_discount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  const initialFilters = {
    code: {
      type: 'text',
      label: 'كود الخصم',
      placeholder: 'البحث بكود الخصم',
      value: ''
    },
    type: {
      type: 'select',
      label: 'نوع الخصم',
      placeholder: 'جميع الأنواع',
      options: [
        { value: 'percentage', label: 'نسبة مئوية' },
        { value: 'fixed', label: 'مبلغ ثابت' }
      ],
      value: ''
    },
    status: {
      type: 'select',
      label: 'الحالة',
      placeholder: 'جميع الحالات',
      options: [
        { value: 'active', label: 'نشط' },
        { value: 'inactive', label: 'غير نشط' },
        { value: 'expired', label: 'منتهي' }
      ],
      value: ''
    }
  };

  const { filters, filterData, handleFilterChange } = useFilters(initialFilters);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call to save coupon
      toast.success(editingCoupon ? 'تم تحديث الكوبون بنجاح' : 'تم إضافة الكوبون بنجاح');
      setShowModal(false);
      setEditingCoupon(null);
      setFormData({
        code: '',
        type: 'percentage',
        value: '',
        min_order: '',
        max_discount: '',
        usage_limit: '',
        start_date: '',
        end_date: '',
        description: ''
      });
    } catch (error) {
      toast.error('فشل في حفظ الكوبون');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;

    try {
      // API call to delete coupon
      toast.success('تم حذف الكوبون بنجاح');
    } catch (error) {
      toast.error('فشل في حذف الكوبون');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'expired': return 'منتهي';
      default: return status;
    }
  };

  const filteredCoupons = filterData(coupons);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">كوبونات الخصم</h2>
        <button
          onClick={() => {
            setEditingCoupon(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          إضافة كوبون جديد
        </button>
      </div>

      <SearchFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.map(coupon => (
          <div key={coupon.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{coupon.code}</h3>
                <p className="text-gray-600 text-sm">{coupon.description}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(coupon.status)}`}>
                {getStatusText(coupon.status)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <span className="font-medium">نوع الخصم:</span>{' '}
                {coupon.type === 'percentage' ? `${coupon.value}%` : `₪${coupon.value}`}
              </p>
              <p className="text-sm">
                <span className="font-medium">الحد الأدنى للطلب:</span> ₪{coupon.min_order}
              </p>
              {coupon.max_discount && (
                <p className="text-sm">
                  <span className="font-medium">أقصى خصم:</span> ₪{coupon.max_discount}
                </p>
              )}
              <p className="text-sm">
                <span className="font-medium">الاستخدام:</span> {coupon.used_count}/{coupon.usage_limit}
              </p>
              <p className="text-sm">
                <span className="font-medium">الصلاحية:</span>{' '}
                {new Date(coupon.start_date).toLocaleDateString('ar-SA')} -{' '}
                {new Date(coupon.end_date).toLocaleDateString('ar-SA')}
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditingCoupon(coupon);
                  setFormData(coupon);
                  setShowModal(true);
                }}
                className="text-blue-600 hover:text-blue-800 ml-2"
              >
                تعديل
              </button>
              <button
                onClick={() => handleDelete(coupon.id)}
                className="text-red-600 hover:text-red-800"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCoupon(null);
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              {editingCoupon ? 'تعديل كوبون' : 'إضافة كوبون جديد'}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كود الخصم
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الخصم
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="percentage">نسبة مئوية</option>
                  <option value="fixed">مبلغ ثابت</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.type === 'percentage' ? 'نسبة الخصم (%)' : 'قيمة الخصم (₪)'}
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  min="0"
                  step={formData.type === 'percentage' ? "1" : "0.01"}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأدنى للطلب (₪)
                </label>
                <input
                  type="number"
                  value={formData.min_order}
                  onChange={(e) => setFormData({ ...formData, min_order: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {formData.type === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    أقصى خصم (₪)
                  </label>
                  <input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأقصى للاستخدام
                </label>
                <input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  min="0"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ البداية
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ النهاية
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCoupon(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingCoupon ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}