import React, { useState } from 'react';
import { Department, RequestStatus, RequestType, ServiceRequest, User, UserRole } from '../types';
import { api } from '../services/api';
import { FileText, Upload, CheckCircle, Clock, XCircle, AlertCircle, PlusCircle, Trash2, Eye, X, Image as ImageIcon } from 'lucide-react';

interface RequestManagerProps {
  user: User;
  departments: Department[];
  requests: ServiceRequest[];
  onRefresh: () => void;
  onDepartmentsChange: () => void; // For Admin to trigger update
}

// Helper to get color status
const getStatusColor = (status: RequestStatus) => {
  switch (status) {
    case RequestStatus.SUCCESS: return 'text-green-600 bg-green-50 border-green-200';
    case RequestStatus.REJECTED: return 'text-red-600 bg-red-50 border-red-200';
    case RequestStatus.UNDER_REVIEW: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case RequestStatus.OPENED: return 'text-blue-600 bg-blue-50 border-blue-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const RequestManager: React.FC<RequestManagerProps> = ({ user, departments, requests, onRefresh, onDepartmentsChange }) => {
  const [view, setView] = useState<'list' | 'create' | 'settings'>('list');
  const [activeDepartment, setActiveDepartment] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  
  // Create Form State
  const [formData, setFormData] = useState({
    details: '',
    type: departments[0]?.name || '',
    residence: '',
    applicantName: user.fullName || '',
    motherName: user.motherName || '',
    dob: '',
    filesCount: 0
  });

  // Settings State
  const [newDeptName, setNewDeptName] = useState('');

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.filesCount < 3) {
      alert("يرجى رفع 3 صور على الأقل");
      return;
    }
    // Simulate multiple images based on file count
    const attachments = Array(formData.filesCount).fill(0).map((_, i) => `https://picsum.photos/800/600?random=${Math.random()}`);

    await api.requests.create({
      userId: user.id,
      applicantName: formData.applicantName,
      motherName: formData.motherName,
      dob: formData.dob,
      residence: formData.residence,
      details: formData.details,
      type: formData.type,
      attachments: attachments,
    });
    setFormData({ ...formData, details: '', residence: '', filesCount: 0 });
    setView('list');
    onRefresh();
  };

  const handleStatusUpdate = async (reqId: string, newStatus: string) => {
    await api.requests.updateStatus(reqId, newStatus);
    onRefresh();
    // Update local selected request if open
    if(selectedRequest && selectedRequest.id === reqId) {
        setSelectedRequest({...selectedRequest, status: newStatus as RequestStatus});
    }
  };

  const handleAddDept = async () => {
    if(newDeptName) {
      await api.departments.add(newDeptName);
      setNewDeptName('');
      onDepartmentsChange();
    }
  }

  const handleDeleteDept = async (id: string) => {
      if(confirm('حذف هذا القسم؟')) {
          await api.departments.delete(id);
          onDepartmentsChange();
      }
  }

  // Filter requests based on role and tab
  const filteredRequests = requests.filter(r => {
    if (user.role === UserRole.CITIZEN) {
      return r.userId === user.id;
    } else {
      // Admin
      return activeDepartment === 'all' || r.type === activeDepartment;
    }
  });

  if (view === 'create' && user.role === UserRole.CITIZEN) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-primary-600 p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">تقديم طلب جديد</h2>
          <button onClick={() => setView('list')} className="text-white/80 hover:text-white text-sm">عودة للقائمة</button>
        </div>
        <form onSubmit={handleCreateRequest} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع الطلب</label>
              <select 
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-500"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الثلاثي</label>
              <input type="text" value={formData.applicantName} readOnly className="w-full border rounded-lg p-2 bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم الأم</label>
              <input type="text" value={formData.motherName} readOnly className="w-full border rounded-lg p-2 bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المواليد</label>
              <input 
                type="date" 
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-500" 
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان السكن</label>
              <input 
                type="text" 
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-500" 
                value={formData.residence}
                onChange={(e) => setFormData({...formData, residence: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تفاصيل الطلب</label>
            <textarea 
              required
              rows={4}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary-500"
              value={formData.details}
              onChange={(e) => setFormData({...formData, details: e.target.value})}
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">المستمسكات (صور فقط)</label>
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  className="hidden" 
                  id="file-upload"
                  onChange={(e) => setFormData({...formData, filesCount: e.target.files?.length || 0})}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <span className="block text-primary-600 font-medium">اختر 3 إلى 6 صور</span>
                  {formData.filesCount > 0 && (
                    <span className="block text-green-600 mt-2 text-sm font-bold">تم اختيار {formData.filesCount} ملفات</span>
                  )}
                </label>
             </div>
          </div>

          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition">
            إرسال الطلب
          </button>
        </form>
      </div>
    );
  }

  if (view === 'settings' && user.role === UserRole.ADMIN) {
     return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-gray-800">إدارة الأقسام</h2>
                 <button onClick={() => setView('list')} className="text-primary-600 hover:underline">عودة للطلبات</button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
                 <div className="flex gap-4 mb-6">
                     <input 
                        type="text" 
                        placeholder="اسم القسم الجديد" 
                        className="flex-1 border rounded-lg p-2"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                     />
                     <button onClick={handleAddDept} className="bg-green-600 text-white px-6 rounded-lg hover:bg-green-700">إضافة</button>
                 </div>
                 
                 <div className="space-y-3">
                     {departments.map(dept => (
                         <div key={dept.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                             <span className="font-medium">{dept.name}</span>
                             <button onClick={() => handleDeleteDept(dept.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
     )
  }

  // LIST VIEW (Shared)
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {user.role === UserRole.ADMIN ? 'إدارة الطلبات' : 'طلباتي'}
        </h2>
        <div className="flex gap-2">
            {user.role === UserRole.CITIZEN && (
            <button 
                onClick={() => setView('create')}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
                <PlusCircle size={18} />
                طلب جديد
            </button>
            )}
            {user.role === UserRole.ADMIN && (
                <button 
                    onClick={() => setView('settings')}
                    className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition"
                >
                    إعدادات الأقسام
                </button>
            )}
        </div>
      </div>

      {user.role === UserRole.ADMIN && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button 
            onClick={() => setActiveDepartment('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeDepartment === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            الكل
          </button>
          {departments.map(dept => (
             <button 
                key={dept.id}
                onClick={() => setActiveDepartment(dept.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeDepartment === dept.name ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
             >
             {dept.name}
           </button>
          ))}
        </div>
      )}

      <div className="grid gap-4">
        {filteredRequests.map(req => (
          <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b pb-4">
              <div>
                 <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${getStatusColor(req.status)}`}>
                    {req.status}
                 </span>
                 <h3 className="font-bold text-lg text-gray-900">{req.type}</h3>
                 <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Clock size={14} />
                    {new Date(req.createdAt).toLocaleDateString('ar-EG')} - {new Date(req.createdAt).toLocaleTimeString('ar-EG')}
                 </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="font-semibold">{req.applicantName}</p>
                    {user.role === UserRole.ADMIN && <p className="text-sm text-gray-500">والدته: {req.motherName}</p>}
                  </div>
                  <button 
                    onClick={() => setSelectedRequest(req)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-bold"
                  >
                    <Eye size={16} />
                    عرض التفاصيل والصور
                  </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 whitespace-pre-wrap line-clamp-2">{req.details}</p>
            </div>
            
            {/* Status Steps Visualization for Citizen */}
            <div className="mt-6 pt-4 border-t">
                 <div className="flex justify-between items-center relative">
                     {/* Line behind */}
                     <div className="absolute top-1/2 right-0 left-0 h-1 bg-gray-200 -z-0"></div>
                     
                     {[RequestStatus.SENT, RequestStatus.OPENED, RequestStatus.UNDER_REVIEW, RequestStatus.SUCCESS].map((step, idx) => {
                         const currentIdx = [RequestStatus.SENT, RequestStatus.OPENED, RequestStatus.UNDER_REVIEW, RequestStatus.SUCCESS].indexOf(req.status);
                         const stepIdx = [RequestStatus.SENT, RequestStatus.OPENED, RequestStatus.UNDER_REVIEW, RequestStatus.SUCCESS].indexOf(step);
                         const isCompleted = stepIdx <= currentIdx || (req.status === RequestStatus.SUCCESS && step !== RequestStatus.REJECTED);
                         const isRejected = req.status === RequestStatus.REJECTED;
                         
                         let colorClass = isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400';
                         if (isRejected && idx === 2) colorClass = 'bg-red-500 text-white'; // Show rejection at review stage usually

                         return (
                            <div key={step} className="z-10 flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${colorClass}`}>
                                    {isCompleted ? <CheckCircle size={16}/> : (isRejected && idx === 2 ? <XCircle size={16}/> : idx + 1)}
                                </div>
                                <span className="text-[10px] mt-1 font-medium text-gray-600 hidden md:block">{step}</span>
                            </div>
                         )
                     })}
                 </div>
            </div>

          </div>
        ))}
        {filteredRequests.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">لا توجد طلبات لعرضها</p>
            </div>
        )}
      </div>

      {/* REQUEST DETAILS MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white z-10 p-5 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">تفاصيل الطلب</h2>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedRequest.status)}`}>
                            {selectedRequest.status}
                        </span>
                    </div>
                    <button 
                        onClick={() => setSelectedRequest(null)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
                        <div>
                            <p className="text-gray-500 text-sm">اسم مقدم الطلب</p>
                            <p className="font-bold text-lg">{selectedRequest.applicantName}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">اسم الأم</p>
                            <p className="font-bold text-lg">{selectedRequest.motherName}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">السكن</p>
                            <p className="font-medium">{selectedRequest.residence}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">المواليد</p>
                            <p className="font-medium">{selectedRequest.dob}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">نوع الطلب</p>
                            <p className="font-medium">{selectedRequest.type}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">تاريخ التقديم</p>
                            <p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleString('ar-EG')}</p>
                        </div>
                    </div>

                    {/* Details Content */}
                    <div>
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <FileText size={20} className="text-primary-600"/>
                            محتوى الطلب
                        </h3>
                        <div className="bg-white border p-4 rounded-xl leading-relaxed text-gray-700 whitespace-pre-wrap">
                            {selectedRequest.details}
                        </div>
                    </div>

                    {/* Attachments Gallery */}
                    <div>
                         <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <ImageIcon size={20} className="text-primary-600"/>
                            المستمسكات والمرفقات
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {selectedRequest.attachments.map((url, idx) => (
                                <div key={idx} className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                                    <img 
                                        src={url} 
                                        alt={`مرفق ${idx + 1}`} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                        onClick={() => window.open(url, '_blank')}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                </div>
                            ))}
                            {selectedRequest.attachments.length === 0 && (
                                <p className="col-span-full text-gray-500 text-center py-4">لا توجد مرفقات</p>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Admin Actions Footer */}
                {user.role === UserRole.ADMIN && (
                    <div className="sticky bottom-0 bg-white border-t p-5 flex flex-wrap gap-3 justify-center">
                        <p className="w-full text-center text-sm text-gray-500 mb-2">تحديث حالة الطلب</p>
                        {Object.values(RequestStatus).map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusUpdate(selectedRequest.id, status)}
                                disabled={selectedRequest.status === status}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    selectedRequest.status === status 
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : status === RequestStatus.SUCCESS ? 'bg-green-600 text-white hover:bg-green-700'
                                    : status === RequestStatus.REJECTED ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-white border hover:bg-gray-50'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};