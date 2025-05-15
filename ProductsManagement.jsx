import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';
import ProductForm from '../Products/ProductForm';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [editingInline, setEditingInline] = useState(null);
  const [inlineData, setInlineData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products with explicit joins instead of using the foreign key shorthand
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');

      if (productsError) throw productsError;
      
      // Fetch categories separately
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Fetch vendors separately
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('id, store_name');

      if (vendorsError) throw vendorsError;
      setVendors(vendorsData || []);

      // Now join the products with their categories and vendors manually
      const productsWithRelations = await Promise.all(
        (productsData || []).map(async (product) => {
          // Get category data if category_id exists
          let category = null;
          if (product.category_id) {
            const { data: categoryData } = await supabase
              .from('categories')
              .select('name')
              .eq('id', product.category_id)
              .single();
              
            if (categoryData) {
              category = categoryData;
            }
          }
          
          // Get vendor data if vendor_id exists
          let vendor = null;
          if (product.vendor_id) {
            const { data: vendorData } = await supabase
              .from('vendors')
              .select('store_name')
              .eq('id', product.vendor_id)
              .single();
              
            if (vendorData) {
              vendor = vendorData;
            }
          }
          
          return {
            ...product,
            category,
            vendor
          };
        })
      );
      
      setProducts(productsWithRelations);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('فشل في تحميل البيانات. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const initialFilters = {
    name: {
      type: 'text',
      label: 'اسم المنتج',
      placeholder: 'البحث باسم المنتج',
      value: ''
    },
    vendor_id: {
      type: 'select',
      label: 'المتجر',
      placeholder: 'جميع المتاجر',
      options: vendors.map(vendor => ({
        value: vendor.id,
        label: vendor.store_name
      })),
      value: ''
    },
    category_id: {
      type: 'select',
      label: 'التصنيف',
      placeholder: 'جميع التصنيفات',
      options: categories.map(category => ({
        value: category.id,
        label: category.name
      })),
      value: ''
    },
    status: {
      type: 'select',
      label: 'الحالة',
      placeholder: 'جميع الحالات',
      options: [
        { value: 'active', label: 'نشط' },
        { value: 'inactive', label: 'غير نشط' },
        { value: 'draft', label: 'مسودة' }
      ],
      value: ''
    }
  };

  const { filters, filterData, handleFilterChange } = useFilters(initialFilters);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // تحويل البيانات إلى الشكل المناسب لقاعدة البيانات
      const productData = {
        id: editingProduct ? editingProduct.id : uuidv4(), // Generate UUID for new products
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price) : null,
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        vendor_id: formData.vendor_id,
        category_id: formData.category_id,
        status: formData.status,
        stock: parseInt(formData.stock),
        image_url: formData.image
      };

      if (editingProduct) {
        // تحديث منتج موجود
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)
          .select();
        
        if (error) throw error;
        
        // إضافة الإضافات (addons)
        if (formData.addons && formData.addons.length > 0) {
          // حذف الإضافات الحالية
          await supabase
            .from('product_addons')
            .delete()
            .eq('product_id', editingProduct.id);
          
          // إضافة الإضافات الجديدة
          const addonsData = formData.addons.map(addon => ({
            product_id: editingProduct.id,
            name: addon.name,
            price: parseFloat(addon.price),
            is_default: addon.is_default,
            is_required: addon.is_required
          }));
          
          const { error: addonsError } = await supabase
            .from('product_addons')
            .insert(addonsData);
          
          if (addonsError) throw addonsError;
        }
        
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        // إضافة منتج جديد
        const { data, error } = await supabase
          .from('products')
          .insert([productData])
          .select();
        
        if (error) throw error;
        
        // إضافة الإضافات (addons)
        if (formData.addons && formData.addons.length > 0 && data && data.length > 0) {
          const addonsData = formData.addons.map(addon => ({
            product_id: data[0].id,
            name: addon.name,
            price: parseFloat(addon.price),
            is_default: addon.is_default,
            is_required: addon.is_required
          }));
          
          const { error: addonsError } = await supabase
            .from('product_addons')
            .insert(addonsData);
          
          if (addonsError) throw addonsError;
        }
        
        toast.success('تم إضافة المنتج بنجاح');
      }
      
      // إعادة تحميل المنتجات
      fetchData();
      
      // إغلاق النموذج
      setShowModal(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(editingProduct ? 'فشل في تحديث المنتج' : 'فشل في إضافة المنتج');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('تم حذف المنتج بنجاح');
      
      // إعادة تحميل المنتجات
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('فشل في حذف المنتج');
    } finally {
      setLoading(false);
    }
  };

  const startInlineEdit = (product, field) => {
    setEditingInline({ id: product.id, field });
    setInlineData({
      ...inlineData,
      [product.id]: {
        ...(inlineData[product.id] || {}),
        [field]: product[field]
      }
    });
  };

  const handleInlineChange = (productId, field, value) => {
    setInlineData({
      ...inlineData,
      [productId]: {
        ...(inlineData[productId] || {}),
        [field]: value
      }
    });
  };

  const saveInlineEdit = async (productId) => {
    try {
      const updates = inlineData[productId];
      if (!updates) return;

      // Convert numeric fields
      if (updates.price !== undefined) updates.price = parseFloat(updates.price);
      if (updates.wholesale_price !== undefined) updates.wholesale_price = parseFloat(updates.wholesale_price) || null;
      if (updates.discount_price !== undefined) updates.discount_price = parseFloat(updates.discount_price) || null;
      if (updates.stock !== undefined) updates.stock = parseInt(updates.stock);

      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;

      toast.success('تم تحديث المنتج بنجاح');
      fetchData();
      setEditingInline(null);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('فشل في تحديث المنتج');
    }
  };

  const cancelInlineEdit = () => {
    setEditingInline(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'draft': return 'مسودة';
      default: return status;
    }
  };

  const filteredProducts = filterData(products);

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredProducts.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500">لا توجد منتجات متطابقة مع معايير البحث</p>
        </div>
      ) : (
        filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {product.image_url && (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                }}
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(product.status)}`}>
                  {getStatusText(product.status)}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{product.description}</p>
              <div className="space-y-2">
                <p className="text-xl font-bold text-green-600">₪{product.price}</p>
                {product.wholesale_price && (
                  <p className="text-sm text-gray-500">
                    سعر الجملة: ₪{product.wholesale_price}
                  </p>
                )}
                {product.discount_price && (
                  <p className="text-sm text-red-500">
                    سعر التخفيض: ₪{product.discount_price}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  المخزون: {product.stock} قطعة
                </p>
                <p className="text-sm text-gray-500">
                  المتجر: {product.vendor?.store_name}
                </p>
                <p className="text-sm text-gray-500">
                  التصنيف: {product.category?.name}
                </p>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 ml-2"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">السعر</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">سعر الجملة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">سعر التخفيض</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المخزون</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المتجر</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التصنيف</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-4 text-center text-gray-500">
                  لا توجد منتجات متطابقة مع معايير البحث
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name}
                          className="w-10 h-10 rounded-full object-cover ml-3"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                          }}
                        />
                      )}
                      <div>
                        {editingInline?.id === product.id && editingInline?.field === 'name' ? (
                          <input
                            type="text"
                            value={inlineData[product.id]?.name || product.name}
                            onChange={(e) => handleInlineChange(product.id, 'name', e.target.value)}
                            className="w-full border rounded-md px-2 py-1 text-sm"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                            onClick={() => startInlineEdit(product, 'name')}
                          >
                            {product.name}
                          </div>
                        )}
                        {editingInline?.id === product.id && editingInline?.field === 'description' ? (
                          <textarea
                            value={inlineData[product.id]?.description || product.description || ''}
                            onChange={(e) => handleInlineChange(product.id, 'description', e.target.value)}
                            className="w-full border rounded-md px-2 py-1 text-sm mt-1"
                            rows="2"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="text-gray-500 cursor-pointer hover:text-blue-600"
                            onClick={() => startInlineEdit(product, 'description')}
                          >
                            {product.description || 'إضافة وصف'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingInline?.id === product.id && editingInline?.field === 'price' ? (
                      <input
                        type="number"
                        value={inlineData[product.id]?.price || product.price}
                        onChange={(e) => handleInlineChange(product.id, 'price', e.target.value)}
                        className="w-24 border rounded-md px-2 py-1 text-sm"
                        min="0"
                        step="0.01"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="text-lg font-semibold text-green-600 cursor-pointer hover:text-blue-600"
                        onClick={() => startInlineEdit(product, 'price')}
                      >
                        ₪{product.price}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingInline?.id === product.id && editingInline?.field === 'wholesale_price' ? (
                      <input
                        type="number"
                        value={inlineData[product.id]?.wholesale_price || product.wholesale_price || ''}
                        onChange={(e) => handleInlineChange(product.id, 'wholesale_price', e.target.value)}
                        className="w-24 border rounded-md px-2 py-1 text-sm"
                        min="0"
                        step="0.01"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="text-gray-500 cursor-pointer hover:text-blue-600"
                        onClick={() => startInlineEdit(product, 'wholesale_price')}
                      >
                        {product.wholesale_price ? `₪${product.wholesale_price}` : '-'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingInline?.id === product.id && editingInline?.field === 'discount_price' ? (
                      <input
                        type="number"
                        value={inlineData[product.id]?.discount_price || product.discount_price || ''}
                        onChange={(e) => handleInlineChange(product.id, 'discount_price', e.target.value)}
                        className="w-24 border rounded-md px-2 py-1 text-sm"
                        min="0"
                        step="0.01"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="text-red-500 cursor-pointer hover:text-blue-600"
                        onClick={() => startInlineEdit(product, 'discount_price')}
                      >
                        {product.discount_price ? `₪${product.discount_price}` : '-'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingInline?.id === product.id && editingInline?.field === 'stock' ? (
                      <input
                        type="number"
                        value={inlineData[product.id]?.stock || product.stock}
                        onChange={(e) => handleInlineChange(product.id, 'stock', e.target.value)}
                        className="w-24 border rounded-md px-2 py-1 text-sm"
                        min="0"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="text-gray-500 cursor-pointer hover:text-blue-600"
                        onClick={() => startInlineEdit(product, 'stock')}
                      >
                        {product.stock} قطعة
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {product.vendor?.store_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {product.category?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingInline?.id === product.id && editingInline?.field === 'status' ? (
                      <select
                        value={inlineData[product.id]?.status || product.status}
                        onChange={(e) => handleInlineChange(product.id, 'status', e.target.value)}
                        className="border rounded-md px-2 py-1 text-sm"
                        autoFocus
                      >
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                        <option value="draft">مسودة</option>
                      </select>
                    ) : (
                      <span 
                        className={`px-2 py-1 text-xs rounded-full cursor-pointer ${getStatusColor(product.status)}`}
                        onClick={() => startInlineEdit(product, 'status')}
                      >
                        {getStatusText(product.status)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingInline?.id === product.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => saveInlineEdit(product.id)}
                          className="text-green-600 hover:text-green-800 ml-2"
                        >
                          حفظ
                        </button>
                        <button
                          onClick={cancelInlineEdit}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product);
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 ml-2"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          حذف
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading && products.length === 0) {
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
        <h2 className="text-2xl font-bold">إدارة المنتجات</h2>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded ${
                viewMode === 'grid' 
                  ? 'bg-white shadow' 
                  : 'hover:bg-gray-200'
              }`}
            >
              عرض شبكي
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded ${
                viewMode === 'table' 
                  ? 'bg-white shadow' 
                  : 'hover:bg-gray-200'
              }`}
            >
              عرض جدول
            </button>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            إضافة منتج جديد
          </button>
        </div>
      </div>

      <SearchFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {viewMode === 'grid' ? renderGridView() : renderTableView()}

      <Dialog
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-start justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white w-full min-h-screen">
            <div className="sticky top-0 bg-white border-b z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <Dialog.Title className="text-2xl font-bold">
                  {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
                </Dialog.Title>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <ProductForm 
                onSubmit={handleSubmit}
                initialData={editingProduct}
              />
            </div>
          </div>
        </div>
      </Dialog>

      {/* Help tooltip for inline editing */}
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-xs">
        <h4 className="font-bold mb-2">تلميح: التعديل السريع</h4>
        <p className="text-sm">
          يمكنك النقر مباشرة على أي حقل في العرض الجدولي للتعديل السريع، ثم الضغط على زر "حفظ" لتأكيد التغييرات.
        </p>
      </div>
    </div>
  );
}