import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';
import { supabase } from '../../lib/supabase';

export default function WholesaleCustomers() {
  const [tiers, setTiers] = useState([
    {
      id: 1,
      name: 'برونزي',
      description: 'المستوى الأساسي للتجار',
      min_purchase_amount: 5000,
      discount_percentage: 5,
      min_order_amount: 500,
      benefits: [
        'خصم 5% على جميع المنتجات',
        'دعم أولوية للتجار',
        'تقارير شهرية'
      ],
      status: 'active'
    },
    {
      id: 2,
      name: 'فضي',
      description: 'المستوى المتوسط للتجار',
      min_purchase_amount: 10000,
      discount_percentage: 10,
      min_order_amount: 1000,
      benefits: [
        'خصم 10% على جميع المنتجات',
        'دعم أولوية للتجار',
        'تقارير أسبوعية',
        'شحن مجاني للطلبات فوق 2000₪'
      ],
      status: 'active'
    },
    {
      id: 3,
      name: 'ذهبي',
      description: 'المستوى المتقدم للتجار',
      min_purchase_amount: 25000,
      discount_percentage: 15,
      min_order_amount: 2000,
      benefits: [
        'خصم 15% على جميع المنتجات',
        'دعم أولوية قصوى',
        'تقارير يومية',
        'شحن مجاني لجميع الطلبات',
        'مدير حساب مخصص'
      ],
      status: 'active'
    },
    {
      id: 4,
      name: 'بلاتيني',
      description: 'المستوى الأعلى للتجار',
      min_purchase_amount: 50000,
      discount_percentage: 20,
      min_order_amount: 5000,
      benefits: [
        'خصم 20% على جميع المنتجات',
        'دعم على مدار الساعة',
        'تقارير مخصصة',
        'شحن مجاني وسريع لجميع الطلبات',
        'مدير حساب مخصص',
        'أسعار خاصة للمنتجات الجديدة'
      ],
      status: 'active'
    }
  ]);

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);

  const [customerForm, setCustomerForm] = useState({
    company_name: '',
    tier_id: '',
    tax_number: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    billing_address: '',
    shipping_address: '',
    status: 'pending',
    notes: ''
  });

  const [tierForm, setTierForm] = useState({
    name: '',
    description: '',
    min_purchase_amount: '',
    discount_percentage: '',
    min_order_amount: '',
    benefits: [],
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch wholesale customers from database
      const { data: customersData, error: customersError } = await supabase
        .from('customer_wholesale_tiers')
        .select(`
          customer_id,
          tier_id,
          status,
          approved_at,
          created_at,
          customer:customer_id(*),
          tier:tier_id(*)
        `);

      if (customersError) throw customersError;

      // Process the data
      const processedCustomers = customersData.map(item => {
        return {
          id: item.customer_id,
          company_name: item.customer?.wholesale_info?.company_name || 'شركة بدون اسم',
          tier_id: item.tier_id,
          tax_number: item.customer?.wholesale_info?.tax_number || '',
          contact_name: item.customer?.name,
          contact_phone: item.customer?.phone,
          contact_email: item.customer?.email || '',
          total_purchases: item.customer?.wholesale_info?.total_purchases || 0,
          status: item.status,
          approval_date: item.approved_at,
          last_purchase_date: item.customer?.wholesale_info?.last_purchase_date,
          billing_address: item.customer?.wholesale_info?.billing_address || item.customer?.address || '',
          shipping_address: item.customer?.wholesale_info?.shipping_address || item.customer?.address || '',
          notes: item.customer?.wholesale_info?.notes || item.customer?.notes || '',
          tier: item.tier
        };
      });

      setCustomers(processedCustomers);

      // Fetch wholesale tiers from database
      const { data: tiersData, error: tiersError } = await supabase
        .from('wholesale_tiers')
        .select('*')
        .order('min_purchase_amount', { ascending: true });

      if (tiersError) {
        console.error('Error fetching tiers:', tiersError);
        // Keep using the default tiers
      } else if (tiersData && tiersData.length > 0) {
        setTiers(tiersData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('فشل في تحميل البيانات. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const initialFilters = {
    company_name: {
      type: 'text',
      label: 'اسم الشركة',
      placeholder: 'البحث باسم الشركة',
      value: ''
    },
    tier_id: {
      type: 'select',
      label: 'المستوى',
      placeholder: 'جميع المستويات',
      options: tiers.map(tier => ({
        value: tier.id,
        label: tier.name
      })),
      value: ''
    },
    status: {
      type: 'select',
      label: 'الحالة',
      placeholder: 'جميع الحالات',
      options: [
        { value: 'pending', label: 'قيد المراجعة' },
        { value: 'approved', label: 'معتمد' },
        { value: 'rejected', label: 'مرفوض' }
      ],
      value: ''
    }
  };

  const { filters, filterData, handleFilterChange } = useFilters(initialFilters);

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!customerForm.company_name || !customerForm.tier_id || !customerForm.tax_number) {
        toast.error('الرجاء تعبئة جميع الحقول المطلوبة');
        return;
      }

      if (selectedCustomer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
            name: customerForm.contact_name,
            phone: customerForm.contact_phone,
            email: customerForm.contact_email,
            address: customerForm.shipping_address,
            notes: customerForm.notes,
            wholesale_info: {
              company_name: customerForm.company_name,
              tax_number: customerForm.tax_number,
              billing_address: customerForm.billing_address,
              shipping_address: customerForm.shipping_address
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedCustomer.id);

        if (error) throw error;

        // Update customer tier
        const { error: tierError } = await supabase.rpc(
          'convert_to_wholesale_customer',
          {
            p_customer_id: selectedCustomer.id,
            p_tier_id: customerForm.tier_id,
            p_status: customerForm.status
          }
        );

        if (tierError) throw tierError;
        
        toast.success('تم تحديث العميل بنجاح');
      } else {
        // Add new customer
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .insert([{
            name: customerForm.contact_name,
            phone: customerForm.contact_phone,
            email: customerForm.contact_email,
            address: customerForm.shipping_address,
            notes: customerForm.notes,
            wholesale_info: {
              company_name: customerForm.company_name,
              tax_number: customerForm.tax_number,
              billing_address: customerForm.billing_address,
              shipping_address: customerForm.shipping_address
            }
          }])
          .select();

        if (customerError) throw customerError;

        // Link customer to tier
        const { error: tierError } = await supabase.rpc(
          'convert_to_wholesale_customer',
          {
            p_customer_id: customerData[0].id,
            p_tier_id: customerForm.tier_id,
            p_status: customerForm.status
          }
        );

        if (tierError) throw tierError;
        
        toast.success('تم إضافة العميل بنجاح');
      }

      // Refresh data
      fetchData();

      // Reset form and close modal
      setShowCustomerModal(false);
      setSelectedCustomer(null);
      setCustomerForm({
        company_name: '',
        tier_id: '',
        tax_number: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        billing_address: '',
        shipping_address: '',
        status: 'pending',
        notes: ''
      });
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error(selectedCustomer ? 'فشل تحديث العميل' : 'فشل إضافة العميل');
    }
  };

  const handleTierSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!tierForm.name || !tierForm.min_purchase_amount || !tierForm.discount_percentage) {
        toast.error('الرجاء تعبئة جميع الحقول المطلوبة');
        return;
      }

      // Prepare tier data
      const tierData = {
        name: tierForm.name,
        description: tierForm.description,
        min_purchase_amount: parseFloat(tierForm.min_purchase_amount),
        discount_percentage: parseFloat(tierForm.discount_percentage),
        min_order_amount: parseFloat(tierForm.min_order_amount) || 0,
        benefits: tierForm.benefits,
        status: tierForm.status
      };

      if (selectedTier) {
        // Update existing tier
        const { error } = await supabase
          .from('wholesale_tiers')
          .update(tierData)
          .eq('id', selectedTier.id);

        if (error) throw error;
        toast.success('تم تحديث المستوى بنجاح');
      } else {
        // Add new tier
        const { error } = await supabase
          .from('wholesale_tiers')
          .insert([tierData]);

        if (error) throw error;
        toast.success('تم إضافة المستوى بنجاح');
      }

      // Refresh data
      fetchData();

      // Reset form and close modal
      setShowTierModal(false);
      setSelectedTier(null);
      setTierForm({
        name: '',
        description: '',
        min_purchase_amount: '',
        discount_percentage: '',
        min_order_amount: '',
        benefits: [],
        status: 'active'
      });
    } catch (error) {
      console.error('Error saving tier:', error);
      toast.error(selectedTier ? 'فشل تحديث المستوى' : 'فشل إضافة المستوى');
    }
  };

  const handleStatusChange = async (customerId, newStatus) => {
    try {
      const { error } = await supabase.rpc(
        'update_wholesale_customer_status',
        {
          p_customer_id: customerId,
          p_status: newStatus
        }
      );

      if (error) throw error;

      // Update local state
      setCustomers(customers.map(customer => 
        customer.id === customerId 
          ? {
              ...customer,
              status: newStatus,
              approval_date: newStatus === 'approved' ? new Date().toISOString() : customer.approval_date
            }
          : customer
      ));
      
      toast.success('تم تحديث حالة العميل بنجاح');
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast.error('فشل في تحديث حالة العميل');
    }
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
    
    try {
      // Remove customer from wholesale tiers
      const { error } = await supabase
        .from('customer_wholesale_tiers')
        .delete()
        .eq('customer_id', customerId);

      if (error) throw error;

      // Update customer to remove wholesale_info
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          wholesale_info: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', customerId);

      if (updateError) throw updateError;

      // Update local state
      setCustomers(customers.filter(c => c.id !== customerId));
      
      toast.success('تم حذف العميل بنجاح');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('فشل في حذف العميل');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'معتمد';
      case 'pending': return 'قيد المراجعة';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  const getTierColor = (tierId) => {
    const tier = tiers.find(t => t.id === tierId);
    switch (tier?.name) {
      case 'برونزي': return 'bg-amber-100 text-amber-800';
      case 'فضي': return 'bg-gray-100 text-gray-800';
      case 'ذهبي': return 'bg-yellow-100 text-yellow-800';
      case 'بلاتيني': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCustomers = filterData(customers);

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
        <h2 className="text-2xl font-bold">عملاء الجملة</h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedTier(null);
              setTierForm({
                name: '',
                description: '',
                min_purchase_amount: '',
                discount_percentage: '',
                min_order_amount: '',
                benefits: [],
                status: 'active'
              });
              setShowTierModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            إضافة مستوى
          </button>
          <button
            onClick={() => {
              setSelectedCustomer(null);
              setCustomerForm({
                company_name: '',
                tier_id: '',
                tax_number: '',
                contact_name: '',
                contact_phone: '',
                contact_email: '',
                billing_address: '',
                shipping_address: '',
                status: 'pending',
                notes: ''
              });
              setShowCustomerModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            إضافة عميل
          </button>
        </div>
      </div>

      {/* Tiers Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">مستويات العملاء</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map(tier => (
            <div
              key={tier.id}
              className={`rounded-lg p-6 ${getTierColor(tier.id)}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold">{tier.name}</h4>
                  <p className="text-sm mt-1">{tier.description}</p>
                </div>
                {tier.status === 'active' ? (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    نشط
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    غير نشط
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">الحد الأدنى للمشتريات السنوية</p>
                  <p className="text-lg font-bold">₪{tier.min_purchase_amount.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm font-medium">نسبة الخصم</p>
                  <p className="text-lg font-bold">{tier.discount_percentage}%</p>
                </div>

                <div>
                  <p className="text-sm font-medium">الحد الأدنى للطلب</p>
                  <p className="text-lg font-bold">₪{tier.min_order_amount.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm font-medium">المميزات</p>
                  <ul className="mt-1 space-y-1">
                    {tier.benefits.map((benefit, index) => (
                      <li key={index} className="text-sm">• {benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedTier(tier);
                    setTierForm({
                      name: tier.name,
                      description: tier.description,
                      min_purchase_amount: tier.min_purchase_amount,
                      discount_percentage: tier.discount_percentage,
                      min_order_amount: tier.min_order_amount,
                      benefits: tier.benefits,
                      status: tier.status
                    });
                    setShowTierModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  تعديل
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customers Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">قائمة العملاء</h3>
        
        <SearchFilter 
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الشركة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المستوى</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">معلومات الاتصال</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجمالي المشتريات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">آخر طلب</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    لا يوجد عملاء جملة متطابقين مع معايير البحث
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{customer.company_name}</div>
                        <div className="text-sm text-gray-500">رقم ضريبي: {customer.tax_number}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-sm rounded-full ${getTierColor(customer.tier_id)}`}>
                        {customer.tier?.name || 'غير محدد'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div>{customer.contact_name}</div>
                        <div className="text-gray-500">{customer.contact_phone}</div>
                        <div className="text-gray-500">{customer.contact_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium">₪{customer.total_purchases.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {customer.last_purchase_date ? new Date(customer.last_purchase_date).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={customer.status}
                        onChange={(e) => handleStatusChange(customer.id, e.target.value)}
                        className={`px-2 py-1 text-sm rounded-full ${getStatusColor(customer.status)}`}
                      >
                        <option value="pending">قيد المراجعة</option>
                        <option value="approved">معتمد</option>
                        <option value="rejected">مرفوض</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCustomerForm({
                            company_name: customer.company_name,
                            tier_id: customer.tier_id,
                            tax_number: customer.tax_number,
                            contact_name: customer.contact_name,
                            contact_phone: customer.contact_phone,
                            contact_email: customer.contact_email,
                            billing_address: customer.billing_address,
                            shipping_address: customer.shipping_address,
                            status: customer.status,
                            notes: customer.notes
                          });
                          setShowCustomerModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 ml-4"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
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

      {/* Customer Modal */}
      <Dialog
        open={showCustomerModal}
        onClose={() => {
          setShowCustomerModal(false);
          setSelectedCustomer(null);
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              {selectedCustomer ? 'تعديل عميل' : 'إضافة عميل جديد'}
            </Dialog.Title>

            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الشركة <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerForm.company_name}
                    onChange={(e) => setCustomerForm({ ...customerForm, company_name: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرقم الضريبي <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerForm.tax_number}
                    onChange={(e) => setCustomerForm({ ...customerForm, tax_number: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المستوى <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={customerForm.tier_id}
                    onChange={(e) => setCustomerForm({ ...customerForm, tier_id: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="">اختر المستوى</option>
                    {tiers.map(tier => (
                      <option key={tier.id} value={tier.id}>
                        {tier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم جهة الاتصال <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerForm.contact_name}
                    onChange={(e) => setCustomerForm({ ...customerForm, contact_name: e.target.value })}
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
                    value={customerForm.contact_phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, contact_phone: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={customerForm.contact_email}
                    onChange={(e) => setCustomerForm({ ...customerForm, contact_email: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان الفواتير
                  </label>
                  <textarea
                    value={customerForm.billing_address}
                    onChange={(e) => setCustomerForm({ ...customerForm, billing_address: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    rows="2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان الشحن
                  </label>
                  <textarea
                    value={customerForm.shipping_address}
                    onChange={(e) => setCustomerForm({ ...customerForm, shipping_address: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    rows="2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات
                  </label>
                  <textarea
                    value={customerForm.notes}
                    onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    rows="3"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة
                  </label>
                  <select
                    value={customerForm.status}
                    onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="pending">قيد المراجعة</option>
                    <option value="approved">معتمد</option>
                    <option value="rejected">مرفوض</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomerModal(false);
                    setSelectedCustomer(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {selectedCustomer ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>

      {/* Tier Modal */}
      <Dialog
        open={showTierModal}
        onClose={() => {
          setShowTierModal(false);
          setSelectedTier(null);
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              {selectedTier ? 'تعديل مستوى' : 'إضافة مستوى جديد'}
            </Dialog.Title>

            <form onSubmit={handleTierSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المستوى <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={tierForm.name}
                  onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={tierForm.description}
                  onChange={(e) => setTierForm({ ...tierForm, description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحد الأدنى للمشتريات السنوية (₪) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={tierForm.min_purchase_amount}
                    onChange={(e) => setTierForm({ ...tierForm, min_purchase_amount: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نسبة الخصم (%) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={tierForm.discount_percentage}
                    onChange={(e) => setTierForm({ ...tierForm, discount_percentage: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحد الأدنى للطلب (₪) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={tierForm.min_order_amount}
                    onChange={(e) => setTierForm({ ...tierForm, min_order_amount: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة
                  </label>
                  <select
                    value={tierForm.status}
                    onChange={(e) => setTierForm({ ...tierForm, status: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المميزات
                </label>
                <div className="space-y-2">
                  {tierForm.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => {
                          const newBenefits = [...tierForm.benefits];
                          newBenefits[index] = e.target.value;
                          setTierForm({ ...tierForm, benefits: newBenefits });
                        }}
                        className="flex-1 border rounded-md px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newBenefits = tierForm.benefits.filter((_, i) => i !== index);
                          setTierForm({ ...tierForm, benefits: newBenefits });
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTierForm({
                      ...tierForm,
                      benefits: [...tierForm.benefits, '']
                    })}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    إضافة ميزة
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTierModal(false);
                    setSelectedTier(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {selectedTier ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}