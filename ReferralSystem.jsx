import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';

export default function ReferralSystem() {
  const [referralRewards, setReferralRewards] = useState([
    {
      id: 1,
      name: 'مكافأة إحالة المستخدم',
      description: 'احصل على نقاط عند دعوة صديق',
      type: 'user',
      points_reward: 100,
      points_referrer: 50,
      usage_limit: null,
      status: 'active'
    },
    {
      id: 2,
      name: 'مكافأة إحالة المشاهير',
      description: 'برنامج إحالة خاص للمشاهير',
      type: 'influencer',
      points_reward: 200,
      points_referrer: 100,
      usage_limit: null,
      status: 'active'
    }
  ]);

  const [referralCodes, setReferralCodes] = useState([
    {
      id: 1,
      user_id: '123',
      code: 'ABC123',
      type: 'user',
      status: 'active',
      usage_limit: 10,
      used_count: 5,
      points_reward: 100,
      points_referrer: 50,
      expires_at: '2025-12-31'
    },
    {
      id: 2,
      user_id: '456',
      code: 'INF789XYZ',
      type: 'influencer',
      status: 'active',
      usage_limit: 100,
      used_count: 45,
      points_reward: 200,
      points_referrer: 100,
      expires_at: '2025-12-31'
    }
  ]);

  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [editingCode, setEditingCode] = useState(null);

  const initialFilters = {
    code: {
      type: 'text',
      label: 'كود الإحالة',
      placeholder: 'البحث بكود الإحالة',
      value: ''
    },
    type: {
      type: 'select',
      label: 'نوع الكود',
      placeholder: 'جميع الأنواع',
      options: [
        { value: 'user', label: 'مستخدم' },
        { value: 'influencer', label: 'مشهور' }
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

  const handleSaveReward = async () => {
    try {
      // API call to save reward
      toast.success(editingReward ? 'تم تحديث المكافأة بنجاح' : 'تم إضافة المكافأة بنجاح');
      setShowRewardModal(false);
      setEditingReward(null);
    } catch (error) {
      toast.error('فشل في حفظ المكافأة');
    }
  };

  const handleSaveCode = async () => {
    try {
      // API call to save code
      toast.success(editingCode ? 'تم تحديث الكود بنجاح' : 'تم إضافة الكود بنجاح');
      setShowCodeModal(false);
      setEditingCode(null);
    } catch (error) {
      toast.error('فشل في حفظ الكود');
    }
  };

  const handleDeleteCode = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الكود؟')) return;

    try {
      // API call to delete code
      toast.success('تم حذف الكود بنجاح');
    } catch (error) {
      toast.error('فشل في حذف الكود');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      default: return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'user': return 'مستخدم';
      case 'influencer': return 'مشهور';
      default: return type;
    }
  };

  const filteredCodes = filterData(referralCodes);

  return (
    <div className="space-y-6">
      {/* Referral Rewards Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">مكافآت الإحالة</h2>
          <button
            onClick={() => {
              setEditingReward(null);
              setShowRewardModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            إضافة مكافأة جديدة
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {referralRewards.map(reward => (
            <div key={reward.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{reward.name}</h3>
                  <p className="text-gray-600 text-sm">{reward.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(reward.status)}`}>
                  {getStatusText(reward.status)}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">نوع الإحالة:</span> {getTypeText(reward.type)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">نقاط المستخدم الجديد:</span> {reward.points_reward}
                </p>
                <p className="text-sm">
                  <span className="font-medium">نقاط صاحب الإحالة:</span> {reward.points_referrer}
                </p>
                {reward.usage_limit && (
                  <p className="text-sm">
                    <span className="font-medium">الحد الأقصى للاستخدام:</span> {reward.usage_limit}
                  </p>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => {
                    setEditingReward(reward);
                    setShowRewardModal(true);
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

      {/* Referral Codes Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">أكواد الإحالة</h2>
          <button
            onClick={() => {
              setEditingCode(null);
              setShowCodeModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            إنشاء كود جديد
          </button>
        </div>

        <SearchFilter 
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكود</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاستخدام</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النقاط</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الانتهاء</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCodes.map(code => (
                <tr key={code.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{code.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getTypeText(code.type)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {code.used_count}/{code.usage_limit || '∞'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div>المستخدم: {code.points_reward}</div>
                      <div>المُحيل: {code.points_referrer}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {code.expires_at ? new Date(code.expires_at).toLocaleDateString('ar-SA') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(code.status)}`}>
                      {getStatusText(code.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingCode(code);
                        setShowCodeModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 ml-2"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteCode(code.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reward Modal */}
      <Dialog
        open={showRewardModal}
        onClose={() => {
          setShowRewardModal(false);
          setEditingReward(null);
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              {editingReward ? 'تعديل مكافأة' : 'إضافة مكافأة جديدة'}
            </Dialog.Title>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveReward();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المكافأة
                </label>
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الإحالة
                </label>
                <select className="w-full border rounded-md px-3 py-2">
                  <option value="user">مستخدم</option>
                  <option value="influencer">مشهور</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نقاط المستخدم الجديد
                </label>
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نقاط صاحب الإحالة
                </label>
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأقصى للاستخدام
                </label>
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2"
                  min="0"
                  placeholder="اتركه فارغاً لعدم وجود حد"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRewardModal(false);
                    setEditingReward(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingReward ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>

      {/* Code Modal */}
      <Dialog
        open={showCodeModal}
        onClose={() => {
          setShowCodeModal(false);
          setEditingCode(null);
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              {editingCode ? 'تعديل كود' : 'إنشاء كود جديد'}
            </Dialog.Title>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveCode();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الكود
                </label>
                <select className="w-full border rounded-md px-3 py-2">
                  <option value="user">مستخدم</option>
                  <option value="influencer">مشهور</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأقصى للاستخدام
                </label>
                <input
                  type="number"
                  className="w-full border rounded-md px-3 py-2"
                  min="0"
                  placeholder="اتركه فارغاً لعدم وجود حد"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الانتهاء
                </label>
                <input
                  type="date"
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCodeModal(false);
                    setEditingCode(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingCode ? 'تحديث' : 'إنشاء'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}