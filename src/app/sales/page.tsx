"use client";
import { API_URL } from "@/lib/config";
import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Users, Search, ShieldAlert, KeyRound } from "lucide-react";

export default function SalesManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("crm_user");
    if (saved) setCurrentUser(JSON.parse(saved));

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`);
      setUsers(res.data.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleDelete = async (user: any) => {
    if (user.role === 'admin') {
      alert("Không thể xóa tài khoản Admin!");
      return;
    }
    if (!confirm(`Xóa tài khoản SALE: ${user.name}? Hành động này không thể hoàn tác.`)) return;
    try {
      await axios.delete(`${API_URL}/users/${user.id}`);
      setUsers(users.filter(u => u.id !== user.id));
    } catch (err) {
      alert("Lỗi xóa tài khoản!");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <ShieldAlert className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-[#1A2350]">Không có quyền truy cập</h2>
        <p>Trang này chỉ dành cho Quản trị viên (Admin).</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* TOOLBAR */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[250px]">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1A2350]">Quản lý Tài Khoản SALE</h1>
            <p className="text-xs text-slate-500">Theo dõi thông tin và mật khẩu các sale đã đăng ký</p>
          </div>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Tìm theo tên hoặc tài khoản..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-4">Tên Sale</th>
                <th className="px-5 py-4">Tài Khoản</th>
                <th className="px-5 py-4">Mật Khẩu</th>
                <th className="px-5 py-4">Vai Trò</th>
                <th className="px-5 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">Đang tải danh sách...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">Không tìm thấy tài khoản nào.</td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-[#1A2350]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold uppercase">
                          {u.name?.[0] || '?'}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-amber-600">{u.username}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded-lg border border-slate-200 max-w-fit font-mono text-xs">
                        <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-700 font-bold">{u.password}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : 'Sale'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          title="Xóa tài khoản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
