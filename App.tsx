import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { NewsSection } from './components/NewsSection';
import { RequestManager } from './components/RequestManager';
import { UserSettings } from './components/UserSettings';
import { api } from './services/api';
import { Department, NewsItem, ServiceRequest, User, UserRole } from './types';
import { APP_CONFIG } from './constants';
import { LayoutDashboard, Newspaper, FileText, Settings, LogOut, Menu, X, UserCog } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'news' | 'requests' | 'settings'>('news');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data State
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    // Check initial session
    const currentUser = api.auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      // If citizen, default to news or requests, if admin default to dashboard
      setActiveTab(currentUser.role === UserRole.ADMIN ? 'dashboard' : 'news');
    }
    setLoading(false);
  }, []);

  const fetchData = async () => {
    if (!user) return;
    
    // Departments
    const depts = await api.departments.getAll();
    setDepartments(depts);

    // News
    const newsData = await api.news.getAll();
    setNews(newsData);

    // Requests
    const reqs = await api.requests.getAll(); 
    setRequests(reqs);
  };

  useEffect(() => {
    fetchData();
  }, [user, activeTab]);

  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    setRequests([]);
    setNews([]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) return <div className="h-screen flex items-center justify-center">تحميل...</div>;

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const NavItem = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
        activeTab === id 
        ? 'bg-primary-50 text-primary-700 shadow-sm' 
        : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f3f4f6]">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
        <h1 className="font-bold text-xl text-primary-700">{APP_CONFIG.appName}</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
           {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 right-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 md:translate-x-0 md:static md:h-screen overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6">
           <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                {user.fullName.charAt(0)}
             </div>
             <div className="overflow-hidden">
               <h3 className="font-bold text-gray-800 truncate">{user.fullName}</h3>
               <p className="text-xs text-gray-500">{user.role === UserRole.ADMIN ? APP_CONFIG.labels.adminRole : APP_CONFIG.labels.citizenRole}</p>
             </div>
           </div>

           <nav className="space-y-2">
             {user.role === UserRole.ADMIN && (
               <NavItem id="dashboard" label="لوحة التحكم" icon={LayoutDashboard} />
             )}
             <NavItem id="news" label="الأخبار" icon={Newspaper} />
             <NavItem id="requests" label={user.role === UserRole.ADMIN ? "إدارة الطلبات" : "طلباتي"} icon={FileText} />
             <NavItem id="settings" label="الإعدادات" icon={UserCog} />
           </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t bg-white">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-64px)] md:h-screen">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && user.role === UserRole.ADMIN && (
            <Dashboard requests={requests} />
          )}

          {activeTab === 'news' && (
            <NewsSection news={news} role={user.role} onRefresh={fetchData} />
          )}

          {activeTab === 'requests' && (
            <RequestManager 
                user={user} 
                departments={departments} 
                requests={requests} 
                onRefresh={fetchData}
                onDepartmentsChange={fetchData}
            />
          )}

          {activeTab === 'settings' && (
            <UserSettings user={user} onUpdateUser={handleUpdateUser} />
          )}
        </div>
      </main>
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}