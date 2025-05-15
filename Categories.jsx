import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';
import MediaUpload from '../Products/MediaUpload';
import { BUCKETS } from '../../lib/supabaseStorage';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: '',
    image_url: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const initialFilters = {
    name: {
      type: 'text',
      label: 'اسم التصنيف',
      placeholder: 'البحث باسم التصنيف',
      value: ''
    },
    parent_id: {
      type: 'select',
      label: 'التصنيف الأب',
      placeholder: 'جميع التصنيفات',
      options: categories.map(cat => ({
        value: cat.id,
        label: cat.name
      })),
      value: ''
    }
  };

  const { filters, filterData, handleFilterChange } = useFilters(initialFilters);
  
  const filteredCategories = filterData(categories);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('فشل في تحميل التصنيفات. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل التصنيفات');
    } finally {
      setLoading(false);
    }
  };

  const generateUniqueSlug = async (baseSlug) => {
    let slug = baseSlug;
    let counter = 1;
    let isUnique = false;

    while (!isUnique) {
      const { data, error } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        throw error;
      }

      // If no category found with this slug, or the found category is the one being edited
      if (!data || (formData.id && data.id === formData.id)) {
        isUnique = true;
      } else {
        // Append counter to the slug and increment
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    return slug;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Generate base slug from name
      const baseSlug = formData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');

      // Get unique slug
      const uniqueSlug = await generateUniqueSlug(baseSlug);

      // Create a new data object with cleaned up values
      const cleanedData = {
        ...formData,
        slug: uniqueSlug,
        // Convert empty parent_id to null
        parent_id: formData.parent_id || null
      };

      // If this is a new category (no id), generate a UUID
      if (!formData.id) {
        cleanedData.id = uuidv4();
      }

      if (formData.id) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update(cleanedData)
          .eq('id', formData.id);

        if (error) throw error;
        toast.success('تم تحديث التصنيف بنجاح');
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([cleanedData]);

        if (error) throw error;
        toast.success('تم إضافة التصنيف بنجاح');
      }

      setIsModalOpen(false);
      setFormData({ name: '', slug: '', description: '', parent_id: '', image_url: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(formData.id ? 'فشل في تحديث التصنيف' : 'فشل في إضافة التصنيف');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('تم حذف التصنيف بنجاح');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('فشل في حذف التصنيف');
    }
  };

  const handleImageUpload = ({ preview }) => {
    if (preview) {
      setFormData({ ...formData, image_url: preview });
    }
  };

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
          onClick={fetchCategories}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const renderCategoryRow = (category, level = 0) => {
    return (
      <React.Fragment key={category.id}>
        <tr>
          <td className="px-6 py-4 whitespace-nowrap">
            <div style={{ marginRight: `${level * 20}px` }}>
              {level > 0 && '↳ '}
              {category.name}
            </div>
          </td>
          <td className="px-6 py-4">{category.description}</td>
          <td className="px-6 py-4 whitespace-nowrap">
            {categories.find(c => c.id === category.parent_id)?.name || '-'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {category.image_url ? (
              <img 
                src={category.image_url} 
                alt={category.name} 
                className="w-10 h-10 object-cover rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                }}
              />
            ) : (
              '-'
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <button
              onClick={() => {
                setFormData(category);
                setIsModalOpen(true);
              }}
              className="text-blue-600 hover:text-blue-900 ml-4"
            >
              تعديل
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="text-red-600 hover:text-red-900"
            >
              حذف
            </button>
          </td>
        </tr>
        {category.children?.map(child => renderCategoryRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">التصنيفات</h2>
        <button
          onClick={() => {
            setFormData({ name: '', slug: '', description: '', parent_id: '', image_url: '' });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          إضافة تصنيف جديد
        </button>
      </div>

      <SearchFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">لا توجد تصنيفات. قم بإضافة تصنيف جديد.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التصنيف الأب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصورة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.map(category => renderCategoryRow(category))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <Dialog.Title className="text-2xl font-bold mb-6">
              {formData.id ? 'تعديل تصنيف' : 'إضافة تصنيف جديد'}
            </Dialog.Title>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم التصنيف <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value
                    });
                  }}
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
                  التصنيف الأب
                </label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value || null })}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="">بدون تصنيف أب</option>
                  {categories
                    .filter(c => c.id !== formData.id)
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة التصنيف
                </label>
                <MediaUpload
                  type="image"
                  preview={formData.image_url}
                  onUpload={handleImageUpload}
                  storeInSupabase={true}
                  bucket={BUCKETS.GENERAL}
                  folder="categories"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({ name: '', slug: '', description: '', parent_id: '', image_url: '' });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {formData.id ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}