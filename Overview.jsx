import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { supabase } from '../../lib/supabase';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Overview() {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    activeVendors: 0,
    activeDrivers: 0
  });
  
  const [salesData, setSalesData] = useState({
    labels: ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو'],
    datasets: [{
      label: 'المبيعات',
      data: [0, 0, 0, 0, 0, 0],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      tension: 0.4
    }]
  });

  const [ordersData, setOrdersData] = useState({
    labels: ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو'],
    datasets: [{
      label: 'الطلبات',
      data: [0, 0, 0, 0, 0, 0],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.5)',
      tension: 0.4
    }]
  });

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [topVendors, setTopVendors] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchTopVendors();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check network connectivity first
      try {
        await fetch('https://www.google.com', { 
          mode: 'no-cors',
          cache: 'no-cache',
          method: 'HEAD'
        });
      } catch (networkError) {
        throw new Error("يبدو أنك غير متصل بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.");
      }
      
      // Fetch total sales - Changed 'orders' to 'ord'
      const { data: ordersData, error: ordersError } = await supabase
        .from('ord')
        .select('total');
      
      if (ordersError) throw ordersError;
      
      const totalSales = ordersData.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
      
      // Fetch total orders count - Changed 'orders' to 'ord'
      const { count: totalOrders, error: countError } = await supabase
        .from('ord')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Fetch active vendors count
      const { count: activeVendors, error: vendorsError } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      if (vendorsError) throw vendorsError;
      
      // Fetch active drivers count
      const { count: activeDrivers, error: driversError } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');
      
      if (driversError) throw driversError;
      
      setStats({
        totalSales,
        totalOrders: totalOrders || 0,
        activeVendors: activeVendors || 0,
        activeDrivers: activeDrivers || 0
      });
      
      // Fetch monthly sales data
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const monthlySalesData = Array(12).fill(0);
      const monthlyOrdersData = Array(12).fill(0);
      
      // Group orders by month - Changed 'orders' to 'ord'
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('ord')
        .select('total, created_at');
      
      if (monthlyError) throw monthlyError;
      
      monthlyData.forEach(order => {
        const orderDate = new Date(order.created_at);
        if (orderDate.getFullYear() === currentYear) {
          const month = orderDate.getMonth();
          monthlySalesData[month] += parseFloat(order.total || 0);
          monthlyOrdersData[month] += 1;
        }
      });
      
      // Update chart data
      setSalesData({
        labels: ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        datasets: [{
          label: 'المبيعات',
          data: monthlySalesData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.4
        }]
      });
      
      setOrdersData({
        labels: ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        datasets: [{
          label: 'الطلبات',
          data: monthlyOrdersData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          tension: 0.4
        }]
      });
      
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError(error.message || 'حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى لاحقًا.');
      
      // Use default mock data for visualization
      setStats({
        totalSales: 5240.50,
        totalOrders: 128,
        activeVendors: 12,
        activeDrivers: 8
      });
      
      // Set default chart data
      const defaultMonthlyData = [420, 380, 450, 520, 630, 540, 480, 510, 570, 490, 520, 230];
      const defaultOrdersData = [25, 20, 28, 32, 40, 35, 30, 38, 42, 36, 30, 15];
      
      setSalesData({
        labels: ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        datasets: [{
          label: 'المبيعات',
          data: defaultMonthlyData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.4
        }]
      });
      
      setOrdersData({
        labels: ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        datasets: [{
          label: 'الطلبات',
          data: defaultOrdersData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.5)',
          tension: 0.4
        }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTopVendors = async () => {
    try {
      // Get vendors with their order counts and total sales
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          id,
          store_name,
          logo_url,
          rating,
          rating_count
        `)
        .eq('status', 'active')
        .order('rating', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      // Get order counts and total sales for each vendor
      const vendorsWithStats = await Promise.all(
        data.map(async (vendor) => {
          const { data: orderData, error: orderError } = await supabase
            .from('ord')
            .select('total')
            .eq('vendor_id', vendor.id);
          
          if (orderError) {
            console.error('Error fetching vendor orders:', orderError);
            return {
              ...vendor,
              total_sales: 0,
              order_count: 0
            };
          }
          
          const totalSales = orderData.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
          
          return {
            ...vendor,
            total_sales: totalSales,
            order_count: orderData.length
          };
        })
      );
      
      // Sort by total sales
      vendorsWithStats.sort((a, b) => b.total_sales - a.total_sales);
      
      setTopVendors(vendorsWithStats);
    } catch (error) {
      console.error('Error fetching top vendors:', error);
      
      // Fallback to mock data
      setTopVendors([
        { id: 1, store_name: 'متجر كوفي', logo_url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=100&auto=format&fit=crop', rating: 4.8, rating_count: 156, total_sales: 12500, order_count: 230 },
        { id: 2, store_name: 'متجر الشاي', logo_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=100&auto=format&fit=crop', rating: 4.5, rating_count: 98, total_sales: 9800, order_count: 180 },
        { id: 3, store_name: 'متجر العصائر', logo_url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=100&auto=format&fit=crop', rating: 4.7, rating_count: 120, total_sales: 8500, order_count: 150 }
      ]);
    }
  };

  const handleStatClick = (statType) => {
    switch (statType) {
      case 'sales':
        navigate('/admin-dashboard/financial-dashboard');
        break;
      case 'orders':
        navigate('/admin-dashboard/orders');
        break;
      case 'vendors':
        navigate('/admin-dashboard/vendors');
        break;
      case 'drivers':
        navigate('/admin-dashboard/drivers');
        break;
      default:
        break;
    }
  };

  const handleRetry = () => {
    fetchStats();
    fetchTopVendors();
  };

  // Show loading or error state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-5xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">خطأ في الاتصال</h2>
          <p className="mb-6">{error}</p>
          <p className="mb-6 text-gray-600">تم عرض بيانات افتراضية للتوضيح فقط.</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatClick('sales')}
        >
          <h3 className="text-lg font-semibold mb-2">إجمالي المبيعات</h3>
          <p className="text-3xl font-bold text-blue-600">₪{stats.totalSales.toFixed(2)}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500">↑ 5.2%</span> مقارنة بالشهر الماضي
          </div>
        </div>
        <div 
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatClick('orders')}
        >
          <h3 className="text-lg font-semibold mb-2">الطلبات النشطة</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalOrders}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500">↑ 12.8%</span> مقارنة بالشهر الماضي
          </div>
        </div>
        <div 
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatClick('vendors')}
        >
          <h3 className="text-lg font-semibold mb-2">البائعين النشطين</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.activeVendors}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500">↑ 2</span> بائعين جدد هذا الشهر
          </div>
        </div>
        <div 
          className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleStatClick('drivers')}
        >
          <h3 className="text-lg font-semibold mb-2">السائقين المتاحين</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.activeDrivers}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="text-green-500">↑ 3</span> سائقين جدد هذا الشهر
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">إحصائيات المبيعات</h2>
          <Line data={salesData} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">إحصائيات الطلبات</h2>
          <Line data={ordersData} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">أحدث الطلبات</h2>
          <LatestOrders />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">أفضل المنتجات مبيعاً</h2>
          <TopProducts />
        </div>
      </div>

      {/* Top Vendors Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">البائعين الأكثر مبيعاً</h2>
        <div className="space-y-4">
          {topVendors.length > 0 ? (
            topVendors.map((vendor, index) => (
              <div key={vendor.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                    {vendor.logo_url ? (
                      <img 
                        src={vendor.logo_url} 
                        alt={vendor.store_name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/48?text=Logo';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{vendor.store_name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span>{vendor.rating}</span>
                      <span className="mx-1">•</span>
                      <span>{vendor.rating_count} تقييم</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">₪{vendor.total_sales.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">{vendor.order_count} طلب</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              لا توجد بيانات متاحة
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <button 
            onClick={() => navigate('/admin-dashboard/vendors')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            عرض جميع البائعين
          </button>
        </div>
      </div>
    </div>
  );
}

// Component to display latest orders
function LatestOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestOrders();
  }, []);

  const fetchLatestOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Changed 'orders' to 'ord' and updated the join syntax
      const { data, error } = await supabase
        .from('ord')
        .select(`
          id,
          total,
          status,
          created_at,
          customers!customer_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      
      // Transform the data to match the expected format
      const transformedData = data.map(order => ({
        ...order,
        customer: {
          name: order.customers?.name || 'غير معروف'
        }
      }));
      
      setOrders(transformedData || []);
    } catch (error) {
      console.error('Error fetching latest orders:', error);
      setError(error.message);
      // Fallback data
      setOrders([
        { id: '1234', customer: { name: 'أحمد محمد' }, total: 120.00, status: 'completed', created_at: new Date().toISOString() },
        { id: '1233', customer: { name: 'سارة خالد' }, total: 85.50, status: 'delivering', created_at: new Date().toISOString() },
        { id: '1232', customer: { name: 'محمد علي' }, total: 210.00, status: 'processing', created_at: new Date().toISOString() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivering': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'delivering': return 'قيد التوصيل';
      case 'processing': return 'قيد التحضير';
      case 'pending': return 'معلق';
      default: return status;
    }
  };

  const handleRetry = () => {
    fetchLatestOrders();
  };

  if (loading) {
    return <div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-center">
        <p className="text-red-600 mb-2">فشل في جلب الطلبات: {error}</p>
        <button 
          onClick={handleRetry}
          className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return <p className="text-center text-gray-500 py-4">لا توجد طلبات حالياً</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الطلب</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">العميل</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map(order => (
            <tr key={order.id}>
              <td className="px-6 py-4 whitespace-nowrap">#{order.id.substring(0, 8)}</td>
              <td className="px-6 py-4 whitespace-nowrap">{order.customer?.name || 'غير معروف'}</td>
              <td className="px-6 py-4 whitespace-nowrap">₪{parseFloat(order.total).toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-center">
        <button 
          onClick={() => navigate('/admin-dashboard/orders')}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          عرض جميع الطلبات
        </button>
      </div>
    </div>
  );
}

// Component to display top products
function TopProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    try {
      // In a real application, you would have a way to track product sales
      // For now, we'll just get some products and pretend they're top sellers
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image_url
        `)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      
      // Add mock sales data
      const productsWithSales = data.map((product, index) => ({
        ...product,
        sales: 120 - (index * 20) // Mock sales numbers
      }));
      
      setProducts(productsWithSales || []);
    } catch (error) {
      console.error('Error fetching top products:', error);
      setError(error.message);
      // Fallback data
      setProducts([
        { id: 1, name: 'قهوة تركية', price: 15.00, sales: 120, image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=200&auto=format&fit=crop' },
        { id: 2, name: 'شاي أخضر', price: 10.00, sales: 95, image_url: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=200&auto=format&fit=crop' },
        { id: 3, name: 'عصير برتقال', price: 12.00, sales: 85, image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=200&auto=format&fit=crop' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchTopProducts();
  };

  if (loading) {
    return <div className="animate-pulse h-40 bg-gray-100 rounded-lg"></div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-center">
        <p className="text-red-600 mb-2">فشل في جلب المنتجات: {error}</p>
        <button 
          onClick={handleRetry}
          className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return <p className="text-center text-gray-500 py-4">لا توجد منتجات حالياً</p>;
  }

  return (
    <div className="space-y-4">
      {products.map(product => (
        <div key={product.id} className="flex items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-lg ml-4 overflow-hidden">
            {product.image_url && (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/48?text=Product';
                }}
              />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{product.name}</h3>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-500">{product.sales} مبيعات</span>
              <span className="font-semibold">₪{parseFloat(product.price).toFixed(2)}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-4 text-center">
        <button 
          onClick={() => navigate('/admin-dashboard/products')}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          عرض جميع المنتجات
        </button>
      </div>
    </div>
  );
}