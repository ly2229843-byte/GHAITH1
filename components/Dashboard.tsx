import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { ServiceRequest, RequestStatus } from '../types';

interface DashboardProps {
  requests: ServiceRequest[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard: React.FC<DashboardProps> = ({ requests }) => {
  // 1. Stats by Status
  const statusStats = Object.values(RequestStatus).map((status) => {
    return {
      name: status,
      value: requests.filter((r) => r.status === status).length,
    };
  }).filter(item => item.value > 0);

  // 2. Stats by Type (Section)
  const typeMap: { [key: string]: number } = {};
  requests.forEach(r => {
    typeMap[r.type] = (typeMap[r.type] || 0) + 1;
  });
  
  const typeStats = Object.keys(typeMap).map(key => ({
    name: key.length > 15 ? key.substring(0, 12) + '...' : key, // Truncate long names
    count: typeMap[key]
  }));

  const totalRequests = requests.length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">لوحة التحكم والإحصائيات</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-blue-500">
          <p className="text-sm text-gray-500">إجمالي الطلبات</p>
          <p className="text-3xl font-bold text-gray-800">{totalRequests}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-green-500">
          <p className="text-sm text-gray-500">تم بنجاح</p>
          <p className="text-3xl font-bold text-gray-800">
            {requests.filter(r => r.status === RequestStatus.SUCCESS).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-yellow-500">
          <p className="text-sm text-gray-500">قيد المراجعة</p>
          <p className="text-3xl font-bold text-gray-800">
             {requests.filter(r => r.status === RequestStatus.UNDER_REVIEW).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-r-4 border-red-500">
          <p className="text-sm text-gray-500">مرفوضة</p>
          <p className="text-3xl font-bold text-gray-800">
             {requests.filter(r => r.status === RequestStatus.REJECTED).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm min-h-[400px]">
          <h3 className="text-lg font-semibold mb-4 text-center">توزيع حالات الطلبات</h3>
          {statusStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">لا توجد بيانات للعرض</div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm min-h-[400px]">
          <h3 className="text-lg font-semibold mb-4 text-center">الطلبات حسب القسم</h3>
           {typeStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={typeStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="عدد الطلبات" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
           ) : (
             <div className="h-full flex items-center justify-center text-gray-400">لا توجد بيانات للعرض</div>
           )}
        </div>
      </div>
    </div>
  );
};