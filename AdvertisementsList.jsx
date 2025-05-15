import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import { AdvertisementBanner, AdvertisementPopup, AdvertisementSlider, VendorCategoryAdvertisement } from '../Advertisements';

export default function AdvertisementsList() {
  const [bannerAds, setBannerAds] = useState([]);
  const [popupAds, setPopupAds] = useState([]);
  const [sliderAds, setSliderAds] = useState([]);
  const [vendorCategoryAds, setVendorCategoryAds] = useState([]);
  const [vendorCategories, setVendorCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPopupAd, setSelectedPopupAd] = useState(null);

  useEffect(() => {
    fetchAdvertisements();
    fetchVendorCategories();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current date in ISO format
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch banner ads
      const { data: bannerData, error: bannerError } = await supabase
        .from('advertisements')
        .select(`
          *,
          vendor:vendor_id(store_name)
        `)
        .eq('type', 'banner')
        .eq('status', 'active')
        .lte('start_date', today)
        .gte('end_date', today)
        .order('priority', { ascending: true });
      
      if (bannerError) throw bannerError;
      setBannerAds(bannerData || []);
      
      // Fetch popup ads
      const { data: popupData, error: popupError } = await supabase
        .from('advertisements')
        .select(`
          *,
          vendor:vendor_id(store_name)
        `)
        .eq('type', 'popup')
        .eq('status', 'active')
        .lte('start_date', today)
        .gte('end_date', today)
        .order('priority', { ascending: true });
      
      if (popupError) throw popupError;
      setPopupAds(popupData || []);
      
      // Fetch slider ads
      const { data: sliderData, error: sliderError } = await supabase
        .from('advertisements')
        .select(`
          *,
          vendor:vendor_id(store_name)
        `)
        .eq('type', 'slider')
        .eq('status', 'active')
        .lte('start_date', today)
        .gte('end_date', today)
        .order('priority', { ascending: true });
      
      if (sliderError) throw sliderError;
      setSliderAds(sliderData || []);
      
      // Fetch vendor category ads
      const { data: vendorCategoryData, error: vendorCategoryError } = await supabase
        .from('advertisements')
        .select(`
          *,
          vendor:vendor_id(store_name),
          vendor_category:vendor_category_id(name)
        `)
        .eq('position', 'vendor_category')
        .eq('status', 'active')
        .lte('start_date', today)
        .gte('end_date', today)
        .order('priority', { ascending: true });
      
      if (vendorCategoryError) throw vendorCategoryError;
      setVendorCategoryAds(vendorCategoryData || []);
      
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      setError('فشل في تحميل الإعلانات. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل الإعلانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_categories_table')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setVendorCategories(data || []);
    } catch (error) {
      console.error('Error fetching vendor categories:', error);
    }
  };

  const handleShowPopup = (ad) => {
    setSelectedPopupAd(ad);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedPopupAd(null);
  };

  const incrementAdView = async (adId) => {
    try {
      await supabase.rpc('increment_advertisement_views', { p_ad_id: adId });
    } catch (error) {
      console.error('Error recording view:', error);
    }
  };

  const incrementAdClick = async (adId) => {
    try {
      await supabase.rpc('increment_advertisement_clicks', { p_ad_id: adId });
    } catch (error) {
      console.error('Error recording click:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <h3 className="font-semibold mb-2">خطأ</h3>
        <p>{error}</p>
        <button 
          onClick={fetchAdvertisements}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">قائمة الإعلانات النشطة</h2>
        
        {/* إعلانات البانر */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">إعلانات البانر</h3>
          {bannerAds.length === 0 ? (
            <p className="text-gray-500 text-center py-4">لا توجد إعلانات بانر نشطة</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {bannerAds.map(ad => (
                <div key={ad.id} className="relative group">
                  <AdvertisementBanner ad={ad} className="w-full" />
                  <div className="absolute top-2 right-2 bg-white/80 px-2 py-1 rounded text-xs">
                    المشاهدات: {ad.views} | النقرات: {ad.clicks}
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => incrementAdView(ad.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      تسجيل مشاهدة
                    </button>
                    <button
                      onClick={() => incrementAdClick(ad.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      تسجيل نقرة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* إعلانات البوب أب */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">إعلانات البوب أب</h3>
          {popupAds.length === 0 ? (
            <p className="text-gray-500 text-center py-4">لا توجد إعلانات بوب أب نشطة</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popupAds.map(ad => (
                <div key={ad.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative aspect-video">
                    <img 
                      src={ad.image_url} 
                      alt={ad.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23e2e8f0%22%3E%3C%2Frect%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20font-family%3D%22Arial%2C%20sans-serif%22%20fill%3D%22%2364748b%22%3E%D8%A5%D8%B9%D9%84%D8%A7%D9%86%3C%2Ftext%3E%3C%2Fsvg%3E';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-white/80 px-2 py-1 rounded text-xs">
                      المشاهدات: {ad.views} | النقرات: {ad.clicks}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold">{ad.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{ad.description}</p>
                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={() => handleShowPopup(ad)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        معاينة كنافذة منبثقة
                      </button>
                      <div className="text-xs text-gray-500">
                        {ad.vendor?.store_name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* إعلانات الشرائح */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">إعلانات الشرائح</h3>
          {sliderAds.length === 0 ? (
            <p className="text-gray-500 text-center py-4">لا توجد إعلانات شرائح نشطة</p>
          ) : (
            <div className="mb-4">
              <AdvertisementSlider ads={sliderAds} />
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {sliderAds.map(ad => (
                  <div key={ad.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{ad.title}</h4>
                      <div className="text-xs text-gray-500">
                        المشاهدات: {ad.views} | النقرات: {ad.clicks}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{ad.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {ad.vendor?.store_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* إعلانات أقسام البائعين */}
        <div>
          <h3 className="text-xl font-semibold mb-4">إعلانات أقسام البائعين</h3>
          {vendorCategoryAds.length === 0 ? (
            <p className="text-gray-500 text-center py-4">لا توجد إعلانات أقسام بائعين نشطة</p>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {vendorCategoryAds.map(ad => (
                <div key={ad.id} className="bg-white border rounded-lg overflow-hidden shadow-sm">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{ad.title}</h4>
                        <p className="text-sm text-gray-600">{ad.description}</p>
                        <div className="mt-1 text-xs text-gray-500">
                          قسم: {ad.vendor_category?.name || 'غير محدد'}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        المشاهدات: {ad.views} | النقرات: {ad.clicks}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <img 
                      src={ad.image_url} 
                      alt={ad.title}
                      className="w-full h-48 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22250%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22800%22%20height%3D%22250%22%20fill%3D%22%23e2e8f0%22%3E%3C%2Frect%3E%3Ctext%20x%3D%22400%22%20y%3D%22125%22%20font-size%3D%2230%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20font-family%3D%22Arial%2C%20sans-serif%22%20fill%3D%22%2364748b%22%3E%D8%A5%D8%B9%D9%84%D8%A7%D9%86%3C%2Ftext%3E%3C%2Fsvg%3E';
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* عرض البوب أب المحدد */}
      {showPopup && selectedPopupAd && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-black opacity-50" onClick={handleClosePopup}></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <button
                onClick={handleClosePopup}
                className="absolute top-2 right-2 bg-white/80 p-1 rounded-full z-10"
                aria-label="Close"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="relative">
                <img 
                  src={selectedPopupAd.image_url} 
                  alt={selectedPopupAd.title}
                  className="w-full object-cover"
                  style={{ maxHeight: '300px' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22400%22%20height%3D%22300%22%20fill%3D%22%23e2e8f0%22%3E%3C%2Frect%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20font-family%3D%22Arial%2C%20sans-serif%22%20fill%3D%22%2364748b%22%3E%D8%A5%D8%B9%D9%84%D8%A7%D9%86%3C%2Ftext%3E%3C%2Fsvg%3E';
                  }}
                />
              </div>

              <div className="p-4">
                <h3 className="text-xl font-bold">{selectedPopupAd.title}</h3>
                {selectedPopupAd.description && (
                  <p className="mt-2 text-gray-600">{selectedPopupAd.description}</p>
                )}
                
                {selectedPopupAd.link && (
                  <div className="mt-4 flex justify-center">
                    <a
                      href={selectedPopupAd.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => incrementAdClick(selectedPopupAd.id)}
                    >
                      عرض التفاصيل
                    </a>
                  </div>
                )}
                
                {selectedPopupAd.vendor?.store_name && (
                  <div className="mt-4 text-sm text-gray-500 text-center">
                    {selectedPopupAd.vendor.store_name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}