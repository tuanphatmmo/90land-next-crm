"use client";
import { API_URL } from "@/lib/config";
import { useState, useEffect } from "react";
import { Building2, Plus, Search, Edit3, Trash2, MapPin, Tag, TrendingUp, Filter } from "lucide-react";
import axios from "axios";

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const res = await axios.get(`${API_URL}/buildings`);
      setBuildings(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBuildings = buildings.filter(b => 
    b.code?.toLowerCase().includes(search.toLowerCase()) || 
    b.name?.toLowerCase().includes(search.toLowerCase()) || 
    b.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2350] flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-500" />
            Quản lý mã tòa (Dự án)
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách các tòa nhà, chung cư mini, nguồn hàng đang có.</p>
        </div>
        <button className="bg-[#1A2350] hover:bg-indigo-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm">
          <Plus className="w-4 h-4" /> Thêm tòa mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm theo mã tòa, tên, địa chỉ..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 shadow-sm w-full md:w-auto justify-center">
            <Filter className="w-4 h-4" /> Bộ lọc
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                <th className="px-6 py-4">Mã / Tên Tòa</th>
                <th className="px-6 py-4">Địa chỉ</th>
                <th className="px-6 py-4 text-center">Số phòng</th>
                <th className="px-6 py-4">Hoa hồng</th>
                <th className="px-6 py-4">Độ ưu tiên</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Đang tải dữ liệu...</td>
                </tr>
              ) : filteredBuildings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Không tìm thấy tòa nhà nào</td>
                </tr>
              ) : (
                filteredBuildings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="font-bold text-[#1A2350] truncate">{b.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-1.5 max-w-[200px] xl:max-w-xs">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <span className="text-slate-600 line-clamp-2">{b.address}, {b.area}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-bold text-xs">
                        {b.Rooms?.length || 0} phòng
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-amber-600">
                        <TrendingUp className="w-4 h-4" /> {b.commission || '50%'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
                        <Tag className="w-3.5 h-3.5 text-slate-400" /> {b.priority || 'Bình thường'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
