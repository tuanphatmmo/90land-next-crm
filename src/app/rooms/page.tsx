"use client";
import { API_URL } from "@/lib/config";
import React, { useState, useEffect, useCallback, useMemo, useTransition } from "react";
import { Search, LayoutGrid, List, MapPin, Building, Image as ImageIcon, X, Plus, Trash2, Edit2, Eye, ExternalLink, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

const isValidUrl = (s: string) => {
  try { return s && s.startsWith('http'); } catch { return false; }
};

const UNSPLASH_IMAGES = [
  "1522708323590-d24dbb6b0267","1502672260266-1c1b56112fec","1484154218962-a1396b281d66",
  "1600596542815-ffad4c1539a9","1512917774080-9991f1c4c750","1493809842365-27be6396f7c9",
  "1564013799919-ab600027ffc6","1497366216548-37526070297c","1615873968403-89e068629265",
];

/* ─── MODAL COMPONENTS ─── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-base font-bold text-[#1A2350]">{title}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

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

/* ─── FAST CHECKBOX (Instant Visual Update) ─── */
function FastCheckbox({ checked, onChange }: { checked: boolean, onChange: () => void }) {
  const [localChecked, setLocalChecked] = useState(checked);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLocalChecked(checked);
  }, [checked]);

  return (
    <div 
      className="absolute top-3 left-3 z-30 flex items-center justify-center p-1.5 -m-1.5 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        setLocalChecked(!localChecked); // Urgent update -> instant tick
        startTransition(() => {
          onChange(); // Non-urgent update -> defer heavy parent re-render
        });
      }}
    >
      <div className={cn(
        "w-5 h-5 rounded border transition-colors flex items-center justify-center shadow-sm",
        localChecked ? "bg-amber-500 border-amber-500" : "bg-white/90 border-slate-300 hover:border-amber-400"
      )}>
        {localChecked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
      </div>
    </div>
  );
}

/* ─── BUILDING CARD (Memoized) ─── */
const BuildingCard = React.memo(({ b, isAdmin, isSelected, onSelect, onClick, onDelete }: any) => {
  const availRooms = b.Rooms?.filter((r: any) => r.status !== 'Đã thuê') || [];
  if (availRooms.length === 0) return null;
  const minPrice = Math.min(...availRooms.map((r: any) => r.price || 0));
  const priceStr = minPrice > 0 ? (minPrice / 1000000).toFixed(1) + 'tr' : '---';

  return (
    <div
      onClick={() => onClick(b)}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-amber-400 transition-all cursor-pointer group relative"
    >
      {/* Image */}
      <div className="h-40 relative overflow-hidden bg-slate-100">
        {isAdmin && (
          <FastCheckbox checked={isSelected} onChange={() => onSelect(b.id)} />
        )}
        {isValidUrl(b.image_link) ? (
          <iframe
            src={b.image_link.includes('/folders/')
              ? `https://drive.google.com/embeddedfolderview?id=${b.image_link.split('/folders/')[1].split('?')[0]}#grid`
              : b.image_link.includes('/file/d/')
                ? `https://drive.google.com/file/d/${b.image_link.split('/file/d/')[1].split('/')[0]}/preview`
                : b.image_link}
            className="w-full h-[300px] -mt-[50px] pointer-events-none"
            style={{ border: 'none' }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-${UNSPLASH_IMAGES[b.id % UNSPLASH_IMAGES.length]}?auto=format&fit=crop&q=80&w=600&h=400')`,
            backgroundSize: 'cover', backgroundPosition: 'center'
          }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Delete button - hover */}
        <button
          onClick={e => { e.stopPropagation(); onDelete(b); }}
          className="absolute top-2 left-2 bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-lg shadow transition-all opacity-0 group-hover:opacity-100 z-10"
          title="Xóa tòa nhà"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow z-10">
          HH {b.commission || '50%'}
        </div>
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
          <ImageIcon className="w-3 h-3" /> {b.Rooms?.length || 0}
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <div className="text-sm font-extrabold text-[#1A2350] truncate">{b.code}</div>
        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 truncate">
          <MapPin className="w-3 h-3 text-amber-500 shrink-0" /> {b.address}
        </div>
        {b.area && (
          <div className="inline-flex items-center mt-1 mb-2 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded-full border border-amber-200">
            Quận {b.area}
          </div>
        )}
        <div className="flex flex-wrap gap-1 mb-2">
          {b.depositOne && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded">Cọc: {b.depositOne}</span>}
          {b.contractDuration && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded">HĐ: {b.contractDuration}</span>}
          {b.petAllowed && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold rounded">Pet: {b.petAllowed}</span>}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Phòng trống</div>
            <div className="text-sm font-bold text-emerald-600">{availRooms.length} phòng</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Từ</div>
            <div className="text-sm font-bold text-[#1A2350]">{priceStr}</div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.b === nextProps.b && prevProps.isSelected === nextProps.isSelected;
});

/* ─── MAIN PAGE ─── */
export default function RoomsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [view, setView] = useState<"grid" | "list">("grid");
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterPrice, setFilterPrice] = useState("");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkEditHH, setShowBulkEditHH] = useState(false);
  const [bulkHHValue, setBulkHHValue] = useState("");
  const [bulkAreaValue, setBulkAreaValue] = useState("");
  const [bulkDepositOne, setBulkDepositOne] = useState("");
  const [bulkContract, setBulkContract] = useState("");
  const [bulkPet, setBulkPet] = useState("");

  const [displayCount, setDisplayCount] = useState(24);

  useEffect(() => {
    setDisplayCount(24);
  }, [search, filterArea, filterPrice]);

  const isAdmin = currentUser?.role === 'admin';

  // Image viewer
  const [viewRoomImage, setViewRoomImage] = useState<any>(null);
  // Room detail modal
  const [viewRoomDetail, setViewRoomDetail] = useState<any>(null);
  // Modals
  const [showAddBuilding, setShowAddBuilding] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showEditBuilding, setShowEditBuilding] = useState(false);
  const [showEditRoom, setShowEditRoom] = useState<any>(null);

  // Add Building form
  const [newBuildingCode, setNewBuildingCode] = useState("");
  const [newBuildingAddress, setNewBuildingAddress] = useState("");
  const [newBuildingArea, setNewBuildingArea] = useState("Hà Nội");
  const [newBuildingImage, setNewBuildingImage] = useState("");
  const [newBuildingCommission, setNewBuildingCommission] = useState("50%");
  const [newBuildingDepositOne, setNewBuildingDepositOne] = useState("");
  const [newBuildingContract, setNewBuildingContract] = useState("");
  const [newBuildingPet, setNewBuildingPet] = useState("");

  // Add Room form
  const [newRoomNum, setNewRoomNum] = useState("");
  const [newRoomPrice, setNewRoomPrice] = useState("");
  const [newRoomType, setNewRoomType] = useState("");
  const [newRoomArea, setNewRoomArea] = useState("");
  const [newRoomStatus, setNewRoomStatus] = useState("Trống");
  const [newRoomFurniture, setNewRoomFurniture] = useState("");
  const [newRoomServices, setNewRoomServices] = useState("");

  // Edit Room
  const [editPrice, setEditPrice] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editType, setEditType] = useState("");
  const [editFurniture, setEditFurniture] = useState("");
  const [editServices, setEditServices] = useState("");

  // Edit Building
  const [showEditBuildingModal, setShowEditBuildingModal] = useState(false);
  const [editBuildingAddress, setEditBuildingAddress] = useState("");
  const [editBuildingArea, setEditBuildingArea] = useState("");
  const [editBuildingCommission, setEditBuildingCommission] = useState("");
  const [editBuildingImage, setEditBuildingImage] = useState("");
  const [editBuildingDepositOne, setEditBuildingDepositOne] = useState("");
  const [editBuildingContract, setEditBuildingContract] = useState("");
  const [editBuildingPet, setEditBuildingPet] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("crm_user");
    if (saved) setCurrentUser(JSON.parse(saved));

    axios.get(`${API_URL}/buildings`).then(res => {
      setBuildings(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredBuildings = useMemo(() => {
    return buildings.filter(b => {
      const matchSearch = search ? (b.address?.toLowerCase().includes(search.toLowerCase()) || b.code?.toLowerCase().includes(search.toLowerCase())) : true;
      const matchArea = filterArea ? b.area?.toLowerCase().includes(filterArea.toLowerCase()) : true;
      let matchPrice = true;
      if (filterPrice) {
        const availRooms = b.Rooms?.filter((r: any) => r.status !== 'Đã thuê') || [];
        if (availRooms.length === 0) { matchPrice = false; }
        else {
          const minP = Math.min(...availRooms.map((r: any) => r.price || 0));
          if (filterPrice === 'lt3') matchPrice = minP > 0 && minP < 3_000_000;
          else if (filterPrice === '3to5') matchPrice = minP >= 3_000_000 && minP <= 5_000_000;
          else if (filterPrice === '5to8') matchPrice = minP > 5_000_000 && minP <= 8_000_000;
          else if (filterPrice === '8to12') matchPrice = minP > 8_000_000 && minP <= 12_000_000;
          else if (filterPrice === 'gt12') matchPrice = minP > 12_000_000;
        }
      }
      return matchSearch && matchArea && matchPrice;
    });
  }, [buildings, search, filterArea, filterPrice]);

  const totalRooms = useMemo(() => {
    return filteredBuildings.reduce((sum, b) => sum + (b.Rooms?.filter((r: any) => r.status !== 'Đã thuê').length || 0), 0);
  }, [filteredBuildings]);

  const totalBuildingsWithRooms = useMemo(() => {
    return filteredBuildings.filter(b => (b.Rooms?.filter((r: any) => r.status !== 'Đã thuê').length || 0) > 0).length;
  }, [filteredBuildings]);

  const areas = useMemo(() => {
    return [...new Set(buildings.map(b => b.area).filter(Boolean))];
  }, [buildings]);

  /* ─── HANDLERS ─── */
  const handleAddBuilding = async () => {
    if (!newBuildingCode || !newBuildingAddress) return alert('Vui lòng nhập đủ Mã tòa và Địa chỉ!');
    try {
      const res = await axios.post(`${API_URL}/buildings`, {
        code: newBuildingCode, name: '', address: newBuildingAddress,
        area: newBuildingArea, source: 'manual',
        commission: newBuildingCommission, image_link: newBuildingImage || '',
        depositOne: newBuildingDepositOne, contractDuration: newBuildingContract, petAllowed: newBuildingPet
      });
      setBuildings([...buildings, { ...res.data.data, Rooms: [] }]);
      setShowAddBuilding(false);
      setNewBuildingCode(''); setNewBuildingAddress(''); setNewBuildingImage('');
      setNewBuildingDepositOne(''); setNewBuildingContract(''); setNewBuildingPet('');
    } catch { alert('Lỗi thêm tòa nhà!'); }
  };

  const handleAddRoom = async () => {
    if (!newRoomNum || !newRoomPrice) return alert('Vui lòng nhập số phòng và giá!');
    try {
      const res = await axios.post(`${API_URL}/rooms`, {
        BuildingId: selectedBuilding.id, room_num: newRoomNum,
        price: parseFloat(newRoomPrice), type: newRoomType,
        area_m2: newRoomArea, status: newRoomStatus,
        furniture: newRoomFurniture, services: newRoomServices
      });
      const newRoom = res.data.data;
      const updated = { ...selectedBuilding, Rooms: [...(selectedBuilding.Rooms || []), newRoom] };
      setSelectedBuilding(updated);
      setBuildings(buildings.map(b => b.id === updated.id ? updated : b));
      setShowAddRoom(false);
      setNewRoomNum(''); setNewRoomPrice(''); setNewRoomType(''); setNewRoomArea('');
      setNewRoomFurniture(''); setNewRoomServices('');
    } catch { alert('Lỗi thêm phòng!'); }
  };

  const handleDeleteBuilding = useCallback(async (b: any) => {
    if (!confirm(`Xóa tòa "${b.code}" sẽ xóa toàn bộ phòng bên trong! Chắc chắn?`)) return;
    try {
      await axios.delete(`${API_URL}/buildings/${b.id}`);
      setBuildings(prev => prev.filter((item: any) => item.id !== b.id));
      setSelectedBuilding((prev: any) => prev?.id === b.id ? null : prev);
    } catch { alert('Lỗi xóa tòa nhà!'); }
  }, []);

  const handleBulkEditHH = async () => {
    if (!selectedIds.length) return;
    
    const updateData: any = {};
    if (bulkHHValue.trim() !== '') updateData.commission = bulkHHValue;
    if (bulkAreaValue.trim() !== '') updateData.area = bulkAreaValue;
    if (bulkDepositOne.trim() !== '') updateData.depositOne = bulkDepositOne;
    if (bulkContract.trim() !== '') updateData.contractDuration = bulkContract;
    if (bulkPet.trim() !== '') updateData.petAllowed = bulkPet;

    if (Object.keys(updateData).length === 0) return alert('Vui lòng nhập ít nhất 1 trường cần sửa!');

    try {
      await axios.put(`${API_URL}/buildings/bulk-update`, { ids: selectedIds, updateData });
      setBuildings(buildings.map(b => selectedIds.includes(b.id) ? { ...b, ...updateData } : b));
      setShowBulkEditHH(false);
      setSelectedIds([]);
      setBulkHHValue(""); setBulkAreaValue(""); setBulkDepositOne(""); setBulkContract(""); setBulkPet("");
    } catch { alert('Lỗi cập nhật đồng loạt!'); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Xóa ${selectedIds.length} tòa nhà đã chọn? Mọi phòng bên trong sẽ bị xóa vĩnh viễn!`)) return;
    try {
      await axios.post(`${API_URL}/buildings/bulk-delete`, { ids: selectedIds });
      setBuildings(buildings.filter(b => !selectedIds.includes(b.id)));
      setSelectedIds([]);
      setSelectedBuilding(null);
    } catch { alert('Lỗi xóa đồng loạt!'); }
  };

  const handleDeleteRoom = async (room: any) => {
    if (!confirm(`Xóa phòng ${room.room_num}?`)) return;
    try {
      await axios.delete(`${API_URL}/rooms/${room.id}`);
      const updated = { ...selectedBuilding, Rooms: selectedBuilding.Rooms.filter((r: any) => r.id !== room.id) };
      setSelectedBuilding(updated);
      setBuildings(buildings.map(b => b.id === updated.id ? updated : b));
    } catch { alert('Lỗi xóa phòng!'); }
  };

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, []);

  const handleEditRoom = async () => {
    try {
      await axios.put(`${API_URL}/rooms/${showEditRoom.id}`, {
        price: parseFloat(editPrice), status: editStatus, type: editType,
        furniture: editFurniture, services: editServices
      });
      const updated = {
        ...selectedBuilding,
        Rooms: selectedBuilding.Rooms.map((r: any) => r.id === showEditRoom.id
          ? { ...r, price: parseFloat(editPrice), status: editStatus, type: editType, furniture: editFurniture, services: editServices }
          : r)
      };
      setSelectedBuilding(updated);
      setBuildings(buildings.map(b => b.id === updated.id ? updated : b));
      setShowEditRoom(null);
    } catch { alert('Lỗi cập nhật phòng!'); }
  };

  const handleEditBuilding = async () => {
    try {
      await axios.put(`${API_URL}/buildings/${selectedBuilding.id}`, {
        address: editBuildingAddress,
        area: editBuildingArea,
        commission: editBuildingCommission,
        image_link: editBuildingImage,
        depositOne: editBuildingDepositOne,
        contractDuration: editBuildingContract,
        petAllowed: editBuildingPet
      });
      const updated = { ...selectedBuilding, address: editBuildingAddress, area: editBuildingArea, commission: editBuildingCommission, image_link: editBuildingImage, depositOne: editBuildingDepositOne, contractDuration: editBuildingContract, petAllowed: editBuildingPet };
      setSelectedBuilding(updated);
      setBuildings(buildings.map(b => b.id === updated.id ? { ...b, ...updated } : b));
      setShowEditBuildingModal(false);
    } catch { alert('Lỗi cập nhật tòa nhà!'); }
  };

  /* ─── ROOM ROW ─── */
  const RoomRow = ({ room }: { room: any }) => {
    const statusColor =
      room.status === 'Trống' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
      room.status === 'Đã cọc' ? 'bg-amber-50 text-amber-700 border-amber-200' :
      'bg-red-50 text-red-700 border-red-200';

    return (
      <div className="flex flex-col gap-1 p-3 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all group">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => setViewRoomDetail(room)}
          >
            <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
              {room.room_num}
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1A2350]">Phòng {room.room_num}</div>
              <div className="text-xs text-slate-500">{room.type || 'Phòng thường'} {room.area_m2 ? `· ${room.area_m2}` : ''}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>{room.status}</span>
            <div className="text-sm font-bold text-[#1A2350]">{room.price ? (room.price / 1000000).toFixed(1) + 'tr' : '---'}</div>
            <div className="flex gap-1">
              {/* Xem chi tiết */}
              <button
                onClick={() => setViewRoomDetail(room)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                title="Xem chi tiết phòng"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              {/* Xem ảnh */}
              <button
                onClick={() => setViewRoomImage(room)}
                className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors"
                title="Xem ảnh phòng"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
              {/* Sửa/Xóa - chỉ admin */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => { setShowEditRoom(room); setEditPrice(String(room.price)); setEditStatus(room.status); setEditType(room.type || ''); setEditFurniture(room.furniture || ''); setEditServices(room.services || ''); }}
                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                    title="Sửa phòng"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(room)}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    title="Xóa phòng"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Chi tiết nội thất / dịch vụ */}
        {(room.furniture || room.services) && (
          <div className="ml-12 flex flex-col gap-1 mt-1">
            {room.furniture && (
              <div className="flex items-start gap-1 text-[11px] text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                <span className="shrink-0">🛋️</span>
                <span className="font-medium shrink-0 mr-1">Nội thất:</span>
                <span className="line-clamp-1 break-words leading-tight">{room.furniture}</span>
              </div>
            )}
            {room.services && (
              <div className="flex items-start gap-1 text-[11px] text-slate-600 bg-blue-50 px-2 py-1 rounded-lg">
                <span className="shrink-0">⚡</span>
                <span className="font-medium shrink-0 mr-1">Dịch vụ:</span>
                <span className="line-clamp-1 break-words leading-tight">{room.services}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* ─── TOOLBAR ─── */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" placeholder="Tìm mã tòa, địa chỉ..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

        <select value={filterArea} onChange={e => setFilterArea(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 bg-white">
          <option value="">Tất cả khu vực</option>
          {areas.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <select value={filterPrice} onChange={e => setFilterPrice(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 bg-white">
          <option value="">Tất cả mức giá</option>
          <option value="lt3">Dưới 3 triệu</option>
          <option value="3to5">3 – 5 triệu</option>
          <option value="5to8">5 – 8 triệu</option>
          <option value="8to12">8 – 12 triệu</option>
          <option value="gt12">Trên 12 triệu</option>
        </select>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1">
          <button onClick={() => setView("grid")} className={cn("p-1.5 rounded-md transition-colors", view === "grid" ? "bg-white text-[#1A2350] shadow-sm" : "text-slate-400")}>
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button onClick={() => setView("list")} className={cn("p-1.5 rounded-md transition-colors", view === "list" ? "bg-white text-[#1A2350] shadow-sm" : "text-slate-400")}>
            <List className="w-4 h-4" />
          </button>
        </div>


        {/* Chỉ hiện Thêm Tòa khi isAdmin */}
        {isAdmin && (
          <>
            <button
              onClick={() => {
                if (selectedIds.length === filteredBuildings.length) {
                  setSelectedIds([]);
                } else {
                  setSelectedIds(filteredBuildings.map(b => b.id));
                }
              }}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              {selectedIds.length === filteredBuildings.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
            <button
              onClick={() => setShowAddBuilding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Thêm Tòa Nhà
            </button>
          </>
        )}
      </div>

      <div className="text-xs text-slate-500 px-1">
        Hiển thị <strong>{totalRooms}</strong> phòng trống từ <strong>{totalBuildingsWithRooms}</strong> tòa
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && isAdmin && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1A2350] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
          <div className="text-sm font-semibold">Đã chọn {selectedIds.length} tòa</div>
          <div className="flex gap-2">
            <button onClick={() => setShowBulkEditHH(true)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors">
              Sửa đồng loạt
            </button>
            <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Xóa {selectedIds.length} tòa
            </button>
            <button onClick={() => setSelectedIds([])} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── GRID ─── */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Đang tải dữ liệu...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBuildings.slice(0, displayCount).map(b => (
              <BuildingCard 
                key={b.id} 
                b={b} 
                isAdmin={isAdmin} 
                isSelected={selectedIds.includes(b.id)}
                onSelect={toggleSelect}
                onClick={setSelectedBuilding}
                onDelete={handleDeleteBuilding}
              />
            ))}
          </div>
          {displayCount < filteredBuildings.length && (
            <div className="text-center mt-8 pb-4">
              <button 
                onClick={() => setDisplayCount(prev => prev + 24)} 
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm"
              >
                Hiển thị thêm... ({filteredBuildings.length - displayCount} tòa)
              </button>
            </div>
          )}
        </>
      )}

      {/* ─── BUILDING DETAIL MODAL ─── */}
      {selectedBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-[#1A2350]">{selectedBuilding.code}</div>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <MapPin className="w-3.5 h-3.5" /> {selectedBuilding.address}
                    {selectedBuilding.area && (
                      <span className="ml-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">
                        Q.{selectedBuilding.area}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => { setShowAddRoom(true); }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Thêm phòng
                    </button>
                    <button
                      onClick={() => {
                        setEditBuildingAddress(selectedBuilding.address || '');
                        setEditBuildingArea(selectedBuilding.area || '');
                        setEditBuildingCommission(selectedBuilding.commission || '50%');
                        setEditBuildingImage(selectedBuilding.image_link || '');
                        setEditBuildingDepositOne(selectedBuilding.depositOne || '');
                        setEditBuildingContract(selectedBuilding.contractDuration || '');
                        setEditBuildingPet(selectedBuilding.petAllowed || '');
                        setShowEditBuildingModal(true);
                      }}
                      className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                      title="Sửa thông tin tòa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBuilding(selectedBuilding)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      title="Xóa tòa nhà"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button onClick={() => setSelectedBuilding(null)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Room list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {(selectedBuilding.Rooms || []).length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Home className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  Chưa có phòng nào. Bấm "Thêm phòng" để bắt đầu.
                </div>
              ) : (
                (selectedBuilding.Rooms || []).map((room: any) => <RoomRow key={room.id} room={room} />)
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: THÊM TÒA NHÀ ─── */}
      {showAddBuilding && (
        <Modal title="🏢 Thêm Tòa Nhà Mới" onClose={() => setShowAddBuilding(false)}>
          <InputField label="Mã Tòa *" value={newBuildingCode} onChange={setNewBuildingCode} placeholder="VD: MT999" />
          <InputField label="Địa chỉ *" value={newBuildingAddress} onChange={setNewBuildingAddress} placeholder="VD: Số 10 Ngõ 5 Láng Hạ" />
          <InputField label="Khu vực" value={newBuildingArea} onChange={setNewBuildingArea} placeholder="VD: Đống Đa, Hà Nội" />
          <InputField label="Hoa hồng" value={newBuildingCommission} onChange={setNewBuildingCommission} placeholder="VD: 50%" />
          <InputField label="Đóng 1 cọc 1 (Có/Không)" value={newBuildingDepositOne} onChange={setNewBuildingDepositOne} placeholder="VD: Có" />
          <InputField label="Hợp đồng bao lâu" value={newBuildingContract} onChange={setNewBuildingContract} placeholder="VD: 6 tháng - 1 năm" />
          <InputField label="Được nuôi pet không" value={newBuildingPet} onChange={setNewBuildingPet} placeholder="VD: Có, cam kết giữ vệ sinh" />
          <InputField label="Link ảnh Google Drive (Tùy chọn)" value={newBuildingImage} onChange={setNewBuildingImage} placeholder="https://drive.google.com/..." />
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowAddBuilding(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleAddBuilding} className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors">
              ✓ Thêm Tòa Nhà
            </button>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: THÊM PHÒNG ─── */}
      {showAddRoom && selectedBuilding && (
        <Modal title={`🚪 Thêm Phòng — ${selectedBuilding.code}`} onClose={() => setShowAddRoom(false)}>
          <InputField label="Số phòng *" value={newRoomNum} onChange={setNewRoomNum} placeholder="VD: 301" />
          <InputField label="Giá thuê (VNĐ) *" value={newRoomPrice} onChange={setNewRoomPrice} placeholder="VD: 5000000" type="number" />
          <InputField label="Loại phòng" value={newRoomType} onChange={setNewRoomType} placeholder="VD: Studio, 1 ngủ 1 khách..." />
          <InputField label="Diện tích" value={newRoomArea} onChange={setNewRoomArea} placeholder="VD: 30m2" />
          <InputField label="🛋️ Nội thất" value={newRoomFurniture} onChange={setNewRoomFurniture} placeholder="VD: Đầy đủ nội thất, Cơ bản, Không nội thất" />
          <InputField label="⚡ Dịch vụ" value={newRoomServices} onChange={setNewRoomServices} placeholder="VD: Điện 3.5k, Nước 80k/khối, Wifi miễn phí" />
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Trạng thái</label>
            <select value={newRoomStatus} onChange={e => setNewRoomStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-white">
              <option value="Trống">🟢 Trống</option>
              <option value="Đã cọc">🟡 Đã cọc</option>
              <option value="Đã thuê">🔴 Đã thuê</option>
            </select>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowAddRoom(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleAddRoom} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors">
              ✓ Thêm Phòng
            </button>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: SỬA PHÒNG ─── */}
      {showEditRoom && (
        <Modal title={`✏️ Sửa Phòng ${showEditRoom.room_num}`} onClose={() => setShowEditRoom(null)}>
          <InputField label="Giá thuê (VNĐ)" value={editPrice} onChange={setEditPrice} placeholder="VD: 5000000" type="number" />
          <InputField label="Loại phòng" value={editType} onChange={setEditType} placeholder="VD: Studio, 1 ngủ 1 khách..." />
          <InputField label="🛋️ Nội thất" value={editFurniture} onChange={setEditFurniture} placeholder="VD: Đầy đủ nội thất, Cơ bản, Không nội thất" />
          <InputField label="⚡ Dịch vụ" value={editServices} onChange={setEditServices} placeholder="VD: Điện 3.5k, Nước 80k/khối, Wifi miễn phí" />
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Trạng thái</label>
            <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 bg-white">
              <option value="Trống">🟢 Trống</option>
              <option value="Đã cọc">🟡 Đã cọc</option>
              <option value="Đã thuê">🔴 Đã thuê</option>
              <option value="Sắp trống">🟠 Sắp trống</option>
            </select>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowEditRoom(null)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleEditRoom} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
              ✓ Lưu Thay Đổi
            </button>
          </div>
        </Modal>
      )}
      {/* MODAL: XEM ẢNH PHÒNG */}
      {viewRoomImage && (
        <Modal title={`🖼️ Ảnh Phòng ${viewRoomImage.room_num}`} onClose={() => setViewRoomImage(null)}>
          {isValidUrl(selectedBuilding?.image_link) ? (
            <div className="w-full h-[60vh] rounded-xl overflow-hidden bg-slate-100">
              <iframe
                src={selectedBuilding.image_link.includes('/folders/')
                  ? `https://drive.google.com/embeddedfolderview?id=${selectedBuilding.image_link.split('/folders/')[1].split('?')[0]}#grid`
                  : selectedBuilding.image_link.includes('/file/d/')
                    ? `https://drive.google.com/file/d/${selectedBuilding.image_link.split('/file/d/')[1].split('/')[0]}/preview`
                    : selectedBuilding.image_link}
                className="w-full h-full"
                style={{ border: 'none' }}
                title="Ảnh phòng"
              />
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <div className="text-slate-500 text-sm">Chưa có link ảnh cho tòa nhà này</div>
            </div>
          )}
          
          <div className="mt-4 flex gap-3">
             {isValidUrl(selectedBuilding?.image_link) && (
               <a 
                 href={selectedBuilding.image_link} 
                 target="_blank" 
                 rel="noreferrer"
                 className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
               >
                 <ExternalLink className="w-4 h-4" /> Mở trong tab mới
               </a>
             )}
            <button onClick={() => setViewRoomImage(null)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
              Đóng
            </button>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: CHI TIẾT PHÒNG ─── */}
      {viewRoomDetail && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#1A2350] to-[#2d3a7c] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-base font-extrabold">
                  {viewRoomDetail.room_num}
                </div>
                <div>
                  <div className="text-base font-bold">Phòng {viewRoomDetail.room_num}</div>
                  <div className="text-xs text-white/70">{selectedBuilding?.code} · {selectedBuilding?.address}</div>
                </div>
              </div>
              <button onClick={() => setViewRoomDetail(null)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status badge */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className={`text-sm font-bold px-3 py-1 rounded-full border ${
                viewRoomDetail.status === 'Trống' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                viewRoomDetail.status === 'Đã cọc' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                viewRoomDetail.status === 'Sắp trống' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                {viewRoomDetail.status === 'Trống' ? '🟢' : viewRoomDetail.status === 'Đã cọc' ? '🟡' : viewRoomDetail.status === 'Sắp trống' ? '🟠' : '🔴'} {viewRoomDetail.status}
              </span>
              <div className="text-xl font-extrabold text-[#1A2350]">
                {viewRoomDetail.price ? (viewRoomDetail.price / 1000000).toFixed(1) + ' triệu/tháng' : '---'}
              </div>
            </div>

            {/* Detail rows */}
            <div className="p-5 space-y-3">
              {[
                { icon: '🏠', label: 'Loại phòng', value: viewRoomDetail.type || 'Phòng thường' },
                { icon: '📐', label: 'Diện tích', value: viewRoomDetail.area_m2 || '---' },
                { icon: '🏢', label: 'Hoa hồng', value: selectedBuilding?.commission || '---' },
                { icon: '💰', label: 'Đóng 1 cọc 1', value: selectedBuilding?.depositOne || 'Chưa có thông tin' },
                { icon: '📝', label: 'Hợp đồng', value: selectedBuilding?.contractDuration || 'Chưa có thông tin' },
                { icon: '🐕', label: 'Thú cưng (Pet)', value: selectedBuilding?.petAllowed || 'Chưa có thông tin' },
                { icon: '🛋️', label: 'Nội thất', value: viewRoomDetail.furniture || 'Không có thông tin' },
                { icon: '⚡', label: 'Dịch vụ', value: viewRoomDetail.services || 'Không có thông tin' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-base shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase mb-0.5">{label}</div>
                    <div className="text-sm font-semibold text-slate-700 break-words whitespace-pre-wrap">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer actions */}
            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={() => { setViewRoomDetail(null); setViewRoomImage(viewRoomDetail); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-sm font-semibold transition-colors"
              >
                <ImageIcon className="w-4 h-4" /> Xem ảnh
              </button>
              {isAdmin && (
                <button
                  onClick={() => {
                    setViewRoomDetail(null);
                    setShowEditRoom(viewRoomDetail);
                    setEditPrice(String(viewRoomDetail.price));
                    setEditStatus(viewRoomDetail.status);
                    setEditType(viewRoomDetail.type || '');
                    setEditFurniture(viewRoomDetail.furniture || '');
                    setEditServices(viewRoomDetail.services || '');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Chỉnh sửa
                </button>
              )}
              <button
                onClick={() => setViewRoomDetail(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: SỬA TÒA NHÀ ─── */}
      {showEditBuildingModal && selectedBuilding && (
        <Modal title={`🏢 Sửa Thông Tin — ${selectedBuilding.code}`} onClose={() => setShowEditBuildingModal(false)}>
          <InputField label="Địa chỉ" value={editBuildingAddress} onChange={setEditBuildingAddress} placeholder="VD: Số 10 Ngõ 5 Láng Hạ" />
          <InputField label="🗺️ Quận / Khu vực" value={editBuildingArea} onChange={setEditBuildingArea} placeholder="VD: Đống Đa, Hai Bà Trưng..." />
          <InputField label="Hoa hồng" value={editBuildingCommission} onChange={setEditBuildingCommission} placeholder="VD: 50%" />
          <InputField label="Đóng 1 cọc 1 (Có/Không)" value={editBuildingDepositOne} onChange={setEditBuildingDepositOne} placeholder="VD: Có" />
          <InputField label="Hợp đồng bao lâu" value={editBuildingContract} onChange={setEditBuildingContract} placeholder="VD: 6 tháng - 1 năm" />
          <InputField label="Được nuôi pet không" value={editBuildingPet} onChange={setEditBuildingPet} placeholder="VD: Có, cam kết giữ vệ sinh" />
          <InputField label="Link ảnh Google Drive" value={editBuildingImage} onChange={setEditBuildingImage} placeholder="https://drive.google.com/..." />
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowEditBuildingModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleEditBuilding} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
              ✓ Lưu Thay Đổi
            </button>
          </div>
        </Modal>
      )}

      {/* ─── MODAL: SỬA ĐỒNG LOẠT ─── */}
      {showBulkEditHH && (
        <Modal title="Sửa Thông Tin Đồng Loạt" onClose={() => setShowBulkEditHH(false)}>
          <div className="mb-4 text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
            Bạn đang sửa thông tin cho <strong>{selectedIds.length}</strong> tòa nhà. <br/>
            <span className="text-xs text-slate-500">Bỏ trống ô nào thì ô đó sẽ không bị thay đổi.</span>
          </div>
          <InputField label="Khu vực / Quận" value={bulkAreaValue} onChange={setBulkAreaValue} placeholder="VD: Đống Đa" />
          <InputField label="Mức Hoa Hồng" value={bulkHHValue} onChange={setBulkHHValue} placeholder="VD: 50%" />
          <InputField label="Đóng 1 cọc 1 (Có/Không)" value={bulkDepositOne} onChange={setBulkDepositOne} placeholder="VD: Có" />
          <InputField label="Hợp đồng bao lâu" value={bulkContract} onChange={setBulkContract} placeholder="VD: 6 tháng - 1 năm" />
          <InputField label="Được nuôi pet không" value={bulkPet} onChange={setBulkPet} placeholder="VD: Có, cam kết giữ vệ sinh" />
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowBulkEditHH(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleBulkEditHH} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors">
              ✓ Lưu Tất Cả
            </button>
          </div>
        </Modal>
      )}
    </div>

  );
}
