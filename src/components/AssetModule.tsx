import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  Truck,
  Server,
  Layers,
  Cpu,
  RefreshCw,
  Trash2,
  Edit3,
  Calendar,
  DollarSign,
  User,
  MapPin,
  FileSpreadsheet,
  ArrowRightLeft,
  ShieldCheck,
  Zap,
  Info,
  X
} from 'lucide-react';
import { Asset, AssetCategory, AssetStatus, AssetLoanLog } from '../types';
import { ispService } from '../services/ispService';

export interface AssetModuleProps {
  tenantId: string;
  key?: React.Key;
}

const CATEGORY_MAP: Record<AssetCategory, { label: string; icon: any; color: string; bg: string }> = {
  core_network: { label: 'Core Network & OLT', icon: Server, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  distribution_odp: { label: 'Distribusi & ODP/ODC', icon: Layers, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' },
  customer_cpe: { label: 'CPE / ONT Pelanggan', icon: Cpu, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  technician_tools: { label: 'Alat Kerja & Splicer', icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  operational_vehicle: { label: 'Kendaraan Lapangan', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  office_facility: { label: 'Fasilitas Kantor & POP', icon: Boxes, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
};

const STATUS_MAP: Record<AssetStatus, { label: string; color: string; bg: string; dot: string }> = {
  available: { label: 'Tersedia / Standby', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  in_use: { label: 'Sedang Digunakan', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  deployed_to_customer: { label: 'Terpasang di Pelanggan', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', dot: 'bg-indigo-500' },
  in_maintenance: { label: 'Dalam Servis / Kalibrasi', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  broken: { label: 'Rusak', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', dot: 'bg-rose-500' },
  disposed: { label: 'Afkir / Dihapus', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-300', dot: 'bg-slate-400' },
};

const INITIAL_MOCK_ASSETS: Asset[] = [
  {
    id: 'ast-001',
    tenantId: 'fiber_ops_prod',
    assetCode: 'AST-OLT-001',
    name: 'OLT ZTE C320 GPON 8-Port Full SFP',
    category: 'core_network',
    brandModel: 'ZTE C320 Chassis + PRAM Card',
    serialNumber: 'ZTEG-892184-C320',
    purchaseDate: '2025-01-15',
    purchasePrice: 28500000,
    currentValue: 24225000,
    depreciationPerYear: 15,
    status: 'in_use',
    location: 'POP Utama Plaju - Rack Server A1',
    assignedTo: 'NOC Lead',
    assignedToName: 'Bambang Irawan (NOC)',
    warrantyExpiry: '2027-01-15',
    notes: 'Kondisi prima, melayani 4 ODP Feeder arah Sekojo & Bukit.'
  },
  {
    id: 'ast-002',
    tenantId: 'fiber_ops_prod',
    assetCode: 'AST-RTR-001',
    name: 'Core Router Mikrotik CCR2004-16G-2S+',
    category: 'core_network',
    brandModel: 'Mikrotik Cloud Core Router CCR2004',
    serialNumber: 'CCR2004-991204',
    purchaseDate: '2025-02-10',
    purchasePrice: 9800000,
    currentValue: 8820000,
    depreciationPerYear: 10,
    status: 'in_use',
    location: 'POP Utama Plaju - Rack Server A1',
    assignedToName: 'Tim NOC & BGP Routing',
    warrantyExpiry: '2026-02-10',
    notes: 'Gateway utama upstream NAP 10Gbps SFP+.'
  },
  {
    id: 'ast-003',
    tenantId: 'fiber_ops_prod',
    assetCode: 'AST-SPL-001',
    name: 'Fusion Splicer Core-Alignment Tumtec FST-18S',
    category: 'technician_tools',
    brandModel: 'Tumtec FST-18S 6 Motors',
    serialNumber: 'TUM-FST-2024-819',
    purchaseDate: '2025-03-20',
    purchasePrice: 14500000,
    currentValue: 13050000,
    depreciationPerYear: 10,
    status: 'in_use',
    location: 'Dibawa Teknisi Lapangan (Tim Alfa)',
    assignedTo: 'emp-001',
    assignedToName: 'Rian Pratama (Splicer Lead)',
    warrantyExpiry: '2026-03-20',
    notes: 'Total arc counter: 1,420 kali. Kalibrasi elektroda terakhir Juli 2026.'
  },
  {
    id: 'ast-004',
    tenantId: 'fiber_ops_prod',
    assetCode: 'AST-OTDR-001',
    name: 'Mini OTDR Fiber Optic 1310/1550nm 28dB + OPM + VFL',
    category: 'technician_tools',
    brandModel: 'Grandway FHO3000 Series',
    serialNumber: 'GW-FHO-48910',
    purchaseDate: '2025-04-05',
    purchasePrice: 7200000,
    currentValue: 6480000,
    depreciationPerYear: 10,
    status: 'available',
    location: 'Gudang Alat & Instrumen - Lemari A',
    assignedToName: 'Standby Gudang',
    warrantyExpiry: '2026-04-05',
    notes: 'Siap pakai untuk tracing kabel putus / LOS.'
  },
  {
    id: 'ast-005',
    tenantId: 'fiber_ops_prod',
    assetCode: 'AST-CAR-001',
    name: 'Mobil Operasional Daihatsu Gran Max Blind Van',
    category: 'operational_vehicle',
    brandModel: 'Gran Max 1.3 AC PS',
    serialNumber: 'BG 8192 PL / NOKA-918293',
    purchaseDate: '2024-11-10',
    purchasePrice: 145000000,
    currentValue: 123250000,
    depreciationPerYear: 15,
    status: 'in_use',
    location: 'Kantor Musi Cyber / Lapangan',
    assignedToName: 'Tim Lapangan Penarikan Kabel',
    warrantyExpiry: '2027-11-10',
    notes: 'Dilengkapi rak tangga teleskopik 6m dan roll drum kabel feeder.'
  },
  {
    id: 'ast-006',
    tenantId: 'fiber_ops_prod',
    assetCode: 'AST-UPS-001',
    name: 'Online UPS Prolink 3KVA 2400W + External Battery Bank',
    category: 'core_network',
    brandModel: 'Prolink Master II Online 3000VA',
    serialNumber: 'PLK-UPS-3K-771',
    purchaseDate: '2025-01-20',
    purchasePrice: 12500000,
    currentValue: 10625000,
    depreciationPerYear: 15,
    status: 'in_use',
    location: 'POP Utama Plaju - Ruang UPS',
    assignedToName: 'Infrastruktur Power',
    warrantyExpiry: '2027-01-20',
    notes: 'Backup daya 4-6 jam saat listrik PLN padam.'
  },
  {
    id: 'ast-007',
    tenantId: 'fiber_ops_prod',
    assetCode: 'AST-LDR-001',
    name: 'Tangga Teleskopik Double Aluminium 6.2 Meter',
    category: 'technician_tools',
    brandModel: 'Krisbow Double Telescopic 6.2M',
    serialNumber: 'KRIS-LDR-62M-01',
    purchaseDate: '2025-05-12',
    purchasePrice: 2400000,
    currentValue: 2160000,
    depreciationPerYear: 10,
    status: 'in_use',
    location: 'Di Mobil Gran Max Operasional',
    assignedToName: 'Dedi Kurniawan (Teknisi)',
    notes: 'Kondisi kuncian engsel normal.'
  }
];

const INITIAL_MOCK_LOANS: AssetLoanLog[] = [
  {
    id: 'loan-001',
    tenantId: 'fiber_ops_prod',
    assetId: 'ast-003',
    assetCode: 'AST-SPL-001',
    assetName: 'Fusion Splicer Tumtec FST-18S',
    employeeId: 'emp-001',
    employeeName: 'Rian Pratama',
    borrowDate: '2026-08-28',
    expectedReturnDate: '2026-08-30',
    purpose: 'Penyambungan Core FO ODP-SKJ-04 & PSB 5 Pelanggan Baru Sekojo',
    status: 'borrowed'
  },
  {
    id: 'loan-002',
    tenantId: 'fiber_ops_prod',
    assetId: 'ast-004',
    assetCode: 'AST-OTDR-001',
    assetName: 'Mini OTDR Grandway FHO3000',
    employeeId: 'emp-002',
    employeeName: 'Hendra Saputra',
    borrowDate: '2026-08-25',
    expectedReturnDate: '2026-08-26',
    returnDate: '2026-08-26',
    purpose: 'Tracing LOS kabel feeder segmen Jembatan Musi 4',
    status: 'returned',
    conditionOnReturn: 'Baik dan bersih, baterai terisi penuh'
  }
];

export function AssetModule({ tenantId }: AssetModuleProps) {
  const [activeTab, setActiveTab] = useState<'daftar' | 'peminjaman' | 'maintenance' | 'depresiasi'>('daftar');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loans, setLoans] = useState<AssetLoanLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Form States
  const [assetForm, setAssetForm] = useState<Partial<Asset>>({
    category: 'technician_tools',
    status: 'available',
    purchasePrice: 0,
    depreciationPerYear: 10,
    location: 'Gudang Utama'
  });

  const [loanForm, setLoanForm] = useState<Partial<AssetLoanLog>>({
    borrowDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    purpose: ''
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedAssets, fetchedLoans] = await Promise.all([
        ispService.getAssets(tenantId),
        ispService.getAssetLoans(tenantId)
      ]);

      if (fetchedAssets && fetchedAssets.length > 0) {
        setAssets(fetchedAssets);
      } else {
        setAssets(INITIAL_MOCK_ASSETS);
      }

      if (fetchedLoans && fetchedLoans.length > 0) {
        setLoans(fetchedLoans);
      } else {
        setLoans(INITIAL_MOCK_LOANS);
      }
    } catch (e) {
      console.warn('Fallback to mock assets data:', e);
      setAssets(INITIAL_MOCK_ASSETS);
      setLoans(INITIAL_MOCK_LOANS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenantId]);

  // Asset Metrics
  const stats = useMemo(() => {
    const totalCount = assets.length;
    const totalAcquisition = assets.reduce((acc, a) => acc + (Number(a.purchasePrice) || 0), 0);
    const totalCurrentVal = assets.reduce((acc, a) => acc + (Number(a.currentValue) || Number(a.purchasePrice) || 0), 0);
    const inUseCount = assets.filter(a => a.status === 'in_use' || a.status === 'deployed_to_customer').length;
    const availableCount = assets.filter(a => a.status === 'available').length;
    const maintenanceCount = assets.filter(a => a.status === 'in_maintenance' || a.status === 'broken').length;

    return {
      totalCount,
      totalAcquisition,
      totalCurrentVal,
      inUseCount,
      availableCount,
      maintenanceCount
    };
  }, [assets]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(item => {
      const matchSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brandModel && item.brandModel.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.assignedToName && item.assignedToName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [assets, searchQuery, categoryFilter, statusFilter]);

  // Add Asset Handler
  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetForm.name || !assetForm.assetCode || !assetForm.purchasePrice) {
      alert('Mohon lengkapi Nama Aset, Kode Aset, dan Harga Perolehan.');
      return;
    }

    const price = Number(assetForm.purchasePrice) || 0;
    const depRate = Number(assetForm.depreciationPerYear) || 10;
    const purchaseYear = assetForm.purchaseDate ? new Date(assetForm.purchaseDate).getFullYear() : new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const yearsDiff = Math.max(0, currentYear - purchaseYear);
    const calculatedCurrent = Math.max(0, price * Math.pow(1 - (depRate / 100), yearsDiff));

    const newAsset: Omit<Asset, 'id' | 'tenantId'> = {
      assetCode: assetForm.assetCode.toUpperCase(),
      name: assetForm.name,
      category: assetForm.category as AssetCategory || 'technician_tools',
      brandModel: assetForm.brandModel || '-',
      serialNumber: assetForm.serialNumber || '-',
      purchaseDate: assetForm.purchaseDate || new Date().toISOString().split('T')[0],
      purchasePrice: price,
      currentValue: assetForm.currentValue ? Number(assetForm.currentValue) : Math.round(calculatedCurrent),
      depreciationPerYear: depRate,
      status: (assetForm.status as AssetStatus) || 'available',
      location: assetForm.location || 'Gudang Utama',
      assignedToName: assetForm.assignedToName || '',
      warrantyExpiry: assetForm.warrantyExpiry || '',
      notes: assetForm.notes || ''
    };

    try {
      const id = await ispService.createAsset(tenantId, newAsset);
      setAssets(prev => [{ id: id || `local-${Date.now()}`, tenantId, ...newAsset } as Asset, ...prev]);
      setShowAddModal(false);
      setAssetForm({
        category: 'technician_tools',
        status: 'available',
        purchasePrice: 0,
        depreciationPerYear: 10,
        location: 'Gudang Utama'
      });
      alert('Aset baru berhasil dicatat dalam inventaris!');
    } catch (err: any) {
      alert('Gagal menyimpan aset: ' + err.message);
    }
  };

  // Loan Asset Handler
  const handleSaveLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanForm.assetId || !loanForm.employeeName || !loanForm.purpose) {
      alert('Mohon pilih Aset, Nama Peminjam, dan Keperluan.');
      return;
    }

    const targetAsset = assets.find(a => a.id === loanForm.assetId);
    if (!targetAsset) return;

    const newLoan: Omit<AssetLoanLog, 'id' | 'tenantId'> = {
      assetId: targetAsset.id || '',
      assetCode: targetAsset.assetCode,
      assetName: targetAsset.name,
      employeeId: loanForm.employeeId || `emp-${Date.now()}`,
      employeeName: loanForm.employeeName,
      borrowDate: loanForm.borrowDate || new Date().toISOString().split('T')[0],
      expectedReturnDate: loanForm.expectedReturnDate || '',
      purpose: loanForm.purpose,
      status: 'borrowed'
    };

    try {
      const id = await ispService.createAssetLoan(tenantId, newLoan);
      setLoans(prev => [{ id: id || `local-loan-${Date.now()}`, tenantId, ...newLoan } as AssetLoanLog, ...prev]);
      
      // Update local asset status
      setAssets(prev => prev.map(a => a.id === targetAsset.id ? { ...a, status: 'in_use', assignedToName: loanForm.employeeName } : a));

      setShowLoanModal(false);
      alert(`Peminjaman alat "${targetAsset.name}" berhasil dicatat untuk ${loanForm.employeeName}!`);
    } catch (err: any) {
      alert('Gagal mencatat peminjaman: ' + err.message);
    }
  };

  const handleReturnAsset = async (loan: AssetLoanLog) => {
    const condition = prompt('Masukkan catatan kondisi alat saat dikembalikan (misal: Baik, Normal, Kabel kotor):', 'Baik & Lengkap');
    if (condition === null) return;

    try {
      await ispService.returnAssetLoan(loan.id || '', loan.assetId, condition);
      setLoans(prev => prev.map(l => l.id === loan.id ? { ...l, status: 'returned', returnDate: new Date().toISOString().split('T')[0], conditionOnReturn: condition } : l));
      setAssets(prev => prev.map(a => a.id === loan.assetId ? { ...a, status: 'available', assignedToName: '' } : a));
      alert('Alat berhasil dikembalikan ke status Tersedia / Gudang!');
    } catch (err: any) {
      alert('Gagal memproses pengembalian: ' + err.message);
    }
  };

  const exportAssetsCsv = () => {
    const headers = ["Kode Aset", "Nama Aset", "Kategori", "Merk/Model", "Serial Number", "Status", "Lokasi", "Penanggung Jawab", "Tgl Beli", "Harga Beli (Rp)", "Nilai Buku (Rp)"];
    const rows = filteredAssets.map(a => [
      `"${a.assetCode}"`,
      `"${a.name}"`,
      `"${CATEGORY_MAP[a.category]?.label || a.category}"`,
      `"${a.brandModel || '-'}"`,
      `"${a.serialNumber || '-'}"`,
      `"${STATUS_MAP[a.status]?.label || a.status}"`,
      `"${a.location}"`,
      `"${a.assignedToName || '-'}"`,
      `"${a.purchaseDate}"`,
      `"${a.purchasePrice}"`,
      `"${a.currentValue}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventaris-aset-ftth-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen & Pencatatan Aset FTTH</h1>
              <p className="text-xs text-slate-500 font-medium">Inventaris perangkat core, OLT, ODP, instrumen teknisi (Splicer/OTDR), dan armada operasional.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => { setIsRefreshing(true); loadData(); }}
            className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <button
            onClick={exportAssetsCsv}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => setShowLoanModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Pinjam Alat</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aset</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Nilai Perolehan</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {formatRupiah(stats.totalAcquisition)}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Dari total <strong className="text-slate-800">{stats.totalCount}</strong> unit aset terdaftar</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Nilai Buku Saat Ini</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 tracking-tight">
            {formatRupiah(stats.totalCurrentVal)}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Setelah depresiasi penyusutan tahunan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Aset Beroperasi / Dipinjam</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-blue-600 tracking-tight">
            {stats.inUseCount} <span className="text-sm font-sans font-medium text-slate-500">Unit</span>
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Tersedia di gudang: <strong className="text-emerald-600">{stats.availableCount} unit</strong></p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Perlu Servis / Kalibrasi</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600 tracking-tight">
            {stats.maintenanceCount} <span className="text-sm font-sans font-medium text-slate-500">Unit</span>
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Termasuk jadwal ganti elektroda splicer</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setActiveTab('daftar')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'daftar' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Inventaris Aset ({filteredAssets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('peminjaman')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'peminjaman' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Log Peminjaman Alat ({loans.filter(l => l.status === 'borrowed').length} Aktif)</span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'maintenance' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Kalibrasi & Pemeliharaan</span>
        </button>

        <button
          onClick={() => setActiveTab('depresiasi')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'depresiasi' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Kalkulator Penyusutan</span>
        </button>
      </div>

      {/* Tab 1: Daftar Aset */}
      {activeTab === 'daftar' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kode aset, nama perangkat, merk, serial number, atau lokasi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">Semua Kategori</option>
                <option value="core_network">Core Network & OLT</option>
                <option value="distribution_odp">Distribusi & ODP</option>
                <option value="customer_cpe">CPE / ONT Pelanggan</option>
                <option value="technician_tools">Alat Kerja & Splicer</option>
                <option value="operational_vehicle">Kendaraan Lapangan</option>
                <option value="office_facility">Fasilitas Kantor & POP</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="available">Tersedia / Standby</option>
                <option value="in_use">Sedang Digunakan</option>
                <option value="deployed_to_customer">Terpasang di Pelanggan</option>
                <option value="in_maintenance">Dalam Servis</option>
                <option value="broken">Rusak</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Kode & Nama Aset</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Merk & SN</th>
                    <th className="py-3 px-4">Lokasi & PIC</th>
                    <th className="py-3 px-4">Nilai Perolehan</th>
                    <th className="py-3 px-4">Nilai Buku</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                        Tidak ada aset yang sesuai dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map(asset => {
                      const catInfo = CATEGORY_MAP[asset.category] || CATEGORY_MAP.technician_tools;
                      const statInfo = STATUS_MAP[asset.status] || STATUS_MAP.available;
                      const CatIcon = catInfo.icon;

                      return (
                        <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold font-mono text-indigo-600 text-[11px]">{asset.assetCode}</div>
                            <div className="font-bold text-slate-900 text-xs">{asset.name}</div>
                            {asset.notes && <div className="text-[10px] text-slate-400 line-clamp-1">{asset.notes}</div>}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${catInfo.bg} ${catInfo.color}`}>
                              <CatIcon className="w-3 h-3" />
                              {catInfo.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800">{asset.brandModel || '-'}</div>
                            <div className="font-mono text-[10px] text-slate-500">SN: {asset.serialNumber || '-'}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1 text-slate-700 font-medium">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[150px]">{asset.location}</span>
                            </div>
                            {asset.assignedToName && (
                              <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-semibold mt-0.5">
                                <User className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate max-w-[150px]">{asset.assignedToName}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                            {formatRupiah(asset.purchasePrice)}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                            {formatRupiah(asset.currentValue || asset.purchasePrice)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border ${statInfo.bg} ${statInfo.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statInfo.dot}`} />
                              {statInfo.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  setShowQrModal(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                title="Cetak QR / Label Barcode"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedAsset(asset);
                                  setLoanForm({
                                    assetId: asset.id,
                                    borrowDate: new Date().toISOString().split('T')[0],
                                    expectedReturnDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
                                  });
                                  setShowLoanModal(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                title="Pinjamkan Alat"
                              >
                                <ArrowRightLeft className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Peminjaman Alat */}
      {activeTab === 'peminjaman' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Log Peminjaman Peralatan & Instrumen Teknisi</h2>
              <p className="text-xs text-slate-500">Mencatat serah terima Fusion Splicer, OTDR, Tangga, dan alat ukur lapangan.</p>
            </div>
            <button
              onClick={() => setShowLoanModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Peminjaman Baru</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Alat & Kode</th>
                    <th className="py-3 px-4">Peminjam (Teknisi)</th>
                    <th className="py-3 px-4">Tgl Pinjam</th>
                    <th className="py-3 px-4">Target Kembali</th>
                    <th className="py-3 px-4">Keperluan / Cluster</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                        Belum ada riwayat peminjaman alat kerja.
                      </td>
                    </tr>
                  ) : (
                    loans.map(loan => (
                      <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold font-mono text-indigo-600 text-[11px]">{loan.assetCode}</div>
                          <div className="font-bold text-slate-900 text-xs">{loan.assetName}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <User className="w-3 h-3 text-indigo-500" />
                            {loan.employeeName}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{loan.borrowDate}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{loan.expectedReturnDate || '-'}</td>
                        <td className="py-3.5 px-4 text-slate-700 max-w-[200px] truncate">{loan.purpose}</td>
                        <td className="py-3.5 px-4">
                          {loan.status === 'borrowed' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" /> Sedang Dipinjam
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Dikembalikan ({loan.returnDate})
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {loan.status === 'borrowed' && (
                            <button
                              onClick={() => handleReturnAsset(loan)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                            >
                              Kembalikan Alat
                            </button>
                          )}
                          {loan.status === 'returned' && loan.conditionOnReturn && (
                            <span className="text-[10px] text-slate-500 italic">Kondisi: {loan.conditionOnReturn}</span>
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
      )}

      {/* Tab 3: Maintenance & Kalibrasi */}
      {activeTab === 'maintenance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                Jadwal Kalibrasi & Servis Instrumen
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md border border-amber-200">SOP Standar</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Fusion Splicer Tumtec FST-18S</span>
                  <span className="text-amber-600 font-mono">1,420 / 3,000 Arcs</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">Penggantian elektroda disarankan pada 3,000 kali arc discharge.</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '47%' }}></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Mini OTDR Grandway FHO3000</span>
                  <span className="text-emerald-600">Terjadwal Okt 2026</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">Kalibrasi tahunan panjang gelombang 1310/1550nm.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Daihatsu Gran Max Blind Van</span>
                  <span className="text-blue-600">Servis Berkala 20.000 KM</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-1">Ganti oli mesin, cek kampas rem, dan rotasi ban operasional.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Garansi & Masa Perlindungan Vendor
            </h3>

            <div className="space-y-3 text-xs">
              {assets.filter(a => a.warrantyExpiry).map(a => (
                <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900">{a.name}</div>
                    <div className="text-[11px] text-slate-500">{a.brandModel}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-indigo-600 text-[11px]">Exp: {a.warrantyExpiry}</div>
                    <span className="text-[10px] text-emerald-600 font-medium">Garansi Resmi</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Kalkulator Depresiasi */}
      {activeTab === 'depresiasi' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Analisis Penyusutan Aset & Nilai Sisa Buku</h3>
            <p className="text-xs text-slate-500 mt-0.5">Perhitungan nilai aset menggunakan metode garis lurus / saldo menurun (Depreciation Schedule).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Akumulasi Nilai Aset</span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">{formatRupiah(stats.totalAcquisition)}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Estimasi Beban Depresiasi / Tahun</span>
              <p className="text-xl font-bold font-mono text-rose-600 mt-1">{formatRupiah(stats.totalAcquisition * 0.12)}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Net Book Value Perusahaan</span>
              <p className="text-xl font-bold font-mono text-emerald-600 mt-1">{formatRupiah(stats.totalCurrentVal)}</p>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Panduan Standar Depresiasi Perangkat Telekomunikasi FTTH:</p>
              <p>• <strong>Core Hardware (OLT, Router):</strong> Masa manfaat 5-8 tahun (Penyusutan 12.5% - 20% / tahun).</p>
              <p>• <strong>Instrumen Kerja (Splicer, OTDR):</strong> Masa manfaat 5 tahun (Penyusutan 20% / tahun).</p>
              <p>• <strong>Kendaraan Operasional:</strong> Masa manfaat 8-10 tahun (Penyusutan 10% - 12.5% / tahun).</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Aset */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Tambah Aset Baru ke Inventaris</h3>
                    <p className="text-xs text-slate-500">Catat perangkat core, OLT, splicer, atau kendaraan operasional.</p>
                  </div>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAsset} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kode Aset (Auto/Custom) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AST-SPL-002"
                      value={assetForm.assetCode || ''}
                      onChange={e => setAssetForm(prev => ({ ...prev, assetCode: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kategori Aset *</label>
                    <select
                      value={assetForm.category}
                      onChange={e => setAssetForm(prev => ({ ...prev, category: e.target.value as AssetCategory }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="core_network">Core Network & OLT</option>
                      <option value="distribution_odp">Distribusi & ODP/ODC</option>
                      <option value="customer_cpe">CPE / ONT Pelanggan</option>
                      <option value="technician_tools">Alat Kerja & Splicer</option>
                      <option value="operational_vehicle">Kendaraan Lapangan</option>
                      <option value="office_facility">Fasilitas Kantor & POP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Perangkat / Aset *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fusion Splicer Tumtec FST-18S"
                    value={assetForm.name || ''}
                    onChange={e => setAssetForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Merk / Model</label>
                    <input
                      type="text"
                      placeholder="e.g. ZTE C320, Tumtec, Grandway"
                      value={assetForm.brandModel || ''}
                      onChange={e => setAssetForm(prev => ({ ...prev, brandModel: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Serial Number (SN) / No Rangka</label>
                    <input
                      type="text"
                      placeholder="e.g. SN-91823901"
                      value={assetForm.serialNumber || ''}
                      onChange={e => setAssetForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Harga Perolehan (Rupiah) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      placeholder="15000000"
                      value={assetForm.purchasePrice || ''}
                      onChange={e => setAssetForm(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tanggal Pembelian</label>
                    <input
                      type="date"
                      value={assetForm.purchaseDate || ''}
                      onChange={e => setAssetForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Lokasi Penempatan</label>
                    <input
                      type="text"
                      placeholder="e.g. POP Utama, Gudang, Mobil Tim A"
                      value={assetForm.location || ''}
                      onChange={e => setAssetForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Status Awal</label>
                    <select
                      value={assetForm.status}
                      onChange={e => setAssetForm(prev => ({ ...prev, status: e.target.value as AssetStatus }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="available">Tersedia / Standby</option>
                      <option value="in_use">Sedang Digunakan</option>
                      <option value="in_maintenance">Dalam Servis</option>
                      <option value="broken">Rusak</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan</label>
                  <textarea
                    rows={2}
                    placeholder="Kelengkapan adapter, garansi, kondisi fisik..."
                    value={assetForm.notes || ''}
                    onChange={e => setAssetForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
                  >
                    Simpan Aset
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Pinjam Alat */}
      <AnimatePresence>
        {showLoanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Peminjaman Alat Kerja Teknisi</h3>
                    <p className="text-xs text-slate-500">Serah terima alat ukur, splicer, atau perkakas lapangan.</p>
                  </div>
                </div>
                <button onClick={() => setShowLoanModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLoan} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pilih Alat / Instrumen *</label>
                  <select
                    required
                    value={loanForm.assetId || ''}
                    onChange={e => setLoanForm(prev => ({ ...prev, assetId: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="">-- Pilih Alat yang Tersedia --</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.assetCode} - {a.name} ({STATUS_MAP[a.status]?.label || a.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Teknisi / Peminjam *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rian Pratama (Splicer Lead)"
                    value={loanForm.employeeName || ''}
                    onChange={e => setLoanForm(prev => ({ ...prev, employeeName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tanggal Pinjam</label>
                    <input
                      type="date"
                      required
                      value={loanForm.borrowDate || ''}
                      onChange={e => setLoanForm(prev => ({ ...prev, borrowDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Estimasi Tanggal Kembali</label>
                    <input
                      type="date"
                      value={loanForm.expectedReturnDate || ''}
                      onChange={e => setLoanForm(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Keperluan & Lokasi Pekerjaan *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Penarikan 4 ODP baru cluster Sekojo dan aktivasi 6 pelanggan baru."
                    value={loanForm.purpose || ''}
                    onChange={e => setLoanForm(prev => ({ ...prev, purpose: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowLoanModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs"
                  >
                    Simpan Peminjaman
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Label QR Code Aset */}
      <AnimatePresence>
        {showQrModal && selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Label Fisik Perangkat</span>
                <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Physical Tag Preview */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 text-slate-900 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono border-b border-slate-200 pb-2">
                  <span className="font-bold text-indigo-600">MUSI CYBER FTTH</span>
                  <span>PROPERTY OF ISP</span>
                </div>

                <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
                  <QrCode className="w-24 h-24 text-slate-900" />
                </div>

                <div className="space-y-0.5">
                  <div className="font-mono font-bold text-base tracking-wider text-indigo-700">{selectedAsset.assetCode}</div>
                  <div className="font-bold text-xs text-slate-800">{selectedAsset.name}</div>
                  <div className="font-mono text-[10px] text-slate-500">SN: {selectedAsset.serialNumber || '-'}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Label Tag</span>
                </button>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
