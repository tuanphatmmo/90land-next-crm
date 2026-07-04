"use client";
import { API_URL } from "@/lib/config";
import { useEffect, useState } from "react";
import axios from "axios";
import { DoorOpen, Building2, Link, Clock, PhoneCall, FileSpreadsheet, Eye, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Phòng đang trống", value: "24", icon: DoorOpen, color: "text-green-600", bg: "bg-green-100", trend: "+12 hôm nay", trendUp: true },
  { label: "Tổng mã tòa", value: "600", icon: Building2, color: "text-[#1A2350]", bg: "bg-slate-200", trend: "600 tòa", trendUp: true },
  { label: "Đã update hôm nay", value: "78%", icon: Link, color: "text-amber-600", bg: "bg-amber-100", trend: "180 có Sheet", trendUp: true },
  { label: "Tin Zalo chưa nhập", value: "3", icon: Clock, color: "text-red-600", bg: "bg-red-100", trend: "Chờ xử lý", trendUp: false },
];

const activity = [
  { title: "MT719 · Đống Đa", desc: "Duyên vừa nhập từ Zalo · 4 phòng trống", time: "2 phút", color: "bg-green-500" },
  { title: "MT207 · KAY HOME", desc: "Sheet tự đồng bộ · 3 phòng mới", time: "15 phút", color: "bg-amber-500" },
  { title: "MT540 · Thanh Xuân", desc: "Oanh cập nhật · Tầng 4 còn trống", time: "32 phút", color: "bg-purple-500" },
  { title: "MT16 · Cầu Giấy", desc: "Đã cho thuê · Xoá khỏi danh sách", time: "1 giờ", color: "bg-red-500" },
];

const getDayLabel = () => {
  const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  return `${days[now.getDay()]} — ${d}/${m}/${y}`;
};

export default function Home() {
  const [totalRooms, setTotalRooms] = useState(0);
  const [totalBuildings, setTotalBuildings] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("crm_user");
    if (saved) setCurrentUser(JSON.parse(saved));

    axios.get(`${API_URL}/buildings`).then(res => {
      const buildings = res.data.data;
      setTotalBuildings(buildings.length);
      const rooms = buildings.reduce((acc: number, b: any) => {
        return acc + (b.Rooms?.filter((r: any) => r.status === 'Trống' || r.status === 'Sắp trống').length || 0);
      }, 0);
      setTotalRooms(rooms);
    }).catch(console.error);
  }, []);

  const stats = [
    { label: "Phòng đang trống", value: totalRooms.toString(), icon: DoorOpen, color: "text-green-600", bg: "bg-green-100", trend: "Sẵn sàng cho thuê", trendUp: true },
    { label: "Tổng mã tòa", value: totalBuildings.toString(), icon: Building2, color: "text-[#1A2350]", bg: "bg-slate-200", trend: "Toàn hệ thống", trendUp: true },
    { label: "Đã update hôm nay", value: "100%", icon: Link, color: "text-amber-600", bg: "bg-amber-100", trend: "Hoạt động tốt", trendUp: true },
    { label: "Tin Zalo chưa nhập", value: "0", icon: Clock, color: "text-red-600", bg: "bg-red-100", trend: "Đã xử lý hết", trendUp: true },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-2">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", stat.bg, stat.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", stat.trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                  {stat.trend}
                </span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-[#1A2350] leading-none mt-2">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={cn("grid grid-cols-1 gap-4", currentUser?.role !== 'sale' ? "md:grid-cols-2" : "")}>
        {/* Tiến độ admin — chỉ hiện với admin */}
        {currentUser?.role !== 'sale' && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
              <div>
                <div className="text-sm font-bold text-[#1A2350]">Tiến độ admin hôm nay</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{getDayLabel()}</div>
              </div>
              <button className="px-3 py-1.5 text-xs font-semibold text-[#1A2350] border border-slate-300 rounded-lg hover:border-[#1A2350] transition-colors">
                Chi tiết
              </button>
            </div>
            <div className="p-4 space-y-4">
              {[
                { name: "Duyên", total: 120, done: 88, color: "text-amber-500", bg: "bg-amber-500" },
                { name: "Oanh", total: 120, done: 96, color: "text-purple-500", bg: "bg-purple-500" },
                { name: "Tuyết Anh", total: 115, done: 68, color: "text-green-500", bg: "bg-green-500" },
              ].map(admin => {
                const pct = Math.round((admin.done / admin.total) * 100);
                return (
                  <div key={admin.name}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold bg-slate-100", admin.color)}>
                          {admin.name[0]}
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-[#1A2350]">{admin.name}</div>
                          <div className="text-[11px] text-slate-500">{admin.done}/{admin.total} mã</div>
                        </div>
                      </div>
                      <span className={cn("text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100", admin.color)}>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-500", admin.bg)} style={{ width: pct + '%' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <div className="text-sm font-bold text-[#1A2350]">Hoạt động gần đây</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Realtime</div>
          </div>
          <div className="p-0">
            {activity.map((act, i) => (
              <div key={i} className="p-3 border-b border-slate-100 flex items-start gap-3 last:border-0 hover:bg-slate-50 transition-colors">
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", act.color)}></div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-[#1A2350]">{act.title}</div>
                  <div className="text-[11px] text-slate-500">{act.desc}</div>
                </div>
                <div className="text-[10px] text-slate-400 shrink-0">{act.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="text-sm font-bold text-[#1A2350]">Thao tác nhanh</div>
        </div>
        <div className="p-4 flex flex-wrap gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-[#1A2350] rounded-lg text-sm font-semibold hover:bg-amber-400 transition-colors">
            <PhoneCall className="w-4 h-4" /> Nhập tin Zalo ngay
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-[#1A2350] text-white rounded-lg text-sm font-semibold hover:bg-indigo-900 transition-colors">
            <FileSpreadsheet className="w-4 h-4" /> Thêm Google Sheet
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#1A2350] border border-slate-300 rounded-lg text-sm font-semibold hover:border-[#1A2350] transition-colors">
            <Eye className="w-4 h-4" /> Xem phòng trống
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#1A2350] border border-slate-300 rounded-lg text-sm font-semibold hover:border-[#1A2350] transition-colors">
            <Plus className="w-4 h-4" /> Thêm mã tòa
          </button>
        </div>
      </div>
    </div>
  );
}
