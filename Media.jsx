import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabase';
import MediaDetails from '../MediaDetails';
import { BUCKETS } from '../../lib/supabaseStorage';

export default function Media() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadBucket, setUploadBucket] = useState('general');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMedia, setTotalMedia] = useState(0);
  const [uploading, setUploading] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchMedia();
  }, [currentPage, searchTerm]);

  const fetchMedia = async () => {
    try {
      setLoading(true);

      // Calculate the range for pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Build the query
      let query = supabase
        .from('media_files')
        .select('*', { count: 'exact' });
      
      // Add search filter if provided
      if (searchTerm) {
        query = query.or(`filename.ilike.%${searchTerm}%,original_filename.ilike.%${searchTerm}%,alt_text.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`);
      }
      
      // Apply pagination and ordering
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Transform data to include proper URLs
      const transformedData = data.map(file => {
        const { publicUrl } = supabase.storage
          .from(file.bucket)
          .getPublicUrl(file.file_path);
          
        return {
          ...file,
          url: publicUrl,
          type: file.mime_type.startsWith('image/') ? 'image' : 
                file.mime_type.startsWith('video/') ? 'video' : 
                file.mime_type.startsWith('audio/') ? 'audio' : 'document'
        };
      });

      setMedia(transformedData);
      setTotalMedia(count || 0);
    } catch (error) {
      console.error('Error fetching media:', error);
      setError('فشل في تحميل ملفات الوسائط');
      
      // If there's an error, let's provide some mock data for the UI
      setMedia([
        {
          id: 1,
          name: 'product-image-1.jpg',
          filename: 'product-image-1.jpg',
          original_filename: 'product-image-1.jpg',
          type: 'image',
          file_size: 1024 * 1024 * 2, // 2MB
          url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=200&auto=format&fit=crop',
          bucket: 'products',
          created_at: '2025-04-15T10:30:00Z',
          width: 1200,
          height: 800,
          usage_count: 3
        },
        {
          id: 2,
          name: 'banner-1.jpg',
          filename: 'banner-1.jpg',
          original_filename: 'banner-1.jpg',
          type: 'image',
          file_size: 1024 * 1024 * 3, // 3MB
          url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=200&auto=format&fit=crop',
          bucket: 'vendors',
          created_at: '2025-04-10T14:20:00Z',
          width: 1920,
          height: 600,
          usage_count: 1
        },
        {
          id: 3,
          name: 'product-video-1.mp4',
          filename: 'product-video-1.mp4',
          original_filename: 'product-video-1.mp4',
          type: 'video',
          file_size: 1024 * 1024 * 15, // 15MB
          url: 'https://example.com/video.mp4',
          bucket: 'products',
          created_at: '2025-04-05T09:15:00Z',
          duration: '00:30',
          usage_count: 2
        },
        {
          id: 4,
          name: 'logo.png',
          filename: 'logo.png',
          original_filename: 'logo.png',
          type: 'image',
          file_size: 1024 * 512, // 512KB
          url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=200&auto=format&fit=crop',
          bucket: 'general',
          created_at: '2025-03-20T11:45:00Z',
          width: 400,
          height: 400,
          usage_count: 5
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast.error('الرجاء اختيار ملف');
      return;
    }

    try {
      setUploading(true);
      
      // Create a file path with a unique name
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = fileName;
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(uploadBucket)
        .upload(filePath, uploadFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(uploadBucket)
        .getPublicUrl(filePath);
        
      // Create a record in the media_files table
      const { data: fileRecord, error: recordError } = await supabase
        .from('media_files')
        .insert([{
          filename: fileName,
          original_filename: uploadFile.name,
          file_path: filePath,
          file_size: uploadFile.size,
          mime_type: uploadFile.type,
          bucket: uploadBucket,
          is_public: true,
          width: uploadFile.type.startsWith('image/') ? 1200 : null, // Just a placeholder for images
          height: uploadFile.type.startsWith('image/') ? 800 : null
        }])
        .select();
        
      if (recordError) throw recordError;

      toast.success('تم رفع الملف بنجاح');
      
      // Add the new file to the media array
      const newMedia = {
        id: fileRecord[0].id,
        name: uploadFile.name,
        filename: fileName,
        original_filename: uploadFile.name,
        file_path: filePath,
        mime_type: uploadFile.type,
        type: uploadFile.type.startsWith('image/') ? 'image' : 
              uploadFile.type.startsWith('video/') ? 'video' : 
              uploadFile.type.startsWith('audio/') ? 'audio' : 'document',
        file_size: uploadFile.size,
        url: publicUrl,
        bucket: uploadBucket,
        created_at: new Date().toISOString(),
        width: uploadFile.type.startsWith('image/') ? 1200 : null,
        height: uploadFile.type.startsWith('image/') ? 800 : null,
        duration: uploadFile.type.startsWith('video/') ? '00:30' : null,
        usage_count: 0
      };

      setMedia([newMedia, ...media]);
      setShowUploadModal(false);
      setUploadFile(null);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('فشل في رفع الملف');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
    
    try {
      setLoading(true);
      
      // Get the file info first
      const { data: fileData, error: fileError } = await supabase
        .from('media_files')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fileError) throw fileError;
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(fileData.bucket)
        .remove([fileData.file_path]);
      
      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Continue anyway, we'll still remove the record
      }
      
      // Delete from database
      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setMedia(media.filter(m => m.id !== id));
      
      if (selectedMedia && selectedMedia.id === id) {
        setShowDetailsModal(false);
        setSelectedMedia(null);
      }
      
      toast.success('تم حذف الملف بنجاح');
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('فشل في حذف الملف');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMedia = async (id, updatedData) => {
    try {
      const { data, error } = await supabase
        .from('media_files')
        .update({
          alt_text: updatedData.alt_text,
          title: updatedData.title,
          description: updatedData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      // Update the media array
      setMedia(media.map(item => 
        item.id === id 
          ? { ...item, ...updatedData }
          : item
      ));
      
      // Update the selected media if it's the one being edited
      if (selectedMedia && selectedMedia.id === id) {
        setSelectedMedia({ ...selectedMedia, ...updatedData });
      }
      
      toast.success('تم تحديث الملف بنجاح');
    } catch (error) {
      console.error('Error updating media:', error);
      toast.error('فشل في تحديث الملف');
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchMedia();
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const totalPages = Math.ceil(totalMedia / itemsPerPage);

  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {media.map(item => (
        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
          <div className="relative aspect-square">
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
                }}
              />
            ) : item.type === 'video' ? (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
              <button
                onClick={() => {
                  setSelectedMedia(item);
                  setShowDetailsModal(true);
                }}
                className="p-2 bg-white rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 bg-white rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              {item.type === 'image' && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(item.url);
                    toast.success('تم نسخ رابط الصورة');
                  }}
                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                >
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-900 truncate">{item.original_filename || item.filename}</h3>
            <div className="flex justify-between items-center mt-1">
              <p className="text-sm text-gray-500">{formatSize(item.file_size || item.size)}</p>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {item.bucket}
              </span>
            </div>
            {item.usage_count > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                استخدم {item.usage_count} مرة
              </p>
            )}
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
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الملف</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحجم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المجلد</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاستخدامات</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الرفع</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {media.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="h-10 w-10 rounded object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/40?text=Error';
                          }}
                        />
                      ) : item.type === 'video' ? (
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="mr-4">
                      <div className="text-sm font-medium text-gray-900">{item.original_filename || item.filename}</div>
                      <div className="text-sm text-gray-500">
                        {item.width && item.height && `${item.width}×${item.height}`}
                        {item.duration && ` • ${item.duration}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.type === 'image' ? 'bg-blue-100 text-blue-800' : 
                    item.type === 'video' ? 'bg-purple-100 text-purple-800' : 
                    item.type === 'audio' ? 'bg-green-100 text-green-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.type === 'image' ? 'صورة' : 
                     item.type === 'video' ? 'فيديو' : 
                     item.type === 'audio' ? 'صوت' : 
                     'مستند'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatSize(item.file_size || item.size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.bucket}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.usage_count || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(item.created_at || item.uploaded_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedMedia(item);
                      setShowDetailsModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 ml-4"
                  >
                    عرض
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
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
  );

  if (loading && media.length === 0) {
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
          onClick={fetchMedia}
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
        <h2 className="text-2xl font-bold">إدارة الوسائط</h2>
        <div className="flex items-center gap-4">
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
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            رفع ملف جديد
          </button>
        </div>
      </div>

      {/* Search Box */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <form onSubmit={handleSearch} className="flex items-stretch gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 pr-10"
              placeholder="البحث عن الملفات..."
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div>
            <select
              value={uploadBucket}
              onChange={(e) => setUploadBucket(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value={BUCKETS.GENERAL}>عام</option>
              <option value={BUCKETS.PRODUCTS}>المنتجات</option>
              <option value={BUCKETS.VENDORS}>البائعين</option>
              <option value={BUCKETS.PROFILES}>الملفات الشخصية</option>
              <option value={BUCKETS.ADVERTISEMENTS}>الإعلانات</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            بحث
          </button>
        </form>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg text-red-800">
          <h3 className="font-semibold mb-2">خطأ</h3>
          <p>{error}</p>
          <button
            onClick={fetchMedia}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : media.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg 
            className="mx-auto h-16 w-16 text-gray-400 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد وسائط</h3>
          <p className="text-gray-500 mb-4">لم يتم العثور على أي وسائط. بدء بالرفع للاستفادة من مكتبة الوسائط.</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            رفع ملف جديد
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? renderGridView() : renderTableView()}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="inline-flex bg-white rounded-md shadow">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-l-md border border-gray-300 ${
                    currentPage === 1 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  السابق
                </button>
                
                {[...Array(totalPages).keys()].map(number => (
                  <button
                    key={number + 1}
                    onClick={() => handlePageChange(number + 1)}
                    className={`px-3 py-2 border-t border-b border-gray-300 ${
                      currentPage === number + 1
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-r-md border border-gray-300 ${
                    currentPage === totalPages 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  التالي
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setShowUploadModal(false)}></div>

            <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6">
                رفع ملف جديد
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المجلد
                </label>
                <select
                  value={uploadBucket}
                  onChange={(e) => setUploadBucket(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value={BUCKETS.GENERAL}>عام</option>
                  <option value={BUCKETS.PRODUCTS}>المنتجات</option>
                  <option value={BUCKETS.VENDORS}>البائعين</option>
                  <option value={BUCKETS.PROFILES}>الملفات الشخصية</option>
                  <option value={BUCKETS.ADVERTISEMENTS}>الإعلانات</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-sm text-gray-600 mt-2">
                    <p>اسحب وأفلت الملف هنا، أو</p>
                    <p className="text-blue-600">اضغط للاختيار</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF, PDF, MP4 حتى 10 ميجابايت
                  </p>
                </label>
              </div>

              {uploadFile && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium">{uploadFile.name}</p>
                        <p className="text-xs text-gray-500">{formatSize(uploadFile.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadFile(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 ml-2"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadFile || uploading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                    !uploadFile || uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? 'جاري الرفع...' : 'رفع'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedMedia && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => {
              setShowDetailsModal(false);
              setSelectedMedia(null);
            }}></div>

            <div className="relative bg-white rounded-lg p-8 max-w-4xl w-full mx-4">
              <MediaDetails 
                media={selectedMedia}
                onClose={() => {
                  setShowDetailsModal(false);
                  setSelectedMedia(null);
                }}
                onDelete={handleDelete}
                onUpdate={handleUpdateMedia}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}