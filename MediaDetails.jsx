import React, { useState } from 'react';
import { formatSize, formatDate } from '../utils/formatters';

export default function MediaDetails({ media, onClose, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    alt_text: media.alt_text || '',
    title: media.title || '',
    description: media.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(media.id, formData);
    setIsEditing(false);
  };

  if (!media) return null;

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">تفاصيل الملف</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-6">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt={media.alt_text || media.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22600%22%20height%3D%22400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22600%22%20height%3D%22400%22%20fill%3D%22%23e2e8f0%22%3E%3C%2Frect%3E%3Ctext%20x%3D%22300%22%20y%3D%22200%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20font-family%3D%22Arial%2C%20sans-serif%22%20fill%3D%22%2364748b%22%3EImage%20Not%20Found%3C%2Ftext%3E%3C%2Fsvg%3E';
              }}
            />
          ) : media.type === 'video' ? (
            <video
              src={media.url}
              controls
              className="w-full h-full"
              onError={(e) => {
                e.target.onerror = null;
                const parent = e.target.parentNode;
                if (parent) {
                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">فشل تحميل الفيديو</div>';
                }
              }}
            />
          ) : media.type === 'audio' ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <audio src={media.url} controls className="w-full" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                النص البديل
              </label>
              <input
                type="text"
                value={formData.alt_text}
                onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                placeholder="وصف الصورة للقراء الشاشة"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                العنوان
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                placeholder="عنوان الملف"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الوصف
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                rows="3"
                placeholder="وصف الملف"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                حفظ
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                اسم الملف
              </label>
              <p className="mt-1 text-sm text-gray-900">{media.original_filename || media.filename || media.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                نوع الملف
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {media.type === 'image' ? 'صورة' : 
                 media.type === 'video' ? 'فيديو' : 
                 media.type === 'audio' ? 'صوت' : 
                 'مستند'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                حجم الملف
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {formatSize(media.file_size || media.size)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                المجلد
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {media.bucket || 'عام'}
              </p>
            </div>

            {media.width && media.height && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  الأبعاد
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {media.width}×{media.height}
                </p>
              </div>
            )}

            {media.duration && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  المدة
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {media.duration} ثانية
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                تاريخ الرفع
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(media.created_at || media.uploaded_at)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                عدد الاستخدامات
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {media.usage_count || 0}
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                النص البديل
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {media.alt_text || 'لا يوجد نص بديل'}
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                العنوان
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {media.title || 'لا يوجد عنوان'}
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                الوصف
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {media.description || 'لا يوجد وصف'}
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                الرابط
              </label>
              <p className="mt-1 text-sm text-blue-600 truncate">
                <a href={media.url} target="_blank" rel="noopener noreferrer">
                  {media.url}
                </a>
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
            >
              تعديل
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            إغلاق
          </button>
          <button
            onClick={() => onDelete(media.id)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}