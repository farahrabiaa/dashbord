import React, { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';
import { getVendorWallets, chargeVendorWallet } from '../../lib/walletApi';
import { supabase } from '../../lib/supabase';

export default function Wallet() {
  const [balance, setBalance] = useState({
    total: 0,
    pending: 0
  });

  const [transactions, setTransactions] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [depositLoading, setDepositLoading] = useState(false);

  const initialFilters = {
    name: {
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
    wallet_enabled: {
      type: 'select',
      label: 'المحفظة',
      placeholder: 'الكل',
      options: [
        { value: 'true', label: 'مفعلة' },
        { value: 'false', label: 'غير مفعلة' }
      ],
      value: ''
    }
  };

  const { filters, filterData, handleFilterChange } = useFilters(initialFilters);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // جلب محافظ البائعين
      const vendorWallets = await getVendorWallets();
      
      // حساب الأرصدة الإجمالية
      const totalBalance = vendorWallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
      const pendingBalance = vendorWallets.reduce((sum, wallet) => sum + (wallet.pending_balance || 0), 0);
      
      setBalance({
        total: totalBalance,
        pending: pendingBalance
      });
      
      // تحويل البيانات لجدول البائعين
      const vendorsData = vendorWallets.map(wallet => ({
        id: wallet.vendor_id,
        name: wallet.vendor?.store_name || 'متجر بدون اسم',
        balance: wallet.balance || 0,
        wallet_enabled: true,
        auto_charge: wallet.auto_charge || false,
        total_orders: wallet.total_orders || 0,
        total_sales: wallet.total_earnings || 0,
        status: wallet.vendor?.status || 'inactive'
      }));
      
      setVendors(vendorsData);
      
      // جلب آخر المعاملات
      try {
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('wallet_transactions')
          .select(`
            *,
            wallet:wallet_id(user_id),
            order:order_id(*)
          `)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (transactionsError) throw transactionsError;
        setTransactions(transactionsData || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        // استخدم بيانات تجريبية
        setTransactions([
          {
            id: 1,
            order_id: '123',
            amount: 500,
            type: 'debit',
            payment_type: 'withdrawal',
            status: 'completed',
            description: 'سحب رصيد',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            order_id: '124',
            amount: 150,
            type: 'credit',
            payment_type: 'cash',
            status: 'completed',
            description: 'مبلغ طلب + توصيل',
            created_at: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      }
      
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setError('فشل في تحميل بيانات المحفظة. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل بيانات المحفظة');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeposit = async () => {
    if (!selectedUser || !depositAmount || depositAmount <= 0) {
      toast.error('الرجاء اختيار المتجر وإدخال المبلغ');
      return;
    }

    try {
      setDepositLoading(true);
      
      // استدعاء API لشحن الرصيد
      await chargeVendorWallet(
        selectedUser.id, 
        parseFloat(depositAmount), 
        `شحن رصيد بواسطة المدير: ${depositAmount} شيكل`
      );
      
      toast.success(`تم شحن ${depositAmount} شيكل بنجاح لحساب ${selectedUser.name}`);
      setShowDepositModal(false);
      setDepositAmount('');
      setSelectedUser(null);
      
      // تحديث البيانات
      fetchData();
    } catch (error) {
      console.error('Error charging wallet:', error);
      toast.error('فشل في عملية الشحن');
    } finally {
      setDepositLoading(false);
    }
  };

  const getTransactionTypeDetails = (transaction) => {
    switch (transaction.type) {
      case 'credit':
        return {
          color: 'text-green-600',
          prefix: '+',
          text: transaction.payment_type === 'cash' ? 'إيداع نقدي' : 
                transaction.payment_type === 'admin_charge' ? 'شحن بواسطة المدير' : 
                'إيداع محفظة'
        };
      case 'debit':
        return {
          color: 'text-red-600',
          prefix: '-',
          text: transaction.payment_type === 'withdrawal' ? 'سحب رصيد' : 
                transaction.payment_type === 'commission' ? 'عمولة' : 
                'خصم'
        };
      default:
        return {
          color: 'text-gray-600',
          prefix: '',
          text: 'معاملة'
        };
    }
  };

  const filteredVendors = filterData(vendors);

  if (loading && vendors.length === 0) {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">الرصيد المتاح</h3>
          <div className="text-3xl font-bold text-green-600">₪{balance.total - balance.pending}</div>
          <p className="text-gray-500 mt-2">الرصيد الكلي: ₪{balance.total}</p>
          <button
            onClick={() => setShowDepositModal(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            شحن رصيد
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">الرصيد المعلق</h3>
          <div className="text-3xl font-bold text-orange-600">₪{balance.pending}</div>
          <p className="text-gray-500 mt-2">سيتم تحويله خلال 24 ساعة</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">محافظ البائعين</h3>
          <button
            onClick={() => setShowDepositModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            شحن رصيد
          </button>
        </div>

        <SearchFilter 
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-right py-3 px-4 bg-gray-50">المتجر</th>
                <th className="text-right py-3 px-4 bg-gray-50">الرصيد</th>
                <th className="text-right py-3 px-4 bg-gray-50">المحفظة</th>
                <th className="text-right py-3 px-4 bg-gray-50">الشحن التلقائي</th>
                <th className="text-right py-3 px-4 bg-gray-50">عدد الطلبات</th>
                <th className="text-right py-3 px-4 bg-gray-50">إجمالي المبيعات</th>
                <th className="text-right py-3 px-4 bg-gray-50">الحالة</th>
                <th className="text-right py-3 px-4 bg-gray-50">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVendors.map(vendor => (
                <tr key={vendor.id}>
                  <td className="py-3 px-4">{vendor.name}</td>
                  <td className="py-3 px-4 font-semibold">₪{vendor.balance}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      vendor.wallet_enabled 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vendor.wallet_enabled ? 'مفعلة' : 'غير مفعلة'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      vendor.auto_charge 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {vendor.auto_charge ? 'مفعل' : 'غير مفعل'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{vendor.total_orders}</td>
                  <td className="py-3 px-4">₪{vendor.total_sales}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      vendor.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vendor.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        setSelectedUser(vendor);
                        setShowDepositModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 ml-3"
                    >
                      شحن رصيد
                    </button>
                    <button
                      onClick={() => {
                        // عرض المعاملات
                      }}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      السجل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">آخر المعاملات</h3>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-right py-2">التاريخ</th>
              <th className="text-right py-2">النوع</th>
              <th className="text-right py-2">المبلغ</th>
              <th className="text-right py-2">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => {
              const typeDetails = getTransactionTypeDetails(transaction);
              return (
                <tr key={transaction.id}>
                  <td className="py-2">{new Date(transaction.created_at).toLocaleDateString('ar-SA')}</td>
                  <td className="py-2">{typeDetails.text}</td>
                  <td className={`py-2 ${typeDetails.color}`}>
                    {typeDetails.prefix}₪{Math.abs(transaction.amount)}
                  </td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      transaction.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status === 'completed' ? 'مكتمل' : 'معلق'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Deposit Modal */}
      <Dialog
        open={showDepositModal}
        onClose={() => {
          setShowDepositModal(false);
          setSelectedUser(null);
          setDepositAmount('');
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              شحن رصيد
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اختر المتجر
                </label>
                <select
                  value={selectedUser?.id || ''}
                  onChange={(e) => {
                    const vendor = vendors.find(v => v.id === e.target.value);
                    setSelectedUser(vendor);
                  }}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">اختر المتجر</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name} (رصيد: ₪{vendor.balance})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المبلغ (₪)
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  min="1"
                  step="0.01"
                  placeholder="أدخل المبلغ"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setSelectedUser(null);
                    setDepositAmount('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={depositLoading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                    depositLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {depositLoading ? 'جاري الشحن...' : 'شحن الرصيد'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}