import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { User as UserIcon, Phone, Lock, Save, AlertCircle } from 'lucide-react';

interface UserSettingsProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

export const UserSettings: React.FC<UserSettingsProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    motherName: user.motherName || '',
    phone: user.phone,
    password: '' // Start empty for security, only send if changed
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare update object
      const updates: any = {
        fullName: formData.fullName,
        phone: formData.phone,
      };
      
      // Only include password if user typed something
      if (formData.password.trim() !== '') {
        updates.password = formData.password;
      }
      
      if (user.role === UserRole.CITIZEN) {
        updates.motherName = formData.motherName;
      }

      const updatedUser = await api.auth.updateProfile(user.id, updates);
      onUpdateUser(updatedUser);
      setMessage({ type: 'success', text: 'تم تحديث بياناتك بنجاح. يرجى استخدام البيانات الجديدة عند الدخول القادم.' });
      
      // Clear password field after save
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ التغييرات' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">إعدادات الحساب</h2>
        <p className="text-gray-500 text-sm mt-1">يمكنك تعديل معلومات الدخول الخاصة بك من هنا</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-6 md:p-8">
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <AlertCircle size={20} />
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">الاسم الثلاثي (الاسم المعروض)</label>
                <div className="relative">
                  <UserIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              </div>

              {/* Mother Name (Citizen Only) */}
              {user.role === UserRole.CITIZEN && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">اسم الأم الثلاثي</label>
                  <div className="relative">
                    <UserIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">رقم الهاتف (يستخدم لتسجيل الدخول)</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <label className="text-sm font-bold text-gray-800 block mb-1">تغيير كلمة المرور</label>
                <p className="text-xs text-gray-500 mb-2">اترك هذا الحقل فارغاً إذا كنت لا تريد تغيير كلمة المرور الحالية.</p>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    placeholder="كلمة المرور الجديدة"
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition w-full font-bold shadow-md"
              >
                {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <Save size={18} />}
                حفظ التعديلات
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
