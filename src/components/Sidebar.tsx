"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building, PhoneCall, FileSpreadsheet, Users, Settings, LogOut, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { section: "TỔNG QUAN", roles: ["admin", "sale"] },
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "sale"] },
  { name: "Phòng trống", href: "/rooms", icon: Building, badge: "12", roles: ["admin", "sale"] },
  { section: "ADMIN", roles: ["admin"] },
  { name: "Nhập từ Zalo", href: "/zalo", icon: PhoneCall, badge: "3", roles: ["admin"] },
  { name: "Google Sheets", href: "/sheets", icon: FileSpreadsheet, roles: ["admin"] },
  { name: "Quản lý mã tòa", href: "/buildings", icon: FileText, roles: ["admin"] },
  { section: "BÁO CÁO", roles: ["admin"] },
  { name: "Góc nhìn sếp", href: "/admin", icon: Users, roles: ["admin"] },
  { name: "Cài đặt", href: "/settings", icon: Settings, roles: ["admin"] },
];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: any }) {
  const pathname = usePathname();
  const [role, setRole] = useState("admin");

  useEffect(() => {
    // Read from localStorage (saved by login)
    const user = JSON.parse(localStorage.getItem("crm_user") || "{}");
    setRole(user.role || "sale");
  }, []);

  return (
    <aside className={cn(
      "w-[240px] bg-[#0d1535] fixed top-0 left-0 bottom-0 z-50 flex flex-col text-slate-300 transition-transform duration-300 ease-in-out md:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center text-[#1A2350] font-bold">
            90
          </div>
          <div>
            <div className="text-lg font-extrabold text-white">
              <span className="text-amber-500">90</span>LAND
            </div>
            <div className="text-[10px] text-white/40 tracking-wider">Nguồn Phòng</div>
          </div>
        </div>
        {/* Nút đóng Sidebar trên mobile */}
        <button onClick={() => setIsOpen?.(false)} className="md:hidden p-2 text-white/50 hover:bg-white/10 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.filter(item => item.roles.includes(role)).map((item, idx) => {
          if (item.section) {
            return (
              <div key={idx} className="text-[10px] font-bold text-white/30 tracking-widest px-2 mt-4 mb-2">
                {item.section}
              </div>
            );
          }
          const active = pathname === item.href;
          const Icon = item.icon!;
          return (
            <Link
              key={item.name}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-amber-500/15 text-amber-500" : "hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
              {item.badge && (
                <span className={cn(
                  "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  active ? "bg-amber-500 text-[#0d1535]" : "bg-red-500 text-white"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button 
          onClick={() => { localStorage.removeItem("crm_user"); window.location.reload(); }}
          className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg mb-3 hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-[#1A2350] font-bold flex items-center justify-center text-xs uppercase">
            {role[0]}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-white truncate">{JSON.parse(localStorage.getItem("crm_user") || "{}").name || "User"}</div>
            <div className="text-[10px] text-white/40 uppercase">{role === "admin" ? "Quản trị viên" : "Sale"}</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/5 text-center">
          <div className="text-[9px] text-white/20 tracking-wider">Developed by</div>
          <div className="text-[10px] font-bold text-white/30 tracking-wide">HOANG TUAN PHAT</div>
        </div>
      </div>
    </aside>
  );
}
