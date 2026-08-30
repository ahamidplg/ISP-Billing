import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  CreditCard,
  Plus,
  Filter,
  Download,
  Printer,
  Send,
  Search,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Edit3,
  PieChart as PieIcon,
  Calculator,
  ChevronRight,
  X,
  User,
  Phone,
  Check,
  ShieldCheck,
  Tag,
  Building,
  Layers,
  Percent,
  Coins,
  FileSpreadsheet,
  Landmark
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Transaction, Invoice, Customer, Plan } from '../types';
import { ispService } from '../services/ispService';
import { auth } from '../lib/firebase';
import { TaxModule } from './TaxModule';

interface FinanceModuleProps {
  tenantId: string;
  customers?: any[];
  plans?: any[];
  initialTab?: string;
  key?: any;
}

const CATEGORY_LABELS: Record<string, { label: string; type: 'income' | 'expense'; color: string }> = {
  // Income
  langganan_bulanan: { label: 'Langganan Internet Bulanan', type: 'income', color: 'emerald' },
  voucher_hotspot: { label: 'Penjualan Voucher Hotspot', type: 'income', color: 'teal' },
  biaya_psb: { label: 'Biaya Pasang Baru (PSB)', type: 'income', color: 'cyan' },
  penjualan_alat: { label: 'Penjualan Perangkat (ONT/Router)', type: 'income', color: 'blue' },
  jasa_teknisi: { label: 'Jasa Instalasi & Setting', type: 'income', color: 'indigo' },
  lainnya_income: { label: 'Pemasukan Lain-lain', type: 'income', color: 'sky' },
  // Expense
  bandwidth_upstream: { label: 'Bandwidth Upstream / NAP', type: 'expense', color: 'rose' },
  sewa_tiang_pop: { label: 'Sewa Tiang & Ruang POP', type: 'expense', color: 'orange' },
  gaji_teknisi: { label: 'Gaji Karyawan & Teknisi', type: 'expense', color: 'amber' },
  operasional_transport: { label: 'BBM & Operasional Lapangan', type: 'expense', color: 'yellow' },
  material_ftth: { label: 'Material Fiber (Dropcore, ODP)', type: 'expense', color: 'red' },
  listrik_ups: { label: 'Listrik, Genset & Baterai UPS', type: 'expense', color: 'purple' },
  marketing_iklan: { label: 'Marketing, Brosur & Promosi', type: 'expense', color: 'pink' },
  pajak_legalitas: { label: 'Pajak & Retribusi Legal', type: 'expense', color: 'slate' },
  lainnya_expense: { label: 'Pengeluaran Lain-lain', type: 'expense', color: 'gray' },
};

const PAYMENT_METHODS: Record<string, string> = {
  cash: 'Tunai (Kas Kasir)',
  transfer_bca: 'Transfer Bank BCA',
  transfer_mandiri: 'Transfer Bank Mandiri',
  transfer_bri: 'Transfer Bank BRI',
  transfer_bni: 'Transfer Bank BNI',
  qris: 'QRIS Universal / E-Wallet',
  payment_gateway: 'Payment Gateway Otomatis'
};

// Initial Seed Data for realistic ISP Financial Ledger
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'trx-1',
    tenantId: 'musi-cyber',
    type: 'income',
    category: 'langganan_bulanan',
    amount: 18500000,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'transfer_bca',
    description: 'Setoran Pembayaran Tagihan Massal Pelanggan Cluster A',
    referenceNo: 'SET-202608-01',
    recordedBy: 'admin@musicyber.net'
  },
  {
    id: 'trx-2',
    tenantId: 'musi-cyber',
    type: 'income',
    category: 'voucher_hotspot',
    amount: 4250000,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'cash',
    description: 'Penjualan Voucher Hotspot RT/RW Net Mingguan',
    referenceNo: 'VCR-2026-W34',
    recordedBy: 'kasir@musicyber.net'
  },
  {
    id: 'trx-3',
    tenantId: 'musi-cyber',
    type: 'income',
    category: 'biaya_psb',
    amount: 2750000,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'transfer_mandiri',
    description: 'Biaya Pasang Baru 5 Pelanggan Perumahan Griya Indah',
    referenceNo: 'PSB-202608-05',
    recordedBy: 'admin@musicyber.net'
  },
  {
    id: 'trx-4',
    tenantId: 'musi-cyber',
    type: 'expense',
    category: 'bandwidth_upstream',
    amount: 8500000,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'transfer_bca',
    description: 'Pembayaran Port Bandwidth Upstream 1Gbps Dedicated ke NAP',
    referenceNo: 'INV-NAP-8891',
    recordedBy: 'finance@musicyber.net'
  },
  {
    id: 'trx-5',
    tenantId: 'musi-cyber',
    type: 'expense',
    category: 'gaji_teknisi',
    amount: 6000000,
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'transfer_bca',
    description: 'Gaji 2 Teknisi Lapangan & 1 Admin Support Periode Agustus',
    referenceNo: 'PAY-202608-TECH',
    recordedBy: 'admin@musicyber.net'
  },
  {
    id: 'trx-6',
    tenantId: 'musi-cyber',
    type: 'expense',
    category: 'material_ftth',
    amount: 3200000,
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'transfer_mandiri',
    description: 'Pembelian 2 Roll Dropcore 1000m + 50 Fast Connector + 4 Box ODP',
    referenceNo: 'PO-MAT-4412',
    recordedBy: 'logistik@musicyber.net'
  },
  {
    id: 'trx-7',
    tenantId: 'musi-cyber',
    type: 'expense',
    category: 'listrik_ups',
    amount: 950000,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'transfer_bri',
    description: 'Tagihan PLN Token POP Pusat & Server Rack',
    referenceNo: 'PLN-POP-202608',
    recordedBy: 'admin@musicyber.net'
  },
  {
    id: 'trx-8',
    tenantId: 'musi-cyber',
    type: 'expense',
    category: 'operasional_transport',
    amount: 650000,
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentMethod: 'cash',
    description: 'Biaya BBM Motor Operasional & Konsumsi Lembur Penarikan FO',
    referenceNo: 'OPS-202608-TR',
    recordedBy: 'admin@musicyber.net'
  }
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    tenantId: 'musi-cyber',
    invoiceNumber: 'INV-202608-0101',
    customerId: 'cust-1',
    customerName: 'Bapak Hendra (Jl. Musi Raya No. 12)',
    customerPhone: '081278990011',
    planId: 'plan-1',
    planName: 'Paket Home Fiber 30 Mbps',
    amount: 250000,
    tax: 0,
    discount: 0,
    totalAmount: 250000,
    status: 'paid',
    billingMonth: 'Agustus 2026',
    dueDate: '2026-08-10',
    paidAt: '2026-08-05T09:30:00Z',
    paymentMethod: 'transfer_bca',
    notes: 'Pembayaran lunas via M-Banking BCA'
  },
  {
    id: 'inv-102',
    tenantId: 'musi-cyber',
    invoiceNumber: 'INV-202608-0102',
    customerId: 'cust-2',
    customerName: 'Ibu Ratna Dewi (Komplek Ogan Permai B4)',
    customerPhone: '081399887722',
    planId: 'plan-2',
    planName: 'Paket Bisnis Fiber 50 Mbps',
    amount: 400000,
    tax: 0,
    discount: 0,
    totalAmount: 400000,
    status: 'paid',
    billingMonth: 'Agustus 2026',
    dueDate: '2026-08-10',
    paidAt: '2026-08-07T14:20:00Z',
    paymentMethod: 'qris',
    notes: 'QRIS Scan di Kasir'
  },
  {
    id: 'inv-103',
    tenantId: 'musi-cyber',
    invoiceNumber: 'INV-202608-0103',
    customerId: 'cust-3',
    customerName: 'Warnet CyberNet Palembang',
    customerPhone: '082166554433',
    planId: 'plan-3',
    planName: 'Paket Dedicated Dedicated 100 Mbps',
    amount: 1500000,
    tax: 0,
    discount: 0,
    totalAmount: 1500000,
    status: 'unpaid',
    billingMonth: 'Agustus 2026',
    dueDate: '2026-08-20',
    notes: 'Menunggu transfer giro akhir minggu'
  },
  {
    id: 'inv-104',
    tenantId: 'musi-cyber',
    invoiceNumber: 'INV-202608-0104',
    customerId: 'cust-4',
    customerName: 'CV. Karya Mandiri Teknik',
    customerPhone: '085211223344',
    planId: 'plan-2',
    planName: 'Paket Bisnis Fiber 50 Mbps',
    amount: 400000,
    tax: 0,
    discount: 0,
    totalAmount: 400000,
    status: 'unpaid',
    billingMonth: 'Agustus 2026',
    dueDate: '2026-08-15',
    notes: 'Invoice dikirim ke email finance perusahaan'
  },
  {
    id: 'inv-105',
    tenantId: 'musi-cyber',
    invoiceNumber: 'INV-202608-0105',
    customerId: 'cust-5',
    customerName: 'Keluarga Bpk. Syaiful (Jl. Demang Lebar Daun)',
    customerPhone: '087811992288',
    planId: 'plan-1',
    planName: 'Paket Home Fiber 30 Mbps',
    amount: 250000,
    tax: 0,
    discount: 0,
    totalAmount: 250000,
    status: 'overdue',
    billingMonth: 'Agustus 2026',
    dueDate: '2026-08-05',
    notes: 'Menunggak 1 periode, reminder WhatsApp terkirim'
  }
];

export function FinanceModule({ tenantId, customers = [], plans = [], initialTab = 'ringkasan' }: FinanceModuleProps) {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'buku_kas' | 'tagihan' | 'laba_rugi' | 'kalkulator_roi'>((initialTab as any) || 'ringkasan');
  
  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters & Search
  const [trxTypeFilter, setTrxTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [trxCategoryFilter, setTrxCategoryFilter] = useState<string>('all');
  const [trxSearchQuery, setTrxSearchQuery] = useState<string>('');
  
  const [invStatusFilter, setInvStatusFilter] = useState<string>('all');
  const [invSearchQuery, setInvSearchQuery] = useState<string>('');

  // Modals
  const [showAddTrxModal, setShowAddTrxModal] = useState<boolean>(false);
  const [showAddInvModal, setShowAddInvModal] = useState<boolean>(false);
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Forms
  const [trxForm, setTrxForm] = useState({
    type: 'income' as 'income' | 'expense',
    category: 'langganan_bulanan',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    description: '',
    referenceNo: ''
  });

  const [invForm, setInvForm] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    planName: 'Paket Home Fiber 30 Mbps',
    amount: '250000',
    billingMonth: 'Agustus 2026',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
  });

  const [payForm, setPayForm] = useState({
    paymentMethod: 'transfer_bca',
    notes: 'Pembayaran lunas terverifikasi'
  });

  // ROI Calculator State
  const [roiForm, setRoiForm] = useState({
    dropcoreMeters: 150,
    cablePricePerMeter: 1200,
    ontPrice: 185000,
    accessoriesPrice: 45000, // fast connector, rosette, clamp
    technicianFee: 75000,
    psbChargedToCustomer: 250000,
    monthlySubscriptionFee: 250000,
    monthlyBandwidthCost: 45000
  });

  // Fetch Firestore Data with local fallback
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [fetchedTrx, fetchedInv] = await Promise.all([
        ispService.getTransactions(tenantId),
        ispService.getInvoices(tenantId)
      ]);

      if (fetchedTrx && fetchedTrx.length > 0) {
        setTransactions(fetchedTrx);
      } else {
        setTransactions(INITIAL_TRANSACTIONS);
      }

      if (fetchedInv && fetchedInv.length > 0) {
        setInvoices(fetchedInv);
      } else {
        setInvoices(INITIAL_INVOICES);
      }
    } catch (e) {
      console.warn('Using local financial state fallback', e);
      setTransactions(INITIAL_TRANSACTIONS);
      setInvoices(INITIAL_INVOICES);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenantId]);

  // Calculations & KPIs
  const financialStats = useMemo(() => {
    let totalRevenue = 0;
    let totalExpense = 0;
    let cashBalance = 0;
    let bankBalance = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        totalRevenue += amt;
        if (t.paymentMethod === 'cash') cashBalance += amt;
        else bankBalance += amt;
      } else {
        totalExpense += amt;
        if (t.paymentMethod === 'cash') cashBalance -= amt;
        else bankBalance -= amt;
      }
    });

    let outstandingReceivable = 0;
    let paidInvoicesCount = 0;
    let unpaidInvoicesCount = 0;

    invoices.forEach(inv => {
      const amt = Number(inv.totalAmount || inv.amount) || 0;
      if (inv.status === 'paid') {
        paidInvoicesCount += 1;
      } else {
        unpaidInvoicesCount += 1;
        outstandingReceivable += amt;
      }
    });

    const netProfit = totalRevenue - totalExpense;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

    return {
      totalRevenue,
      totalExpense,
      netProfit,
      profitMargin,
      outstandingReceivable,
      paidInvoicesCount,
      unpaidInvoicesCount,
      cashBalance,
      bankBalance
    };
  }, [transactions, invoices]);

  // Chart Data: 6-Month Projection / Trend
  const monthlyChartData = useMemo(() => {
    return [
      { month: 'Mar', pendapatan: 18500000, pengeluaran: 9200000, laba: 9300000 },
      { month: 'Apr', pendapatan: 21000000, pengeluaran: 10500000, laba: 10500000 },
      { month: 'Mei', pendapatan: 23400000, pengeluaran: 11200000, laba: 12200000 },
      { month: 'Jun', pendapatan: 24800000, pengeluaran: 12000000, laba: 12800000 },
      { month: 'Jul', pendapatan: 26500000, pengeluaran: 12800000, laba: 13700000 },
      { 
        month: 'Agu (Kini)', 
        pendapatan: financialStats.totalRevenue, 
        pengeluaran: financialStats.totalExpense, 
        laba: financialStats.netProfit 
      }
    ];
  }, [financialStats]);

  // Breakdown Data for Donut Charts
  const incomeCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'income').forEach(t => {
      const label = CATEGORY_LABELS[t.category]?.label || t.category;
      map[label] = (map[label] || 0) + Number(t.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const expenseCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const label = CATEGORY_LABELS[t.category]?.label || t.category;
      map[label] = (map[label] || 0) + Number(t.amount);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const PIE_COLORS = ['#10b981', '#3b82f6', '#6366f1', '#ec4899', '#f59e0b', '#8b5cf6', '#14b8a6', '#ef4444'];

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (trxTypeFilter !== 'all' && t.type !== trxTypeFilter) return false;
      if (trxCategoryFilter !== 'all' && t.category !== trxCategoryFilter) return false;
      if (trxSearchQuery.trim()) {
        const q = trxSearchQuery.toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const ref = (t.referenceNo || '').toLowerCase();
        const cat = (CATEGORY_LABELS[t.category]?.label || t.category).toLowerCase();
        if (!desc.includes(q) && !ref.includes(q) && !cat.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, trxTypeFilter, trxCategoryFilter, trxSearchQuery]);

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (invStatusFilter !== 'all' && inv.status !== invStatusFilter) return false;
      if (invSearchQuery.trim()) {
        const q = invSearchQuery.toLowerCase();
        const num = (inv.invoiceNumber || '').toLowerCase();
        const name = (inv.customerName || '').toLowerCase();
        const plan = (inv.planName || '').toLowerCase();
        if (!num.includes(q) && !name.includes(q) && !plan.includes(q)) return false;
      }
      return true;
    });
  }, [invoices, invStatusFilter, invSearchQuery]);

  // ROI Calculation Results
  const roiCalculations = useMemo(() => {
    const cableCost = roiForm.dropcoreMeters * roiForm.cablePricePerMeter;
    const totalHardwareCost = cableCost + roiForm.ontPrice + roiForm.accessoriesPrice;
    const totalInstallationCost = totalHardwareCost + roiForm.technicianFee;
    const netInvestmentPsb = totalInstallationCost - roiForm.psbChargedToCustomer;
    const monthlyNetContribution = roiForm.monthlySubscriptionFee - roiForm.monthlyBandwidthCost;
    
    // BEP (Break-Even Point) in Months
    let bepMonths = 0;
    if (netInvestmentPsb <= 0) {
      bepMonths = 0; // Immediate profit from PSB fee
    } else if (monthlyNetContribution > 0) {
      bepMonths = Number((netInvestmentPsb / monthlyNetContribution).toFixed(1));
    }

    // 1-Year Projected Profit from this Subscriber
    const firstYearRevenue = roiForm.psbChargedToCustomer + (roiForm.monthlySubscriptionFee * 12);
    const firstYearCost = totalInstallationCost + (roiForm.monthlyBandwidthCost * 12);
    const firstYearNetProfit = firstYearRevenue - firstYearCost;

    return {
      cableCost,
      totalHardwareCost,
      totalInstallationCost,
      netInvestmentPsb,
      monthlyNetContribution,
      bepMonths,
      firstYearRevenue,
      firstYearCost,
      firstYearNetProfit
    };
  }, [roiForm]);

  // Handlers
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxForm.amount || Number(trxForm.amount) <= 0) return;

    const newTrx: Partial<Transaction> = {
      tenantId,
      type: trxForm.type,
      category: trxForm.category,
      amount: Number(trxForm.amount),
      date: trxForm.date,
      paymentMethod: trxForm.paymentMethod,
      description: trxForm.description || (trxForm.type === 'income' ? 'Pemasukan Kas' : 'Pengeluaran Kas'),
      referenceNo: trxForm.referenceNo || `TRX-${Date.now().toString().slice(-6)}`,
      recordedBy: auth.currentUser?.email || 'admin'
    };

    try {
      const id = await ispService.addTransaction(tenantId, newTrx);
      setTransactions(prev => [{ id: id || `local-${Date.now()}`, ...newTrx } as Transaction, ...prev]);
      setShowAddTrxModal(false);
      setTrxForm({
        type: 'income',
        category: 'langganan_bulanan',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        description: '',
        referenceNo: ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTransaction = async (id?: string) => {
    if (!id || !confirm('Apakah Anda yakin ingin menghapus transaksi ini dari buku kas?')) return;
    try {
      await ispService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(invForm.amount) || 0;
    const invNum = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInv: Partial<Invoice> = {
      tenantId,
      invoiceNumber: invNum,
      customerId: invForm.customerId || `cust-${Date.now()}`,
      customerName: invForm.customerName || 'Pelanggan FTTH',
      customerPhone: invForm.customerPhone,
      planName: invForm.planName,
      amount: amt,
      totalAmount: amt,
      status: 'unpaid',
      billingMonth: invForm.billingMonth,
      dueDate: invForm.dueDate,
      notes: invForm.notes
    };

    try {
      const id = await ispService.addInvoice(tenantId, newInv);
      setInvoices(prev => [{ id: id || `local-${Date.now()}`, ...newInv } as Invoice, ...prev]);
      setShowAddInvModal(false);
      setInvForm({
        customerId: '',
        customerName: '',
        customerPhone: '',
        planName: 'Paket Home Fiber 30 Mbps',
        amount: '250000',
        billingMonth: 'Agustus 2026',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: ''
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecutePayment = async () => {
    if (!selectedInvoice) return;
    try {
      await ispService.payInvoice(tenantId, selectedInvoice, payForm.paymentMethod, auth.currentUser?.email || 'admin');
      
      // Update local invoices
      setInvoices(prev => prev.map(inv => {
        if (inv.id === selectedInvoice.id) {
          return {
            ...inv,
            status: 'paid',
            paidAt: new Date().toISOString(),
            paymentMethod: payForm.paymentMethod
          };
        }
        return inv;
      }));

      // Add corresponding transaction to ledger
      const newIncomeTrx: Transaction = {
        id: `trx-pay-${Date.now()}`,
        tenantId,
        type: 'income',
        category: 'langganan_bulanan',
        amount: Number(selectedInvoice.totalAmount || selectedInvoice.amount),
        date: new Date().toISOString().split('T')[0],
        paymentMethod: payForm.paymentMethod,
        description: `Pembayaran Invoice ${selectedInvoice.invoiceNumber} - ${selectedInvoice.customerName}`,
        referenceNo: selectedInvoice.invoiceNumber,
        invoiceId: selectedInvoice.id,
        recordedBy: auth.currentUser?.email || 'admin'
      };

      setTransactions(prev => [newIncomeTrx, ...prev]);
      setShowPayModal(false);
      setSelectedInvoice(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateBulkInvoices = () => {
    if (!confirm(`Generate tagihan bulanan otomatis untuk ${customers.length > 0 ? customers.length : 12} pelanggan aktif?`)) return;

    const currentMonth = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    const dueDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const sampleCusts = customers.length > 0 ? customers : [
      { id: 'c-101', name: 'Bapak Hendra', username: 'hendra_net', planId: 'p-1' },
      { id: 'c-102', name: 'Ibu Ratna Dewi', username: 'ratna_home', planId: 'p-2' },
      { id: 'c-103', name: 'Warnet CyberNet', username: 'cyber_palembang', planId: 'p-3' },
      { id: 'c-104', name: 'CV. Karya Mandiri', username: 'karyamandiri_biz', planId: 'p-2' },
      { id: 'c-105', name: 'Bpk. Ahmad Subarjo', username: 'subarjo_ftth', planId: 'p-1' },
      { id: 'c-106', name: 'Toko Kelontong Berkah', username: 'toko_berkah', planId: 'p-1' },
    ];

    const generatedInvoices: Invoice[] = sampleCusts.map((c, idx) => {
      const invNum = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(idx + 201).padStart(4, '0')}`;
      const amount = idx % 3 === 0 ? 400000 : idx % 2 === 0 ? 300000 : 250000;
      return {
        id: `gen-inv-${Date.now()}-${idx}`,
        tenantId,
        invoiceNumber: invNum,
        customerId: c.id || `c-${idx}`,
        customerName: c.name || `Pelanggan #${idx + 1}`,
        customerPhone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
        planName: amount === 400000 ? 'Paket Bisnis Fiber 50 Mbps' : 'Paket Home Fiber 30 Mbps',
        amount: amount,
        totalAmount: amount,
        status: 'unpaid',
        billingMonth: currentMonth,
        dueDate: dueDate,
        notes: 'Tagihan siklus bulanan reguler'
      };
    });

    setInvoices(prev => [...generatedInvoices, ...prev]);
    alert(`Berhasil membuat ${generatedInvoices.length} invoice tagihan baru untuk periode ${currentMonth}!`);
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const getWhatsAppMessage = (inv: Invoice) => {
    return encodeURIComponent(
      `*MUSI CYBER NETWORK - PEMBERITAHUAN TAGIHAN INTERNET*\n\n` +
      `Yth. Bapak/Ibu *${inv.customerName}*,\n` +
      `Berikut adalah rincian tagihan internet FTTH Anda:\n\n` +
      `📄 *No. Invoice:* ${inv.invoiceNumber}\n` +
      `📦 *Paket:* ${inv.planName || 'Fiber Internet'}\n` +
      `📅 *Periode:* ${inv.billingMonth}\n` +
      `💰 *Total Tagihan:* ${formatRupiah(inv.totalAmount || inv.amount)}\n` +
      `⏳ *Jatuh Tempo:* ${inv.dueDate}\n` +
      `📊 *Status:* ${inv.status === 'paid' ? 'LUNAS (TERIMA KASIH)' : 'BELUM DIBAYAR'}\n\n` +
      `*Metode Pembayaran Transfer Bank:*\n` +
      `• BCA: 021-9988-7711 a/n PT Musi Cyber Nusantara\n` +
      `• Mandiri: 112-00-998877 a/n Musi Cyber\n` +
      `• Atau bayar langsung ke kasir / scan QRIS resmi kami.\n\n` +
      `_Mohon kirimkan bukti transfer jika sudah melakukan pembayaran. Terima kasih atas kepercayaan Anda!_`
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Modul Keuangan & Billing ISP</h1>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Real-Time Ledger
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manajemen buku kas, pelaporan laba rugi, rekonsiliasi pembayaran, dan penagihan invoice otomatis Musi Cyber.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <button
            onClick={() => {
              setTrxForm({ ...trxForm, type: 'income', category: 'langganan_bulanan' });
              setShowAddTrxModal(true);
            }}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <ArrowUpRight className="w-4 h-4" />
            + Pemasukan
          </button>
          <button
            onClick={() => {
              setTrxForm({ ...trxForm, type: 'expense', category: 'bandwidth_upstream' });
              setShowAddTrxModal(true);
            }}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <ArrowDownRight className="w-4 h-4" />
            + Pengeluaran
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'ringkasan', label: 'Ringkasan & KPI Keuangan', icon: TrendingUp },
          { id: 'buku_kas', label: 'Buku Kas & Transaksi', icon: Receipt },
          { id: 'tagihan', label: 'Tagihan & Invoice Pelanggan', icon: CreditCard },
          { id: 'laba_rugi', label: 'Laporan Laba Rugi (P&L)', icon: FileSpreadsheet },
          { id: 'kalkulator_roi', label: 'Kalkulator PSB & ROI', icon: Calculator },
          { id: 'pajak_bhp', label: 'Perhitungan Pajak & BHP (Kominfo)', icon: Landmark },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold tracking-tight transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: RINGKASAN & KPI */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Pendapatan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Pendapatan (Bulan Ini)</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatRupiah(financialStats.totalRevenue)}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-emerald-600">
                <span className="px-1.5 py-0.5 bg-emerald-100 rounded text-[9px]">+14.2%</span>
                <span className="text-slate-400 font-medium">dibanding bulan lalu</span>
              </div>
            </div>

            {/* Total Pengeluaran */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-rose-200 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Beban Operasional (OPEX)</span>
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatRupiah(financialStats.totalExpense)}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-slate-500">
                <span className="text-slate-600 font-medium">Bandwidth, Gaji, Material, Listrik</span>
              </div>
            </div>

            {/* Laba Bersih */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Laba Bersih Operasional</span>
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {formatRupiah(financialStats.netProfit)}
              </div>
              <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-indigo-300">
                <span>Margin Laba: {financialStats.profitMargin}%</span>
                <span className="text-slate-400">• Sangat Sehat</span>
              </div>
            </div>

            {/* Piutang Pelanggan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-200 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Piutang Belum Tertagih</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatRupiah(financialStats.outstandingReceivable)}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-amber-600">
                <span>{financialStats.unpaidInvoicesCount} Tagihan Belum Lunas</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 6-Month Income vs Expense Trend */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 tracking-tight">Tren Pendapatan vs Pengeluaran (6 Bulan)</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pertumbuhan performa finansial ISP</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                    <span>Pendapatan</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-500">
                    <div className="w-3 h-3 bg-rose-500 rounded-sm"></div>
                    <span>Pengeluaran</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `Rp${(val / 1000000).toFixed(0)}Jt`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatRupiah(Number(val)), '']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="pendapatan" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" />
                    <Area type="monotone" dataKey="pengeluaran" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Saldo Kas & Distribusi */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">Posisi Saldo Kas & Bank</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">Likuiditas kas operasional</p>

                <div className="space-y-3">
                  <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-600 text-white rounded-lg">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Rekening Bank (BCA / Mandiri)</p>
                        <p className="text-[10px] text-slate-500 font-medium">Penerimaan Transfer & Gateway</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-indigo-700 font-mono">
                      {formatRupiah(financialStats.bankBalance > 0 ? financialStats.bankBalance : 24350000)}
                    </span>
                  </div>

                  <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-600 text-white rounded-lg">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Kas Tunai Kasir & Bendahara</p>
                        <p className="text-[10px] text-slate-500 font-medium">Pembayaran Cash & Voucher</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-700 font-mono">
                      {formatRupiah(financialStats.cashBalance > 0 ? financialStats.cashBalance : 8100000)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-600">Total Likuiditas Siap Pakai:</span>
                  <span className="font-bold text-slate-900 text-base">
                    {formatRupiah((financialStats.bankBalance > 0 ? financialStats.bankBalance : 24350000) + (financialStats.cashBalance > 0 ? financialStats.cashBalance : 8100000))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Category Breakdown & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut Chart: Komposisi Pengeluaran */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">Struktur Pengeluaran Operasional (OPEX)</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">Alokasi beban biaya internet</p>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoryData.length > 0 ? expenseCategoryData : [
                        { name: 'Bandwidth Upstream', value: 8500000 },
                        { name: 'Gaji Karyawan', value: 6000000 },
                        { name: 'Material Fiber', value: 3200000 },
                        { name: 'Listrik & UPS', value: 950000 },
                        { name: 'Transportasi', value: 650000 }
                      ]}
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {expenseCategoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: any) => formatRupiah(Number(val))} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions & Recent Records */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 tracking-tight">Transaksi Kas Terbaru</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Catatan mutasi terakhir</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('buku_kas')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    Buka Buku Kas <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {transactions.slice(0, 4).map(trx => (
                    <div key={trx.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${trx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {trx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs">{trx.description}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{trx.date} • {PAYMENT_METHODS[trx.paymentMethod] || trx.paymentMethod}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold font-mono ${trx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trx.type === 'income' ? '+' : '-'}{formatRupiah(Number(trx.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handleGenerateBulkInvoices}
                  className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  Generate Siklus Tagihan Pelanggan Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUKU KAS & JURNAL TRANSAKSI */}
      {activeTab === 'buku_kas' && (
        <div className="space-y-6">
          {/* Action Bar & Filters */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi, deskripsi, no resi..."
                  value={trxSearchQuery}
                  onChange={e => setTrxSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setTrxForm({ ...trxForm, type: 'income', category: 'langganan_bulanan' });
                    setShowAddTrxModal(true);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  + Pemasukan
                </button>
                <button
                  onClick={() => {
                    setTrxForm({ ...trxForm, type: 'expense', category: 'bandwidth_upstream' });
                    setShowAddTrxModal(true);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <ArrowDownRight className="w-4 h-4" />
                  + Pengeluaran
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mr-1">Tipe:</span>
              {[
                { id: 'all', label: 'Semua Transaksi' },
                { id: 'income', label: 'Pemasukan (Income)' },
                { id: 'expense', label: 'Pengeluaran (Expense)' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setTrxTypeFilter(f.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    trxTypeFilter === f.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider ml-4 mr-1">Kategori:</span>
              <select
                value={trxCategoryFilter}
                onChange={e => setTrxCategoryFilter(e.target.value)}
                className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">Semua Kategori</option>
                <optgroup label="Pemasukan">
                  <option value="langganan_bulanan">Langganan Internet Bulanan</option>
                  <option value="voucher_hotspot">Penjualan Voucher Hotspot</option>
                  <option value="biaya_psb">Biaya Pasang Baru (PSB)</option>
                  <option value="penjualan_alat">Penjualan Perangkat (ONT/Router)</option>
                  <option value="jasa_teknisi">Jasa Instalasi & Setting</option>
                </optgroup>
                <optgroup label="Pengeluaran">
                  <option value="bandwidth_upstream">Bandwidth Upstream / NAP</option>
                  <option value="sewa_tiang_pop">Sewa Tiang & Ruang POP</option>
                  <option value="gaji_teknisi">Gaji Karyawan & Teknisi</option>
                  <option value="operasional_transport">BBM & Operasional</option>
                  <option value="material_ftth">Material Fiber (Dropcore, ODP)</option>
                  <option value="listrik_ups">Listrik, Genset & Baterai UPS</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Transactions Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Jurnal Buku Kas</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Menampilkan {filteredTransactions.length} transaksi tercatat</p>
              </div>
              <button
                onClick={() => {
                  const csv = "Tanggal,Tipe,Kategori,Nominal,Metode,Deskripsi,No Referensi\n" +
                    filteredTransactions.map(t => `"${t.date}","${t.type}","${CATEGORY_LABELS[t.category]?.label || t.category}","${t.amount}","${t.paymentMethod}","${t.description}","${t.referenceNo}"`).join("\n");
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `buku-kas-musicyber-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Ekspor CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="py-3.5 px-6">Tanggal & Referensi</th>
                    <th className="py-3.5 px-4">Kategori & Akun</th>
                    <th className="py-3.5 px-4">Deskripsi / Keterangan</th>
                    <th className="py-3.5 px-4">Metode Bayar</th>
                    <th className="py-3.5 px-4 text-right">Nominal (IDR)</th>
                    <th className="py-3.5 px-6 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="font-bold text-xs">Tidak ada data transaksi yang sesuai filter</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(t => {
                      const isIncome = t.type === 'income';
                      const catInfo = CATEGORY_LABELS[t.category];
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/70 transition-colors group">
                          <td className="py-4 px-6">
                            <p className="font-bold text-slate-900">{t.date}</p>
                            <p className="font-mono text-[10px] text-slate-400">{t.referenceNo || '-'}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              isIncome ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              {isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {catInfo?.label || t.category}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-slate-800 max-w-xs">{t.description}</p>
                            {t.recordedBy && (
                              <p className="text-[10px] text-slate-400">Dicatat oleh: {t.recordedBy}</p>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-600">
                              {PAYMENT_METHODS[t.paymentMethod] || t.paymentMethod}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className={`font-mono font-bold text-sm ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {isIncome ? '+' : '-'}{formatRupiah(Number(t.amount))}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* TAB 3: TAGIHAN & INVOICE PELANGGAN */}
      {activeTab === 'tagihan' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari no invoice, nama pelanggan..."
                value={invSearchQuery}
                onChange={e => setInvSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {['all', 'unpaid', 'paid', 'overdue'].map(s => (
                  <button
                    key={s}
                    onClick={() => setInvStatusFilter(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      invStatusFilter === s
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s === 'all' ? 'Semua' : s === 'unpaid' ? 'Belum Bayar' : s === 'paid' ? 'Lunas' : 'Jatuh Tempo'}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerateBulkInvoices}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Generate Massal
              </button>

              <button
                onClick={() => setShowAddInvModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Buat Tagihan
              </button>
            </div>
          </div>

          {/* Invoices List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    <th className="py-3.5 px-6">No. Invoice & Periode</th>
                    <th className="py-3.5 px-4">Nama Pelanggan</th>
                    <th className="py-3.5 px-4">Paket Internet</th>
                    <th className="py-3.5 px-4">Jatuh Tempo</th>
                    <th className="py-3.5 px-4">Status Tagihan</th>
                    <th className="py-3.5 px-4 text-right">Total (IDR)</th>
                    <th className="py-3.5 px-6 text-center">Aksi & Notifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="font-bold text-xs">Tidak ada data tagihan yang ditemukan</p>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map(inv => {
                      const isPaid = inv.status === 'paid';
                      const isOverdue = inv.status === 'overdue';
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</p>
                            <p className="text-[10px] text-slate-400">{inv.billingMonth}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-800">{inv.customerName || 'Pelanggan FTTH'}</p>
                            <p className="text-[10px] text-slate-400">{inv.customerPhone || '08xx-xxxx-xxxx'}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[10px]">
                              {inv.planName || 'Fiber Internet'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-slate-700">{inv.dueDate}</p>
                            {isPaid && inv.paidAt && (
                              <p className="text-[9px] text-emerald-600 font-bold">Lunas: {inv.paidAt.split('T')[0]}</p>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {isPaid ? (
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Lunas
                              </span>
                            ) : isOverdue ? (
                              <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Terlambat
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Belum Bayar
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {formatRupiah(Number(inv.totalAmount || inv.amount))}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {!isPaid && (
                                <button
                                  onClick={() => {
                                    setSelectedInvoice(inv);
                                    setShowPayModal(true);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                                  title="Tandai Sudah Bayar"
                                >
                                  Bayar
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setShowPrintModal(true);
                                }}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                title="Cetak Kwitansi / Struk"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setShowWhatsappModal(true);
                                }}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                                title="Kirim Pesan WhatsApp"
                              >
                                <Send className="w-3.5 h-3.5" />
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

      {/* TAB 4: LAPORAN LABA RUGI (P&L STATEMENT) */}
      {activeTab === 'laba_rugi' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
            {/* Header Laporan */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">LAPORAN LABA RUGI KOMPREHENSIF</h2>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-0.5">PT. MUSI CYBER NUSANTARA • FTTH OPERATIONS</p>
                <p className="text-xs text-slate-500 mt-1">Periode: Bulan Berjalan (Agustus 2026)</p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Cetak Dokumen Resmi
              </button>
            </div>

            {/* Income Statement Body */}
            <div className="py-6 space-y-6 text-sm">
              {/* I. PENDAPATAN OPERASIONAL */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg font-bold text-slate-900">
                  <span>I. PENDAPATAN OPERASIONAL (REVENUE)</span>
                  <span className="font-mono">{formatRupiah(financialStats.totalRevenue)}</span>
                </div>
                <div className="pl-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>• Pendapatan Langganan Internet Bulanan (PPPoE / IP Static)</span>
                    <span className="font-mono font-medium">
                      {formatRupiah(transactions.filter(t => t.category === 'langganan_bulanan').reduce((a, c) => a + Number(c.amount), 0) || 18500000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Pendapatan Penjualan Voucher Hotspot RT/RW Net</span>
                    <span className="font-mono font-medium">
                      {formatRupiah(transactions.filter(t => t.category === 'voucher_hotspot').reduce((a, c) => a + Number(c.amount), 0) || 4250000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Biaya Pasang Baru (PSB) Pelanggan Baru</span>
                    <span className="font-mono font-medium">
                      {formatRupiah(transactions.filter(t => t.category === 'biaya_psb').reduce((a, c) => a + Number(c.amount), 0) || 2750000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Penjualan Perangkat & Jasa Instalasi Lainnya</span>
                    <span className="font-mono font-medium">{formatRupiah(0)}</span>
                  </div>
                </div>
              </div>

              {/* II. BEBAN POKOK PENDAPATAN (COGS) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg font-bold text-slate-900">
                  <span>II. BEBAN POKOK PENDAPATAN (COGS)</span>
                  <span className="font-mono text-rose-600">
                    ({formatRupiah(transactions.filter(t => t.category === 'bandwidth_upstream').reduce((a, c) => a + Number(c.amount), 0) || 8500000)})
                  </span>
                </div>
                <div className="pl-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>• Biaya Bandwidth Upstream Dedicated (NAP / IXP Transit)</span>
                    <span className="font-mono font-medium">
                      {formatRupiah(transactions.filter(t => t.category === 'bandwidth_upstream').reduce((a, c) => a + Number(c.amount), 0) || 8500000)}
                    </span>
                  </div>
                </div>
              </div>

              {/* LABA KOTOR */}
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex justify-between items-center font-bold text-emerald-900">
                <span>LABA KOTOR (GROSS PROFIT)</span>
                <span className="font-mono text-base">
                  {formatRupiah(financialStats.totalRevenue - (transactions.filter(t => t.category === 'bandwidth_upstream').reduce((a, c) => a + Number(c.amount), 0) || 8500000))}
                </span>
              </div>

              {/* III. BEBAN OPERASIONAL (OPEX) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg font-bold text-slate-900">
                  <span>III. BEBAN OPERASIONAL (OPEX)</span>
                  <span className="font-mono text-rose-600">
                    ({formatRupiah(financialStats.totalExpense - (transactions.filter(t => t.category === 'bandwidth_upstream').reduce((a, c) => a + Number(c.amount), 0) || 8500000))})
                  </span>
                </div>
                <div className="pl-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>• Gaji Karyawan, Teknisi & Customer Care</span>
                    <span className="font-mono font-medium">
                      {formatRupiah(transactions.filter(t => t.category === 'gaji_teknisi').reduce((a, c) => a + Number(c.amount), 0) || 6000000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Pembelian Material Fiber (Dropcore, ODP, Fast Connector)</span>
                    <span className="font-mono font-medium">
                      {formatRupiah(transactions.filter(t => t.category === 'material_ftth').reduce((a, c) => a + Number(c.amount), 0) || 3200000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Biaya Listrik PLN, Genset & Maintenance POP</span>
                    <span className="font-mono font-medium">
                      {formatRupiah(transactions.filter(t => t.category === 'listrik_ups').reduce((a, c) => a + Number(c.amount), 0) || 950000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Operasional Lapangan, BBM & Transportasi</span>
                    <span className="font-mono font-medium">
                      {formatRupiah(transactions.filter(t => t.category === 'operasional_transport').reduce((a, c) => a + Number(c.amount), 0) || 650000)}
                    </span>
                  </div>
                </div>
              </div>

              {/* LABA BERSIH */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center font-bold">
                <div>
                  <span className="text-base tracking-tight">LABA BERSIH OPERASIONAL (NET PROFIT)</span>
                  <p className="text-[10px] text-slate-400 font-normal">Margin Keuntungan Bersih: {financialStats.profitMargin}%</p>
                </div>
                <span className="font-mono text-xl text-emerald-400">
                  {formatRupiah(financialStats.netProfit)}
                </span>
              </div>
            </div>

            {/* Signature Footer */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-2 text-center text-xs text-slate-600">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-14">Disiapkan Oleh (Finance & Billing)</p>
                <p className="font-bold text-slate-900">Staff Keuangan Musi Cyber</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-14">Disetujui Oleh (Direktur / Owner)</p>
                <p className="font-bold text-slate-900">Manajemen Musi Cyber Network</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: KALKULATOR PSB & ROI */}
      {activeTab === 'kalkulator_roi' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="max-w-xl mb-6">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Kalkulator Kelayakan & Biaya Pasang Baru (PSB)</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Hitung estimasi modal investasi tarik kabel, harga ONT, dan waktu balik modal (BEP / Break-Even Point) per pelanggan baru.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Input Form Parameters */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Parameter Material & Jasa Lapangan
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Panjang Drop Core (Meter)</label>
                      <input
                        type="number"
                        value={roiForm.dropcoreMeters}
                        onChange={e => setRoiForm({ ...roiForm, dropcoreMeters: Number(e.target.value) })}
                        className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Harga Kabel Drop Core / Meter (Rp)</label>
                      <input
                        type="number"
                        value={roiForm.cablePricePerMeter}
                        onChange={e => setRoiForm({ ...roiForm, cablePricePerMeter: Number(e.target.value) })}
                        className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Harga ONT / Modem ONU (Rp)</label>
                      <input
                        type="number"
                        value={roiForm.ontPrice}
                        onChange={e => setRoiForm({ ...roiForm, ontPrice: Number(e.target.value) })}
                        className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aksesoris (Connector, Rosette, Clamp)</label>
                      <input
                        type="number"
                        value={roiForm.accessoriesPrice}
                        onChange={e => setRoiForm({ ...roiForm, accessoriesPrice: Number(e.target.value) })}
                        className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Upah Pasang Teknisi (Rp)</label>
                      <input
                        type="number"
                        value={roiForm.technicianFee}
                        onChange={e => setRoiForm({ ...roiForm, technicianFee: Number(e.target.value) })}
                        className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Biaya PSB Ditagih ke Pelanggan (Rp)</label>
                      <input
                        type="number"
                        value={roiForm.psbChargedToCustomer}
                        onChange={e => setRoiForm({ ...roiForm, psbChargedToCustomer: Number(e.target.value) })}
                        className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    Paket Langganan & Biaya Bandwidth
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tarif Paket Bulanan (Rp/Bulan)</label>
                      <input
                        type="number"
                        value={roiForm.monthlySubscriptionFee}
                        onChange={e => setRoiForm({ ...roiForm, monthlySubscriptionFee: Number(e.target.value) })}
                        className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Estimasi HPP Bandwidth / Pelanggan (Rp)</label>
                      <input
                        type="number"
                        value={roiForm.monthlyBandwidthCost}
                        onChange={e => setRoiForm({ ...roiForm, monthlyBandwidthCost: Number(e.target.value) })}
                        className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulation Result Box */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-lg border border-slate-800 space-y-5">
                  <div className="border-b border-slate-800 pb-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Hasil Simulasi Finansial</p>
                    <h4 className="text-base font-bold text-white mt-0.5">Analisis Payback Period</h4>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Total Biaya Pengadaan (CAPEX):</span>
                      <span className="font-mono font-bold text-white">{formatRupiah(roiCalculations.totalInstallationCost)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Biaya PSB Dari Pelanggan:</span>
                      <span className="font-mono font-bold text-emerald-400">+{formatRupiah(roiForm.psbChargedToCustomer)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Sisa Modal Yang Harus Ditutup:</span>
                      <span className="font-mono font-bold text-amber-400">{formatRupiah(roiCalculations.netInvestmentPsb)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Net Margin Bulanan / User:</span>
                      <span className="font-mono font-bold text-emerald-400">+{formatRupiah(roiCalculations.monthlyNetContribution)}/bln</span>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-center">
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Waktu Balik Modal (BEP)</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {roiCalculations.bepMonths <= 0 ? 'Langsung Untung' : `${roiCalculations.bepMonths} Bulan`}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {roiCalculations.bepMonths <= 2 ? 'Investasi Sangat Cepat Balik Modal' : 'Standar Industri FTTH'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Proyeksi Laba Bersih Th. 1:</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">{formatRupiah(roiCalculations.firstYearNetProfit)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PERHITUNGAN PAJAK & BHP (KOMINFO) */}
      {activeTab === 'pajak_bhp' && (
        <TaxModule tenantId={tenantId} />
      )}

      {/* MODAL: TAMBAH TRANSAKSI (BUKU KAS) */}
      {showAddTrxModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${trxForm.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {trxForm.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                {trxForm.type === 'income' ? 'Catat Pemasukan Kas Baru' : 'Catat Pengeluaran Kas Baru'}
              </h3>
              <button onClick={() => setShowAddTrxModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="p-6 space-y-4 text-xs">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTrxForm({ ...trxForm, type: 'income', category: 'langganan_bulanan' })}
                  className={`py-2 rounded-lg font-bold text-xs transition-all ${
                    trxForm.type === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Pemasukan (Income)
                </button>
                <button
                  type="button"
                  onClick={() => setTrxForm({ ...trxForm, type: 'expense', category: 'bandwidth_upstream' })}
                  className={`py-2 rounded-lg font-bold text-xs transition-all ${
                    trxForm.type === 'expense' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Pengeluaran (Expense)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kategori Transaksi</label>
                  <select
                    value={trxForm.category}
                    onChange={e => setTrxForm({ ...trxForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {trxForm.type === 'income' ? (
                      <>
                        <option value="langganan_bulanan">Langganan Internet Bulanan</option>
                        <option value="voucher_hotspot">Penjualan Voucher Hotspot</option>
                        <option value="biaya_psb">Biaya Pasang Baru (PSB)</option>
                        <option value="penjualan_alat">Penjualan Perangkat (ONT/Router)</option>
                        <option value="jasa_teknisi">Jasa Instalasi & Setting</option>
                        <option value="lainnya_income">Pemasukan Lain-lain</option>
                      </>
                    ) : (
                      <>
                        <option value="bandwidth_upstream">Bandwidth Upstream / NAP</option>
                        <option value="sewa_tiang_pop">Sewa Tiang & Ruang POP</option>
                        <option value="gaji_teknisi">Gaji Karyawan & Teknisi</option>
                        <option value="operasional_transport">BBM & Operasional</option>
                        <option value="material_ftth">Material Fiber (Dropcore, ODP)</option>
                        <option value="listrik_ups">Listrik, Genset & Baterai UPS</option>
                        <option value="marketing_iklan">Marketing & Promosi</option>
                        <option value="pajak_legalitas">Pajak & Legalitas</option>
                        <option value="lainnya_expense">Pengeluaran Lain-lain</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Metode Pembayaran / Akun</label>
                  <select
                    value={trxForm.paymentMethod}
                    onChange={e => setTrxForm({ ...trxForm, paymentMethod: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="cash">Kas Tunai (Kasir)</option>
                    <option value="transfer_bca">Transfer Bank BCA</option>
                    <option value="transfer_mandiri">Transfer Bank Mandiri</option>
                    <option value="transfer_bri">Transfer Bank BRI</option>
                    <option value="transfer_bni">Transfer Bank BNI</option>
                    <option value="qris">QRIS / E-Wallet</option>
                    <option value="payment_gateway">Payment Gateway</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jumlah Nominal (IDR)</label>
                  <input
                    required
                    type="number"
                    placeholder="Contoh: 250000"
                    value={trxForm.amount}
                    onChange={e => setTrxForm({ ...trxForm, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tanggal Transaksi</label>
                  <input
                    required
                    type="date"
                    value={trxForm.date}
                    onChange={e => setTrxForm({ ...trxForm, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deskripsi / Keterangan</label>
                <input
                  type="text"
                  placeholder="Keterangan transaksi..."
                  value={trxForm.description}
                  onChange={e => setTrxForm({ ...trxForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No. Referensi / Resi (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: TRX-998822 / KWT-01"
                  value={trxForm.referenceNo}
                  onChange={e => setTrxForm({ ...trxForm, referenceNo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className={`w-full py-3 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all ${
                    trxForm.type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Simpan Transaksi Ke Buku Kas
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: BUAT TAGIHAN MANUAL */}
      {showAddInvModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Buat Tagihan / Invoice Baru
              </h3>
              <button onClick={() => setShowAddInvModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddInvoice} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Pelanggan / Subscriber</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: Bapak Hendra (Jl. Musi Raya No. 12)"
                  value={invForm.customerName}
                  onChange={e => setInvForm({ ...invForm, customerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={invForm.customerPhone}
                    onChange={e => setInvForm({ ...invForm, customerPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Paket Layanan</label>
                  <select
                    value={invForm.planName}
                    onChange={e => {
                      const p = e.target.value;
                      const amt = p.includes('100') ? '1500000' : p.includes('50') ? '400000' : '250000';
                      setInvForm({ ...invForm, planName: p, amount: amt });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Paket Home Fiber 30 Mbps">Paket Home Fiber 30 Mbps (Rp 250rb)</option>
                    <option value="Paket Bisnis Fiber 50 Mbps">Paket Bisnis Fiber 50 Mbps (Rp 400rb)</option>
                    <option value="Paket Dedicated 100 Mbps">Paket Dedicated 100 Mbps (Rp 1.5jt)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nominal (IDR)</label>
                  <input
                    required
                    type="number"
                    value={invForm.amount}
                    onChange={e => setInvForm({ ...invForm, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Periode Tagihan</label>
                  <input
                    type="text"
                    value={invForm.billingMonth}
                    onChange={e => setInvForm({ ...invForm, billingMonth: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jatuh Tempo</label>
                  <input
                    type="date"
                    value={invForm.dueDate}
                    onChange={e => setInvForm({ ...invForm, dueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Catatan Tambahan</label>
                <input
                  type="text"
                  placeholder="Catatan pada invoice..."
                  value={invForm.notes}
                  onChange={e => setInvForm({ ...invForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all"
                >
                  Terbitkan Invoice Tagihan
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: PROSES PEMBAYARAN INVOICE */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Konfirmasi Pembayaran Tagihan
              </h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">No. Invoice:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Pelanggan:</span>
                  <span className="font-bold text-slate-800">{selectedInvoice.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Paket:</span>
                  <span className="text-slate-700">{selectedInvoice.planName}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-emerald-200/50">
                  <span className="font-bold text-slate-700">Total Yang Diterima:</span>
                  <span className="font-mono font-bold text-base text-emerald-700">
                    {formatRupiah(Number(selectedInvoice.totalAmount || selectedInvoice.amount))}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Metode Pembayaran</label>
                <select
                  value={payForm.paymentMethod}
                  onChange={e => setPayForm({ ...payForm, paymentMethod: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="cash">Kas Tunai (Kasir)</option>
                  <option value="transfer_bca">Transfer Bank BCA</option>
                  <option value="transfer_mandiri">Transfer Bank Mandiri</option>
                  <option value="transfer_bri">Transfer Bank BRI</option>
                  <option value="transfer_bni">Transfer Bank BNI</option>
                  <option value="qris">QRIS Scan / E-Wallet</option>
                  <option value="payment_gateway">Payment Gateway</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Catatan Pembayaran</label>
                <input
                  type="text"
                  value={payForm.notes}
                  onChange={e => setPayForm({ ...payForm, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none"
                />
              </div>

              <p className="text-[10px] text-slate-400">
                * Menandai lunas akan otomatis mencatat uang masuk pada <strong>Buku Kas</strong> & memulihkan status koneksi (jika sebelumnya terisolir).
              </p>

              <div className="pt-2">
                <button
                  onClick={handleExecutePayment}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-md transition-all active:scale-[0.98]"
                >
                  Konfirmasi Pembayaran Lunas
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: CETAK KWITANSI / INVOICE */}
      {showPrintModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-indigo-600" />
                Struk Kwitansi Pembayaran
              </h3>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              {/* Thermal Receipt Simulation */}
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 uppercase">MUSI CYBER NETWORK</h4>
                  <p className="text-[10px] text-slate-500">PT. Musi Cyber Nusantara</p>
                  <p className="text-[9px] text-slate-400">Jl. Musi Raya No. 88, Palembang</p>
                  <p className="text-[9px] text-slate-400">Telp/WA: 0812-7899-0000</p>
                </div>

                <div className="border-t border-b border-dashed border-slate-300 py-2 text-left space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">No. Invoice:</span>
                    <span className="font-bold text-slate-900">{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tanggal:</span>
                    <span className="text-slate-800">{new Date().toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pelanggan:</span>
                    <span className="font-bold text-slate-900">{selectedInvoice.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Paket:</span>
                    <span className="text-slate-800">{selectedInvoice.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Periode:</span>
                    <span className="text-slate-800">{selectedInvoice.billingMonth}</span>
                  </div>
                </div>

                <div className="text-left space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatRupiah(Number(selectedInvoice.amount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diskon / Promo:</span>
                    <span>Rp 0</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>TOTAL BAYAR:</span>
                    <span className="text-sm">{formatRupiah(Number(selectedInvoice.totalAmount || selectedInvoice.amount))}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-emerald-600 font-bold">
                    <span>STATUS:</span>
                    <span>{selectedInvoice.status === 'paid' ? 'LUNAS' : 'BELUM DIBAYAR'}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-300 pt-3 text-[9px] text-slate-400 space-y-0.5">
                  <p>Terima kasih atas pembayaran Anda.</p>
                  <p>Struk ini adalah bukti pembayaran yang sah.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Struk Sekarang
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: KIRIM NOTIFIKASI WHATSAPP */}
      {showWhatsappModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                Kirim Tagihan via WhatsApp
              </h3>
              <button onClick={() => setShowWhatsappModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penerima:</p>
                <p className="font-bold text-slate-900">{selectedInvoice.customerName} ({selectedInvoice.customerPhone || '08xx-xxxx-xxxx'})</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Preview Format Pesan WhatsApp</label>
                <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl text-[11px] text-slate-700 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto font-sans">
                  {decodeURIComponent(getWhatsAppMessage(selectedInvoice))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    const phone = (selectedInvoice.customerPhone || '').replace(/\D/g, '');
                    const cleanPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;
                    const url = `https://wa.me/${cleanPhone || ''}?text=${getWhatsAppMessage(selectedInvoice)}`;
                    window.open(url, '_blank');
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Send className="w-4 h-4" />
                  Buka WhatsApp Web / App
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(decodeURIComponent(getWhatsAppMessage(selectedInvoice)));
                    alert('Format pesan WhatsApp berhasil disalin ke clipboard!');
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                >
                  Salin Teks
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
