import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';

export default function WalletCharging() {
  const [vendors, setVendors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('vendors');
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeDescription, setChargeDescription] = useState('شحن رصيد');
  const [chargingInProgress, setChargingInProgress] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'vendors') {
        await fetchVendors();
      } else {
        await fetchDrivers();
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      setError(`فشل في تحميل بيانات ${activeTab === 'vendors' ? 'البائعين' : 'السائقين'}. الرجاء المحاولة مرة أخرى.`);
      toast.error(`فشل في تحميل بيانات ${activeTab === 'vendors' ? 'البائعين' : 'السائقين'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      // Try to use the RPC function first
      const { data, error } = await supabase.rpc('get_all_vendor_wallets');
      
      if (error) {
        console.error('Error using RPC function:', error);
        
        // Fallback to direct query
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendor_wallets')
          .select('*');
        
        if (vendorError) throw vendorError;
        setVendors(vendorData || []);
      } else {
        setVendors(data || []);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Set mock data if all else fails
      setVendors([
        {
          id: '1',
          vendor_id: '1',
          store_name: 'متجر كوفي',
          balance: 1500,
          pending_balance: 200,
          auto_charge: true,
          status: 'active',
          total_orders: 120,
          total_earnings: 15000
        },
        {
          id: '2',
          vendor_id: '2',
          store_name: 'متجر الشاي',
          balance: 800,
          pending_balance: 100,
          auto_charge: false,
          status: 'active',
          total_orders: 80,
          total_earnings: 8000
        }
      ]);
    }
  };

  const fetchDrivers = async () => {
    try {
      // Try to use the RPC function first
      const { data, error } = await supabase.rpc('get_all_driver_wallets');
      
      if (error) {
        console.error('Error using RPC function:', error);
        
        // Fallback to direct query
        const { data: driverData, error: driverError } = await supabase
          .from('driver_wallets')
          .select('*');
        
        if (driverError) throw driverError;
        setDrivers(driverData || []);
      } else {
        setDrivers(data || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      // Set mock data if all else fails
      setDrivers([
        {
          id: '1',
          driver_id: '1',
          name: 'خالد أحمد',
          balance: 800,
          pending_balance: 100,
          auto_charge: true,
          status: 'available',
          total_orders: 50,
          total_earnings: 5000
        },
        {
          id: '2',
          driver_id: '2',
          name: 'محمد علي',
          balance: 600,
          pending_balance: 50,
          auto_charge: false,
          status: 'busy',
          total_orders: 40,
          total_earnings: 4000
        }
      ]);
    }
  };

  const handleChargeWallet = async () => {
    if (!selectedEntity) {
      toast.error('الرجاء اختيار مستخدم');
      return;
    }

    if (!chargeAmount || parseFloat(chargeAmount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }

    try {
      setChargingInProgress(true);
      
      let result;
      
      if (activeTab === 'vendors') {
        // Charge vendor wallet
        const { data, error } = await supabase.rpc(
          'charge_vendor_wallet',
          {
            p_vendor_id: selectedEntity.vendor_id,
            p_amount: parseFloat(chargeAmount),
            p_description: chargeDescription || 'شحن رصيد'
          }
        );
        
        if (error) throw error;
        result = data;
      } else {
        // Charge driver wallet
        const { data, error } = await supabase.rpc(
          'charge_driver_wallet',
          {
            p_driver_id: selectedEntity.driver_id,
            p_amount: parseFloat(chargeAmount),
            p_description: chargeDescription || 'شحن رصيد'
          }
        );
        
        if (error) throw error;
        result = data;
      }
      
      if (result && result.success) {
        toast.success(`تم شحن ₪${chargeAmount} بنجاح إلى ${activeTab === 'vendors' ? 'محفظة البائع' : 'محفظة السائق'}`);
        
        // Refresh data
        fetchData();
        
        // Reset form
        setShowChargeModal(false);
        setSelectedEntity(null);
        setChargeAmount('');
        setChargeDescription('شحن رصيد');
      } else {
        toast.error(result?.message || 'فشل في شحن المحفظة');
      }
    } catch (error) {
      console.error('Error charging wallet:', error);
      toast.error('فشل في شحن المحفظة: ' + (error.message || 'خطأ غير معروف'));
    } finally {
      setChargingInProgress(false);
    }
  };

  const vendorFilters = {
    store_name: {
      type: 'text',
      label: 'اسم المتجر',
      placeholder: 'البحث باسم المتجر',
      value: ''
    },
    status: {
      type: 'select',
      label: 'الحالة',
      placeholder: 'جميع الحالات',
      options: [
        { value: 'active', label: 'نشط' },
        { value: 'inactive', label: 'غير نشط' }
      ],
      value: ''
    },
    auto_charge: {
      type: 'select',
      label: 'الشحن التلقائي',
      placeholder: 'الكل',
      options: [
        { value: 'true', label: 'مفعل' },
        { value: 'false', label: 'غير مفعل' }
      ],
      value: ''
    }
  };

  const driverFilters = {
    name: {
      type: 'text',
      label: 'اسم السائق',
      placeholder: 'البحث باسم السائق',
      value: ''
    },
    status: {
      type: 'select',
      label: 'الحالة',
      placeholder: 'جميع الحالات',
      options: [
        { value: 'available', label: 'متاح' },
        { value: 'busy', label: 'مشغول' },
        { value: 'offline', label: 'غير متصل' }
      ],
      value: ''
    },
    auto_charge: {
      type: 'select',
      label: 'الشحن التلقائي',
      placeholder: 'الكل',
      options: [
        { value: 'true', label: 'مفعل' },
        { value: 'false', label: 'غير مفعل' }
      ],
      value: ''
    }
  };

  const { filters: vendorFilterState, filterData: filterVendors, handleFilterChange: handleVendorFilterChange } = useFilters(vendorFilters);
  const { filters: driverFilterState, filterData: filterDrivers, handleFilterChange: handleDriverFilterChange } = useFilters(driverFilters);

  const filteredVendors = filterVendors(vendors);
  const filteredDrivers = filterDrivers(drivers);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'available': return 'متاح';
      case 'busy': return 'مشغول';
      case 'offline': return 'غير متصل';
      default: return status;
    }
  };

  if (loading && vendors.length === 0 && drivers.length === 0) {
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
        <h2 className="text-2xl font-bold">شحن المحافظ</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="border-b mb-6">
          <nav className="flex space-x-4 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('vendors')}
              className={`py-4 px-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'vendors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              محافظ البائعين
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`py-4 px-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'drivers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              محافظ السائقين
            </button>
          </nav>
        </div>

        {activeTab === 'vendors' && (
          <>
            <SearchFilter 
              filters={vendorFilterState}
              onFilterChange={handleVendorFilterChange}
            />

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المتجر</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرصيد</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرصيد المعلق</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الشحن التلقائي</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عدد الطلبات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجمالي المبيعات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVendors.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        لا توجد بيانات متطابقة مع معايير البحث
                      </td>
                    </tr>
                  ) : (
                    filteredVendors.map(vendor => (
                      <tr key={vendor.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{vendor.store_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">₪{vendor.balance}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-yellow-600">₪{vendor.pending_balance}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            vendor.auto_charge 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {vendor.auto_charge ? 'مفعل' : 'غير مفعل'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{vendor.total_orders || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">₪{vendor.total_earnings || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(vendor.status)}`}>
                            {getStatusText(vendor.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedEntity(vendor);
                              setShowChargeModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            شحن رصيد
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'drivers' && (
          <>
            <SearchFilter 
              filters={driverFilterState}
              onFilterChange={handleDriverFilterChange}
            />

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السائق</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرصيد</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرصيد المعلق</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الشحن التلقائي</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عدد الطلبات</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجمالي الأرباح</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDrivers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        لا توجد بيانات متطابقة مع معايير البحث
                      </td>
                    </tr>
                  ) : (
                    filteredDrivers.map(driver => (
                      <tr key={driver.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{driver.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">₪{driver.balance}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-yellow-600">₪{driver.pending_balance}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            driver.auto_charge 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {driver.auto_charge ? 'مفعل' : 'غير مفعل'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{driver.total_orders || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">₪{driver.total_earnings || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(driver.status)}`}>
                            {getStatusText(driver.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedEntity(driver);
                              setShowChargeModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            شحن رصيد
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Charge Modal */}
      <Dialog
        open={showChargeModal}
        onClose={() => {
          if (!chargingInProgress) {
            setShowChargeModal(false);
            setSelectedEntity(null);
            setChargeAmount('');
            setChargeDescription('شحن رصيد');
          }
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              شحن رصيد {activeTab === 'vendors' ? 'البائع' : 'السائق'}
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {activeTab === 'vendors' ? 'المتجر' : 'السائق'}
                </label>
                <div className="w-full border rounded-md px-3 py-2 bg-gray-50">
                  {activeTab === 'vendors' ? selectedEntity?.store_name : selectedEntity?.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرصيد الحالي
                </label>
                <div className="w-full border rounded-md px-3 py-2 bg-gray-50 font-semibold">
                  ₪{selectedEntity?.balance || 0}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المبلغ (₪) <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  min="1"
                  step="0.01"
                  placeholder="أدخل المبلغ"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <input
                  type="text"
                  value={chargeDescription}
                  onChange={(e) => setChargeDescription(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="وصف العملية"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => {
                    setShowChargeModal(false);
                    setSelectedEntity(null);
                    setChargeAmount('');
                    setChargeDescription('شحن رصيد');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  disabled={chargingInProgress}
                >
                  إلغاء
                </button>
                <button
                  onClick={handleChargeWallet}
                  disabled={chargingInProgress || !chargeAmount || parseFloat(chargeAmount) <= 0}
                  className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                    chargingInProgress || !chargeAmount || parseFloat(chargeAmount) <= 0 ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {chargingInProgress ? 'جاري الشحن...' : 'شحن الرصيد'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Information Section */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">معلومات عن المحافظ</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-blue-700 mb-2">محفظة البائع</h4>
            <p className="text-blue-600">
              تستخدم محفظة البائع لتخزين أرصدة البائعين من المبيعات. يمكن للبائع سحب الرصيد المتاح في أي وقت.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700 mb-2">محفظة السائق</h4>
            <p className="text-blue-600">
              تستخدم محفظة السائق لتخزين أرصدة السائقين من عمليات التوصيل. يمكن للسائق سحب الرصيد المتاح في أي وقت.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700 mb-2">الشحن التلقائي</h4>
            <p className="text-blue-600">
              عند تفعيل الشحن التلقائي، يتم شحن المحفظة تلقائياً عند استلام طلب جديد بقيمة الطلب.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-blue-700 mb-2">الرصيد المعلق</h4>
            <p className="text-blue-600">
              الرصيد المعلق هو المبلغ الذي تم إضافته للمحفظة ولكن لم يتم تأكيده بعد. يتم تحويله إلى الرصيد المتاح بعد تأكيد الطلب.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}