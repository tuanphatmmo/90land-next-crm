"use client";
import { Settings, User, Bell, Shield, PaintBucket } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#1A2350] flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-500" />
          Cài đặt hệ thống
        </h1>
        <p className="text-sm text-slate-500 mt-1">Tùy chỉnh thông tin cá nhân và cấu hình CRM của bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#1A2350] shadow-sm flex items-center gap-3">
            <User className="w-4 h-4 text-amber-500" /> Hồ sơ cá nhân
          </button>
          <button className="w-full text-left px-4 py-3 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:shadow-sm transition-all flex items-center gap-3">
            <Bell className="w-4 h-4 text-slate-400" /> Thông báo
          </button>
          <button className="w-full text-left px-4 py-3 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:shadow-sm transition-all flex items-center gap-3">
            <Shield className="w-4 h-4 text-slate-400" /> Bảo mật
          </button>
          <button className="w-full text-left px-4 py-3 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:shadow-sm transition-all flex items-center gap-3">
            <PaintBucket className="w-4 h-4 text-slate-400" /> Giao diện
          </button>
        </div>
        
        <div className="md:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-bold text-[#1A2350] border-b border-slate-100 pb-4">Thông tin cá nhân</h2>
            
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                VD
              </div>
              <div>
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                  Thay đổi Avatar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Họ và tên</label>
                <input type="text" defaultValue="Vũ Ngọc Đại" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Số điện thoại</label>
                <input type="text" defaultValue="0987654321" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 transition-colors" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                <input type="email" defaultValue="contact@90land.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 transition-colors" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button className="bg-[#1A2350] hover:bg-indigo-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors">
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
