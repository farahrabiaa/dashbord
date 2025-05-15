import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import SearchFilter from '../SearchFilter';
import useFilters from '../../hooks/useFilters';
import MediaUpload from '../Products/MediaUpload';
import { BUCKETS } from '../../lib/supabaseStorage';

export default function Advertisements() {
  const [advertisements, setAdvertisements] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorCategories, setVendorCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vendor_id: '',
    vendor_category_id: '',
    image_url: '',
    link: '',
    start_date: '',
    end_date: '',
    status: 'draft',
    type: 'banner',
    position: 'home',
    priority: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch vendors
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('id, store_name')
        .order('store_name');
      
      if (vendorsError) throw vendorsError;
      setVendors(vendorsData || []);
      
      // Fetch vendor categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('vendor_categories_table')
        .select('id, name')
        .order('name');
      
      if (categoriesError) throw categoriesError;
      setVendorCategories(categoriesData || []);
      
      // Fetch advertisements
      const { data, error: adsError } = await supabase
        .from('advertisements')
        .select(`
          *,
          vendor:vendor_id(store_name),
          vendor_category:vendor_category_id(name)
        `)
        .order('created_at', { ascending: false });
      
      if (adsError) throw adsError;
      setAdvertisements(data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('فشل في تحميل البيانات. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const initialFilters = {
    title: {
      type: 'text',
      label: 'العنوان',
      placeholder: 'البحث بالعنوان',
      value: ''
    },
    type: {
      type: 'select',
      label: 'النوع',
      placeholder: 'جميع الأنواع',
      options: [
        { value: 'banner', label: 'بانر' },
        { value: 'popup', label: 'نافذة منبثقة' },
        { value: 'slider', label: 'شريحة عرض' }
      ],
      value: ''
    },
    position: {
      type: 'select',
      label: 'الموقع',
      placeholder: 'جميع المواقع',
      options: [
        { value: 'home', label: 'الرئيسية' },
        { value: 'category', label: 'التصنيفات' },
        { value: 'product', label: 'المنتجات' },
        { value: 'checkout', label: 'الدفع' },
        { value: 'vendor_category', label: 'قسم البائعين' }
      ],
      value: ''
    },
    status: {
      type: 'select',
      label: 'الحالة',
      placeholder: 'جميع الحالات',
      options: [
        { value: 'draft', label: 'مسودة' },
        { value: 'pending', label: 'معلق' },
        { value: 'active', label: 'نشط' },
        { value: 'expired', label: 'منتهي' }
      ],
      value: ''
    }
  };

  const { filters, filterData, handleFilterChange } = useFilters(initialFilters);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.image_url) {
      toast.error('الرجاء تعبئة جميع الحقول المطلوبة');
      return;
    }

    try {
      // Check if position is vendor_category and vendor_category_id is required
      if (formData.position === 'vendor_category' && !formData.vendor_category_id) {
        toast.error('الرجاء اختيار قسم البائعين');
        return;
      }

      if (editingAd) {
        // Update existing ad
        const { data, error } = await supabase
          .from('advertisements')
          .update({
            title: formData.title,
            description: formData.description,
            vendor_id: formData.vendor_id || null,
            vendor_category_id: formData.position === 'vendor_category' ? formData.vendor_category_id : null,
            image_url: formData.image_url,
            link: formData.link,
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: formData.status,
            type: formData.type,
            position: formData.position,
            priority: parseInt(formData.priority)
          })
          .eq('id', editingAd.id)
          .select();
        
        if (error) throw error;
        
        // Update local state
        setAdvertisements(ads => ads.map(ad => 
          ad.id === editingAd.id 
            ? { 
                ...data[0], 
                vendor: vendors.find(v => v.id === data[0].vendor_id) || null,
                vendor_category: vendorCategories.find(c => c.id === data[0].vendor_category_id) || null
              } 
            : ad
        ));
        
        toast.success('تم تحديث الإعلان بنجاح');
        setShowModal(false);
        setEditingAd(null);
      } else {
        // Create new ad
        const { data, error } = await supabase
          .from('advertisements')
          .insert([{
            title: formData.title,
            description: formData.description,
            vendor_id: formData.vendor_id || null,
            vendor_category_id: formData.position === 'vendor_category' ? formData.vendor_category_id : null,
            image_url: formData.image_url,
            link: formData.link,
            start_date: formData.start_date,
            end_date: formData.end_date,
            status: formData.status,
            type: formData.type,
            position: formData.position,
            priority: parseInt(formData.priority)
          }])
          .select();
        
        if (error) throw error;
        
        // Add new ad to local state
        setAdvertisements(ads => [{
          ...data[0],
          vendor: vendors.find(v => v.id === data[0].vendor_id) || null,
          vendor_category: vendorCategories.find(c => c.id === data[0].vendor_category_id) || null
        }, ...ads]);
        
        toast.success('تم إضافة الإعلان بنجاح');
        setShowModal(false);
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        vendor_id: '',
        vendor_category_id: '',
        image_url: '',
        link: '',
        start_date: '',
        end_date: '',
        status: 'draft',
        type: 'banner',
        position: 'home',
        priority: 1
      });
      
    } catch (error) {
      console.error('Error saving advertisement:', error);
      toast.error('فشل في حفظ الإعلان');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;

    try {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove from local state
      setAdvertisements(advertisements.filter(ad => ad.id !== id));
      toast.success('تم حذف الإعلان بنجاح');
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast.error('فشل في حذف الإعلان');
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'banner': return 'بانر';
      case 'popup': return 'نافذة منبثقة';
      case 'slider': return 'شريحة عرض';
      default: return type;
    }
  };

  const getPositionText = (position) => {
    switch (position) {
      case 'home': return 'الرئيسية';
      case 'category': return 'التصنيفات';
      case 'product': return 'المنتجات';
      case 'checkout': return 'الدفع';
      case 'vendor_category': return 'قسم البائعين';
      default: return position;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'مسودة';
      case 'pending': return 'معلق';
      case 'active': return 'نشط';
      case 'expired': return 'منتهي';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleImageUpload = ({ preview }) => {
    if (preview) {
      setFormData({ ...formData, image_url: preview });
    }
  };

  const filteredAds = filterData(advertisements);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الإعلانات</h2>
        <button
          onClick={() => {
            setEditingAd(null);
            setFormData({
              title: '',
              description: '',
              vendor_id: '',
              vendor_category_id: '',
              image_url: '',
              link: '',
              start_date: '',
              end_date: '',
              status: 'draft',
              type: 'banner',
              position: 'home',
              priority: 1
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          إضافة إعلان جديد
        </button>
      </div>

      <SearchFilter 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-800">
          <h3 className="font-semibold mb-2">خطأ</h3>
          <p>{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">لا توجد إعلانات</h3>
          <p className="text-gray-500 mb-6">لم يتم العثور على أي إعلانات متطابقة مع معايير البحث المحددة.</p>
          <button
            onClick={() => {
              setEditingAd(null);
              setFormData({
                title: '',
                description: '',
                vendor_id: '',
                vendor_category_id: '',
                image_url: '',
                link: '',
                start_date: '',
                end_date: '',
                status: 'draft',
                type: 'banner',
                position: 'home',
                priority: 1
              });
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            إضافة أول إعلان
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الصورة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العنوان</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المتجر</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">قسم البائعين</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموقع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفترة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإحصائيات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAds.map((ad) => (
                  <tr key={ad.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-16 w-24 bg-gray-200 rounded overflow-hidden">
                        {ad.image_url ? (
                          <img
                            src={ad.image_url}
                            alt={ad.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22100%22%20height%3D%2280%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%22%20height%3D%2280%22%20fill%3D%22%23e2e8f0%22%3E%3C%2Frect%3E%3Ctext%20x%3D%2250%22%20y%3D%2240%22%20font-size%3D%2210%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20font-family%3D%22Arial%2C%20sans-serif%22%20fill%3D%22%2364748b%22%3E%D8%A5%D8%B9%D9%84%D8%A7%D9%86%3C%2Ftext%3E%3C%2Fsvg%3E';
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            لا توجد صورة
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                      {ad.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{ad.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ad.vendor?.store_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ad.vendor_category?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getTypeText(ad.type)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getPositionText(ad.position)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(ad.start_date).toLocaleDateString('ar-SA')}
                        <br />
                        {new Date(ad.end_date).toLocaleDateString('ar-SA')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ad.status)}`}>
                        {getStatusText(ad.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span>المشاهدات: {ad.views || 0}</span>
                        <span>النقرات: {ad.clicks || 0}</span>
                        <span className="text-xs">
                          {ad.views > 0 ? 
                            `${((ad.clicks / ad.views) * 100).toFixed(1)}% معدل النقر` : 
                            '0% معدل النقر'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingAd(ad);
                          setFormData({
                            title: ad.title,
                            description: ad.description || '',
                            vendor_id: ad.vendor_id || '',
                            vendor_category_id: ad.vendor_category_id || '',
                            image_url: ad.image_url,
                            link: ad.link || '',
                            start_date: ad.start_date || '',
                            end_date: ad.end_date || '',
                            status: ad.status,
                            type: ad.type,
                            position: ad.position,
                            priority: ad.priority
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 ml-4"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id)}
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
      )}

      {/* Modal form */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          
          <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <Dialog.Title className="text-2xl font-bold mb-4">
              {editingAd ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
            </Dialog.Title>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    rows="3"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المتجر
                  </label>
                  <select
                    value={formData.vendor_id}
                    onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الموقع <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="home">الرئيسية</option>
                    <option value="category">التصنيفات</option>
                    <option value="product">المنتجات</option>
                    <option value="checkout">الدفع</option>
                    <option value="vendor_category">قسم البائعين</option>
                  </select>
                </div>

                {formData.position === 'vendor_category' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      قسم البائعين <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.vendor_category_id}
                      onChange={(e) => setFormData({ ...formData, vendor_category_id: e.target.value })}
                      className="w-full border rounded-md px-3 py-2"
                      required={formData.position === 'vendor_category'}
                    >
                      <option value="">اختر قسم البائعين</option>
                      {vendorCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    صورة الإعلان <span className="text-red-600">*</span>
                  </label>
                  <MediaUpload
                    type="image"
                    preview={formData.image_url}
                    onUpload={handleImageUpload}
                    storeInSupabase={true}
                    bucket={BUCKETS.ADVERTISEMENTS}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رابط الإعلان
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ البداية <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ النهاية <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع الإعلان <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="banner">بانر</option>
                    <option value="popup">نافذة منبثقة</option>
                    <option value="slider">شريحة عرض</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الأولوية <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full border rounded-md px-3 py-2"
                    min="1"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">الإعلانات ذات الأرقام الأقل تظهر أولاً</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الحالة <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingAd ? 'تحديث الإعلان' : 'إضافة الإعلان'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}