"use client";
import { API_URL } from "@/lib/config";
import { useState, useEffect } from "react";
import { TrendingUp, Users, DollarSign, Target, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";
import axios from "axios";


const performanceData = [
  { name: 'Thứ 2', chot: 0, truot: 0, cdt: 0 },
  { name: 'Thứ 3', chot: 0, truot: 0, cdt: 0 },
  { name: 'Thứ 4', chot: 0, truot: 0, cdt: 0 },
  { name: 'Thứ 5', chot: 0, truot: 0, cdt: 0 },
  { name: 'Thứ 6', chot: 0, truot: 0, cdt: 0 },
  { name: 'Thứ 7', chot: 0, truot: 0, cdt: 0 },
  { name: 'CN', chot: 0, truot: 0, cdt: 0 },
];

const saleLeaderboard: any[] = [];

export default function AdminDashboard() {
  const [role, setRole] = useState("admin");

  const [buildings, setBuildings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    // Check role setup
    const storedRole = localStorage.getItem("crm_role") || "admin";
    setRole(storedRole);
    
    // Fetch data
    const fetchData = async () => {
      try {
        const [bRes, rRes] = await Promise.all([
          axios.get(`${API_URL}/buildings`),
          axios.get(`${API_URL}/rooms`)
        ]);
        setBuildings(bRes.data.data || []);
        setRooms(rRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  if (role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] animate-in fade-in">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Target className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#1A2350]">Không có quyền truy cập</h2>
        <p className="text-slate-500 mt-2">Góc nhìn sếp chỉ dành riêng cho Admin/Quản lý.</p>
      </div>
    );
  }

  // Calculations
  const totalRooms = rooms.length;
  const rentedRooms = rooms.filter(r => r.status === 'Đã thuê' || r.status === 'Đã cọc').length;
  const rentRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;
  
  // Calculate projected commission
  let totalCommission = 0;
  rooms.forEach(r => {
    if (r.status === 'Đã thuê' || r.status === 'Đã cọc') {
      let b = buildings.find(b => b.id === r.BuildingId);
      if (b) {
        let commPercent = parseFloat((b.commission || '50').toString().replace('%', ''));
        totalCommission += (Number(r.price) * (commPercent / 100));
      } else {
        totalCommission += (Number(r.price) * 0.5); // Default 50%
      }
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-[#1A2350]">Góc nhìn Sếp</h1>
          <p className="text-xs text-slate-500">Báo cáo hiệu suất công ty tuần này</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-semibold text-[#1A2350]">Tuần này</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-16 h-16 text-amber-500" /></div>
          <div className="text-xs font-bold text-slate-500 mb-1">Doanh thu hoa hồng (Tạm tính)</div>
          <div className="text-3xl font-extrabold text-[#1A2350]">{new Intl.NumberFormat('vi-VN').format(totalCommission)}đ</div>
          <div className="text-xs font-bold text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Từ {rentedRooms} phòng đã chốt
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Target className="w-16 h-16 text-green-500" /></div>
          <div className="text-xs font-bold text-slate-500 mb-1">Tổng cọc / Chốt</div>
          <div className="text-3xl font-extrabold text-[#1A2350]">{rentedRooms} phòng</div>
          <div className="text-xs font-bold text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> {rentRate}% tỷ lệ lấp đầy
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-16 h-16 text-blue-500" /></div>
          <div className="text-xs font-bold text-slate-500 mb-1">Tổng nguồn hàng</div>
          <div className="text-3xl font-extrabold text-[#1A2350]">{totalRooms} phòng</div>
          <div className="text-xs font-bold text-slate-500 mt-2 flex items-center gap-1">
            Tại {buildings.length} tòa / dự án
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-bold text-[#1A2350] mb-4">Biểu đồ hiệu suất chốt phòng</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                <Bar dataKey="chot" name="Đã chốt" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="truot" name="Khách hủy" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-0 flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-bold text-[#1A2350]">Bảng vàng Sales (Leaderboard)</h2>
            <p className="text-[11px] text-slate-500">Tính theo doanh thu hoa hồng</p>
          </div>
          <div className="p-4 flex-1 flex items-center justify-center text-sm text-slate-500">
            {saleLeaderboard.length === 0 ? "Chưa có dữ liệu giao dịch" : ""}
            {saleLeaderboard.map(sale => (
              <div key={sale.rank} className="flex items-center gap-3">
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0", 
                  sale.rank === 1 ? "bg-amber-100 text-amber-700" : 
                  sale.rank === 2 ? "bg-slate-200 text-slate-700" : 
                  sale.rank === 3 ? "bg-amber-50/50 text-amber-900" : "bg-slate-100 text-slate-400"
                )}>
                  {sale.rank}
                </div>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0", sale.avatar)}>
                  {sale.name[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-[#1A2350]">{sale.name}</div>
                  <div className="text-xs text-slate-500">{sale.chot} hợp đồng</div>
                </div>
                <div className={cn("font-black text-sm text-right", sale.color)}>
                  {sale.revenue}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100 text-center">
            <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Xem toàn bộ danh sách</button>
          </div>
        </div>
      </div>
    </div>
  );
}
