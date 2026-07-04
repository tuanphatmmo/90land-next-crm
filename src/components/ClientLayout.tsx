"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { API_URL } from "@/lib/config";

function InputField({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
      />
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("crm_user");
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { 
        username: loginUsername.trim().toLowerCase(), 
        password: loginPassword.trim() 
      });
      setCurrentUser(res.data.data);
      localStorage.setItem("crm_user", JSON.stringify(res.data.data));
    } catch (err: any) {
      alert(err.response?.data?.error || "Đăng nhập thất bại");
    }
  };

  if (loading) return null;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ background: "linear-gradient(135deg, #0d1535 0%, #1a2350 50%, #0d1535 100%)" }}>

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/30 mb-4">
            <span className="text-2xl font-black text-[#0d1535]">90</span>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            <span className="text-amber-400">90</span>LAND
          </div>
          <div className="text-xs text-white/30 tracking-[0.2em] uppercase mt-1">Nguồn Phòng</div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm p-7">
          <div className="text-center mb-7">
            <h1 className="text-xl font-bold text-white mb-1">Đăng nhập</h1>
            <p className="text-white/40 text-xs">Hệ thống quản lý nguồn hàng 90Land</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-white/50 uppercase mb-1.5">Tài khoản</label>
              <input
                type="text" value={loginUsername}
                onChange={e => setLoginUsername(e.target.value)}
                placeholder="admin hoặc sale"
                className="w-full px-3 py-2.5 text-sm bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-white/50 uppercase mb-1.5">Mật khẩu</label>
              <input
                type="password" value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-3 py-2.5 text-sm bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>
            <button type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-[#0d1535] rounded-xl font-bold transition-all shadow-lg shadow-amber-500/30 mt-2 text-sm tracking-wide">
              Đăng Nhập →
            </button>
          </form>
        </div>

        {/* Credit */}
        <div className="mt-8 text-center">
          <div className="text-[11px] text-white/25 tracking-widest uppercase mb-1">Developed by</div>
          <div className="text-sm font-black tracking-[0.15em] uppercase"
            style={{ background: "linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            HOANG TUAN PHAT
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen relative overflow-x-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col md:ml-[240px] ml-0 min-w-0 transition-all duration-300">
        <Topbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 bg-slate-50 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
