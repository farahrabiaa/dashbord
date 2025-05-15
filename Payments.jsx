import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PaymentSettings from './PaymentSettings';
import { getWalletTransactions } from '../../lib/walletApi';
import { supabase } from '../../lib/supabase';

export default function Payments() {
  const [activeTab, setActiveTab] = useState('settings');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener todas las carteras
      const { data: wallets, error: walletsError } = await supabase
        .from('wallets')
        .select('id');
      
      if (walletsError) throw walletsError;
      
      // Si hay carteras, obtener las transacciones de todas ellas
      if (wallets && wallets.length > 0) {
        const walletIds = wallets.map(wallet => wallet.id);
        
        // Obtener transacciones de todas las carteras
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('wallet_transactions')
          .select(`
            *,
            wallet:wallet_id(user_id),
            order:order_id(*)
          `)
          .in('wallet_id', walletIds)
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (transactionsError) throw transactionsError;
        
        setTransactions(transactionsData || []);
      } else {
        // Si no hay carteras, mostrar datos de ejemplo
        setTransactions([
          {
            id: 1,
            amount: 150,
            type: 'credit',
            payment_type: 'electronic',
            status: 'completed',
            description: 'دفع إلكتروني للطلب #123',
            created_at: new Date().toISOString(),
            order: { id: 123, total: 150 }
          },
          {
            id: 2,
            amount: 200,
            type: 'credit',
            payment_type: 'cash',
            status: 'completed',
            description: 'دفع نقدي للطلب #124',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            order: { id: 124, total: 200 }
          },
          {
            id: 3,
            amount: 500,
            type: 'debit',
            payment_type: 'withdrawal',
            status: 'pending',
            description: 'طلب سحب رصيد',
            created_at: new Date(Date.now() - 172800000).toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('فشل في تحميل المعاملات. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل المعاملات');
    } finally {
      setLoading(false);
    }
  };

  const getTypeText = (type, paymentType) => {
    if (type === 'credit') {
      if (paymentType === 'electronic') return 'دفع إلكتروني';
      if (paymentType === 'cash') return 'دفع نقدي';
      if (paymentType === 'wallet') return 'دفع من المحفظة';
      return 'إيداع';
    } else {
      if (paymentType === 'withdrawal') return 'سحب رصيد';
      if (paymentType === 'commission') return 'عمولة';
      return 'خصم';
    }
  };

  const getTypeColor = (type) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'pending': return 'معلق';
      case 'failed': return 'فشل';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <nav className="flex space-x-4 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              إعدادات طرق الدفع
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-4 text-sm font-medium border-b-2 -mb-px ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              سجل المعاملات
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'settings' && <PaymentSettings />}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">سجل المعاملات</h2>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 p-4 rounded-lg text-red-800">
                  <h3 className="font-semibold mb-2">خطأ</h3>
                  <p>{error}</p>
                  <button
                    onClick={fetchTransactions}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">لا توجد معاملات</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الطلب</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map(transaction => (
                          <tr key={transaction.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(transaction.created_at).toLocaleDateString('ar-SA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {transaction.order ? `#${transaction.order.id}` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={getTypeColor(transaction.type)}>
                                {getTypeText(transaction.type, transaction.payment_type)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <span className={getTypeColor(transaction.type)}>
                                {transaction.type === 'credit' ? '+' : '-'}₪{Math.abs(transaction.amount)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                                {getStatusText(transaction.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}