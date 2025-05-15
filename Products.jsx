import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getProducts } from '../../lib/productsApi';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch real data from Supabase
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('فشل في تحميل المنتجات');
      
      // Fallback to mock data if API fails
      setProducts([
        {
          id: 1,
          name: 'قهوة تركية',
          description: 'قهوة تركية أصلية مطحونة ناعمة',
          price: 15.00,
          image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=200&auto=format&fit=crop',
          category: { name: 'مشروبات ساخنة' },
          vendor: { store_name: 'متجر كوفي' },
          status: 'active',
          stock: 100
        },
        {
          id: 2,
          name: 'شاي أخضر',
          description: 'شاي أخضر صيني عالي الجودة',
          price: 12.00,
          image_url: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=200&auto=format&fit=crop',
          category: { name: 'مشروبات ساخنة' },
          vendor: { store_name: 'متجر الشاي' },
          status: 'active',
          stock: 75
        },
        {
          id: 3,
          name: 'عصير برتقال',
          description: 'عصير برتقال طازج 100%',
          price: 10.00,
          image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=200&auto=format&fit=crop',
          category: { name: 'عصائر' },
          vendor: { store_name: 'متجر العصائر' },
          status: 'active',
          stock: 50
        },
        {
          id: 4,
          name: 'كيك شوكولاتة',
          description: 'كيك شوكولاتة بلجيكية فاخرة',
          price: 25.00,
          image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=200&auto=format&fit=crop',
          category: { name: 'حلويات' },
          vendor: { store_name: 'متجر الحلويات' },
          status: 'active',
          stock: 30
        }
      ]);
    } finally {
      setLoading(false);
    }
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

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
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
              <p className="text-xl font-bold text-green-600">₪{product.price.toFixed(2)}</p>
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
          </div>
        </div>
      ))}
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المخزون</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المتجر</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التصنيف</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product.id}>
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
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-gray-500">{product.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-lg font-semibold text-green-600">
                  ₪{product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {product.stock} قطعة
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {product.vendor?.store_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {product.category?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(product.status)}`}>
                    {getStatusText(product.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">المنتجات</h2>
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
        </div>
      </div>

      {viewMode === 'grid' ? renderGridView() : renderTableView()}
    </div>
  );
}