import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';

export default function Delivery() {
  const [methods, setMethods] = useState([
    {
      id: 1,
      name: 'توصيل حسب المسافة',
      description: 'حساب سعر التوصيل بناءً على المسافة',
      type: 'distance',
      settings: {
        min_distance: 1,
        max_distance: 20,
        base_fee: 5,
        price_per_km: 2
      },
      status: 'active'
    },
    {
      id: 2,
      name: 'توصيل بسعر ثابت',
      description: 'سعر توصيل ثابت لجميع الطلبات',
      type: 'fixed',
      settings: {
        fixed_price: 10
      },
      status: 'active'
    },
    {
      id: 3,
      name: 'توصيل حسب المنطقة',
      description: 'أسعار توصيل مختلفة لكل منطقة',
      type: 'zones',
      settings: {
        zones: [
          { name: 'المنطقة أ', price: 10 },
          { name: 'المنطقة ب', price: 15 },
          { name: 'المنطقة ج', price: 20 }
        ]
      },
      status: 'active'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'distance',
    settings: {},
    status: 'active'
  });

  const initialFilters = {
    name: {
      type: 'text',
      label: 'اسم الطريقة',
      placeholder: 'البحث باسم طريقة التوصيل',
      value: ''
    },
    type: {
      type: 'select',
      label: 'النوع',
      placeholder: 'جميع الأنواع',
      options: [
        { value: 'distance', label: 'حسب المسافة' },
        { value: 'fixed', label: 'سعر ثابت' },
        { value: 'zones', label: 'مناطق' }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newMethod = {
        id: editingMethod ? editingMethod.id : methods.length + 1,
        ...formData
      };

      if (editingMethod) {
        setMethods(methods.map(m => m.id === editingMethod.id ? newMethod : m));
        toast.success('تم تحديث طريقة التوصيل بنجاح');
      } else {
        setMethods([...methods, newMethod]);
        toast.success('تم إضافة طريقة التوصيل بنجاح');
      }

      setShowModal(false);
      setEditingMethod(null);
      setFormData({
        name: '',
        description: '',
        type: 'distance',
        settings: {},
        status: 'active'
      });
    } catch (error) {
      toast.error(editingMethod ? 'فشل تحديث طريقة التوصيل' : 'فشل إضافة طريقة التوصيل');
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('هل أنت متأكد من حذف طريقة التوصيل هذه؟')) return;
    setMethods(methods.filter(m => m.id !== id));
    toast.success('تم حذف طريقة التوصيل بنجاح');
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'distance': return 'حسب المسافة';
      case 'fixed': return 'سعر ثابت';
      case 'zones': return 'مناطق';
      default: return type;
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

  const filteredMethods = filterData(methods);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">طرق التوصيل</h2>
        <button
          onClick={() => {
            setEditingMethod(null);
            setFormData({
              name: '',
              description: '',
              type: 'distance',
              settings: {},
              status: 'active'
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          إضافة طريقة توصيل
        </button>
      </div>

      <SearchFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMethods.map(method => (
          <div key={method.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{method.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{method.description}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(method.status)}`}>
                {getStatusText(method.status)}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">النوع</p>
                <p className="text-lg">{getTypeText(method.type)}</p>
              </div>

              {method.type === 'distance' && (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">السعر لكل كيلومتر</p>
                    <p className="text-lg">₪{method.settings.price_per_km}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">السعر الأساسي</p>
                    <p className="text-lg">₪{method.settings.base_fee}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">نطاق التوصيل</p>
                    <p className="text-lg">
                      {method.settings.min_distance} - {method.settings.max_distance} كم
                    </p>
                  </div>
                </div>
              )}

              {method.type === 'fixed' && (
                <div>
                  <p className="text-sm font-medium text-gray-700">السعر الثابت</p>
                  <p className="text-lg">₪{method.settings.fixed_price}</p>
                </div>
              )}

              {method.type === 'zones' && (
                <div>
                  <p className="text-sm font-medium text-gray-700">المناطق</p>
                  <div className="space-y-1 mt-2">
                    {method.settings.zones.map((zone, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{zone.name}</span>
                        <span>₪{zone.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setEditingMethod(method);
                  setFormData({
                    name: method.name,
                    description: method.description,
                    type: method.type,
                    settings: method.settings,
                    status: method.status
                  });
                  setShowModal(true);
                }}
                className="text-blue-600 hover:text-blue-800 ml-2"
              >
                تعديل
              </button>
              <button
                onClick={() => handleDelete(method.id)}
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
          setEditingMethod(null);
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              {editingMethod ? 'تعديل طريقة التوصيل' : 'إضافة طريقة توصيل'}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الطريقة
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
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  النوع
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const type = e.target.value;
                    let settings = {};
                    
                    switch (type) {
                      case 'distance':
                        settings = {
                          min_distance: 1,
                          max_distance: 20,
                          base_fee: 5,
                          price_per_km: 2
                        };
                        break;
                      case 'fixed':
                        settings = {
                          fixed_price: 10
                        };
                        break;
                      case 'zones':
                        settings = {
                          zones: [
                            { name: 'المنطقة أ', price: 10 },
                            { name: 'المنطقة ب', price: 15 },
                            { name: 'المنطقة ج', price: 20 }
                          ]
                        };
                        break;
                    }

                    setFormData({ ...formData, type, settings });
                  }}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="distance">حسب المسافة</option>
                  <option value="fixed">سعر ثابت</option>
                  <option value="zones">مناطق</option>
                </select>
              </div>

              {formData.type === 'distance' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      السعر لكل كيلومتر (₪)
                    </label>
                    <input
                      type="number"
                      value={formData.settings.price_per_km}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          price_per_km: parseFloat(e.target.value)
                        }
                      })}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      السعر الأساسي (₪)
                    </label>
                    <input
                      type="number"
                      value={formData.settings.base_fee}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          base_fee: parseFloat(e.target.value)
                        }
                      })}
                      className="w-full border rounded-md px-3 py-2"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        أقل مسافة (كم)
                      </label>
                      <input
                        type="number"
                        value={formData.settings.min_distance}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            min_distance: parseFloat(e.target.value)
                          }
                        })}
                        className="w-full border rounded-md px-3 py-2"
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        أقصى مسافة (كم)
                      </label>
                      <input
                        type="number"
                        value={formData.settings.max_distance}
                        onChange={(e) => setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            max_distance: parseFloat(e.target.value)
                          }
                        })}
                        className="w-full border rounded-md px-3 py-2"
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.type === 'fixed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السعر الثابت (₪)
                  </label>
                  <input
                    type="number"
                    value={formData.settings.fixed_price}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        fixed_price: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full border rounded-md px-3 py-2"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              )}

              {formData.type === 'zones' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المناطق
                  </label>
                  <div className="space-y-2">
                    {formData.settings.zones.map((zone, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={zone.name}
                          onChange={(e) => {
                            const newZones = [...formData.settings.zones];
                            newZones[index] = { ...zone, name: e.target.value };
                            setFormData({
                              ...formData,
                              settings: { ...formData.settings, zones: newZones }
                            });
                          }}
                          className="flex-1 border rounded-md px-3 py-2"
                          placeholder="اسم المنطقة"
                          required
                        />
                        <input
                          type="number"
                          value={zone.price}
                          onChange={(e) => {
                            const newZones = [...formData.settings.zones];
                            newZones[index] = { ...zone, price: parseFloat(e.target.value) };
                            setFormData({
                              ...formData,
                              settings: { ...formData.settings, zones: newZones }
                            });
                          }}
                          className="w-32 border rounded-md px-3 py-2"
                          min="0"
                          step="0.01"
                          placeholder="السعر"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newZones = formData.settings.zones.filter((_, i) => i !== index);
                            setFormData({
                              ...formData,
                              settings: { ...formData.settings, zones: newZones }
                            });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newZones = [...formData.settings.zones, { name: '', price: 0 }];
                        setFormData({
                          ...formData,
                          settings: { ...formData.settings, zones: newZones }
                        });
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      إضافة منطقة
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                >
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingMethod(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingMethod ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}