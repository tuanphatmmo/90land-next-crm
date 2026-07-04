"use client";
import { useState, useEffect } from "react";
import { Bell, Shield } from "lucide-react";

export default function Topbar({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("crm_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("crm_user");
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-[60px] px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div>
          <div className="text-[15px] font-bold text-[#1A2350] hidden sm:block">Dashboard tổng quan</div>
          <div className="text-xs text-slate-500">Hệ thống nguồn hàng 90Land</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white"></span>
        </button>
        
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-[#1A2350]">{user.name}</div>
              <div className="text-xs text-slate-500">{user.role === 'admin' ? 'Quản trị viên' : 'Sale'}</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#1A2350] text-amber-500 font-bold flex items-center justify-center text-xs uppercase shadow-sm">
              {user.name.charAt(0)}
            </div>
            <button
              onClick={handleLogout}
              className="ml-1 px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
