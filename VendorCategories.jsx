import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';

export default function VendorCategories() {
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'restaurant') // Filter by type to get only restaurant/market categories
        .order('name');
      
      if (categoriesError) throw categoriesError;
      
      // Fetch vendor categories to count vendors per category
      const { data: vendorCategoriesData, error: vendorCategoriesError } = await supabase
        .from('vendor_categories')
        .select(`
          vendor_id,
          category_id
        `);
      
      if (vendorCategoriesError) throw vendorCategoriesError;
      
      // Count vendors per category
      const vendorCounts = {};
      vendorCategoriesData.forEach(vc => {
        vendorCounts[vc.category_id] = (vendorCounts[vc.category_id] || 0) + 1;
      });
      
      // Add vendor count to each category
      const categoriesWithCounts = categoriesData.map(category => ({
        ...category,
        vendorCount: vendorCounts[category.id] || 0
      }));
      
      setCategories(categoriesWithCounts || []);
      
      // Fetch vendors for dropdown
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('id, store_name')
        .order('store_name');
      
      if (vendorsError) throw vendorsError;
      setVendors(vendorsData || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('فشل في تحميل البيانات. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (!formData.name) {
        toast.error('الرجاء إدخال اسم التصنيف');
        setLoading(false);
        return;
      }
      
      // Generate a slug from the name
      const slug = formData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
      
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url,
            slug
          })
          .eq('id', editingCategory.id);
        
        if (error) throw error;
        
        toast.success('تم تحديث التصنيف بنجاح');
      } else {
        // Add new category
        const { data, error } = await supabase
          .from('categories')
          .insert([{
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url,
            slug,
            type: 'restaurant' // Set type to restaurant for vendor categories
          }])
          .select();
        
        if (error) throw error;
        
        // If a vendor is selected, link the category to the vendor
        if (formData.vendor_id) {
          const { error: linkError } = await supabase
            .from('vendor_categories')
            .insert([{
              vendor_id: formData.vendor_id,
              category_id: data[0].id
            }]);
          
          if (linkError) {
            console.error('Error linking category to vendor:', linkError);
            // Continue anyway, the category was created successfully
          }
        }
        
        toast.success('تم إضافة التصنيف بنجاح');
      }
      
      // Refresh categories
      fetchData();
      
      // Reset form and close modal
      setShowModal(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        image_url: '',
        vendor_id: ''
      });
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(editingCategory ? 'فشل في تحديث التصنيف' : 'فشل في إضافة التصنيف');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    
    try {
      setLoading(true);
      
      // Check if category is linked to any vendors
      const { data: vendorCategories, error: checkError } = await supabase
        .from('vendor_categories')
        .select('vendor_id')
        .eq('category_id', id);
      
      if (checkError) throw checkError;
      
      if (vendorCategories && vendorCategories.length > 0) {
        toast.error('لا يمكن حذف هذا التصنيف لأنه مرتبط ببائعين');
        setLoading(false);
        return;
      }
      
      // Delete category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('تم حذف التصنيف بنجاح');
      
      // Refresh categories
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('فشل في حذف التصنيف');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkVendor = async (categoryId, vendorId) => {
    try {
      setLoading(true);
      
      // Check if the link already exists
      const { data: existingLink, error: checkError } = await supabase
        .from('vendor_categories')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('category_id', categoryId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') throw checkError;
      
      if (existingLink) {
        toast.info('هذا البائع مرتبط بالفعل بهذا التصنيف');
        setLoading(false);
        return;
      }
      
      // Create the link
      const { error } = await supabase
        .from('vendor_categories')
        .insert([{
          vendor_id: vendorId,
          category_id: categoryId
        }]);
      
      if (error) throw error;
      
      toast.success('تم ربط البائع بالتصنيف بنجاح');
      
      // Refresh categories
      fetchData();
    } catch (error) {
      console.error('Error linking vendor to category:', error);
      toast.error('فشل في ربط البائع بالتصنيف');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkVendor = async (categoryId, vendorId) => {
    try {
      setLoading(true);
      
      // Delete the link
      const { error } = await supabase
        .from('vendor_categories')
        .delete()
        .eq('vendor_id', vendorId)
        .eq('category_id', categoryId);
      
      if (error) throw error;
      
      toast.success('تم إلغاء ربط البائع بالتصنيف بنجاح');
      
      // Refresh categories
      fetchData();
    } catch (error) {
      console.error('Error unlinking vendor from category:', error);
      toast.error('فشل في إلغاء ربط البائع بالتصنيف');
    } finally {
      setLoading(false);
    }
  };

  // Get vendors linked to a specific category
  const getVendorsForCategory = async (categoryId) => {
    try {
      const { data, error } = await supabase
        .from('vendor_categories')
        .select(`
          vendor:vendor_id(id, store_name)
        `)
        .eq('category_id', categoryId);
      
      if (error) throw error;
      
      return data.map(item => item.vendor);
    } catch (error) {
      console.error('Error fetching vendors for category:', error);
      return [];
    }
  };

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryVendors, setCategoryVendors] = useState([]);
  const [showVendorsModal, setShowVendorsModal] = useState(false);

  const handleViewVendors = async (category) => {
    setSelectedCategory(category);
    setLoading(true);
    
    try {
      const vendors = await getVendorsForCategory(category.id);
      setCategoryVendors(vendors);
      setShowVendorsModal(true);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('فشل في جلب البائعين');
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
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
        <h2 className="text-2xl font-bold">تصنيفات المتاجر</h2>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({
              name: '',
              description: '',
              image_url: '',
              vendor_id: ''
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          إضافة تصنيف جديد
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصورة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عدد البائعين</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    لا توجد تصنيفات. قم بإضافة تصنيف جديد.
                  </td>
                </tr>
              ) : (
                categories.map(category => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-500">{category.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                          }}
                        />
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewVendors(category)}
                        className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200"
                      >
                        {category.vendorCount || 0} بائع
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setFormData({
                            name: category.name,
                            description: category.description || '',
                            image_url: category.image_url || ''
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 ml-4"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">ربط بائع بتصنيف</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التصنيف
            </label>
            <select
              className="w-full border rounded-md px-3 py-2"
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              value={formData.category_id || ''}
            >
              <option value="">اختر التصنيف</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البائع
            </label>
            <select
              className="w-full border rounded-md px-3 py-2"
              onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
              value={formData.vendor_id || ''}
            >
              <option value="">اختر البائع</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.store_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                if (!formData.category_id || !formData.vendor_id) {
                  toast.error('الرجاء اختيار التصنيف والبائع');
                  return;
                }
                handleLinkVendor(formData.category_id, formData.vendor_id);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              disabled={loading}
            >
              ربط
            </button>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <Dialog
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              {editingCategory ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم التصنيف <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                  placeholder="مثال: مطاعم، ماركت"
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
                  placeholder="وصف مختصر للتصنيف"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الصورة
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {!editingCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ربط مع بائع (اختياري)
                  </label>
                  <select
                    value={formData.vendor_id || ''}
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
                    setEditingCategory(null);
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
                  {loading ? 'جاري الحفظ...' : (editingCategory ? 'تحديث' : 'إضافة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>

      {/* Vendors Modal */}
      <Dialog
        open={showVendorsModal}
        onClose={() => setShowVendorsModal(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              البائعين في تصنيف: {selectedCategory?.name}
            </Dialog.Title>

            {categoryVendors.length === 0 ? (
              <p className="text-center text-gray-500 py-4">لا يوجد بائعين في هذا التصنيف</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {categoryVendors.map(vendor => (
                  <li key={vendor.id} className="py-4 flex justify-between items-center">
                    <span>{vendor.store_name}</span>
                    <button
                      onClick={() => {
                        handleUnlinkVendor(selectedCategory.id, vendor.id);
                        setShowVendorsModal(false);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      إلغاء الربط
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowVendorsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
