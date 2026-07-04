"use client";
import { API_URL } from "@/lib/config";
import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import axios from "axios";

export default function SheetsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: string, message: string, added?: number } | null>(null);
  const [sheetUrl, setSheetUrl] = useState("https://docs.google.com/spreadsheets/d/1-eAgUNaN6gw2H0ED5yzmmcFPso7XkdUMTUh9QX9RKiU/edit?gid=795947349#gid=795947349");
  const [buildingCode, setBuildingCode] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/import-excel`, formData);
      setResult({ status: "ok", message: res.data.message, added: res.data.added });
    } catch (error: any) {
      setResult({ status: "error", message: error.response?.data?.error || error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 max-w-3xl">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="text-sm font-bold text-[#1A2350]">Nhập dữ liệu phòng từ Excel</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Hỗ trợ file KAY HOME - Danh sách phòng trống.xlsx</div>
        </div>
        <div className="p-6">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Google Sheets Link (Cấp quyền: Bất kỳ ai có liên kết)</label>
              <input 
                type="text" 
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..." 
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#1A2350] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Mã Tòa (Tùy chọn)</label>
              <input 
                type="text" 
                value={buildingCode}
                onChange={(e) => setBuildingCode(e.target.value.toUpperCase())}
                placeholder="VD: KAYHOME" 
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#1A2350] transition-colors"
              />
              <p className="text-[10px] text-slate-400 mt-1">Nếu nhập, tất cả phòng trong link này sẽ dùng mã tòa này.</p>
            </div>
          </div>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              accept=".xlsx,.xls" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <FileSpreadsheet className="w-12 h-12 text-slate-400 mb-3" />
              <div className="text-sm font-semibold text-[#1A2350]">
                {file ? file.name : "Chọn file Excel hoặc kéo thả vào đây"}
              </div>
              <div className="text-xs text-slate-500 mt-1">Định dạng hỗ trợ: .xlsx, .xls</div>
            </label>
          </div>

          {result && (
            <div className={
              "mt-4 p-4 rounded-lg flex items-start gap-3 " + 
              (result.status === 'ok' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200')
            }>
              {result.status === 'ok' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
              <div>
                <div className={
                  "text-sm font-semibold " + 
                  (result.status === 'ok' ? 'text-green-800' : 'text-red-800')
                }>{result.message}</div>
                {result.added !== undefined && <div className="text-xs text-green-600 mt-1">Đã thêm/cập nhật: {result.added} phòng trống</div>}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button 
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setResult(null);
                try {
                  const res = await axios.post(`${API_URL}/sync-sheets`, { sheetUrl, buildingCode: buildingCode || undefined });
                  setResult({ status: "ok", message: res.data.message, added: res.data.added });
                } catch (error: any) {
                  setResult({ status: "error", message: error.response?.data?.error || error.message });
                } finally {
                  setLoading(false);
                }
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Đồng bộ từ Google Sheets
            </button>
            <button 
              disabled={!file || loading}
              onClick={handleUpload}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1A2350] text-white rounded-lg text-sm font-semibold hover:bg-indigo-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Bắt đầu Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
