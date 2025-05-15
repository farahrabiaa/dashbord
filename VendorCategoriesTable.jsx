import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import MediaUpload from '../Products/MediaUpload';
import { BUCKETS } from '../../lib/supabaseStorage';
import { VendorCategoryAdvertisement } from '../Advertisements';

export default function VendorCategoriesTable() {
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showVendorsModal, setShowVendorsModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    slug: ''
  });
  const [selectedVendor, setSelectedVendor] = useState('');
  const [categoryVendors, setCategoryVendors] = useState([]);
  const [adFormData, setAdFormData] = useState({
    title: '',
    description: '',
    vendor_id: '',
    image_url: '',
    link: '',
    start_date: '',
    end_date: '',
    status: 'draft',
    type: 'banner',
    position: 'vendor_category',
    priority: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch vendor categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('vendor_categories_table')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch vendors
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

      // Generate slug if not provided
      const slug = formData.slug || formData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

      if (editingCategory) {
        // Update existing category
        const { data, error } = await supabase
          .from('vendor_categories_table')
          .update({
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url,
            slug,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id)
          .select();

        if (error) throw error;
        toast.success('تم تحديث القسم بنجاح');
      } else {
        // Add new category
        const { data, error } = await supabase
          .from('vendor_categories_table')
          .insert([{
            name: formData.name,
            description: formData.description,
            image_url: formData.image_url,
            slug
          }])
          .select();

        if (error) throw error;
        toast.success('تم إضافة القسم بنجاح');
      }

      // Refresh data
      fetchData();

      // Reset form and close modal
      setShowModal(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        image_url: '',
        slug: ''
      });
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(editingCategory ? 'فشل في تحديث القسم' : 'فشل في إضافة القسم');
    } finally {
      setLoading(false);
    }
  };

  const handleAdSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (!adFormData.title || !adFormData.image_url || !adFormData.start_date || !adFormData.end_date) {
        toast.error('الرجاء تعبئة جميع الحقول المطلوبة');
        setLoading(false);
        return;
      }

      // Create new ad
      const { data, error } = await supabase
        .from('advertisements')
        .insert([{
          title: adFormData.title,
          description: adFormData.description,
          vendor_id: adFormData.vendor_id || null,
          vendor_category_id: selectedCategory.id,
          image_url: adFormData.image_url,
          link: adFormData.link,
          start_date: adFormData.start_date,
          end_date: adFormData.end_date,
          status: adFormData.status,
          type: adFormData.type,
          position: 'vendor_category',
          priority: parseInt(adFormData.priority)
        }])
        .select();
      
      if (error) throw error;
      
      toast.success('تم إضافة الإعلان بنجاح');
      setShowAdModal(false);
      
      // Reset form
      setAdFormData({
        title: '',
        description: '',
        vendor_id: '',
        image_url: '',
        link: '',
        start_date: '',
        end_date: '',
        status: 'draft',
        type: 'banner',
        position: 'vendor_category',
        priority: 1
      });
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast.error('فشل في حفظ الإعلان');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟')) return;

    try {
      // Delete category
      const { error } = await supabase
        .from('vendor_categories_table')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم حذف القسم بنجاح');
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('فشل في حذف القسم');
    }
  };

  const handleImageUpload = ({ preview }) => {
    if (preview) {
      setFormData({ ...formData, image_url: preview });
    }
  };

  const handleAdImageUpload = ({ preview }) => {
    if (preview) {
      setAdFormData({ ...adFormData, image_url: preview });
    }
  };

  const handleViewVendors = async (category) => {
    try {
      setLoading(true);
      setSelectedCategory(category);

      // Fetch vendors for this category
      const { data, error } = await supabase
        .from('vendor_to_category')
        .select(`
          vendor:vendor_id(id, store_name)
        `)
        .eq('category_id', category.id);

      if (error) {
        console.error('Error fetching category vendors:', error);
        // Continue with empty array if there's an error
        setCategoryVendors([]);
      } else {
        // Transform data to get just the vendor objects
        const vendorsList = data
          .filter(item => item.vendor) // Filter out any null vendors
          .map(item => item.vendor);
        setCategoryVendors(vendorsList);
      }

      setShowVendorsModal(true);
    } catch (error) {
      console.error('Error fetching category vendors:', error);
      toast.error('فشل في تحميل البائعين');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkVendor = async () => {
    if (!selectedCategory || !selectedVendor) {
      toast.error('الرجاء اختيار البائع');
      return;
    }

    try {
      setLoading(true);

      // Check if the vendor is already linked to this category
      const { data: existingLink, error: checkError } = await supabase
        .from('vendor_to_category')
        .select('*')
        .eq('vendor_id', selectedVendor)
        .eq('category_id', selectedCategory.id);

      // Handle the case where no rows are returned (which is not an error)
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // If the vendor is already linked, show a message and return
      if (existingLink && existingLink.length > 0) {
        toast.info('هذا البائع مرتبط بالفعل بهذا القسم');
        setSelectedVendor('');
        return;
      }

      // Link vendor to category
      const { error } = await supabase
        .from('vendor_to_category')
        .insert([{
          vendor_id: selectedVendor,
          category_id: selectedCategory.id
        }]);

      if (error) throw error;

      toast.success('تم ربط البائع بالقسم بنجاح');

      // Refresh vendors list
      const { data: updatedVendors, error: vendorsError } = await supabase
        .from('vendor_to_category')
        .select(`
          vendor:vendor_id(id, store_name)
        `)
        .eq('category_id', selectedCategory.id);

      if (vendorsError) throw vendorsError;

      // Transform data to get just the vendor objects
      const vendorsList = updatedVendors
        .filter(item => item.vendor) // Filter out any null vendors
        .map(item => item.vendor);
      setCategoryVendors(vendorsList);

      // Reset selected vendor
      setSelectedVendor('');
    } catch (error) {
      console.error('Error linking vendor to category:', error);
      toast.error('فشل في ربط البائع بالقسم: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkVendor = async (vendorId) => {
    if (!selectedCategory || !vendorId) return;

    try {
      setLoading(true);

      // Unlink vendor from category
      const { error } = await supabase
        .from('vendor_to_category')
        .delete()
        .eq('vendor_id', vendorId)
        .eq('category_id', selectedCategory.id);

      if (error) throw error;

      toast.success('تم إلغاء ربط البائع بالقسم بنجاح');

      // Update the local state by removing the unlinked vendor
      setCategoryVendors(categoryVendors.filter(vendor => vendor.id !== vendorId));
    } catch (error) {
      console.error('Error unlinking vendor from category:', error);
      toast.error('فشل في إلغاء ربط البائع بالقسم');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdvertisement = (category) => {
    setSelectedCategory(category);
    setAdFormData({
      title: '',
      description: '',
      vendor_id: '',
      image_url: '',
      link: '',
      start_date: '',
      end_date: '',
      status: 'draft',
      type: 'banner',
      position: 'vendor_category',
      priority: 1
    });
    setShowAdModal(true);
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
        <h2 className="text-2xl font-bold">أقسام المتاجر</h2>
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({
              name: '',
              description: '',
              image_url: '',
              slug: ''
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          إضافة قسم جديد
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصورة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عدد البائعين</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإعلان</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    لا توجد أقسام بعد. قم بإضافة قسم جديد.
                  </td>
                </tr>
              ) : (
                categories.map(category => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">لا توجد صورة</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{category.name}</div>
                      <div className="text-sm text-gray-500">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{category.description || 'لا يوجد وصف'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewVendors(category)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        عرض البائعين
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAddAdvertisement(category)}
                          className="text-green-600 hover:text-green-800"
                        >
                          إضافة إعلان
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setFormData({
                            name: category.name,
                            description: category.description || '',
                            image_url: category.image_url || '',
                            slug: category.slug || ''
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

      {/* Preview Section */}
      {categories.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">معاينة إعلانات الأقسام</h3>
          <div className="space-y-6">
            {categories.map(category => (
              <div key={category.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                <h4 className="text-md font-semibold mb-2">{category.name}</h4>
                <VendorCategoryAdvertisement categoryId={category.id} className="w-full" />
              </div>
            ))}
          </div>
        </div>
      )}

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
              {editingCategory ? 'تعديل قسم' : 'إضافة قسم جديد'}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم القسم <span className="text-red-600">*</span>
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
                  الرابط المختصر (Slug)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="سيتم إنشاؤه تلقائيًا إذا تُرك فارغًا"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة القسم
                </label>
                <MediaUpload
                  type="image"
                  preview={formData.image_url}
                  onUpload={handleImageUpload}
                  storeInSupabase={true}
                  bucket={BUCKETS.GENERAL}
                  folder="vendor-categories"
                />
              </div>

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
                  {loading ? 'جارٍ الحفظ...' : (editingCategory ? 'تحديث' : 'إضافة')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>

      {/* Vendors Modal */}
      <Dialog
        open={showVendorsModal}
        onClose={() => {
          setShowVendorsModal(false);
          setSelectedCategory(null);
          setCategoryVendors([]);
          setSelectedVendor('');
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              البائعين في قسم: {selectedCategory?.name}
            </Dialog.Title>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                إضافة بائع للقسم
              </label>
              <div className="flex space-x-2">
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="flex-1 border rounded-md px-3 py-2"
                >
                  <option value="">اختر بائع</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.store_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleLinkVendor}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  disabled={!selectedVendor || loading}
                >
                  إضافة
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {categoryVendors.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  لا يوجد بائعين في هذا القسم
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {categoryVendors.map(vendor => (
                    <li key={vendor.id} className="py-3 flex justify-between items-center">
                      <span>{vendor.store_name}</span>
                      <button
                        onClick={() => handleUnlinkVendor(vendor.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        إلغاء الربط
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowVendorsModal(false);
                  setSelectedCategory(null);
                  setCategoryVendors([]);
                  setSelectedVendor('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Advertisement Modal */}
      <Dialog
        open={showAdModal}
        onClose={() => {
          setShowAdModal(false);
          setSelectedCategory(null);
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              إضافة إعلان لقسم: {selectedCategory?.name}
            </Dialog.Title>

            <form onSubmit={handleAdSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الإعلان <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={adFormData.title}
                  onChange={(e) => setAdFormData({ ...adFormData, title: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  value={adFormData.description}
                  onChange={(e) => setAdFormData({ ...adFormData, description: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المتجر
                </label>
                <select
                  value={adFormData.vendor_id}
                  onChange={(e) => setAdFormData({ ...adFormData, vendor_id: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">اختر المتجر</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.store_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة الإعلان <span className="text-red-600">*</span>
                </label>
                <MediaUpload
                  type="image"
                  preview={adFormData.image_url}
                  onUpload={handleAdImageUpload}
                  storeInSupabase={true}
                  bucket={BUCKETS.ADVERTISEMENTS}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط الإعلان
                </label>
                <input
                  type="text"
                  value={adFormData.link}
                  onChange={(e) => setAdFormData({ ...adFormData, link: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ البداية <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={adFormData.start_date}
                    onChange={(e) => setAdFormData({ ...adFormData, start_date: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ النهاية <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={adFormData.end_date}
                    onChange={(e) => setAdFormData({ ...adFormData, end_date: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الإعلان <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={adFormData.type}
                    onChange={(e) => setAdFormData({ ...adFormData, type: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="banner">بانر</option>
                    <option value="popup">نافذة منبثقة</option>
                    <option value="slider">شريحة عرض</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={adFormData.status}
                    onChange={(e) => setAdFormData({ ...adFormData, status: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="draft">مسودة</option>
                    <option value="pending">معلق</option>
                    <option value="active">نشط</option>
                    <option value="expired">منتهي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الأولوية <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={adFormData.priority}
                  onChange={(e) => setAdFormData({ ...adFormData, priority: parseInt(e.target.value) })}
                  className="w-full border rounded-md px-3 py-2"
                  min="1"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">الإعلانات ذات الأرقام الأقل تظهر أولاً</p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdModal(false);
                    setSelectedCategory(null);
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
                  {loading ? 'جارٍ الحفظ...' : 'إضافة الإعلان'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}