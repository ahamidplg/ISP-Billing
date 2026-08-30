import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  DollarSign,
  Printer,
  Calendar,
  Phone,
  Mail,
  UserCheck,
  CreditCard,
  Briefcase,
  Send,
  RefreshCw,
  X,
  UserPlus,
  Activity,
  Award,
  AlertTriangle
} from 'lucide-react';
import { 
  Employee, 
  AttendanceRecord, 
  WorkOrder, 
  PayrollSlip, 
  WorkOrderType, 
  WorkOrderPriority,
  EmployeeRole,
  EmploymentType 
} from '../types';
import { ispService } from '../services/ispService';

export interface HRModuleProps {
  tenantId: string;
  key?: React.Key;
}

const ROLE_MAP: Record<EmployeeRole, { label: string; department: string; color: string; bg: string }> = {
  technician_splicer: { label: 'Lead Splicer FO', department: 'Teknisi Lapangan', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  technician_field: { label: 'Teknisi Instalasi & PSB', department: 'Teknisi Lapangan', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  noc_engineer: { label: 'Senior NOC Engineer', department: 'NOC & Server', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  billing_admin: { label: 'Billing & Keuangan', department: 'Finance & Admin', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  customer_service: { label: 'Customer Care & Helpdesk', department: 'Helpdesk CS', color: 'text-sky-700', bg: 'bg-sky-50 border-sky-200' },
  sales_marketing: { label: 'Marketing & Sales', department: 'Sales & Marketing', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  manager: { label: 'Operations Manager', department: 'Manajemen', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-300' }
};

const WORKORDER_TYPE_MAP: Record<WorkOrderType, { label: string; color: string; bg: string }> = {
  psb_installation: { label: 'Pasang Baru (PSB)', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  los_troubleshooting: { label: 'Perbaikan LOS / Redaman', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
  cable_cut_repair: { label: 'Kabel Putus (Cut FO)', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  relocation: { label: 'Relokasi Titik ONT', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  routine_maintenance: { label: 'Perapihan ODP / Feeder', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  dismantle: { label: 'Bongkar / Dismantle', color: 'text-slate-700', bg: 'bg-slate-100 border-slate-300' }
};

const INITIAL_MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    tenantId: 'fiber_ops_prod',
    employeeCode: 'EMP-TEK-001',
    name: 'Rian Pratama',
    role: 'technician_splicer',
    department: 'Teknisi Lapangan',
    employmentType: 'permanent',
    phone: '081278990123',
    email: 'rian.pratama@musicyber.net',
    basicSalary: 4200000,
    allowance: 800000,
    psbIncentivePerTask: 50000,
    bankAccount: 'BCA 8910-2391-01',
    joinDate: '2024-03-01',
    status: 'active',
    activeWorkOrdersCount: 2
  },
  {
    id: 'emp-002',
    tenantId: 'fiber_ops_prod',
    employeeCode: 'EMP-TEK-002',
    name: 'Hendra Saputra',
    role: 'technician_field',
    department: 'Teknisi Lapangan',
    employmentType: 'permanent',
    phone: '085267123490',
    email: 'hendra.field@musicyber.net',
    basicSalary: 3800000,
    allowance: 600000,
    psbIncentivePerTask: 40000,
    bankAccount: 'BRI 0059-01-098231-50-1',
    joinDate: '2024-06-15',
    status: 'active',
    activeWorkOrdersCount: 1
  },
  {
    id: 'emp-003',
    tenantId: 'fiber_ops_prod',
    employeeCode: 'EMP-NOC-001',
    name: 'Bambang Irawan',
    role: 'noc_engineer',
    department: 'NOC & Server',
    employmentType: 'permanent',
    phone: '081390128477',
    email: 'bambang.noc@musicyber.net',
    basicSalary: 5500000,
    allowance: 1200000,
    psbIncentivePerTask: 0,
    bankAccount: 'Mandiri 113-00-1928471-2',
    joinDate: '2023-11-01',
    status: 'active',
    activeWorkOrdersCount: 0
  },
  {
    id: 'emp-004',
    tenantId: 'fiber_ops_prod',
    employeeCode: 'EMP-CS-001',
    name: 'Siti Nurhaliza',
    role: 'customer_service',
    department: 'Helpdesk CS',
    employmentType: 'permanent',
    phone: '087899120019',
    email: 'siti.care@musicyber.net',
    basicSalary: 3500000,
    allowance: 500000,
    psbIncentivePerTask: 0,
    bankAccount: 'BCA 0981-9921-22',
    joinDate: '2025-01-10',
    status: 'active',
    activeWorkOrdersCount: 0
  }
];

const INITIAL_MOCK_WORKORDERS: WorkOrder[] = [
  {
    id: 'spk-001',
    tenantId: 'fiber_ops_prod',
    orderNumber: 'SPK-2026-08-001',
    type: 'psb_installation',
    customerName: 'Ahmad Syahrir',
    customerPhone: '081273891029',
    address: 'Jl. Ahmad Yani No. 45, Plaju, Palembang',
    assignedTechnicianId: 'emp-001',
    assignedTechnicianName: 'Rian Pratama & Hendra',
    priority: 'high',
    status: 'in_progress',
    scheduledDate: '2026-08-29',
    notes: 'Paket Home Gamer 50Mbps. ODP-PLJ-02 Port 5.'
  },
  {
    id: 'spk-002',
    tenantId: 'fiber_ops_prod',
    orderNumber: 'SPK-2026-08-002',
    type: 'los_troubleshooting',
    customerName: 'CV Multi Sarana',
    customerPhone: '08119823712',
    address: 'Komp. Ruko Sekojo Blok C No. 8',
    assignedTechnicianId: 'emp-002',
    assignedTechnicianName: 'Hendra Saputra',
    priority: 'critical',
    status: 'pending',
    scheduledDate: '2026-08-29',
    notes: 'Lampu PON Merah (LOS) sejak tadi pagi. Cek kabel dropcore di tiang.'
  },
  {
    id: 'spk-003',
    tenantId: 'fiber_ops_prod',
    orderNumber: 'SPK-2026-08-003',
    type: 'psb_installation',
    customerName: 'Dra. Hj. Nuraini',
    customerPhone: '085377881920',
    address: 'Jl. Sumpah Pemuda No. 12, Lorok Pakjo',
    assignedTechnicianId: 'emp-001',
    assignedTechnicianName: 'Rian Pratama',
    priority: 'normal',
    status: 'completed',
    scheduledDate: '2026-08-28',
    completedAt: '2026-08-28 16:30',
    redamanDb: '-18.4 dBm',
    notes: 'Koneksi aktif dan speedtest 32Mbps stabil.'
  }
];

export function HRModule({ tenantId }: HRModuleProps) {
  const [activeTab, setActiveTab] = useState<'karyawan' | 'presensi' | 'spk' | 'payroll'>('karyawan');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [payrollSlips, setPayrollSlips] = useState<PayrollSlip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Modals
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showAddSpkModal, setShowAddSpkModal] = useState(false);
  const [showPaySlipModal, setShowPaySlipModal] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<PayrollSlip | null>(null);

  // Forms
  const [empForm, setEmpForm] = useState<Partial<Employee>>({
    role: 'technician_field',
    department: 'Teknisi Lapangan',
    employmentType: 'permanent',
    status: 'active',
    basicSalary: 3800000,
    allowance: 600000,
    psbIncentivePerTask: 50000,
    bankAccount: 'BCA 1234567890'
  });

  const [spkForm, setSpkForm] = useState<Partial<WorkOrder>>({
    type: 'psb_installation',
    priority: 'normal',
    status: 'pending',
    scheduledDate: new Date().toISOString().split('T')[0]
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
      const [fetchedEmployees, fetchedAttendances, fetchedSpk, fetchedPayroll] = await Promise.all([
        ispService.getEmployees(tenantId),
        ispService.getAttendances(tenantId),
        ispService.getWorkOrders(tenantId),
        ispService.getPayrollSlips(tenantId)
      ]);

      if (fetchedEmployees && fetchedEmployees.length > 0) {
        setEmployees(fetchedEmployees);
      } else {
        setEmployees(INITIAL_MOCK_EMPLOYEES);
      }

      setAttendances(fetchedAttendances || []);
      setWorkOrders(fetchedSpk && fetchedSpk.length > 0 ? fetchedSpk : INITIAL_MOCK_WORKORDERS);
      setPayrollSlips(fetchedPayroll || []);
    } catch (e) {
      console.warn('Fallback mock HR data:', e);
      setEmployees(INITIAL_MOCK_EMPLOYEES);
      setWorkOrders(INITIAL_MOCK_WORKORDERS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenantId]);

  // Metrics
  const stats = useMemo(() => {
    const totalActive = employees.filter(e => e.status === 'active').length;
    const technicians = employees.filter(e => e.role.includes('technician')).length;
    const activeSpk = workOrders.filter(w => w.status === 'in_progress' || w.status === 'pending').length;
    const estimatedPayroll = employees.reduce((acc, e) => {
      const commission = 12 * (e.psbIncentivePerTask || 0);
      return acc + (e.basicSalary || 0) + (e.allowance || 0) + commission;
    }, 0);

    return {
      totalActive,
      technicians,
      activeSpk,
      estimatedPayroll
    };
  }, [employees, workOrders]);

  // Add Employee Handler
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.name || !empForm.employeeCode || !empForm.role) {
      alert('Mohon lengkapi NIK/Kode Karyawan, Nama Lengkap, dan Jabatan.');
      return;
    }

    const roleInfo = ROLE_MAP[empForm.role as EmployeeRole] || ROLE_MAP.technician_field;

    const newEmp: Omit<Employee, 'id' | 'tenantId'> = {
      employeeCode: empForm.employeeCode.toUpperCase(),
      name: empForm.name,
      email: empForm.email || `${empForm.employeeCode?.toLowerCase()}@musicyber.net`,
      phone: empForm.phone || '',
      role: empForm.role as EmployeeRole || 'technician_field',
      department: roleInfo.department,
      employmentType: empForm.employmentType as EmploymentType || 'permanent',
      joinDate: empForm.joinDate || new Date().toISOString().split('T')[0],
      status: 'active',
      basicSalary: Number(empForm.basicSalary) || 0,
      allowance: Number(empForm.allowance) || 0,
      psbIncentivePerTask: Number(empForm.psbIncentivePerTask) || 0,
      bankAccount: empForm.bankAccount || 'BCA 123456789'
    };

    try {
      const id = await ispService.createEmployee(tenantId, newEmp);
      setEmployees(prev => [{ id: id || `emp-${Date.now()}`, tenantId, ...newEmp } as Employee, ...prev]);
      setShowAddEmpModal(false);
      setEmpForm({
        role: 'technician_field',
        department: 'Teknisi Lapangan',
        employmentType: 'permanent',
        status: 'active',
        basicSalary: 3800000,
        allowance: 600000,
        psbIncentivePerTask: 50000,
        bankAccount: 'BCA 1234567890'
      });
      alert(`Karyawan baru "${newEmp.name}" berhasil didaftarkan!`);
    } catch (err: any) {
      alert('Gagal menyimpan karyawan: ' + err.message);
    }
  };

  // Add Work Order Handler
  const handleSaveWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spkForm.customerName || !spkForm.address) {
      alert('Mohon lengkapi Nama Pelanggan dan Alamat Lokasi Pekerjaan.');
      return;
    }

    const targetTech = employees.find(emp => emp.id === spkForm.assignedTechnicianId);

    const newSpk: Omit<WorkOrder, 'id' | 'tenantId'> = {
      orderNumber: `SPK-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(workOrders.length + 1).padStart(3, '0')}`,
      type: spkForm.type as WorkOrderType || 'psb_installation',
      customerName: spkForm.customerName,
      customerPhone: spkForm.customerPhone || '',
      address: spkForm.address,
      assignedTechnicianId: spkForm.assignedTechnicianId || '',
      assignedTechnicianName: targetTech ? targetTech.name : 'Tim Lapangan Standby',
      priority: spkForm.priority as WorkOrderPriority || 'normal',
      status: 'pending',
      scheduledDate: spkForm.scheduledDate || new Date().toISOString().split('T')[0],
      notes: spkForm.notes || ''
    };

    try {
      const id = await ispService.createWorkOrder(tenantId, newSpk);
      setWorkOrders(prev => [{ id: id || `spk-${Date.now()}`, tenantId, ...newSpk } as WorkOrder, ...prev]);
      setShowAddSpkModal(false);
      alert(`Surat Perintah Kerja (SPK) ${newSpk.orderNumber} berhasil diterbitkan!`);
    } catch (err: any) {
      alert('Gagal menerbitkan SPK: ' + err.message);
    }
  };

  // Complete SPK
  const handleCompleteSpk = async (wo: WorkOrder) => {
    const redaman = prompt('Masukkan hasil pengukuran redaman dBm (misal: -18.5 dBm):', '-18.5 dBm');
    if (redaman === null) return;

    try {
      await ispService.updateWorkOrderStatus(wo.id || '', 'completed', redaman);
      setWorkOrders(prev => prev.map(w => w.id === wo.id ? { ...w, status: 'completed', redamanDb: redaman, completedAt: new Date().toISOString() } : w));
      alert(`SPK ${wo.orderNumber} telah selesai dikerjakan dengan redaman ${redaman}! Insentif komisi teknisi otomatis terakumulasi.`);
    } catch (err: any) {
      alert('Gagal menyelesaikan SPK: ' + err.message);
    }
  };

  // Send SPK via WhatsApp
  const handleSendSpkWa = (wo: WorkOrder) => {
    const tech = employees.find(e => e.id === wo.assignedTechnicianId);
    const techPhone = tech?.phone ? tech.phone.replace(/[^0-9]/g, '') : '';
    const phoneFormatted = techPhone.startsWith('0') ? '62' + techPhone.slice(1) : techPhone;

    const message = `*PENUGASAN SPK TEKNISI - MUSI CYBER FTTH*\n` +
      `No SPK: ${wo.orderNumber}\n` +
      `Jenis Pekerjaan: ${WORKORDER_TYPE_MAP[wo.type]?.label || wo.type}\n` +
      `Pelanggan: ${wo.customerName} (${wo.customerPhone || '-'})\n` +
      `Alamat: ${wo.address}\n` +
      `Jadwal: ${wo.scheduledDate}\n` +
      `Catatan: ${wo.notes || '-'}\n\n` +
      `Harap cek redaman sebelum & sesudah sambung, serta laporkan foto ODP ke sistem. Terima kasih!`;

    const waUrl = `https://wa.me/${phoneFormatted}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // Generate Payroll Slip
  const handleGenerateSlip = (emp: Employee) => {
    const psbCount = 14; // Default completed for demo
    const psbBonus = psbCount * (emp.psbIncentivePerTask || 0);
    const grossSalary = emp.basicSalary + emp.allowance + psbBonus;
    const bpjsDeduction = Math.round(emp.basicSalary * 0.03);
    const takeHomePay = grossSalary - bpjsDeduction;

    const currentPeriod = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    const slip: PayrollSlip = {
      id: `slip-${emp.id}-${Date.now()}`,
      tenantId,
      slipNumber: `PAY-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${emp.employeeCode}`,
      employeeId: emp.id || '',
      employeeName: emp.name,
      role: ROLE_MAP[emp.role]?.label || emp.role,
      period: currentPeriod,
      basicSalary: emp.basicSalary,
      allowance: emp.allowance,
      overtimeBonus: 0,
      psbIncentive: psbBonus,
      deductions: bpjsDeduction,
      totalTakeHomePay: takeHomePay,
      paymentStatus: 'pending'
    };

    setSelectedSlip(slip);
    setShowPaySlipModal(true);
  };

  // Pay Salary & Sync to Finance Ledger
  const handleProcessPayrollPayment = async (slip: PayrollSlip, method: string) => {
    if (!confirm(`Konfirmasi pembayaran gaji ${slip.employeeName} sebesar ${formatRupiah(slip.totalTakeHomePay)} via ${method}? Biaya ini akan otomatis tercatat di Pembukuan Kas ISP.`)) {
      return;
    }

    try {
      await ispService.markPayrollSlipPaid(tenantId, slip, method);
      setPayrollSlips(prev => [{ ...slip, paymentStatus: 'paid', paymentDate: new Date().toISOString().split('T')[0], paymentMethod: method }, ...prev]);
      setShowPaySlipModal(false);
      alert(`Gaji ${slip.employeeName} BERHASIL dibayarkan dan otomatis tercatat sebagai pengeluaran di Modul Keuangan!`);
    } catch (err: any) {
      alert('Gagal memproses gaji: ' + err.message);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.phone && emp.phone.includes(searchQuery));
      const matchDept = deptFilter === 'all' || emp.department === deptFilter;
      return matchSearch && matchDept;
    });
  }, [employees, searchQuery, deptFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Manajemen HR, Tim & SPK Teknisi</h1>
            <p className="text-xs text-slate-500 font-medium">Pengelolaan staff, penugasan SPK PSB/LOS, absensi, dan payroll insentif teknisi.</p>
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
            onClick={() => setShowAddSpkModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all"
          >
            <Wrench className="w-4 h-4" />
            <span>Terbitkan SPK</span>
          </button>
          <button
            onClick={() => setShowAddEmpModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Karyawan</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Karyawan Aktif</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {stats.totalActive} <span className="text-sm font-sans font-medium text-slate-500">Orang</span>
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Termasuk <strong className="text-indigo-600">{stats.technicians} teknisi lapangan</strong></p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">SPK Teknisi Berjalan</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600 tracking-tight">
            {stats.activeSpk} <span className="text-sm font-sans font-medium text-slate-500">Tugas</span>
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Instalasi PSB & penanganan LOS FO</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Estimasi Payroll Bulan Ini</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 tracking-tight">
            {formatRupiah(stats.estimatedPayroll)}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Gaji pokok + tunjangan + komisi PSB</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Presensi Shift Hari Ini</span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-sky-600 tracking-tight">
            100% <span className="text-sm font-sans font-medium text-slate-500">Hadir</span>
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Semua regu NOC & Splicer standby</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200/80">
        <button
          onClick={() => setActiveTab('karyawan')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'karyawan' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Direktori Tim ({employees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('spk')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'spk' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>SPK / Work Orders ({workOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'payroll' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Penggajian & Slip Gaji</span>
        </button>

        <button
          onClick={() => setActiveTab('presensi')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'presensi' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Presensi & Jadwal Shift</span>
        </button>
      </div>

      {/* Tab 1: Karyawan */}
      {activeTab === 'karyawan' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama karyawan, NIK, nomor WA, atau divisi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Departemen</option>
              <option value="Teknisi Lapangan">Teknisi Lapangan</option>
              <option value="NOC & Server">NOC & Server</option>
              <option value="Helpdesk CS">Helpdesk CS</option>
              <option value="Finance & Admin">Finance & Admin</option>
              <option value="Sales & Marketing">Sales & Marketing</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map(emp => {
              const roleInfo = ROLE_MAP[emp.role] || ROLE_MAP.technician_field;
              const psbBonus = 14 * (emp.psbIncentivePerTask || 0);

              return (
                <div key={emp.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 hover:border-indigo-200 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-indigo-600">{emp.employeeCode}</span>
                      <h3 className="font-bold text-slate-900 text-sm">{emp.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{roleInfo.label}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleInfo.bg} ${roleInfo.color}`}>
                      {roleInfo.department}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{emp.phone || '-'}</span>
                    </div>
                    {emp.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>{emp.bankAccount || '-'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Gaji Pokok + Tunjangan</span>
                      <div className="font-mono font-bold text-slate-900">{formatRupiah(emp.basicSalary + emp.allowance)}</div>
                      {emp.psbIncentivePerTask ? (
                        <div className="text-[10px] text-emerald-600 font-medium">
                          +14 PSB ({formatRupiah(psbBonus)})
                        </div>
                      ) : null}
                    </div>

                    <button
                      onClick={() => handleGenerateSlip(emp)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs transition-all"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Slip Gaji</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: SPK / Work Orders */}
      {activeTab === 'spk' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Manajemen Surat Perintah Kerja (SPK) Lapangan</h2>
              <p className="text-xs text-slate-500">Penugasan teknisi untuk Pasang Baru (PSB), perbaikan LOS, kabel putus, dan pemeliharaan ODP.</p>
            </div>
            <button
              onClick={() => setShowAddSpkModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Terbitkan SPK Baru</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">No. SPK & Tipe</th>
                    <th className="py-3 px-4">Pelanggan & Lokasi</th>
                    <th className="py-3 px-4">Teknisi Ditugaskan</th>
                    <th className="py-3 px-4">Jadwal / Redaman</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {workOrders.map(wo => {
                    const typeInfo = WORKORDER_TYPE_MAP[wo.type] || WORKORDER_TYPE_MAP.psb_installation;

                    return (
                      <tr key={wo.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-indigo-600 text-[11px]">{wo.orderNumber}</div>
                          <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-bold border ${typeInfo.bg} ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{wo.customerName}</div>
                          <div className="text-[11px] text-slate-500">{wo.address}</div>
                          {wo.customerPhone && <div className="text-[10px] font-mono text-slate-400">Tel: {wo.customerPhone}</div>}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800 flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-amber-500" />
                            {wo.assignedTechnicianName || 'Belum ditugaskan'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-slate-600">{wo.scheduledDate}</div>
                          {wo.redamanDb && (
                            <span className="inline-block mt-0.5 font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              Redaman: {wo.redamanDb}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {wo.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Selesai
                            </span>
                          )}
                          {wo.status === 'in_progress' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Clock className="w-3 h-3" /> Dikerjakan
                            </span>
                          )}
                          {wo.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3 h-3" /> Menunggu
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSendSpkWa(wo)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Kirim SPK ke WhatsApp Teknisi"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            {wo.status !== 'completed' && (
                              <button
                                onClick={() => handleCompleteSpk(wo)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-all"
                              >
                                Selesaikan
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Payroll */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Perhitungan Penggajian & Insentif Teknisi FTTH</h2>
              <p className="text-xs text-slate-500">Otomatisasi insentif PSB per sambungan dan sinkronisasi ke buku kas pengeluaran ISP.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                Periode: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Karyawan</th>
                    <th className="py-3 px-4">Gaji Pokok</th>
                    <th className="py-3 px-4">Tunjangan</th>
                    <th className="py-3 px-4">Insentif PSB</th>
                    <th className="py-3 px-4">Potongan (BPJS)</th>
                    <th className="py-3 px-4">Total Gaji Bersih (THP)</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {employees.map(emp => {
                    const psbBonus = 14 * (emp.psbIncentivePerTask || 0);
                    const gross = emp.basicSalary + emp.allowance + psbBonus;
                    const bpjs = Math.round(emp.basicSalary * 0.03);
                    const thp = gross - bpjs;

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{emp.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{emp.employeeCode} • {ROLE_MAP[emp.role]?.label || emp.role}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">{formatRupiah(emp.basicSalary)}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">{formatRupiah(emp.allowance)}</td>
                        <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">
                          {formatRupiah(psbBonus)}
                          <span className="block text-[10px] font-normal text-slate-400">(14 PSB selesai)</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-rose-600">-{formatRupiah(bpjs)}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                          {formatRupiah(thp)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleGenerateSlip(emp)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all"
                          >
                            Cetak / Bayar Slip
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Presensi & Shift */}
      {activeTab === 'presensi' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Jadwal Shift & Standby Operasional 24/7
            </h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Shift Aktif: Pagi & Lapangan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-indigo-700 block">Shift 1 (Pagi 08:00 - 17:00)</span>
              <p className="text-slate-600">Regu Instalasi PSB & Helpdesk Reguler.</p>
              <div className="text-[11px] text-slate-500 font-medium">
                • Rian Pratama (Splicer)<br />
                • Hendra Saputra (Dropcore)<br />
                • Siti Nurhaliza (CS)
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-indigo-700 block">Shift 2 (NOC Standby 16:00 - 00:00)</span>
              <p className="text-slate-600">Monitoring Traffic MRTG & BGP Router.</p>
              <div className="text-[11px] text-slate-500 font-medium">
                • Bambang Irawan (NOC Lead)<br />
                • Tim On-Call Fiber Optic Cut
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-indigo-700 block">Shift 3 (Malam 00:00 - 08:00)</span>
              <p className="text-slate-600">Pemeliharaan Jaringan & Backup Database.</p>
              <div className="text-[11px] text-slate-500 font-medium">
                • Automated Bot Ping & Server Health
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Karyawan */}
      <AnimatePresence>
        {showAddEmpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Tambah Data Karyawan / Teknisi</h3>
                    <p className="text-xs text-slate-500">Daftarkan anggota tim baru ke sistem operasional FTTH.</p>
                  </div>
                </div>
                <button onClick={() => setShowAddEmpModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">NIK / Kode Karyawan *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EMP-TEK-003"
                      value={empForm.employeeCode || ''}
                      onChange={e => setEmpForm(prev => ({ ...prev, employeeCode: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold text-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Posisi / Role *</label>
                    <select
                      value={empForm.role}
                      onChange={e => setEmpForm(prev => ({ ...prev, role: e.target.value as EmployeeRole }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="technician_field">Teknisi Instalasi & PSB</option>
                      <option value="technician_splicer">Lead Splicer FO</option>
                      <option value="noc_engineer">Senior NOC Engineer</option>
                      <option value="billing_admin">Billing & Keuangan</option>
                      <option value="customer_service">Customer Care & Helpdesk</option>
                      <option value="sales_marketing">Marketing & Sales</option>
                      <option value="manager">Operations Manager</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ridho Pratama, S.Kom"
                    value={empForm.name || ''}
                    onChange={e => setEmpForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp *</label>
                    <input
                      type="text"
                      required
                      placeholder="0812XXXXXXXX"
                      value={empForm.phone || ''}
                      onChange={e => setEmpForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tipe Kontrak</label>
                    <select
                      value={empForm.employmentType}
                      onChange={e => setEmpForm(prev => ({ ...prev, employmentType: e.target.value as EmploymentType }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="permanent">Karyawan Tetap</option>
                      <option value="contract">Kontrak (PKWT)</option>
                      <option value="freelance">Freelance / Mitra PSB</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Gaji Pokok (Rp)</label>
                    <input
                      type="number"
                      value={empForm.basicSalary || ''}
                      onChange={e => setEmpForm(prev => ({ ...prev, basicSalary: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tunjangan (Rp)</label>
                    <input
                      type="number"
                      value={empForm.allowance || ''}
                      onChange={e => setEmpForm(prev => ({ ...prev, allowance: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Komisi / PSB (Rp)</label>
                    <input
                      type="number"
                      value={empForm.psbIncentivePerTask || ''}
                      onChange={e => setEmpForm(prev => ({ ...prev, psbIncentivePerTask: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rekening Bank (Nama Bank & No Rekening)</label>
                  <input
                    type="text"
                    placeholder="BCA 8910-2391-01 a.n Rian"
                    value={empForm.bankAccount || ''}
                    onChange={e => setEmpForm(prev => ({ ...prev, bankAccount: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddEmpModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
                  >
                    Simpan Karyawan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Terbitkan SPK */}
      <AnimatePresence>
        {showAddSpkModal && (
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
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Terbitkan Surat Perintah Kerja (SPK)</h3>
                    <p className="text-xs text-slate-500">Tugaskan teknisi untuk pekerjaan lapangan.</p>
                  </div>
                </div>
                <button onClick={() => setShowAddSpkModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveWorkOrder} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Jenis Pekerjaan *</label>
                    <select
                      value={spkForm.type}
                      onChange={e => setSpkForm(prev => ({ ...prev, type: e.target.value as WorkOrderType }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="psb_installation">Pasang Baru (PSB)</option>
                      <option value="los_troubleshooting">Perbaikan LOS / Redaman</option>
                      <option value="cable_cut_repair">Kabel Putus (Cut FO)</option>
                      <option value="relocation">Relokasi Titik ONT</option>
                      <option value="routine_maintenance">Perapihan ODP / Feeder</option>
                      <option value="dismantle">Bongkar / Dismantle</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Teknisi Ditugaskan</label>
                    <select
                      value={spkForm.assignedTechnicianId || ''}
                      onChange={e => setSpkForm(prev => ({ ...prev, assignedTechnicianId: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="">-- Pilih Teknisi --</option>
                      {employees.filter(e => e.role.includes('technician')).map(e => (
                        <option key={e.id} value={e.id}>{e.name} ({ROLE_MAP[e.role]?.label})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nama Pelanggan *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bapak Hendri"
                      value={spkForm.customerName || ''}
                      onChange={e => setSpkForm(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp Pelanggan</label>
                    <input
                      type="text"
                      placeholder="0812XXXXXXXX"
                      value={spkForm.customerPhone || ''}
                      onChange={e => setSpkForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alamat Lokasi Pemasangan / Gangguan *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jl. Mayor Zen No. 12, Sekojo, Palembang"
                    value={spkForm.address || ''}
                    onChange={e => setSpkForm(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Catatan Tambahan / Detail Port ODP</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. ODP-SKJ-04 Port 3, Redaman ODP -16dBm, Pelanggan minta kabel masuk dari samping."
                    value={spkForm.notes || ''}
                    onChange={e => setSpkForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddSpkModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
                  >
                    Terbitkan SPK
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Slip Gaji Resmi & Bayar */}
      <AnimatePresence>
        {showPaySlipModal && selectedSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Musi Cyber FTTH Network</span>
                  <h3 className="font-bold text-slate-900 text-base">Slip Gaji & Insentif Karyawan</h3>
                </div>
                <button onClick={() => setShowPaySlipModal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Salary Breakdown Voucher */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <div>
                    <div className="font-bold text-slate-900">{selectedSlip.employeeName}</div>
                    <div className="text-[10px] text-slate-500">{selectedSlip.role}</div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-slate-600">
                    <div>No: {selectedSlip.slipNumber}</div>
                    <div>{selectedSlip.period}</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Gaji Pokok:</span>
                    <span className="font-mono">{formatRupiah(selectedSlip.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tunjangan Operasional:</span>
                    <span className="font-mono">{formatRupiah(selectedSlip.allowance)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Insentif Pasang Baru (PSB):</span>
                    <span className="font-mono">+{formatRupiah(selectedSlip.psbIncentive)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-medium pb-2 border-b border-slate-200">
                    <span>Potongan BPJS / Kasbon:</span>
                    <span className="font-mono">-{formatRupiah(selectedSlip.deductions)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 font-bold text-slate-900 text-sm">
                  <span>Total Diterima (Take Home Pay):</span>
                  <span className="text-indigo-600 font-mono text-base">{formatRupiah(selectedSlip.totalTakeHomePay)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => handleProcessPayrollPayment(selectedSlip, 'Transfer Bank BCA')}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Bayar & Catat ke Buku Kas Keuangan</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Slip</span>
                  </button>
                  <button
                    onClick={() => setShowPaySlipModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
