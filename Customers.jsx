import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';
import { supabase } from '../../lib/supabase';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Instead of using the RPC function, let's directly query the customers table
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw new Error(`فشل في جلب بيانات الزبائن: ${error.message}`);
      }

      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError(error.message || 'فشل في تحميل بيانات العملاء. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل بيانات العملاء');
      
      // Set empty array to avoid undefined errors
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const initialFilters = {
    name: {
      type: 'text',
      label: 'اسم العميل',
      placeholder: 'البحث باسم العميل',
      value: ''
    },
    phone: {
      type: 'text',
      label: 'رقم الهاتف',
      placeholder: 'البحث برقم الهاتف',
      value: ''
    },
    address: {
      type: 'text',
      label: 'العنوان',
      placeholder: 'البحث بالعنوان',
      value: ''
    },
    status: {
      type: 'select',
      label: 'الحالة',
      placeholder: 'جميع الحالات',
      options: [
        { value: 'active', label: 'نشط' },
        { value: 'blocked', label: 'محظور' }
      ],
      value: ''
    },
    orders_count: {
      type: 'number',
      label: 'عدد الطلبات',
      placeholder: 'الحد الأدنى للطلبات',
      min: 0,
      value: ''
    },
    total_spent: {
      type: 'number',
      label: 'إجمالي الإنفاق',
      placeholder: 'الحد الأدنى للإنفاق',
      min: 0,
      value: ''
    }
  };

  const { filters, filterData, handleFilterChange } = useFilters(initialFilters);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error('الرجاء إدخال الاسم ورقم الهاتف');
      return;
    }

    try {
      setLoading(true);
      
      if (editingCustomer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            email: formData.email,
            notes: formData.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCustomer.id);
        
        if (error) throw error;
        
        toast.success('تم تحديث بيانات العميل بنجاح');
      } else {
        // Add new customer
        const { error } = await supabase
          .from('customers')
          .insert([{
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            email: formData.email,
            notes: formData.notes
          }]);
        
        if (error) throw error;
        
        toast.success('تم إضافة العميل بنجاح');
      }
      
      // Reset form and close modal
      setFormData({
        name: '',
        phone: '',
        address: '',
        email: '',
        notes: ''
      });
      setEditingCustomer(null);
      setShowModal(false);
      
      // Refresh customers list
      fetchCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error(editingCustomer ? 'فشل في تحديث بيانات العميل' : 'فشل في إضافة العميل');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address || '',
      email: customer.email || '',
      notes: customer.notes || ''
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (customerId) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;
      
      const newStatus = customer.status === 'active' ? 'blocked' : 'active';
      
      const { error } = await supabase
        .from('customers')
        .update({ status: newStatus })
        .eq('id', customerId);
      
      if (error) throw error;
      
      setCustomers(customers.map(c => 
        c.id === customerId 
          ? { ...c, status: newStatus } 
          : c
      ));
      
      toast.success(`تم ${newStatus === 'active' ? 'إلغاء حظر' : 'حظر'} العميل بنجاح`);
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('فشل في تحديث حالة العميل');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'blocked': return 'محظور';
      default: return status;
    }
  };

  const filteredCustomers = filterData(customers);

  if (loading && customers.length === 0) {
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
          onClick={fetchCustomers}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">الزبائن</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setEditingCustomer(null);
                setFormData({
                  name: '',
                  phone: '',
                  address: '',
                  email: '',
                  notes: ''
                });
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              إضافة زبون جديد
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
              تصدير البيانات
            </button>
          </div>
        </div>

        <SearchFilter 
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الهاتف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العنوان</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عدد الطلبات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجمالي الإنفاق</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">آخر طلب</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    لا يوجد زبائن متطابقين مع معايير البحث
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.address || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{customer.orders_count || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₪{(customer.total_spent || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.last_order ? new Date(customer.last_order).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(customer.status || 'active')}`}>
                        {getStatusText(customer.status || 'active')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:text-blue-900 ml-4"
                      >
                        تعديل
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(customer.id)}
                        className={`${
                          (customer.status || 'active') === 'blocked' 
                            ? 'text-green-600 hover:text-green-900' 
                            : 'text-red-600 hover:text-red-900'
                        }`}
                      >
                        {(customer.status || 'active') === 'blocked' ? 'إلغاء الحظر' : 'حظر'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Customer Modal */}
      <Dialog
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCustomer(null);
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              {editingCustomer ? 'تعديل بيانات الزبون' : 'إضافة زبون جديد'}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  العنوان
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
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

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'جاري الحفظ...' : (editingCustomer ? 'تحديث' : 'إضافة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}