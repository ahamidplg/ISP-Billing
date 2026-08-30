import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Router as RouterIcon, 
  Map as MapIcon, 
  CreditCard, 
  Settings, 
  Bell, 
  Search,
  Activity,
  Wifi,
  ShieldCheck,
  HardDrive,
  Cpu,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Circle,
  LogOut,
  LogIn,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  Terminal,
  Plus,
  Trash2,
  X,
  Power,
  Zap,
  Thermometer,
  ZapOff,
  Gauge,
  Radio,
  Share2,
  Wallet,
  Boxes,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import NetworkMap from './components/NetworkMap';
import { FinanceModule } from './components/FinanceModule';
import { AssetModule } from './components/AssetModule';
import { HRModule } from './components/HRModule';
import { ispService, Router, isValidMacAddress } from './services/ispService';

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Mock Data ---
const MOCK_TRAFFIC = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  download: Math.floor(Math.random() * 800) + 200,
  upload: Math.floor(Math.random() * 200) + 50,
}));

const MOCK_ROUTERS = [
  { id: '1', name: 'Core-BGP-01', status: 'online', load: 34, temp: 45, uptime: '14d 2h' },
  { id: '2', name: 'OLT-FTTH-Central', status: 'online', load: 56, temp: 52, uptime: '8d 5h' },
  { id: '3', name: 'Edge-Bras-South', status: 'warning', load: 82, temp: 68, uptime: '1d 12h' },
];

// --- Contexts ---
const AuthContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });
export const useAuth = () => useContext(AuthContext);

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Activity className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginView />;

  return (
    <AuthContext.Provider value={{ user, loading }}>
      <TenantInitializer>
        <AppShell />
      </TenantInitializer>
    </AuthContext.Provider>
  );
}

function TenantInitializer({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      if (!user) return;
      try {
        const tenantId = 'fiber_ops_prod'; // Default tenant
        console.log('[BOOTSTRAP] Checking tenant membership...');
        
        // Use ispService logic to ensure tenant and member exist
        // We use a try-catch because if they don't exist, we just create them
        await ispService.createTenant('Musi Cyber Enterprise', tenantId);
        console.log('[BOOTSTRAP] Tenant and membership verified/created.');
      } catch (err: any) {
        // If it already exists, createTenant might throw (but actually we used setDoc so it's idempotent for the doc, 
        // but set_up_firebase rules might be strict)
        console.log('[BOOTSTRAP] Note:', err.message);
      } finally {
        setInitializing(false);
      }
    };
    bootstrap();
  }, [user]);

  if (initializing) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <Activity className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Menyinkronkan Izin Node Edge...</p>
      </div>
    );
  }

  return <>{children}</>;
}

// --- Login View ---
function LoginView() {
  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <div className="h-screen w-full flex bg-white font-sans overflow-hidden">
      <div className="flex-1 flex flex-col justify-center px-12 lg:px-24">
        <div className="max-w-md w-full mx-auto space-y-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-slate-200 shadow-lg">
              IB
            </div>
            <span className="text-slate-900 font-bold text-2xl tracking-tight">Penagihan ISP</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-slate-900 tracking-tighter leading-tight">ISP Anda,<br /><span className="text-indigo-600">Didesain Ulang.</span></h1>
            <p className="text-slate-500 text-lg leading-relaxed">Manajemen FTTH multi-tenant dengan visibilitas jaringan real-time dan pelacakan pendapatan otomatis.</p>
          </div>
          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-md active:scale-[0.98]"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5 brightness-[100]" alt="Google" />
              Sign in dengan Google
            </button>
            <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">Hanya Akses Berwenang</p>
          </div>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bg-slate-50 border-l border-slate-100 items-center justify-center relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-[100px]"></div>
         <div className="relative p-12 bg-white rounded-2xl shadow-2xl border border-slate-200 w-[480px] space-y-6">
            <div className="flex justify-between items-center">
               <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
               </div>
               <div className="px-3 py-1 bg-slate-100 rounded text-[10px] font-mono text-slate-500 uppercase tracking-wider">production.billing.v4</div>
            </div>
            <div className="space-y-4">
               <div className="h-4 bg-slate-100 rounded-full w-2/3"></div>
               <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
               <div className="h-32 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                  <Activity className="w-8 h-8 text-indigo-400 animate-pulse" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// --- App Shell ---
function AppShell() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();
  const handleLogout = () => signOut(auth);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className={cn("bg-slate-900 flex flex-col transition-all duration-300 border-r border-slate-800 shrink-0", isSidebarOpen ? "w-56" : "w-20")}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 text-slate-900 rounded flex items-center justify-center font-bold">IB</div>
          {isSidebarOpen && <span className="text-white font-bold tracking-tight">Penagihan ISP</span>}
        </div>
        <nav className="flex-1 px-3 space-y-1 mt-4">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-3 pb-2 tracking-wider">Operasi Jaringan</div>
          <SidebarItem icon={LayoutDashboard} label="Dasbor" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} isOpen={isSidebarOpen} />
          <SidebarItem icon={Users} label="Pelanggan" isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} isOpen={isSidebarOpen} />
          <SidebarItem icon={RouterIcon} label="Manajemen OLT" isActive={activeTab === 'network'} onClick={() => setActiveTab('network')} isOpen={isSidebarOpen} />
          <SidebarItem icon={MapIcon} label="Pemetaan Fiber" isActive={activeTab === 'map'} onClick={() => setActiveTab('map')} isOpen={isSidebarOpen} />
          
          <div className="pt-4 text-[10px] uppercase font-bold text-slate-500 px-3 pb-2 tracking-wider">Keuangan & Billing</div>
          <SidebarItem icon={Wallet} label="Modul Keuangan" isActive={activeTab === 'finance'} onClick={() => setActiveTab('finance')} isOpen={isSidebarOpen} />
          <SidebarItem icon={CreditCard} label="Siklus Penagihan" isActive={activeTab === 'billing'} onClick={() => setActiveTab('billing')} isOpen={isSidebarOpen} />

          <div className="pt-4 text-[10px] uppercase font-bold text-slate-500 px-3 pb-2 tracking-wider">Aset & Tim</div>
          <SidebarItem icon={Boxes} label="Pencatatan Aset" isActive={activeTab === 'assets'} onClick={() => setActiveTab('assets')} isOpen={isSidebarOpen} />
          <SidebarItem icon={Briefcase} label="Modul HR & Tim" isActive={activeTab === 'hr'} onClick={() => setActiveTab('hr')} isOpen={isSidebarOpen} />
        </nav>
        
        {isSidebarOpen && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex justify-between">
              <span>Beban Sistem</span>
              <span>24%</span>
            </div>
            <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-400 h-full w-[24%]"></div>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-slate-800">
          <SidebarItem icon={Settings} label="Konfigurasi" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} isOpen={isSidebarOpen} />
          <SidebarItem icon={LogOut} label="Keluar" onClick={handleLogout} isOpen={isSidebarOpen} danger />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 text-slate-500 shadow-sm z-20 shrink-0">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Activity className="w-4 h-4" /></button>
             <div className="h-6 w-px bg-slate-200 mx-1"></div>
             <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-600">
                <div className="w-2 h-2 rounded-full bg-indigo-500 status-pulse"></div>
                TENANT: FIBER_OPS_PROD
             </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-slate-400 tracking-wider">
                <div className="flex items-center gap-1.5 uppercase">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> RADIUS API: ONLINE
                </div>
                <div className="flex items-center gap-1.5 uppercase">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> MIKROTIK: SYNCED
                </div>
             </div>
             <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
                <div className="text-right">
                   <p className="text-xs font-bold text-slate-900 leading-none mb-1">{user?.displayName?.split(' ')[0]}</p>
                   <p className="text-[9px] uppercase font-mono tracking-tighter text-slate-400 font-bold">Admin Level 4</p>
                </div>
                <img src={user?.photoURL || ''} className="w-8 h-8 rounded border border-slate-200 p-0.5 bg-white" alt="Avatar" />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardView key="dashboard" />}
            {activeTab === 'customers' && <SubscribersView key="customers" />}
            {activeTab === 'network' && <InfrastructureView key="network" />}
            {activeTab === 'map' && <MapView key="map" />}
            {activeTab === 'finance' && <FinanceModule key="finance" tenantId="fiber_ops_prod" initialTab="ringkasan" />}
            {activeTab === 'billing' && <FinanceModule key="billing" tenantId="fiber_ops_prod" initialTab="tagihan" />}
            {activeTab === 'assets' && <AssetModule key="assets" tenantId="fiber_ops_prod" />}
            {activeTab === 'hr' && <HRModule key="hr" tenantId="fiber_ops_prod" />}
            {activeTab === 'settings' && <SettingsView key="settings" />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- Views ---

function DashboardView() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total FTTH Aktif" value="14,282" change="+3.4%" trend="up" icon={Users} />
        <StatCard label="Bandwidth Saat Ini" value="8.42 Gbps" change="92.4% Penggunaan" trend="warn" icon={Activity} />
        <StatCard label="Pendapatan (Bulan Ini)" value="Rp 124.500.000" change="+Rp 2.100.000 Tertunda" trend="up" icon={CreditCard} />
        <StatCard label="Node OLT Aktif" value="48/48" change="Normal" trend="up" icon={HardDrive} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-center mb-10">
              <h3 className="font-bold text-slate-800">Throughput Fiber (Gabungan)</h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Unduh</div>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><div className="w-2 h-2 rounded-full bg-slate-200"></div> Unggah</div>
              </div>
           </div>
           <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={MOCK_TRAFFIC}>
                    <defs>
                       <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.08}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} tickFormatter={(v) => `${v}G`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)' }} />
                    <Area type="monotone" dataKey="download" stroke="#6366f1" fillOpacity={1} fill="url(#colorTraffic)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="upload" stroke="#cbd5e1" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl flex flex-col text-slate-300">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-400 status-pulse"></div>
                 Automation Logs
              </h3>
              <span className="text-[10px] font-mono text-slate-500">tail -f mikrotik.log</span>
           </div>
           <div className="space-y-4 flex-1 font-mono text-[10px] leading-relaxed overflow-hidden">
              <div className="flex gap-2">
                 <span className="text-slate-600 shrink-0">[14:22:01]</span>
                 <span><span className="text-indigo-400 underline">SCHEDULER:</span> Running auto-suspend check...</span>
              </div>
              <div className="flex gap-2 text-slate-500">
                 <span className="shrink-0">[14:22:05]</span>
                 <span>PROCESSED: 1,429 active sessions.</span>
              </div>
              <div className="flex gap-2">
                 <span className="text-slate-600 shrink-0">[14:23:44]</span>
                 <span className="text-amber-400">WARNING: High latency on OLT-XN-02 [14ms avg]</span>
              </div>
              <div className="flex gap-2">
                 <span className="text-slate-600 shrink-0">[14:24:12]</span>
                 <span className="text-white">API_CALL: routeros_api.get_queues() - SUCCESS</span>
              </div>
              <div className="flex gap-2">
                 <span className="text-slate-600 shrink-0">[14:25:01]</span>
                 <span className="text-rose-400 font-bold">TIMEOUT: PPP_POE peer node 88:E9:FE:12 unreachable</span>
              </div>
              <div className="flex gap-2 text-slate-500">
                 <span className="shrink-0">[14:25:05]</span>
                 <span>Retrying automated reconnect [1/3]</span>
              </div>
              <div className="flex gap-2">
                 <span className="text-slate-600 shrink-0">[14:25:08]</span>
                 <span className="text-emerald-500 font-bold">RECOVERY: Link restored on FiberPort G1/1</span>
              </div>
              <div className="animate-pulse">_</div>
           </div>
           <button className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors">Access SSH Terminal</button>
        </div>
      </div>
    </motion.div>
  );
}

function SubscribersView() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', macAddress: '', planId: 'basic', latitude: '', longitude: '' });
  const [error, setError] = useState<string | null>(null);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // In a real app we'd use the current tenant slug
      const data = await ispService.getCustomers('fiber_ops_prod');
      setCustomers(data || []);
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const toggleSelectAll = () => {
    if (selectedIds.length === customers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(customers.map(c => c.id).filter(id => id !== undefined) as string[]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async (status: 'active' | 'suspended') => {
    if (!selectedIds.length) return;
    setBulkProcessing(true);
    try {
      await ispService.bulkUpdateCustomerStatus(selectedIds, status);
      await fetchCustomers();
    } catch (err) {
      console.error(err);
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await ispService.addCustomer('fiber_ops_prod', { 
        ...formData, 
        status: 'active',
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined
      });
      setShowModal(false);
      setFormData({ name: '', username: '', macAddress: '', planId: 'basic', latitude: '', longitude: '' });
      fetchCustomers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
       <div className="flex justify-between items-center text-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pelanggan</h1>
            <p className="text-xs text-slate-500 font-medium tracking-tight">Kelola profil pelanggan FTTH dan identitas perangkat keras.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all cursor-pointer"
          >
             <Users className="w-3.5 h-3.5" /> Daftar Akun Baru
          </button>
       </div>

       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-slate-800"
              >
                 <div className="flex flex-col">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tindakan Massal</p>
                  <p className="text-xs font-bold text-white">{selectedIds.length} Node Terpilih</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    disabled={bulkProcessing}
                    onClick={() => handleBulkAction('active')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                  >
                    {bulkProcessing ? <Activity className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
                    Aktifkan Terpilih
                  </button>
                  <button 
                    disabled={bulkProcessing}
                    onClick={() => handleBulkAction('suspended')}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                  >
                    {bulkProcessing ? <Activity className="w-3 h-3 animate-spin" /> : <Power className="w-3 h-3" />}
                    Tangguhkan Terpilih
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-slate-50/50 text-[9px] uppercase font-bold tracking-widest text-slate-500 border-b border-slate-100">
                   <th className="px-6 py-4 w-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                        checked={customers.length > 0 && selectedIds.length === customers.length}
                        onChange={toggleSelectAll}
                      />
                   </th>
                   <th className="px-6 py-4">Account Holder</th>
                   <th className="px-6 py-4">Username/PPPoE</th>
                   <th className="px-6 py-4">MAC Address</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8 h-16 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center">
                      <p className="text-slate-400 text-xs font-bold uppercase">Tidak ada pelanggan ditemukan di tenant saat ini</p>
                    </td>
                  </tr>
                ) : customers.map((c: any) => (
                  <tr key={c.id} className={`hover:bg-slate-50/50 transition-colors group ${c.id && selectedIds.includes(c.id) ? 'bg-indigo-50/30' : ''}`}>
                     <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          checked={c.id && selectedIds.includes(c.id)}
                          onChange={() => c.id && toggleSelect(c.id)}
                        />
                     </td>
                     <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">{c.name}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">ID: {c.id?.slice(0, 8)}</p>
                     </td>
                     <td className="px-6 py-4 font-mono text-[10px] text-indigo-600 font-bold tracking-wider">{c.username}</td>
                     <td className="px-6 py-4 font-mono text-[10px] text-slate-500 font-bold">{c.macAddress || '—'}</td>
                     <td className="px-6 py-4"><StatusBadge status={c.status === 'active' ? 'online' : 'offline'} /></td>
                     <td className="px-6 py-4 text-right">
                        <button className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 transition-all">
                           <MoreHorizontal className="w-4 h-4" />
                        </button>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
       </div>

       {showModal && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                     <div className="p-1 bg-indigo-100 text-indigo-600 rounded">
                        <Users className="w-4 h-4" />
                     </div>
                     Account Provisioning
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><AlertCircle className="w-5 h-5 rotate-45" /></button>
               </div>
               <form onSubmit={handleCreate} className="p-6 space-y-4">
                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                       <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                       <p className="text-[10px] font-bold text-rose-600 uppercase tracking-tight leading-relaxed">{error}</p>
                    </div>
                  )}
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Identity</label>
                     <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        placeholder="Musi Cyber User 022" 
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PPPoE Handle</label>
                        <input 
                           required
                           type="text" 
                           value={formData.username}
                           onChange={e => setFormData({...formData, username: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-indigo-600"
                           placeholder="musi_011" 
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hardware MAC</label>
                        <input 
                           type="text" 
                           value={formData.macAddress}
                           onChange={e => setFormData({...formData, macAddress: e.target.value.toUpperCase()})}
                           className={cn(
                             "w-full bg-slate-50 border rounded-lg px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 transition-all font-bold",
                             formData.macAddress && !isValidMacAddress(formData.macAddress) 
                               ? "border-rose-300 text-rose-600 focus:ring-rose-500/20 focus:border-rose-500" 
                               : "border-slate-200 text-slate-900 focus:ring-indigo-500/20 focus:border-indigo-500"
                           )}
                           placeholder="00:11:22:33:44:55" 
                        />
                        {formData.macAddress && !isValidMacAddress(formData.macAddress) && (
                          <p className="text-[9px] font-bold text-rose-500 uppercase">Invalid Format</p>
                        )}
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Geo Latitude</label>
                        <input 
                           type="number"
                           step="any"
                           value={formData.latitude}
                           onChange={e => setFormData({...formData, latitude: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                           placeholder="-6.2088" 
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Geo Longitude</label>
                        <input 
                           type="number"
                           step="any"
                           value={formData.longitude}
                           onChange={e => setFormData({...formData, longitude: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                           placeholder="106.8456" 
                        />
                     </div>
                  </div>
                  <div className="space-y-1.5 pt-2">
                     <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]">
                        Push To Edge Node
                     </button>
                  </div>
               </form>
            </motion.div>
         </div>
       )}
    </motion.div>
  );
}

function InfrastructureView() {
  const [viewMode, setViewMode] = useState<'routers' | 'olts' | 'odps'>('olts');
  const [routers, setRouters] = useState<any[]>([]);
  const [olts, setOlts] = useState<any[]>([]);
  const [odps, setOdps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOlt, setSelectedOlt] = useState<any>(null);
  const [unconfiguredOnus, setUnconfiguredOnus] = useState<any[]>([]);
  const [configuredOnus, setConfiguredOnus] = useState<any[]>([]);
  const [isOltLoading, setIsOltLoading] = useState(false);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionFormData, setProvisionFormData] = useState({ 
    name: '', 
    ip: '', 
    brand: 'huawei' as 'huawei' | 'zte' | 'bdcom', 
    protocol: 'ssh' as 'ssh' | 'telnet',
    status: 'online' as const, 
    username: '', 
    password: '' 
  });
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [provisionSuccess, setProvisionSuccess] = useState<string | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [selectedRouter, setSelectedRouter] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [isDiagFetching, setIsDiagFetching] = useState(false);
  const [diagError, setDiagError] = useState<string | null>(null);
  const [selectedOdp, setSelectedOdp] = useState<any>(null);
  const [showOdpModal, setShowOdpModal] = useState(false);
  const [odpFormData, setOdpFormData] = useState({ name: '', oltId: '', ports: 8, lat: -6.21, lng: 106.84 });
  const [odpError, setOdpError] = useState<string | null>(null);
  const [isOdpSubmitting, setIsOdpSubmitting] = useState(false);
  const [selectedUnconfiguredOnus, setSelectedUnconfiguredOnus] = useState<string[]>([]);
  const [isBulkAuthorizing, setIsBulkAuthorizing] = useState(false);

  const handleBulkAuthorize = async () => {
    if (!selectedOlt || selectedUnconfiguredOnus.length === 0) return;
    setIsBulkAuthorizing(true);
    try {
      const promises = unconfiguredOnus
        .filter(onu => selectedUnconfiguredOnus.includes(onu.sn))
        .map(onu => ispService.authorizeOnu(selectedOlt.id, {
          sn: onu.sn,
          ponPort: onu.pon,
          customerId: 'pending'
        }));
      await Promise.all(promises);
      setSelectedUnconfiguredOnus([]);
      fetchOltDetails(selectedOlt);
    } catch (err) {
      console.error('Bulk authorization failed', err);
    } finally {
      setIsBulkAuthorizing(false);
    }
  };

  const toggleSelectAllOnus = () => {
    if (selectedUnconfiguredOnus.length === unconfiguredOnus.length) {
      setSelectedUnconfiguredOnus([]);
    } else {
      setSelectedUnconfiguredOnus(unconfiguredOnus.map(o => o.sn));
    }
  };

  const toggleSelectOnu = (sn: string) => {
    setSelectedUnconfiguredOnus(prev => 
      prev.includes(sn) ? prev.filter(s => s !== sn) : [...prev, sn]
    );
  };

  const [selectedOnuDetails, setSelectedOnuDetails] = useState<any>(null);
  const [onuMetrics, setOnuMetrics] = useState<any>(null);
  const [isMetricsFetching, setIsMetricsFetching] = useState(false);
  const [showOnuModal, setShowOnuModal] = useState(false);

  const fetchOnuDetails = async (oltId: string, onuSn: string) => {
    setIsMetricsFetching(true);
    setShowOnuModal(true);
    try {
      const [details, metrics] = await Promise.all([
        ispService.getOnuDetails(oltId, onuSn),
        ispService.getOnuTechnicalMetrics(oltId, onuSn)
      ]);
      setSelectedOnuDetails({ ...details, sn: onuSn });
      setOnuMetrics(metrics);
    } catch (err) {
      console.error('Failed to fetch ONU info', err);
    } finally {
      setIsMetricsFetching(false);
    }
  };

  const handleRegisterOdp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOdpSubmitting(true);
    setOdpError(null);
    try {
      await ispService.addOdp('musi_cyber', odpFormData);
      setShowOdpModal(false);
      setOdpFormData({ name: '', oltId: '', ports: 8, lat: -6.21, lng: 106.84 });
      fetchData();
    } catch (err: any) {
      setOdpError(err.message);
    } finally {
      setIsOdpSubmitting(false);
    }
  };

  const fetchLiveHealth = async (routerId: string) => {
    setIsDiagFetching(true);
    setDiagError(null);
    try {
      const data = await ispService.getRouterHealth('musi_cyber', routerId);
      setHealthData(data);
    } catch (err: any) {
      setDiagError(err.message || 'Failed to fetch node metrics');
    } finally {
      setIsDiagFetching(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rData, oData, odpData] = await Promise.all([
        ispService.getRouters('musi_cyber'),
        ispService.getOlts('musi_cyber'),
        ispService.getOdpNodes('musi_cyber')
      ]);
      setRouters(rData || []);
      setOlts(oData || []);
      setOdps(odpData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRegisterHw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);
    setProvisionError(null);
    setProvisionSuccess(null);
    try {
      if (viewMode === 'olts') {
        const { addDoc, collection } = await import('firebase/firestore');
        await addDoc(collection(db, 'olt_nodes'), { ...provisionFormData, tenantId: 'musi_cyber' });
      } else {
        await ispService.addRouter('musi_cyber', { ...provisionFormData });
      }
      setShowProvisionModal(false);
      setProvisionFormData({ 
        name: '', 
        ip: '', 
        brand: 'huawei', 
        protocol: 'ssh',
        status: 'online', 
        username: '', 
        password: '' 
      });
      fetchData();
    } catch (err: any) {
      setProvisionError(err.message);
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setProvisionError(null);
    setProvisionSuccess(null);
    try {
      const res = await ispService.testOltConnection({
        ...provisionFormData,
        vendor: provisionFormData.brand
      });
      setProvisionSuccess(res.message);
    } catch (err: any) {
      setProvisionError(err.message);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const fetchOltDetails = async (olt: any) => {
    setSelectedOlt(olt);
    setIsOltLoading(true);
    setSelectedOnuDetails(null);
    setOnuMetrics(null);
    try {
      const [unconfigured, configured] = await Promise.all([
        ispService.getUnconfiguredOnus(olt.id),
        ispService.getConfiguredOnus(olt.id)
      ]);
      setUnconfiguredOnus(unconfigured);
      setConfiguredOnus(configured);
    } catch (err) {
      console.error(err);
    } finally {
      setIsOltLoading(false);
    }
  };


  const handleAuthorize = async (onu: any) => {
    if (!selectedOlt) return;
    try {
      await ispService.authorizeOnu(selectedOlt.id, {
        sn: onu.sn,
        ponPort: onu.pon,
        customerId: 'pending'
      });
      fetchOltDetails(selectedOlt);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
       <div className="flex justify-between items-center text-slate-800">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold tracking-tight">Infrastruktur</h1>
            <div className="flex bg-slate-200/50 p-1 rounded-lg border border-slate-200">
               <button 
                onClick={() => setViewMode('olts')}
                className={cn("px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all", viewMode === 'olts' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
               >
                 OLT FTTH
               </button>
               <button 
                onClick={() => setViewMode('routers')}
                className={cn("px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all", viewMode === 'routers' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
               >
                 Router Utama
               </button>
               <button 
                onClick={() => setViewMode('odps')}
                className={cn("px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all", viewMode === 'odps' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
               >
                 PDN/ODP
               </button>
            </div>
          </div>
          <button 
            onClick={() => {
              if (viewMode === 'odps') {
                setShowOdpModal(true);
              } else {
                setShowProvisionModal(true);
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all cursor-pointer"
          >
             <Plus className="w-3.5 h-3.5" /> {viewMode === 'odps' ? 'Daftar ODP' : 'Daftar HW'}
          </button>
       </div>
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                   <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{viewMode === 'olts' ? 'Terminal Jalur Optik' : viewMode === 'routers' ? 'Router Jaringan' : 'Titik Distribusi Optik'}</h3>
                   <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{viewMode === 'olts' ? olts.length : viewMode === 'routers' ? routers.length : odps.length} Node Aktif</span>
                </div>
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-slate-50/20 text-[9px] uppercase font-bold tracking-widest text-slate-500 border-b border-slate-100">
                         <th className="px-6 py-4">{viewMode === 'odps' ? 'Identitas ODP' : 'Identitas Node'}</th>
                         <th className="px-6 py-4">Endpoint IP / Lokasi</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4 text-right">Perintah</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={4} className="px-6 py-8 h-16 bg-slate-50/20"></td>
                          </tr>
                        ))
                      ) : (viewMode === 'olts' ? olts : viewMode === 'routers' ? routers : odps).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-24 text-center">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tidak ada perangkat keras yang diprovisi di sektor ini</p>
                            <p className="text-[10px] text-slate-300 mt-2">Daftarkan node untuk mulai memantau aset</p>
                          </td>
                        </tr>
                      ) : (viewMode === 'olts' ? olts : viewMode === 'routers' ? routers : odps).map((node: any) => (
                        <tr 
                          key={node.id} 
                          onClick={() => {
                            if (viewMode === 'olts') {
                              fetchOltDetails(node);
                            } else if (viewMode === 'routers') {
                              setSelectedRouter(node);
                              fetchLiveHealth(node.id);
                            } else {
                              setSelectedOdp(node);
                            }
                          }}
                          className={cn(
                            "hover:bg-slate-50/50 transition-colors group cursor-pointer",
                            viewMode === 'olts' 
                              ? (selectedOlt?.id === node.id ? "bg-indigo-50/30" : "")
                              : viewMode === 'routers' 
                                ? (selectedRouter?.id === node.id ? "bg-indigo-50/30" : "")
                                : (selectedOdp?.id === node.id ? "bg-indigo-50/30" : "")
                          )}
                        >
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border", (node.status === 'online' || viewMode === 'odps') ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600")}>
                                    <Share2 className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">{node.name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                                      {viewMode === 'odps' ? `Splitter Port ${node.ports || 8}` : `Infrastruktur ${node.brand || 'Generik'}`}
                                    </p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 font-mono text-[10px] text-slate-500">
                             {viewMode === 'odps' ? `${node.lat?.toFixed(4) || '0.0000'}, ${node.lng?.toFixed(4) || '0.0000'}` : node.ip}
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                 <div className={cn("w-1.5 h-1.5 rounded-full", (node.status === 'online' || viewMode === 'odps') ? "bg-emerald-500" : "bg-rose-500 animate-pulse")}></div>
                                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{viewMode === 'odps' ? 'Installed' : node.status}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 opacity-0 group-hover:opacity-100 transition-all"><ChevronRight className="w-4 h-4" /></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>

          <div className="lg:col-span-1 border-l border-slate-100 pl-2">
            {viewMode === 'olts' ? (
              selectedOlt ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                  <div className="p-6 border-b border-slate-100 bg-slate-900 text-white">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none">Diagnostic Shell</p>
                        <h3 className="text-lg font-bold tracking-tight">{selectedOlt.name}</h3>
                      </div>
                      <div className="p-2 bg-slate-800 rounded-lg text-indigo-400"><Terminal className="w-4 h-4" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                         <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">Optical Load</p>
                         <p className="text-sm font-mono font-bold text-white">128/1024</p>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                         <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-1">Temp Info</p>
                         <p className="text-sm font-mono font-bold text-emerald-400">42°C Norm</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authorized Fleet</h4>
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{configuredOnus.length} Active</span>
                      </div>
                      
                      <div className="space-y-2">
                        {configuredOnus.length === 0 ? (
                          <p className="text-[10px] text-slate-400 text-center py-4 border border-dashed border-slate-100 rounded-lg">No active sessions</p>
                        ) : configuredOnus.map((onu, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => selectedOlt && fetchOnuDetails(selectedOlt.id, onu.sn)}
                            className="p-3 bg-white border border-slate-100 rounded-xl group hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                          >
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                                   <Zap className="w-4 h-4" />
                                </div>
                                <div className="space-y-0.5">
                                   <p className="text-[10px] font-mono font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase">{onu.sn}</p>
                                   <p className="text-[8px] text-slate-400 font-bold uppercase">PON: {onu.pon}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           {unconfiguredOnus.length > 0 && (
                             <input 
                               type="checkbox" 
                               checked={selectedUnconfiguredOnus.length === unconfiguredOnus.length && unconfiguredOnus.length > 0}
                               onChange={toggleSelectAllOnus}
                               className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                             />
                           )}
                           <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ONU Belum Dikonfigurasi</h4>
                        </div>
                        {isOltLoading && <Activity className="w-3 h-3 text-indigo-500 animate-spin" />}
                      </div>
                      
                      {selectedUnconfiguredOnus.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-indigo-600 rounded-xl p-3 flex flex-col gap-3 shadow-lg shadow-indigo-100"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{selectedUnconfiguredOnus.length} Item Terpilih</span>
                            <button onClick={() => setSelectedUnconfiguredOnus([])} className="text-indigo-200 hover:text-white"><X className="w-3 h-3" /></button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                             <button 
                               onClick={handleBulkAuthorize}
                               disabled={isBulkAuthorizing}
                               className="flex-1 py-1.5 bg-white text-indigo-600 rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                             >
                               {isBulkAuthorizing ? 'Memproses...' : 'Otorisasi Terpilih'}
                             </button>
                             <button 
                               onClick={() => alert('Logika penugasan Plan Group menunggu integrasi backend')}
                               className="flex-1 py-1.5 bg-indigo-500 text-white border border-indigo-400 rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-indigo-400 transition-colors"
                             >
                               Tugaskan Plan Group
                             </button>
                          </div>
                        </motion.div>
                      )}

                      <div className="space-y-2">
                        {unconfiguredOnus.length === 0 ? (
                          <div className="py-12 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-300">
                            <HardDrive className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-[9px] font-bold uppercase tracking-widest">Tidak ada perangkat keras terdeteksi</p>
                          </div>
                        ) : unconfiguredOnus.map((onu, idx) => (
                          <div 
                            key={idx} 
                            onClick={(e) => {
                               if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'INPUT') {
                                 toggleSelectOnu(onu.sn);
                               }
                            }}
                            className={cn(
                              "p-4 bg-slate-50 border border-slate-200 rounded-xl group hover:border-indigo-300 transition-all cursor-pointer relative",
                              selectedUnconfiguredOnus.includes(onu.sn) ? "border-indigo-400 bg-indigo-50/10" : ""
                            )}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex gap-3">
                                 <input 
                                   type="checkbox" 
                                   checked={selectedUnconfiguredOnus.includes(onu.sn)}
                                   onChange={() => toggleSelectOnu(onu.sn)}
                                   className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                                 />
                                 <div>
                                   <p className="text-[10px] font-mono font-bold text-indigo-600 select-all uppercase">{onu.sn}</p>
                                   <p className="text-[9px] text-slate-400 font-bold uppercase">PON: {onu.pon} | Merek: {onu.vendor}</p>
                                 </div>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAuthorize(onu);
                                }}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded text-[9px] font-bold uppercase tracking-wider hover:bg-slate-900 transition-colors shadow-lg shadow-indigo-100"
                              >
                                Otorisasi
                              </button>
                            </div>
                            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                               <motion.div initial={{ width: 0 }} animate={{ width: '0%' }} className="bg-indigo-500 h-full"></motion.div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button 
                      onClick={() => selectedOlt && fetchOltDetails(selectedOlt)}
                      className="w-full py-3 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-sm font-bold disabled:opacity-50"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5", isOltLoading && "animate-spin")} /> Pindai Ulang Antarmuka PON
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col items-center justify-center p-12 text-center text-slate-300">
                  <Activity className="w-12 h-12 mb-4 opacity-20" />
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Diagnostik Perangkat Keras</h3>
                  <p className="text-[10px] mt-2 leading-relaxed">Pilih node OLT yang telah diprovisi untuk memulai protokol penemuan perangkat keras.</p>
                </div>
              )
            ) : (
              selectedRouter ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                  <div className="p-6 border-b border-slate-100 bg-slate-900 text-white text-center">
                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none mb-2">Shell Diagnostik</p>
                    <h3 className="text-lg font-bold tracking-tight">{selectedRouter.name}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">{selectedRouter.ip}</p>
                  </div>
                  
                  <div className="flex-1 p-6 flex flex-col overflow-y-auto">
                    {isDiagFetching && !healthData ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                          <div className="w-12 h-12 border-2 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                          <Activity className="w-4 h-4 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pulse" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 animate-pulse">Menunggu Handshake API...</p>
                      </div>
                    ) : diagError ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 p-4">
                        <AlertCircle className="w-8 h-8 text-rose-400" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Communication Error</p>
                          <p className="text-[10px] text-slate-500 mt-1">{diagError}</p>
                        </div>
                        <button 
                          onClick={() => fetchLiveHealth(selectedRouter.id)}
                          className="px-4 py-2 bg-slate-100 rounded-md text-[9px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          Retry Connection
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                             <Cpu className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">CPU Utilization</p>
                             <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900">{healthData?.cpu || '0'}%</span>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase">Optimal</span>
                             </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                             <span>Memory (DDR4)</span>
                             <span>{healthData?.memory?.percent || 0}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                                style={{ width: `${healthData?.memory?.percent || 0}%` }}
                             ></div>
                          </div>
                          <p className="text-[9px] font-mono text-slate-400">{healthData?.memory?.used || '0B'} / {healthData?.memory?.total || '0B'} Dialokasikan</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Waktu Aktif</p>
                             <p className="text-xs font-bold text-slate-700 font-mono tracking-tighter">{healthData?.uptime || '0s'}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Suhu Inti</p>
                             <p className="text-xs font-bold text-slate-700 font-mono tracking-tighter">{healthData?.temp || 0}°C</p>
                          </div>
                        </div>

                        <div className="pt-4">
                          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100/50 flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 status-pulse"></div>
                             <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">RouterOS v7.14 Stable</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button 
                      onClick={() => fetchLiveHealth(selectedRouter.id)}
                      className="w-full py-3 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-sm font-bold disabled:opacity-50"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5", isDiagFetching && "animate-spin")} /> Jalankan Cek Kesehatan Sistem
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col items-center justify-center p-12 text-center text-slate-300">
                  <Activity className="w-12 h-12 mb-4 opacity-20" />
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Diagnostik Router</h3>
                  <p className="text-[10px] mt-2 leading-relaxed">Pilih router utama untuk memulai tautan telemetri kesehatan langsung.</p>
                </div>
              )
            )}
          </div>
        </div>

       {showProvisionModal && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                     <div className="p-1 bg-indigo-100 text-indigo-600 rounded">
                        <RouterIcon className="w-4 h-4" />
                     </div>
                     Hardware Provisioning
                  </h3>
                  <button onClick={() => setShowProvisionModal(false)} className="text-slate-400 hover:text-slate-600"><AlertCircle className="w-5 h-5 rotate-45" /></button>
               </div>
               <form onSubmit={handleRegisterHw} className="p-6 space-y-4">
                  {provisionError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2">
                       <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                       <p className="text-[10px] font-bold text-rose-600 uppercase tracking-tight leading-relaxed">{provisionError}</p>
                    </div>
                  )}
                  {provisionSuccess && (
                     <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-2 shadow-sm">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight leading-relaxed">{provisionSuccess}</p>
                     </div>
                  )}
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nama Perangkat Keras</label>
                     <input 
                        required
                        type="text" 
                        value={provisionFormData.name}
                        onChange={e => setProvisionFormData({...provisionFormData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                        placeholder="e.g. CCR2004-CORE-01" 
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Merek Vendor</label>
                        <select 
                           value={provisionFormData.brand}
                           onChange={e => setProvisionFormData({...provisionFormData, brand: e.target.value as any})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                        >
                           <option value="huawei">Huawei</option>
                           <option value="zte">ZTE</option>
                           <option value="bdcom">BDCOM</option>
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protokol</label>
                        <select 
                           value={provisionFormData.protocol}
                           onChange={e => setProvisionFormData({...provisionFormData, protocol: e.target.value as any})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                        >
                           <option value="ssh">SSH (Port 22)</option>
                           <option value="telnet">Telnet (Port 23)</option>
                        </select>
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Endpoint IP</label>
                     <input 
                        required
                        type="text" 
                        value={provisionFormData.ip}
                        onChange={e => setProvisionFormData({...provisionFormData, ip: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-indigo-600"
                        placeholder="10.255.0.1" 
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nama Pengguna API</label>
                        <input 
                           required
                           type="text" 
                           value={provisionFormData.username}
                           onChange={e => setProvisionFormData({...provisionFormData, username: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                           placeholder="admin" 
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status Provisi</label>
                        <select 
                           value={provisionFormData.status}
                           onChange={e => setProvisionFormData({...provisionFormData, status: e.target.value as any})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                        >
                           <option value="online">Online</option>
                           <option value="offline">Maintenance</option>
                        </select>
                     </div>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kata Sandi API</label>
                     <input 
                        required
                        type="password" 
                        value={provisionFormData.password}
                        onChange={e => setProvisionFormData({...provisionFormData, password: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                        placeholder="••••••••" 
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                     <button 
                        type="button"
                        onClick={handleTestConnection}
                        disabled={isTestingConnection}
                        className="py-4 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-slate-200"
                     >
                        {isTestingConnection ? <Activity className="w-3 h-3 animate-spin" /> : <Wifi className="w-3 h-3" />}
                        Test Link
                     </button>
                     <button 
                        type="submit" 
                        disabled={isProvisioning}
                        className="py-4 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
                     >
                        {isProvisioning ? "Mendaftarkan..." : "Provisi Node"}
                     </button>
                  </div>
               </form>
            </motion.div>
         </div>
        )}

        {showOdpModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                   <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <div className="p-1 bg-amber-100 text-amber-600 rounded">
                         <Share2 className="w-4 h-4" />
                      </div>
                      Daftar Titik Distribusi (ODP)
                   </h3>
                   <button onClick={() => setShowOdpModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5 transition-all hover:scale-110" /></button>
                </div>
                <form onSubmit={handleRegisterOdp} className="p-6 space-y-4">
                   {odpError && (
                     <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-tight leading-relaxed">{odpError}</p>
                     </div>
                   )}
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nama ODP</label>
                      <input 
                         required
                         type="text" 
                         value={odpFormData.name}
                         onChange={e => setOdpFormData({...odpFormData, name: e.target.value})}
                         className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                         placeholder="misal: ODP-BKT-01" 
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kapasitas (Port)</label>
                         <input 
                            required
                            type="number" 
                            value={odpFormData.ports}
                            onChange={e => setOdpFormData({...odpFormData, ports: parseInt(e.target.value)})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID OLT Induk</label>
                         <select 
                            required
                            value={odpFormData.oltId}
                            onChange={e => setOdpFormData({...odpFormData, oltId: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                         >
                            <option value="">Pilih OLT</option>
                            {olts.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                         </select>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lintang</label>
                         <input 
                            required
                            type="number"
                            step="any"
                            value={odpFormData.lat}
                            onChange={e => setOdpFormData({...odpFormData, lat: parseFloat(e.target.value)})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold font-mono"
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bujur</label>
                         <input 
                            required
                            type="number"
                            step="any"
                            value={odpFormData.lng}
                            onChange={e => setOdpFormData({...odpFormData, lng: parseFloat(e.target.value)})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold font-mono"
                         />
                      </div>
                   </div>
                   <div className="space-y-1.5 pt-2">
                      <button disabled={isOdpSubmitting} type="submit" className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all active:scale-[0.98] disabled:opacity-50">
                         {isOdpSubmitting ? 'Mendaftarkan...' : 'Provisi ODP'}
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}

        {showOnuModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                className="bg-white rounded-2xl w-full max-lg shadow-2xl overflow-hidden border border-slate-100"
              >
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight leading-none mb-1">Diagnostik ONU</h3>
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{selectedOnuDetails?.sn || 'Memuat...'}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowOnuModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {isMetricsFetching && !onuMetrics ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">Menjalankan Diagnostik Optik...</p>
                    </div>
                  ) : (
                    <>
                      {/* Technical Metrics Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Daya RX</span>
                            <Radio className="w-3.5 h-3.5 text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-900 tracking-tighter">{onuMetrics?.rxPower || '-21.40'}<span className="text-xs ml-1 font-medium text-slate-400">dBm</span></p>
                            <div className="mt-2 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full transition-all duration-1000",
                                  parseFloat(onuMetrics?.rxPower || "-22") < -27 ? "bg-rose-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${Math.min(100, Math.max(0, (parseFloat(onuMetrics?.rxPower || "-22") + 40) * 2))}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Daya TX</span>
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-900 tracking-tighter">{onuMetrics?.txPower || '2.10'}<span className="text-xs ml-1 font-medium text-slate-400">dBm</span></p>
                            <div className="mt-2 w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 w-[65%]"></div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Suhu</span>
                            <p className="text-lg font-bold text-slate-900 tracking-tight">{onuMetrics?.temperature || '45.2'}°C</p>
                          </div>
                          <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                            <Thermometer className="w-4 h-4" />
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tegangan</span>
                            <p className="text-lg font-bold text-slate-900 tracking-tight">{onuMetrics?.voltage || '3.31'}V</p>
                          </div>
                          <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
                            <Gauge className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Customer Assignment */}
                      <div className="pt-2">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-[1px] flex-1 bg-slate-100"></div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Informasi Pelanggan</span>
                          <div className="h-[1px] flex-1 bg-slate-100"></div>
                        </div>
                        
                        <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-lg">
                              {selectedOnuDetails?.customer?.name?.charAt(0) || 'A'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{selectedOnuDetails?.customer?.name || 'Memuat Pelanggan...'}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{selectedOnuDetails?.customer?.plan || 'Langganan Aktif'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ID</p>
                             <p className="text-[11px] font-mono font-bold text-indigo-600">{selectedOnuDetails?.customer?.id || 'CUST-XXXX'}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <button 
                            type="button"
                            className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                            onClick={() => alert(`Membuka CRM untuk ${selectedOnuDetails?.customer?.id}`)}
                          >
                            <Users className="w-3.5 h-3.5" />
                            Lihat Profil
                          </button>
                          <button 
                            type="button"
                            className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                            title="Segarkan Diagnostik"
                            onClick={() => selectedOlt && fetchOnuDetails(selectedOlt.id, selectedOnuDetails.sn)}
                          >
                            <RefreshCw className={cn("w-4 h-4", isMetricsFetching ? "animate-spin" : "")} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
         )}
    </motion.div>
  );
}

function MapView() {
  const [odps, setOdps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOdps = async () => {
      try {
        const data = await ispService.getOdpNodes('musi_cyber');
        setOdps(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOdps();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
       <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kesadaran Geospatial</h1>
          <p className="text-xs text-slate-500 font-medium">Visualisasi kepadatan pelanggan dan topologi tulang punggung fiber.</p>
       </div>
       <NetworkMap odpNodes={odps} />
    </motion.div>
  );
}

function SettingsView() {
  const { user } = useAuth();
  const [tenantName, setTenantName] = useState('Musi Cyber Enterprise');
  const [notifications, setNotifications] = useState({ email: true, slack: false, browser: true });
  const [isSaving, setIsSaving] = useState(false);

  const [profiles, setProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', description: '', remoteAddress: '', rateLimit: '' });
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const data = await ispService.getPppoeProfiles('fiber_ops_prod');
      setProfiles(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    try {
      await ispService.addPppoeProfile('fiber_ops_prod', profileForm);
      setShowProfileModal(false);
      setProfileForm({ name: '', description: '', remoteAddress: '', rateLimit: '' });
      fetchProfiles();
    } catch (err: any) {
      setProfileError(err.message);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PPPoE profile? This will break any existing provisioning dependencies.')) return;
    try {
      await ispService.deletePppoeProfile(id);
      fetchProfiles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrgSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // In a real app, we would update Firestore here
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6 max-w-4xl">
       <div className="flex justify-between items-center text-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Konfigurasi Sistem</h1>
            <p className="text-xs text-slate-500 font-medium tracking-tight">Kelola profil pengguna, kredensial organisasi, dan pengaturan seluruh ISP.</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="md:col-span-1 space-y-6">
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-20 bg-indigo-600 relative">
                   <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                      <img 
                        src={user?.photoURL || ''} 
                        className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg bg-white" 
                        alt="Profile" 
                      />
                   </div>
                </div>
                <div className="pt-12 pb-6 px-6 text-center">
                   <h3 className="font-bold text-slate-900 tracking-tight">{user?.displayName}</h3>
                   <p className="text-xs text-slate-500 font-medium mb-4">{user?.email}</p>
                   <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold uppercase tracking-widest">
                      Administrator Level 4
                   </div>
                </div>
                <div className="border-t border-slate-50 p-4">
                   <button className="w-full text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest">Update Photo</button>
                </div>
             </div>

             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Bell className="w-3 h-3" /> Notifications
                </h4>
                <div className="space-y-3">
                   {Object.entries(notifications).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between">
                         <span className="text-xs font-bold text-slate-600 capitalize">{key} Alerts</span>
                         <button 
                           onClick={() => setNotifications(prev => ({ ...prev, [key]: !val }))}
                           className={cn(
                              "w-8 h-4 rounded-full transition-all relative",
                              val ? "bg-indigo-500" : "bg-slate-200"
                           )}
                         >
                            <div className={cn(
                               "w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all",
                               val ? "right-0.5" : "left-0.5"
                            )}></div>
                         </button>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Main Settings Panel */}
          <div className="md:col-span-2 space-y-6 text-slate-800">
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                   <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <LayoutDashboard className="w-5 h-5" />
                   </div>
                   <div>
                      <h3 className="font-bold text-sm tracking-tight">Profil Organisasi</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Metadata Dasar ISP</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nama ISP</label>
                      <input 
                        type="text" 
                        value={tenantName}
                        onChange={(e) => setTenantName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                        placeholder="Musi Cyber" 
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Slug Identifier</label>
                      <input 
                        disabled
                        type="text" 
                        value="fiber_ops_prod"
                        className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-3 text-xs font-mono font-bold text-slate-400 cursor-not-allowed"
                      />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Internal Billing Currency</label>
                   <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold">
                      <option>IDR - Indonesian Rupiah (Rp)</option>
                      <option>USD - United States Dollar ($)</option>
                      <option>EUR - Euro (€)</option>
                   </select>
                </div>

                <div className="flex justify-end">
                   <button 
                     onClick={handleOrgSave}
                     disabled={isSaving}
                     className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                   >
                      {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Save Modifications'}
                   </button>
                </div>
             </div>

             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
                   <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                      <Settings className="w-5 h-5" />
                   </div>
                   <div>
                      <h3 className="font-bold text-sm tracking-tight">Security & Edge Keys</h3>
                      <p className="text-[10px] text-rose-400 font-bold uppercase tracking-tight">Technical Authentication</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">RADIUS API Key</p>
                      <div className="flex items-center gap-2">
                         <span className="font-mono text-sm blur-[3px] select-none text-slate-900 flex-1">••••••••••••••••••••••••••••••••</span>
                         <button className="p-1 px-2 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 rounded transition-colors uppercase tracking-widest">Reveal</button>
                      </div>
                   </div>

                   <div className="flex items-center justify-between p-4 border border-rose-100 bg-rose-50/30 rounded-xl">
                      <div>
                         <p className="text-xs font-bold text-slate-900 tracking-tight">Two-Factor Authentication</p>
                         <p className="text-[10px] text-slate-500 font-medium">Protect your admin account with an extra layer of security.</p>
                      </div>
                      <button className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-rose-50 transition-colors">Enable 2FA</button>
                   </div>
                </div>
             </div>

             {/* PPPoE Profiles Section */}
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                         <Terminal className="w-5 h-5" />
                      </div>
                      <div>
                         <h3 className="font-bold text-sm tracking-tight">PPPoE Profile Templates</h3>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Network automation blueprints</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setShowProfileModal(true)}
                     className="p-2 hover:bg-slate-50 rounded-lg text-emerald-600 transition-colors"
                   >
                      <Plus className="w-5 h-5" />
                   </button>
                </div>

                <div className="space-y-3">
                   {loadingProfiles ? (
                      <div className="py-8 text-center animate-pulse text-slate-400 text-[10px] font-bold uppercase">Syncing with Edge Nodes...</div>
                   ) : profiles.length === 0 ? (
                      <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                         <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No profiles defined</p>
                      </div>
                   ) : (
                      profiles.map(p => (
                         <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl group hover:border-emerald-200 transition-colors">
                            <div>
                               <p className="text-xs font-bold text-slate-900 tracking-tight">{p.name}</p>
                               <p className="text-[10px] text-slate-500 font-medium">{p.rateLimit || 'No Limit'} • {p.remoteAddress || 'Pool Default'}</p>
                            </div>
                            <button 
                               onClick={() => handleDeleteProfile(p.id)}
                               className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-50 text-rose-400 rounded-md transition-all"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      ))
                   )}
                </div>
             </div>
          </div>
       </div>

       {showProfileModal && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                     <div className="p-1 bg-emerald-100 text-emerald-600 rounded">
                        <Terminal className="w-4 h-4" />
                     </div>
                     Define PPPoE Environment
                  </h3>
                  <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               <form onSubmit={handleCreateProfile} className="p-6 space-y-4">
                  {profileError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-2">
                       <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                       <p className="text-[10px] font-bold text-rose-600 uppercase tracking-tight leading-relaxed">{profileError}</p>
                    </div>
                  )}
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">NAS Profile Name</label>
                     <input 
                        required
                        type="text" 
                        value={profileForm.name}
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold"
                        placeholder="e.g. ISOLIR_PLAN" 
                     />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Function Description</label>
                     <input 
                        type="text" 
                        value={profileForm.description}
                        onChange={e => setProfileForm({...profileForm, description: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        placeholder="Profile for suspended accounts..." 
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Remote Address/Pool</label>
                        <input 
                           type="text" 
                           value={profileForm.remoteAddress}
                           onChange={e => setProfileForm({...profileForm, remoteAddress: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold"
                           placeholder="pool_isolir" 
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rate Limit (U/D)</label>
                        <input 
                           type="text" 
                           value={profileForm.rateLimit}
                           onChange={e => setProfileForm({...profileForm, rateLimit: e.target.value})}
                           className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold"
                           placeholder="512k/1M" 
                        />
                     </div>
                  </div>
                  <div className="space-y-1.5 pt-2">
                     <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98]">
                        Commit Configuration
                     </button>
                  </div>
               </form>
            </motion.div>
         </div>
       )}
    </motion.div>
  );
}

function BillingView() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Revenue Engine</h1>
            <p className="text-xs text-slate-500 font-medium tracking-tight">Automated recurring billing and payment reconciliation for Musi Cyber.</p>
          </div>
          <div className="flex gap-2">
             <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">Post Prorate Docs</button>
             <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">Generate Cycle</button>
          </div>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-6 rounded-xl text-white shadow-xl border border-slate-800">
             <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-6">Pending Monthly Revenue</p>
             <p className="text-3xl font-bold tracking-tight mb-2">Rp 124.500.000</p>
             <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 status-pulse"></div>
                124 Outstanding Invoices
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5"><CreditCard className="w-12 h-12 text-slate-900 rotate-12" /></div>
             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-6">Gateway Success Rate</p>
             <p className="text-3xl font-bold tracking-tight text-slate-900 mb-2">99.8%</p>
             <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Status: Optimal</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-6">Churn Impact (MoM)</p>
             <p className="text-3xl font-bold tracking-tight text-slate-900 mb-2">-1.2%</p>
             <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Retention Focus Needed</p>
          </div>
       </div>

       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-4 px-6 py-4 border-b border-slate-100 bg-slate-50/50 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
             <span>Invoice Identity</span>
             <span>Subscriber</span>
             <span>Amount</span>
             <span>Status</span>
          </div>
          <div className="divide-y divide-slate-50">
             {[1,2,3,4,5].map(i => (
                <div key={i} className="grid grid-cols-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors cursor-pointer group">
                   <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-slate-600 transition-colors">#INV-2026-0X{i}</span>
                   <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-slate-50 rounded border border-slate-100 flex items-center justify-center text-slate-400">
                         <span className="text-[10px] font-bold">M</span>
                      </div>
                      <span className="text-[13px] font-bold text-slate-700">Musi_Cyber_User_{i}</span>
                   </div>
                   <span className="text-[13px] font-bold text-slate-900">Rp 250.000</span>
                   <div>
                      <StatusBadge status={i % 3 === 0 ? 'warning' : 'online'} />
                   </div>
                </div>
             ))}
          </div>
       </div>
    </motion.div>
  );
}

// --- Shared Components ---

function SidebarItem({ icon: Icon, label, isActive, onClick, isOpen, danger }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all group relative text-sm font-medium",
        isActive 
          ? "bg-indigo-600 text-white" 
          : cn("text-slate-400 hover:text-white hover:bg-slate-800", danger ? "hover:bg-rose-600/10 hover:text-rose-400" : "")
      )}
    >
      <Icon className={cn("w-4 h-4 transition-transform", isActive ? "" : "opacity-70 group-hover:opacity-100")} />
      {isOpen && <span>{label}</span>}
    </button>
  );
}

function StatCard({ label, value, change, trend, icon: Icon }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{label}</div>
        <div className={cn(
          "text-[9px] font-bold",
          trend === 'up' ? "text-emerald-600" : trend === 'warn' ? "text-slate-500" : "text-rose-600"
        )}>
          {change}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    online: "bg-emerald-50 text-emerald-600 border-emerald-100",
    offline: "bg-rose-50 text-rose-600 border-rose-100",
    warning: "bg-amber-50 text-amber-600 border-amber-100",
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border", styles[status as keyof typeof styles])}>
      {status === 'online' ? 'Active' : status === 'offline' ? 'Offline' : 'Warning'}
    </span>
  );
}
