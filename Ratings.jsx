import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getRatingsByType, getRatingsStats } from '../../lib/ratingsApi';
import { RatingStars } from '../Rating';

export default function Ratings({ type = 'vendor' }) {
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState({ average: 0, total: 0, distribution: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch ratings
      const ratingsData = await getRatingsByType(type);
      setRatings(ratingsData || []);
      
      // Fetch stats
      const statsData = await getRatingsStats(type);
      setStats(statsData || { average: 0, total: 0, distribution: {} });
    } catch (error) {
      console.error('Error fetching ratings data:', error);
      setError('فشل في تحميل بيانات التقييمات. الرجاء المحاولة مرة أخرى.');
      toast.error('فشل في تحميل بيانات التقييمات');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;
    
    try {
      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('تم حذف التقييم بنجاح');
      fetchData();
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast.error('فشل في حذف التقييم');
    }
  };

  const calculateDistributionPercentage = (count) => {
    return stats.total > 0 ? (count / stats.total) * 100 : 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderGridView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-yellow-500">{stats.average.toFixed(1)}</div>
            <div className="mt-2">
              <RatingStars rating={stats.average} />
            </div>
            <div className="text-gray-500 mt-2">من {stats.total} تقييم</div>
          </div>
          
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4">توزيع التقييمات</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center">
                  <div className="w-12 text-sm text-gray-600">{star} نجوم</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-500 h-2.5 rounded-full" 
                        style={{ width: `${calculateDistributionPercentage(stats.distribution[star] || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-sm text-gray-600">
                    {stats.distribution[star] || 0} ({calculateDistributionPercentage(stats.distribution[star] || 0).toFixed(0)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ratings.map(rating => (
          <div key={rating.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {type === 'vendor' ? 'متجر' : type === 'driver' ? 'سائق' : 'زبون'}
                  {rating.to_name && `: ${rating.to_name}`}
                </h3>
                <p className="text-gray-500 text-sm">
                  تقييم من {rating.from_name || 'مستخدم'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <RatingStars rating={rating.rating} />
                <span className="text-lg font-semibold">{rating.rating}</span>
              </div>
            </div>
            
            {rating.comment && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{rating.comment}</p>
              </div>
            )}
            
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {formatDate(rating.created_at)}
              </span>
              <button
                onClick={() => handleDelete(rating.id)}
                className="text-red-600 hover:text-red-800"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTableView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-yellow-500">{stats.average.toFixed(1)}</div>
            <div className="mt-2">
              <RatingStars rating={stats.average} />
            </div>
            <div className="text-gray-500 mt-2">من {stats.total} تقييم</div>
          </div>
          
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-4">توزيع التقييمات</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center">
                  <div className="w-12 text-sm text-gray-600">{star} نجوم</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-500 h-2.5 rounded-full" 
                        style={{ width: `${calculateDistributionPercentage(stats.distribution[star] || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-sm text-gray-600">
                    {stats.distribution[star] || 0} ({calculateDistributionPercentage(stats.distribution[star] || 0).toFixed(0)}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {type === 'vendor' ? 'المتجر' : type === 'driver' ? 'السائق' : 'الزبون'}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المقيم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التقييم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التعليق</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ratings.map(rating => (
                <tr key={rating.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{rating.to_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{rating.from_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <RatingStars rating={rating.rating} />
                      <span className="ml-2">{rating.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate">
                      {rating.comment || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(rating.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(rating.id)}
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
    </div>
  );

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
        <h2 className="text-2xl font-bold">
          {type === 'vendor' ? 'تقييمات البائعين' : type === 'driver' ? 'تقييمات السائقين' : 'تقييمات الزبائن'}
        </h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-white shadow text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            عرض شبكي
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-white shadow text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            عرض جدول
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? renderGridView() : renderTableView()}
    </div>
  );
}