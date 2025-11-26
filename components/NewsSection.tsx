import React, { useState } from 'react';
import { NewsItem, UserRole } from '../types';
import { Trash2, Edit, Plus, Image as ImageIcon, Video, X } from 'lucide-react';
import { api } from '../services/api';

interface NewsSectionProps {
  news: NewsItem[];
  role: UserRole;
  onRefresh: () => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ news, role, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', mediaType: 'none', mediaUrl: '' });
  const [uploading, setUploading] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الخبر؟')) {
      await api.news.delete(id);
      onRefresh();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      // Simulate upload by creating a local URL
      // In a real app, this would be an API call to upload the file
      setTimeout(() => {
        const url = URL.createObjectURL(file);
        setNewPost({ ...newPost, mediaUrl: url });
        setUploading(false);
      }, 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.news.create({
      title: newPost.title,
      content: newPost.content,
      mediaType: newPost.mediaType as any,
      mediaUrl: newPost.mediaUrl
    });
    setIsModalOpen(false);
    setNewPost({ title: '', content: '', mediaType: 'none', mediaUrl: '' });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">آخر الأخبار والمستجدات</h2>
        {role === UserRole.ADMIN && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            <Plus size={18} />
            إضافة خبر
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {item.mediaType === 'image' && item.mediaUrl && (
              <img src={item.mediaUrl} alt={item.title} className="w-full h-48 object-cover" />
            )}
            {item.mediaType === 'video' && item.mediaUrl && (
              <div className="w-full h-48 bg-black flex items-center justify-center">
                <Video className="text-white w-12 h-12 opacity-50" />
              </div>
            )}
            <div className="p-5">
              <h3 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.content}</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{new Date(item.createdAt).toLocaleDateString('ar-EG')}</span>
                {role === UserRole.ADMIN && (
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {news.length === 0 && (
          <div className="col-span-full text-center py-20 bg-white rounded-xl text-gray-400">
            لا توجد أخبار حالياً
          </div>
        )}
      </div>

      {/* Add News Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">نشر خبر جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الخبر</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المحتوى</label>
                <textarea
                  required
                  rows={4}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوسائط</label>
                <div className="flex gap-4 mb-2">
                    <button type="button" onClick={() => setNewPost({...newPost, mediaType: 'image'})} className={`flex-1 p-2 rounded border flex items-center justify-center gap-2 ${newPost.mediaType === 'image' ? 'bg-primary-50 border-primary-500 text-primary-700' : ''}`}>
                        <ImageIcon size={18}/> صورة
                    </button>
                    <button type="button" onClick={() => setNewPost({...newPost, mediaType: 'video'})} className={`flex-1 p-2 rounded border flex items-center justify-center gap-2 ${newPost.mediaType === 'video' ? 'bg-primary-50 border-primary-500 text-primary-700' : ''}`}>
                        <Video size={18}/> فيديو
                    </button>
                </div>
                {newPost.mediaType !== 'none' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input type="file" id="mediaUpload" className="hidden" onChange={handleFileUpload} accept={newPost.mediaType === 'image' ? "image/*" : "video/*"} />
                        <label htmlFor="mediaUpload" className="cursor-pointer text-primary-600 hover:text-primary-700 block">
                            {uploading ? "جاري الرفع..." : newPost.mediaUrl ? "تم اختيار الملف (اضغط للتغيير)" : "اضغط لرفع الملف"}
                        </label>
                    </div>
                )}
              </div>

              <div className="pt-4">
                <button type="submit" disabled={uploading} className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition">
                  نشر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};