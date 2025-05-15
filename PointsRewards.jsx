import React, { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';

export default function PointsRewards() {
  const [settings, setSettings] = useState({
    points_value: 0.10,
    min_points_redeem: 100,
    points_expiry_days: 365,
    points_per_currency: 1.00,
    min_order_points: 10.00
  });

  const [levels, setLevels] = useState([
    {
      id: 1,
      name: 'برونزي',
      icon: '🥉',
      min_points: 0,
      max_points: 999,
      benefits: [
        'كسب نقاط × 1',
        'خصم 5% على التوصيل'
      ],
      color: 'bg-amber-100 text-amber-800'
    },
    {
      id: 2,
      name: 'فضي',
      icon: '🥈', 
      min_points: 1000,
      max_points: 4999,
      benefits: [
        'كسب نقاط × 1.5',
        'خصم 10% على التوصيل',
        'أولوية في الدعم'
      ],
      color: 'bg-gray-100 text-gray-800'
    },
    {
      id: 3,
      name: 'ذهبي',
      icon: '🥇',
      min_points: 5000,
      max_points: 9999,
      benefits: [
        'كسب نقاط × 2',
        'خصم 15% على التوصيل',
        'أولوية في الدعم',
        'عروض حصرية'
      ],
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 4,
      name: 'بلاتيني',
      icon: '👑',
      min_points: 10000,
      max_points: null,
      benefits: [
        'كسب نقاط × 3',
        'خصم 20% على التوصيل',
        'أولوية قصوى في الدعم',
        'عروض حصرية',
        'هدية عيد ميلاد'
      ],
      color: 'bg-purple-100 text-purple-800'
    }
  ]);

  const [rewards, setRewards] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [editingLevel, setEditingLevel] = useState(null);
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    points_cost: '',
    reward_type: 'free_delivery',
    discount_type: '',
    discount_value: '',
    min_order_amount: '',
    max_discount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('points_rewards')
        .select('*')
        .order('points_cost', { ascending: true });

      if (rewardsError) throw rewardsError;
      setRewards(rewardsData || []);

      // Fetch customers with points accounts
      try {
        const { data: customersData, error: customersError } = await supabase.rpc('get_customers_with_points');
        
        if (customersError) throw customersError;
        setCustomers(customersData || []);
      } catch (error) {
        console.error('Error fetching customers with points:', error);
        // Fallback to regular customers query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('customers')
          .select('id, name, phone, email');
          
        if (fallbackError) throw fallbackError;
        setCustomers(fallbackData || []);
      }

      // Fetch recent transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('points_transactions')
        .select(`
          *,
          account:account_id(
            customer:customer_id(name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

      // Fetch recent redemptions
      const { data: redemptionsData, error: redemptionsError } = await supabase
        .from('points_redemptions')
        .select(`
          *,
          account:account_id(
            customer:customer_id(name)
          ),
          reward:reward_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (redemptionsError) throw redemptionsError;
      setRedemptions(redemptionsData || []);

      // Fetch app settings
      const { data: appSettings, error: settingsError } = await supabase
        .from('app_settings')
        .select('settings')
        .single();

      if (!settingsError && appSettings?.settings?.points) {
        setSettings(appSettings.settings.points);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('فشل في تحميل البيانات. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const initialFilters = {
    name: {
      type: 'text',
      label: 'اسم المكافأة',
      placeholder: 'البحث باسم المكافأة',
      value: ''
    },
    reward_type: {
      type: 'select',
      label: 'نوع المكافأة',
      placeholder: 'جميع الأنواع',
      options: [
        { value: 'free_delivery', label: 'توصيل مجاني' },
        { value: 'order_discount', label: 'خصم على الطلب' },
        { value: 'delivery_discount', label: 'خصم على التوصيل' },
        { value: 'product_discount', label: 'خصم على منتج' },
        { value: 'gift', label: 'هدية' }
      ],
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
    }
  };

  const { filters, filterData, handleFilterChange } = useFilters(initialFilters);

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // Get current app settings
      const { data: currentSettings, error: fetchError } = await supabase
        .from('app_settings')
        .select('settings, id')
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      let updatedSettings;
      let settingsId;
      
      if (currentSettings) {
        // Update existing settings
        updatedSettings = {
          ...currentSettings.settings,
          points: settings
        };
        settingsId = currentSettings.id;
        
        const { error: updateError } = await supabase
          .from('app_settings')
          .update({ settings: updatedSettings })
          .eq('id', settingsId);
          
        if (updateError) throw updateError;
      } else {
        // Create new settings
        updatedSettings = { points: settings };
        
        const { data: newSettings, error: insertError } = await supabase
          .from('app_settings')
          .insert([{ settings: updatedSettings }])
          .select();
          
        if (insertError) throw insertError;
      }
      
      toast.success('تم حفظ الإعدادات بنجاح');
      setShowSettingsModal(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('فشل في حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReward = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!rewardForm.name || !rewardForm.points_cost || !rewardForm.reward_type || !rewardForm.start_date || !rewardForm.end_date) {
        toast.error('الرجاء تعبئة جميع الحقول المطلوبة');
        setLoading(false);
        return;
      }
      
      // Prepare data for insert/update
      const rewardData = {
        name: rewardForm.name,
        description: rewardForm.description,
        points_cost: parseInt(rewardForm.points_cost),
        reward_type: rewardForm.reward_type,
        discount_type: rewardForm.discount_type || null,
        discount_value: rewardForm.discount_value ? parseFloat(rewardForm.discount_value) : null,
        min_order_amount: rewardForm.min_order_amount ? parseFloat(rewardForm.min_order_amount) : null,
        max_discount: rewardForm.max_discount ? parseFloat(rewardForm.max_discount) : null,
        usage_limit: rewardForm.usage_limit ? parseInt(rewardForm.usage_limit) : null,
        start_date: rewardForm.start_date,
        end_date: rewardForm.end_date,
        status: rewardForm.status
      };
      
      if (editingReward) {
        // Update existing reward
        const { error } = await supabase
          .from('points_rewards')
          .update(rewardData)
          .eq('id', editingReward.id);
          
        if (error) throw error;
        
        toast.success('تم تحديث المكافأة بنجاح');
      } else {
        // Create new reward
        const { error } = await supabase
          .from('points_rewards')
          .insert([rewardData]);
          
        if (error) throw error;
        
        toast.success('تم إضافة المكافأة بنجاح');
      }
      
      // Refresh data
      fetchData();
      
      // Reset form and close modal
      setShowRewardModal(false);
      setEditingReward(null);
      setRewardForm({
        name: '',
        description: '',
        points_cost: '',
        reward_type: 'free_delivery',
        discount_type: '',
        discount_value: '',
        min_order_amount: '',
        max_discount: '',
        usage_limit: '',
        start_date: '',
        end_date: '',
        status: 'active'
      });
    } catch (error) {
      console.error('Error saving reward:', error);
      toast.error('فشل في حفظ المكافأة');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLevel = async () => {
    try {
      // This would typically save to the database
      // For now, we'll just update the local state
      if (editingLevel) {
        setLevels(levels.map(level => 
          level.id === editingLevel.id ? { ...editingLevel } : level
        ));
        toast.success('تم تحديث المستوى بنجاح');
      } else {
        // Add new level
        const newLevel = {
          id: Math.max(...levels.map(l => l.id)) + 1,
          ...editingLevel
        };
        setLevels([...levels, newLevel]);
        toast.success('تم إضافة المستوى بنجاح');
      }
      
      setShowLevelModal(false);
      setEditingLevel(null);
    } catch (error) {
      console.error('Error saving level:', error);
      toast.error('فشل في حفظ المستوى');
    }
  };

  const handleDeleteReward = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المكافأة؟')) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('points_rewards')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('تم حذف المكافأة بنجاح');
      
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast.error('فشل في حذف المكافأة');
    } finally {
      setLoading(false);
    }
  };

  const getRewardTypeText = (type) => {
    switch (type) {
      case 'free_delivery': return 'توصيل مجاني';
      case 'order_discount': return 'خصم على الطلب';
      case 'delivery_discount': return 'خصم على التوصيل';
      case 'product_discount': return 'خصم على منتج';
      case 'gift': return 'هدية';
      default: return type;
    }
  };

  const getDiscountText = (reward) => {
    if (reward.reward_type === 'free_delivery') {
      return 'توصيل مجاني';
    }
    
    if (reward.discount_type === 'percentage') {
      return `${reward.discount_value}%`;
    }
    
    return `₪${reward.discount_value}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'used': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'used': return 'مستخدم';
      case 'expired': return 'منتهي';
      default: return status;
    }
  };

  const getTransactionTypeText = (type) => {
    switch (type) {
      case 'earn': return 'كسب نقاط';
      case 'spend': return 'استخدام نقاط';
      case 'expire': return 'انتهاء صلاحية';
      case 'adjust': return 'تعديل';
      default: return type;
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'earn': return 'text-green-600';
      case 'spend': return 'text-red-600';
      case 'expire': return 'text-gray-600';
      case 'adjust': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const filteredRewards = filterData(rewards);

  if (loading && rewards.length === 0) {
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
      {/* Points Settings Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">إعدادات النقاط</h2>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            تعديل الإعدادات
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">قيمة النقطة</h3>
            <p className="text-2xl font-bold text-gray-900">₪{settings.points_value}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">الحد الأدنى للاستبدال</h3>
            <p className="text-2xl font-bold text-gray-900">{settings.min_points_redeem} نقطة</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">مدة صلاحية النقاط</h3>
            <p className="text-2xl font-bold text-gray-900">{settings.points_expiry_days} يوم</p>
          </div>
        </div>
      </div>

      {/* Customer Levels Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">مستويات العملاء</h2>
          <button
            onClick={() => {
              setEditingLevel(null);
              setShowLevelModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            إضافة مستوى جديد
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {levels.map(level => (
            <div key={level.id} className={`rounded-lg p-6 ${level.color}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-3xl">{level.icon}</span>
                  <h3 className="text-xl font-semibold mt-2">{level.name}</h3>
                </div>
                <div className="text-sm">
                  {level.min_points.toLocaleString()} - {level.max_points ? level.max_points.toLocaleString() : '∞'} نقطة
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">المميزات:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {level.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setEditingLevel(level);
                    setShowLevelModal(true);
                  }}
                  className="text-sm hover:underline"
                >
                  تعديل
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">آخر معاملات النقاط</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العملية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النقاط</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    لا توجد معاملات
                  </td>
                </tr>
              ) : (
                transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.account?.customer?.name || 'غير معروف'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getTransactionTypeColor(transaction.type)}>
                        {getTransactionTypeText(transaction.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getTransactionTypeColor(transaction.type)}>
                        {transaction.type === 'earn' ? '+' : transaction.type === 'spend' || transaction.type === 'expire' ? '-' : ''}
                        {transaction.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleString('ar-SA')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Redemptions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">آخر عمليات استبدال النقاط</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المكافأة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النقاط</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الرمز</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الانتهاء</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {redemptions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    لا توجد عمليات استبدال
                  </td>
                </tr>
              ) : (
                redemptions.map(redemption => (
                  <tr key={redemption.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {redemption.account?.customer?.name || 'غير معروف'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {redemption.reward?.name || 'غير معروف'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-red-600">
                        -{redemption.points_spent}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        {redemption.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(redemption.status)}`}>
                        {getStatusText(redemption.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(redemption.expires_at).toLocaleDateString('ar-SA')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rewards Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">المكافآت</h2>
          <button
            onClick={() => {
              setEditingReward(null);
              setRewardForm({
                name: '',
                description: '',
                points_cost: '',
                reward_type: 'free_delivery',
                discount_type: '',
                discount_value: '',
                min_order_amount: '',
                max_discount: '',
                usage_limit: '',
                start_date: '',
                end_date: '',
                status: 'active'
              });
              setShowRewardModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            إضافة مكافأة جديدة
          </button>
        </div>

        <SearchFilter 
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          
          {filteredRewards.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              لا توجد مكافآت متطابقة مع معايير البحث
            </div>
          ) : (
            filteredRewards.map(reward => (
              <div key={reward.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{reward.name}</h3>
                    <p className="text-gray-600 text-sm">{reward.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    reward.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {reward.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="font-medium">النقاط المطلوبة:</span> {reward.points_cost}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">نوع المكافأة:</span> {getRewardTypeText(reward.reward_type)}
                  </p>
                  {reward.discount_value && (
                    <p className="text-sm">
                      <span className="font-medium">قيمة الخصم:</span> {getDiscountText(reward)}
                    </p>
                  )}
                  {reward.min_order_amount && (
                    <p className="text-sm">
                      <span className="font-medium">الحد الأدنى للطلب:</span> ₪{reward.min_order_amount}
                    </p>
                  )}
                  {reward.max_discount && (
                    <p className="text-sm">
                      <span className="font-medium">أقصى خصم:</span> ₪{reward.max_discount}
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">الاستخدام:</span> {reward.used_count || 0}/{reward.usage_limit || '∞'}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">الصلاحية:</span>{' '}
                    {new Date(reward.start_date).toLocaleDateString('ar-SA')} -{' '}
                    {new Date(reward.end_date).toLocaleDateString('ar-SA')}
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setEditingReward(reward);
                      setRewardForm({
                        name: reward.name,
                        description: reward.description || '',
                        points_cost: reward.points_cost.toString(),
                        reward_type: reward.reward_type,
                        discount_type: reward.discount_type || '',
                        discount_value: reward.discount_value ? reward.discount_value.toString() : '',
                        min_order_amount: reward.min_order_amount ? reward.min_order_amount.toString() : '',
                        max_discount: reward.max_discount ? reward.max_discount.toString() : '',
                        usage_limit: reward.usage_limit ? reward.usage_limit.toString() : '',
                        start_date: reward.start_date,
                        end_date: reward.end_date,
                        status: reward.status
                      });
                      setShowRewardModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 ml-2"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDeleteReward(reward.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <Dialog
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-semibold mb-6">
              إعدادات النقاط
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  قيمة النقطة (₪)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.points_value}
                  onChange={(e) => setSettings({ ...settings, points_value: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الحد الأدنى للاستبدال (نقاط)
                </label>
                <input
                  type="number"
                  value={settings.min_points_redeem}
                  onChange={(e) => setSettings({ ...settings, min_points_redeem: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مدة صلاحية النقاط (أيام)
                </label>
                <input
                  type="number"
                  value={settings.points_expiry_days}
                  onChange={(e) => setSettings({ ...settings, points_expiry_days: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  النقاط لكل ₪1
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.points_per_currency}
                  onChange={(e) => setSettings({ ...settings, points_per_currency: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الحد الأدنى للطلب لكسب النقاط (₪)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.min_order_points}
                  onChange={(e) => setSettings({ ...settings, min_order_points: parseFloat(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'جارٍ الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Reward Modal */}
      <Dialog
        open={showRewardModal}
        onClose={() => setShowRewardModal(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-semibold mb-6">
              {editingReward ? 'تعديل المكافأة' : 'إضافة مكافأة جديدة'}
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المكافأة
                </label>
                <input
                  type="text"
                  value={rewardForm.name}
                  onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف
                </label>
                <textarea
                  value={rewardForm.description}
                  onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  النقاط المطلوبة
                </label>
                <input
                  type="number"
                  value={rewardForm.points_cost}
                  onChange={(e) => setRewardForm({ ...rewardForm, points_cost: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نوع المكافأة
                </label>
                <select
                  value={rewardForm.reward_type}
                  onChange={(e) => setRewardForm({ ...rewardForm, reward_type: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="free_delivery">توصيل مجاني</option>
                  <option value="order_discount">خصم على الطلب</option>
                  <option value="delivery_discount">خصم على التوصيل</option>
                  <option value="product_discount">خصم على منتج</option>
                  <option value="gift">هدية</option>
                </select>
              </div>

              {rewardForm.reward_type !== 'free_delivery' && rewardForm.reward_type !== 'gift' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نوع الخصم
                    </label>
                    <select
                      value={rewardForm.discount_type}
                      onChange={(e) => setRewardForm({ ...rewardForm, discount_type: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">اختر نوع الخصم</option>
                      <option value="percentage">نسبة مئوية</option>
                      <option value="fixed">مبلغ ثابت</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      قيمة الخصم
                    </label>
                    <input
                      type="number"
                      step={rewardForm.discount_type === 'percentage' ? '1' : '0.01'}
                      value={rewardForm.discount_value}
                      onChange={(e) => setRewardForm({ ...rewardForm, discount_value: e.target.value })}
                      className="w-full p-2 border rounded-lg"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الحد الأدنى للطلب
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={rewardForm.min_order_amount}
                  onChange={(e) => setRewardForm({ ...rewardForm, min_order_amount: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {rewardForm.reward_type !== 'free_delivery' && rewardForm.reward_type !== 'gift' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    أقصى خصم
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={rewardForm.max_discount}
                    onChange={(e) => setRewardForm({ ...rewardForm, max_discount: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  حد الاستخدام
                </label>
                <input
                  type="number"
                  value={rewardForm.usage_limit}
                  onChange={(e) => setRewardForm({ ...rewardForm, usage_limit: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="اتركه فارغاً لعدم وجود حد"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ البداية
                </label>
                <input
                  type="date"
                  value={rewardForm.start_date}
                  onChange={(e) => setRewardForm({ ...rewardForm, start_date: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  تاريخ الانتهاء
                </label>
                <input
                  type="date"
                  value={rewardForm.end_date}
                  onChange={(e) => setRewardForm({ ...rewardForm, end_date: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الحالة
                </label>
                <select
                  value={rewardForm.status}
                  onChange={(e) => setRewardForm({ ...rewardForm, status: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => setShowRewardModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveReward}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'جارٍ الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Level Modal */}
      <Dialog
        open={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              {editingLevel ? 'تعديل المستوى' : 'إضافة مستوى جديد'}
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  اسم المستوى
                </label>
                <input
                  type="text"
                  value={editingLevel?.name || ''}
                  onChange={(e) => setEditingLevel({ ...editingLevel, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الأيقونة
                </label>
                <input
                  type="text"
                  value={editingLevel?.icon || ''}
                  onChange={(e) => setEditingLevel({ ...editingLevel, icon: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الحد الأدنى للنقاط
                </label>
                <input
                  type="number"
                  value={editingLevel?.min_points || ''}
                  onChange={(e) => setEditingLevel({ ...editingLevel, min_points: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الحد الأقصى للنقاط
                </label>
                <input
                  type="number"
                  value={editingLevel?.max_points || ''}
                  onChange={(e) => setEditingLevel({ ...editingLevel, max_points: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                  placeholder="اتركه فارغاً لعدم وجود حد"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المميزات (كل سطر ميزة)
                </label>
                <textarea
                  value={editingLevel?.benefits?.join('\n') || ''}
                  onChange={(e) => setEditingLevel({ ...editingLevel, benefits: e.target.value.split('\n') })}
                  className="w-full p-2 border rounded-lg"
                  rows={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  لون الخلفية
                </label>
                <select
                  value={editingLevel?.color || ''}
                  onChange={(e) => setEditingLevel({ ...editingLevel, color: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="bg-amber-100 text-amber-800">برونزي</option>
                  <option value="bg-gray-100 text-gray-800">فضي</option>
                  <option value="bg-yellow-100 text-yellow-800">ذهبي</option>
                  <option value="bg-purple-100 text-purple-800">بلاتيني</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => setShowLevelModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveLevel}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'جارٍ الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}