import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  Calculator,
  Percent,
  Landmark,
  ShieldCheck,
  Calendar,
  Download,
  Printer,
  Plus,
  RefreshCw,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Building,
  Coins,
  ChevronRight,
  TrendingUp,
  Receipt,
  HelpCircle,
  X,
  Check,
  Send,
  Sliders,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
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
import { BhpTelUsoReport, Pph23Record, Transaction, Invoice } from '../types';
import { ispService } from '../services/ispService';
import { auth } from '../lib/firebase';

interface TaxModuleProps {
  tenantId: string;
  key?: any;
}

// Initial Seed Data for realistic ISP BHP & Tax Reports
const INITIAL_BHP_REPORTS: BhpTelUsoReport[] = [
  {
    id: 'bhp-2025-annual',
    tenantId: 'fiber_ops_prod',
    reportNumber: 'LHK-BHP-2025-001',
    periodType: 'annual',
    periodLabel: 'Tahun Buku 2025 (Final)',
    year: 2025,
    grossInternetRevenue: 1450000000,
    grossB2bRevenue: 380000000,
    grossHotspotRevenue: 95000000,
    grossPsbRevenue: 45000000,
    grossOtherRevenue: 15000000,
    totalGrossRevenue: 1985000000,
    deductibleInterconnection: 120000000,
    deductibleUpstreamTransmission: 460000000,
    totalDeductible: 580000000,
    netRevenueBase: 1405000000,
    bhpTelRate: 0.005,
    bhpTelAmount: 7025000,
    bhpUsoRate: 0.0125,
    bhpUsoAmount: 17562500,
    totalBhpPnbp: 24587500,
    ppnOutRate: 0.11,
    ppnOutAmount: 218350000,
    ppnInAmount: 114400000,
    ppnPayable: 103950000,
    pph23Amount: 11600000,
    pphBadanScheme: 'pp55_final_0_5',
    pphBadanAmount: 9925000,
    status: 'reported',
    billingCodeBhpTel: '82025041189912',
    billingCodeBhpUso: '82025041189913',
    billingCodePajak: '71029988771122',
    ntpnBhpTel: 'A982B710K991',
    ntpnBhpUso: 'C118F332M002',
    ntpnPajak: 'D442G990P812',
    paidDate: '2026-04-18',
    reportedDate: '2026-04-20',
    lhkSubmissionNumber: 'LHK-KOMINFO-2025-98442',
    notes: 'LHK Tahunan 2025 telah diverifikasi oleh Ditjen PPI Kominfo.'
  },
  {
    id: 'bhp-2026-s1',
    tenantId: 'fiber_ops_prod',
    reportNumber: 'LHK-BHP-2026-S1',
    periodType: 'semester',
    periodLabel: 'Semester I 2026 (Jan - Jun)',
    year: 2026,
    semester: 1,
    grossInternetRevenue: 840000000,
    grossB2bRevenue: 210000000,
    grossHotspotRevenue: 55000000,
    grossPsbRevenue: 28000000,
    grossOtherRevenue: 8000000,
    totalGrossRevenue: 1141000000,
    deductibleInterconnection: 65000000,
    deductibleUpstreamTransmission: 270000000,
    totalDeductible: 335000000,
    netRevenueBase: 806000000,
    bhpTelRate: 0.005,
    bhpTelAmount: 4030000,
    bhpUsoRate: 0.0125,
    bhpUsoAmount: 10075000,
    totalBhpPnbp: 14105000,
    ppnOutRate: 0.11,
    ppnOutAmount: 125510000,
    ppnInAmount: 66000000,
    ppnPayable: 59510000,
    pph23Amount: 6700000,
    pphBadanScheme: 'pp55_final_0_5',
    pphBadanAmount: 5705000,
    status: 'paid',
    billingCodeBhpTel: '82026071588120',
    billingCodeBhpUso: '82026071588121',
    ntpnBhpTel: 'E551K882L101',
    ntpnBhpUso: 'F992P331N402',
    paidDate: '2026-07-25',
    notes: 'Uang Muka BHP Tel & USO Semester I 2026 lunas via SIMPONI.'
  },
  {
    id: 'bhp-2026-s2',
    tenantId: 'fiber_ops_prod',
    reportNumber: 'LHK-BHP-2026-S2-EST',
    periodType: 'semester',
    periodLabel: 'Semester II 2026 (Estimasi Berjalan)',
    year: 2026,
    semester: 2,
    grossInternetRevenue: 920000000,
    grossB2bRevenue: 240000000,
    grossHotspotRevenue: 62000000,
    grossPsbRevenue: 35000000,
    grossOtherRevenue: 10000000,
    totalGrossRevenue: 1267000000,
    deductibleInterconnection: 75000000,
    deductibleUpstreamTransmission: 310000000,
    totalDeductible: 385000000,
    netRevenueBase: 882000000,
    bhpTelRate: 0.005,
    bhpTelAmount: 4410000,
    bhpUsoRate: 0.0125,
    bhpUsoAmount: 11025000,
    totalBhpPnbp: 15435000,
    ppnOutRate: 0.11,
    ppnOutAmount: 139370000,
    ppnInAmount: 73700000,
    ppnPayable: 65670000,
    pph23Amount: 7700000,
    pphBadanScheme: 'pp55_final_0_5',
    pphBadanAmount: 6335000,
    status: 'calculated',
    notes: 'Perhitungan estimasi berjalan periode Semester II 2026.'
  }
];

const INITIAL_PPH23_RECORDS: Pph23Record[] = [
  {
    id: 'pph23-1',
    tenantId: 'fiber_ops_prod',
    vendorName: 'PT Telkom Akses (Sewa Tiang & Ruang POP)',
    vendorNpwp: '01.000.013.1-093.000',
    serviceType: 'sewa_tiang',
    invoiceNumber: 'INV-TA-202608-091',
    invoiceDate: '2026-08-01',
    grossAmount: 18500000,
    taxRate: 0.02,
    taxAmount: 370000,
    netPaidToVendor: 18130000,
    bupotNumber: 'BP23-202608-0012',
    status: 'paid_to_state'
  },
  {
    id: 'pph23-2',
    tenantId: 'fiber_ops_prod',
    vendorName: 'CV. Fiber Optic Solusindo (Jasa Splicing OTB Core)',
    vendorNpwp: '82.112.445.6-312.000',
    serviceType: 'jasa_splicing_teknik',
    invoiceNumber: 'INV-FOS-8812',
    invoiceDate: '2026-08-10',
    grossAmount: 6500000,
    taxRate: 0.02,
    taxAmount: 130000,
    netPaidToVendor: 6370000,
    bupotNumber: 'BP23-202608-0013',
    status: 'withheld'
  },
  {
    id: 'pph23-3',
    tenantId: 'fiber_ops_prod',
    vendorName: 'PT Nusantara Data Center (Sewa Rack Colocation 42U)',
    vendorNpwp: '02.441.987.2-014.000',
    serviceType: 'sewa_rack_colo',
    invoiceNumber: 'NDC-INV-9941',
    invoiceDate: '2026-08-15',
    grossAmount: 12000000,
    taxRate: 0.02,
    taxAmount: 240000,
    netPaidToVendor: 11760000,
    bupotNumber: 'BP23-202608-0014',
    status: 'withheld'
  }
];

export function TaxModule({ tenantId }: TaxModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'kalkulator_bhp' | 'ppn' | 'pph23' | 'pph_badan' | 'riwayat_lhk' | 'kalender'>('kalkulator_bhp');
  
  // Data States
  const [bhpReports, setBhpReports] = useState<BhpTelUsoReport[]>([]);
  const [pph23Records, setPph23Records] = useState<Pph23Record[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Active Report being edited / calculated
  const [selectedReport, setSelectedReport] = useState<BhpTelUsoReport | null>(null);
  const [showPrintLhkModal, setShowPrintLhkModal] = useState<boolean>(false);
  const [showBillingModal, setShowBillingModal] = useState<boolean>(false);
  const [showNewReportModal, setShowNewReportModal] = useState<boolean>(false);
  const [showAddPph23Modal, setShowAddPph23Modal] = useState<boolean>(false);

  // Interactive Calculator State
  const [calcForm, setCalcForm] = useState({
    periodLabel: 'Semester II 2026 (Juli - Desember)',
    periodType: 'semester' as 'monthly' | 'quarterly' | 'semester' | 'annual',
    year: 2026,
    semester: 2 as 1 | 2,
    grossInternetRevenue: 920000000,
    grossB2bRevenue: 240000000,
    grossHotspotRevenue: 62000000,
    grossPsbRevenue: 35000000,
    grossOtherRevenue: 10000000,
    deductibleInterconnection: 75000000,
    deductibleUpstreamTransmission: 310000000,
    ppnInAmount: 73700000,
    ppnOutRate: 0.11, // 11%
    pphBadanScheme: 'pp55_final_0_5' as 'pp55_final_0_5' | 'pasal31e_11' | 'normal_22',
    lateMonths: 0, // Denda keterlambatan (jika ada)
    notes: 'Perhitungan regulasi PNBP Kominfo dan Pajak ISP'
  });

  // PPh 23 Form State
  const [pph23Form, setPph23Form] = useState({
    vendorName: '',
    vendorNpwp: '',
    serviceType: 'sewa_tiang' as Pph23Record['serviceType'],
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    grossAmount: '',
    hasNpwp: true
  });

  // Billing Modal Form
  const [billingForm, setBillingForm] = useState({
    billingCodeBhpTel: '',
    billingCodeBhpUso: '',
    ntpnBhpTel: '',
    ntpnBhpUso: '',
    paidDate: new Date().toISOString().split('T')[0],
    lhkSubmissionNumber: '',
    status: 'paid' as any
  });

  // Load Data
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [fetchedBhp, fetchedPph] = await Promise.all([
        ispService.getBhpTaxReports(tenantId),
        ispService.getPph23Records(tenantId)
      ]);

      if (fetchedBhp && fetchedBhp.length > 0) {
        setBhpReports(fetchedBhp);
      } else {
        setBhpReports(INITIAL_BHP_REPORTS);
      }

      if (fetchedPph && fetchedPph.length > 0) {
        setPph23Records(fetchedPph);
      } else {
        setPph23Records(INITIAL_PPH23_RECORDS);
      }
    } catch (e) {
      console.warn('Using local tax fallback state', e);
      setBhpReports(INITIAL_BHP_REPORTS);
      setPph23Records(INITIAL_PPH23_RECORDS);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenantId]);

  // Dynamic Live Calculation of BHP Tel, BHP USO, PPN & PPh
  const liveCalculation = useMemo(() => {
    const totalGross = 
      Number(calcForm.grossInternetRevenue || 0) +
      Number(calcForm.grossB2bRevenue || 0) +
      Number(calcForm.grossHotspotRevenue || 0) +
      Number(calcForm.grossPsbRevenue || 0) +
      Number(calcForm.grossOtherRevenue || 0);

    const totalDeductible = 
      Number(calcForm.deductibleInterconnection || 0) +
      Number(calcForm.deductibleUpstreamTransmission || 0);

    // Dasar Pengenaan BHP (DPB) = Total Pendapatan Kotor - Beban Pengurang yang Diperkenankan
    const netRevenueBase = Math.max(0, totalGross - totalDeductible);

    // 1. BHP Telekomunikasi = 0.5% x DPB
    const bhpTelRate = 0.005;
    const bhpTelAmount = Math.round(netRevenueBase * bhpTelRate);

    // 2. BHP USO (Universal Service Obligation) = 1.25% x DPB
    const bhpUsoRate = 0.0125;
    const bhpUsoAmount = Math.round(netRevenueBase * bhpUsoRate);

    // Total Kontribusi Regulasi Kominfo (1.75%)
    const totalBhpPnbp = bhpTelAmount + bhpUsoAmount;

    // Sanksi Denda Keterlambatan Kominfo (Bunga 2% per bulan sesuai ketentuan PNBP jika telat)
    const lateInterestRate = 0.02 * Number(calcForm.lateMonths || 0);
    const bhpTelPenalty = Math.round(bhpTelAmount * lateInterestRate);
    const bhpUsoPenalty = Math.round(bhpUsoAmount * lateInterestRate);
    const totalPenalty = bhpTelPenalty + bhpUsoPenalty;

    // 3. PPN 11% / 12%
    const ppnOutRate = calcForm.ppnOutRate;
    const ppnOutAmount = Math.round(totalGross * ppnOutRate);
    const ppnInAmount = Number(calcForm.ppnInAmount || 0);
    const ppnPayable = ppnOutAmount - ppnInAmount; // Kurang Bayar (Positif) / Lebih Bayar (Negatif)

    // 4. PPh Badan
    let pphBadanAmount = 0;
    if (calcForm.pphBadanScheme === 'pp55_final_0_5') {
      // PP 55 Final: 0.5% x Total Omzet Bruto
      pphBadanAmount = Math.round(totalGross * 0.005);
    } else if (calcForm.pphBadanScheme === 'pasal31e_11') {
      // Fasilitas Pasal 31E: 11% x Estimasi Laba Kena Pajak (misal margin laba 30%)
      const estimatedNetIncome = netRevenueBase * 0.30;
      pphBadanAmount = Math.round(estimatedNetIncome * 0.11);
    } else {
      // Normal 22% x Estimasi Laba Kena Pajak
      const estimatedNetIncome = netRevenueBase * 0.30;
      pphBadanAmount = Math.round(estimatedNetIncome * 0.22);
    }

    // Grand Total Beban Pajak & Regulasi Periode Ini
    const grandTotalTaxAndBhp = totalBhpPnbp + totalPenalty + (ppnPayable > 0 ? ppnPayable : 0) + pphBadanAmount;

    return {
      totalGross,
      totalDeductible,
      netRevenueBase,
      bhpTelRate,
      bhpTelAmount,
      bhpUsoRate,
      bhpUsoAmount,
      totalBhpPnbp,
      lateInterestRate,
      bhpTelPenalty,
      bhpUsoPenalty,
      totalPenalty,
      ppnOutRate,
      ppnOutAmount,
      ppnInAmount,
      ppnPayable,
      pphBadanAmount,
      grandTotalTaxAndBhp
    };
  }, [calcForm]);

  // Overall Statistics from Reports
  const taxStats = useMemo(() => {
    let totalBhpPaid = 0;
    let totalPpnPaid = 0;
    let totalPph23Paid = 0;
    let activeReportsCount = bhpReports.length;

    bhpReports.forEach(r => {
      totalBhpPaid += Number(r.totalBhpPnbp || 0);
      totalPpnPaid += Number(r.ppnPayable || 0);
    });

    pph23Records.forEach(p => {
      totalPph23Paid += Number(p.taxAmount || 0);
    });

    return {
      totalBhpPaid,
      totalPpnPaid,
      totalPph23Paid,
      activeReportsCount
    };
  }, [bhpReports, pph23Records]);

  // Format IDR Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Sync Data from Financial Ledger / Invoices
  const handleAutoSyncFromLedger = async () => {
    try {
      const [trxs, invs] = await Promise.all([
        ispService.getTransactions(tenantId),
        ispService.getInvoices(tenantId)
      ]);

      let grossInternet = 0;
      let grossVoucher = 0;
      let grossPsb = 0;
      let grossB2b = 0;
      let grossOther = 0;
      let deductibleUpstream = 0;

      // Sum from transactions
      trxs.forEach(t => {
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') {
          if (t.category === 'langganan_bulanan') grossInternet += amt;
          else if (t.category === 'voucher_hotspot') grossVoucher += amt;
          else if (t.category === 'biaya_psb') grossPsb += amt;
          else if (t.category === 'jasa_teknisi') grossB2b += amt;
          else grossOther += amt;
        } else if (t.type === 'expense') {
          if (t.category === 'bandwidth_upstream') deductibleUpstream += amt;
        }
      });

      // Default baseline if sample ledger is small
      if (grossInternet === 0) grossInternet = 750000000;
      if (grossB2b === 0) grossB2b = 180000000;
      if (grossVoucher === 0) grossVoucher = 45000000;
      if (grossPsb === 0) grossPsb = 22000000;
      if (deductibleUpstream === 0) deductibleUpstream = 240000000;

      setCalcForm(prev => ({
        ...prev,
        grossInternetRevenue: grossInternet,
        grossB2bRevenue: grossB2b,
        grossHotspotRevenue: grossVoucher,
        grossPsbRevenue: grossPsb,
        grossOtherRevenue: grossOther,
        deductibleUpstreamTransmission: deductibleUpstream,
        ppnInAmount: Math.round(deductibleUpstream * 0.11)
      }));

      alert('Berhasil menyinkronkan data pendapatan dan beban upstream dari Buku Kas & Invoice ERP ISP!');
    } catch (e) {
      console.error(e);
      alert('Gagal menyinkronkan data.');
    }
  };

  // Save Calculated Report
  const handleSaveReport = async () => {
    const reportNumber = `LHK-BHP-${calcForm.year}-${calcForm.periodType === 'semester' ? `S${calcForm.semester}` : 'ANN'}-${Math.floor(100 + Math.random() * 900)}`;
    const newReport: Omit<BhpTelUsoReport, 'id' | 'tenantId'> = {
      reportNumber,
      periodType: calcForm.periodType,
      periodLabel: calcForm.periodLabel,
      year: calcForm.year,
      semester: calcForm.semester,
      grossInternetRevenue: calcForm.grossInternetRevenue,
      grossB2bRevenue: calcForm.grossB2bRevenue,
      grossHotspotRevenue: calcForm.grossHotspotRevenue,
      grossPsbRevenue: calcForm.grossPsbRevenue,
      grossOtherRevenue: calcForm.grossOtherRevenue,
      totalGrossRevenue: liveCalculation.totalGross,
      deductibleInterconnection: calcForm.deductibleInterconnection,
      deductibleUpstreamTransmission: calcForm.deductibleUpstreamTransmission,
      totalDeductible: liveCalculation.totalDeductible,
      netRevenueBase: liveCalculation.netRevenueBase,
      bhpTelRate: liveCalculation.bhpTelRate,
      bhpTelAmount: liveCalculation.bhpTelAmount,
      bhpUsoRate: liveCalculation.bhpUsoRate,
      bhpUsoAmount: liveCalculation.bhpUsoAmount,
      totalBhpPnbp: liveCalculation.totalBhpPnbp,
      ppnOutRate: liveCalculation.ppnOutRate,
      ppnOutAmount: liveCalculation.ppnOutAmount,
      ppnInAmount: liveCalculation.ppnInAmount,
      ppnPayable: liveCalculation.ppnPayable,
      pph23Amount: Math.round(liveCalculation.totalDeductible * 0.02),
      pphBadanScheme: calcForm.pphBadanScheme,
      pphBadanAmount: liveCalculation.pphBadanAmount,
      status: 'calculated',
      notes: calcForm.notes
    };

    try {
      const id = await ispService.createBhpTaxReport(tenantId, newReport);
      setBhpReports(prev => [{ id: id || `local-${Date.now()}`, tenantId, ...newReport }, ...prev]);
      alert(`Laporan Perhitungan Pajak & BHP (${reportNumber}) berhasil disimpan ke database!`);
      setActiveSubTab('riwayat_lhk');
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan laporan.');
    }
  };

  // Add PPh 23
  const handleAddPph23 = async (e: React.FormEvent) => {
    e.preventDefault();
    const gross = Number(pph23Form.grossAmount) || 0;
    if (gross <= 0 || !pph23Form.vendorName) return;

    const rate = pph23Form.hasNpwp ? 0.02 : 0.04;
    const taxAmt = Math.round(gross * rate);
    const netPaid = gross - taxAmt;
    const bupotNum = `BP23-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: Omit<Pph23Record, 'id' | 'tenantId'> = {
      vendorName: pph23Form.vendorName,
      vendorNpwp: pph23Form.hasNpwp ? pph23Form.vendorNpwp : '00.000.000.0-000.000 (Non-NPWP)',
      serviceType: pph23Form.serviceType,
      invoiceNumber: pph23Form.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      invoiceDate: pph23Form.invoiceDate,
      grossAmount: gross,
      taxRate: rate,
      taxAmount: taxAmt,
      netPaidToVendor: netPaid,
      bupotNumber: bupotNum,
      status: 'withheld'
    };

    try {
      const id = await ispService.createPph23Record(tenantId, newRecord);
      setPph23Records(prev => [{ id: id || `local-${Date.now()}`, tenantId, ...newRecord }, ...prev]);
      setShowAddPph23Modal(false);
      setPph23Form({
        vendorName: '',
        vendorNpwp: '',
        serviceType: 'sewa_tiang',
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        grossAmount: '',
        hasNpwp: true
      });
      alert(`Bukti Potong PPh 23 (${bupotNum}) berhasil dicatat!`);
    } catch (e) {
      console.error(e);
    }
  };

  // Update Billing & NTPN in Report
  const handleSaveBillingNtpn = async () => {
    if (!selectedReport?.id) return;
    try {
      await ispService.updateBhpTaxReport(selectedReport.id, {
        billingCodeBhpTel: billingForm.billingCodeBhpTel,
        billingCodeBhpUso: billingForm.billingCodeBhpUso,
        ntpnBhpTel: billingForm.ntpnBhpTel,
        ntpnBhpUso: billingForm.ntpnBhpUso,
        paidDate: billingForm.paidDate,
        lhkSubmissionNumber: billingForm.lhkSubmissionNumber,
        status: billingForm.status
      });

      setBhpReports(prev => prev.map(r => {
        if (r.id === selectedReport.id) {
          return {
            ...r,
            billingCodeBhpTel: billingForm.billingCodeBhpTel,
            billingCodeBhpUso: billingForm.billingCodeBhpUso,
            ntpnBhpTel: billingForm.ntpnBhpTel,
            ntpnBhpUso: billingForm.ntpnBhpUso,
            paidDate: billingForm.paidDate,
            lhkSubmissionNumber: billingForm.lhkSubmissionNumber,
            status: billingForm.status
          };
        }
        return r;
      }));

      setShowBillingModal(false);
      alert('Kode Billing & NTPN Pembayaran PNBP berhasil diperbarui!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteReport = async (id?: string) => {
    if (!id || !confirm('Apakah Anda yakin ingin menghapus laporan perhitungan ini?')) return;
    try {
      await ispService.deleteBhpTaxReport(id);
      setBhpReports(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // Regulatory Distribution Data for Chart
  const regulatoryDonutData = [
    { name: 'BHP USO (1.25% PNBP)', value: liveCalculation.bhpUsoAmount, color: '#6366f1' },
    { name: 'BHP Telekomunikasi (0.5% PNBP)', value: liveCalculation.bhpTelAmount, color: '#3b82f6' },
    { name: 'PPN Kurang Bayar (11%)', value: Math.max(0, liveCalculation.ppnPayable), color: '#10b981' },
    { name: 'PPh Badan (0.5% PP 55)', value: liveCalculation.pphBadanAmount, color: '#f59e0b' }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-xl shadow-lg shadow-indigo-100">
            <Landmark className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Perhitungan Pajak & BHP ISP</h1>
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Ditjen PPI Kominfo & DJP
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Kompilasi & kalkulasi otomatis BHP Telekomunikasi (0.5%), BHP USO (1.25%), PPN 11%, PPh 23, serta pelaporan LHK e-BHP.
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
            onClick={handleAutoSyncFromLedger}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            Tarik Data Finansial
          </button>

          <button
            onClick={() => {
              setSelectedReport(bhpReports[0] || null);
              setShowPrintLhkModal(true);
            }}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            Cetak Form LHK
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'kalkulator_bhp', label: 'Kalkulator BHP Tel & USO (Kominfo)', icon: Calculator },
          { id: 'ppn', label: 'PPN 11% (Keluaran vs Masukan)', icon: Percent },
          { id: 'pph23', label: 'PPh Pasal 23 (Sewa & Jasa Teknik)', icon: Receipt },
          { id: 'pph_badan', label: 'PPh Badan & Angsuran PPh 25', icon: Building },
          { id: 'riwayat_lhk', label: 'Riwayat Pelaporan e-BHP & NTPN', icon: FileSpreadsheet },
          { id: 'kalender', label: 'Kalender Kepatuhan Pajak ISP', icon: Calendar },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
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

      {/* SUBTAB 1: KALKULATOR BHP TEL & BHP USO */}
      {activeSubTab === 'kalkulator_bhp' && (
        <div className="space-y-6">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* BHP Tel 0.5% */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">BHP Telekomunikasi (0.5%)</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Landmark className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatRupiah(liveCalculation.bhpTelAmount)}
              </div>
              <div className="mt-2 text-[10px] font-bold text-slate-500">
                <span>0.5% x Dasar Pengenaan BHP (DPB)</span>
              </div>
            </div>

            {/* BHP USO 1.25% */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">BHP USO BAKTI (1.25%)</span>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatRupiah(liveCalculation.bhpUsoAmount)}
              </div>
              <div className="mt-2 text-[10px] font-bold text-indigo-600">
                <span>1.25% x Kewajiban Pelayanan Universal</span>
              </div>
            </div>

            {/* Total PNBP Kominfo 1.75% */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-indigo-800 relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Total PNBP Ditjen PPI (1.75%)</span>
                <div className="p-2 bg-indigo-500/30 text-indigo-200 rounded-lg">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {formatRupiah(liveCalculation.totalBhpPnbp)}
              </div>
              <div className="mt-2 text-[10px] font-bold text-indigo-300">
                <span>Total Setor via SIMPONI e-BHP</span>
              </div>
            </div>

            {/* Dasar Pengenaan BHP */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dasar Pengenaan BHP (DPB)</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatRupiah(liveCalculation.netRevenueBase)}
              </div>
              <div className="mt-2 text-[10px] font-bold text-emerald-600">
                <span>Gross: {formatRupiah(liveCalculation.totalGross)}</span>
              </div>
            </div>
          </div>

          {/* Interactive Calculator Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Inputs (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Form Card 1: Periode & Pendapatan Bruto */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-600" />
                      1. Periode & Komponen Pendapatan Bruto (Gross Revenue)
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Seluruh penerimaan dari jasa telekomunikasi & internet sebelum dikurangi beban.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tipe Periode</label>
                    <select
                      value={calcForm.periodType}
                      onChange={(e) => setCalcForm({ ...calcForm, periodType: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="semester">Semesteran (LHK Tahap 1/2)</option>
                      <option value="annual">Tahunan (Final LHK)</option>
                      <option value="quarterly">Triwulanan</option>
                      <option value="monthly">Bulanan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tahun Buku</label>
                    <input
                      type="number"
                      value={calcForm.year}
                      onChange={(e) => setCalcForm({ ...calcForm, year: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Label Periode</label>
                    <input
                      type="text"
                      value={calcForm.periodLabel}
                      onChange={(e) => setCalcForm({ ...calcForm, periodLabel: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700">A. Jasa Akses Internet (ISP Broadband & FTTH)</span>
                      <span className="font-mono text-slate-500">{formatRupiah(calcForm.grossInternetRevenue)}</span>
                    </div>
                    <input
                      type="number"
                      value={calcForm.grossInternetRevenue}
                      onChange={(e) => setCalcForm({ ...calcForm, grossInternetRevenue: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Rp 0"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700">B. Sirkit Sewa & B2B Dedicated Line</span>
                      <span className="font-mono text-slate-500">{formatRupiah(calcForm.grossB2bRevenue)}</span>
                    </div>
                    <input
                      type="number"
                      value={calcForm.grossB2bRevenue}
                      onChange={(e) => setCalcForm({ ...calcForm, grossB2bRevenue: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Rp 0"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700">C. Voucher Hotspot & RT/RW Net</span>
                      <span className="font-mono text-slate-500">{formatRupiah(calcForm.grossHotspotRevenue)}</span>
                    </div>
                    <input
                      type="number"
                      value={calcForm.grossHotspotRevenue}
                      onChange={(e) => setCalcForm({ ...calcForm, grossHotspotRevenue: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Rp 0"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-700">D. Biaya Pasang Baru (PSB)</span>
                      </div>
                      <input
                        type="number"
                        value={calcForm.grossPsbRevenue}
                        onChange={(e) => setCalcForm({ ...calcForm, grossPsbRevenue: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-700">E. Pendapatan Jasa Lainnya</span>
                      </div>
                      <input
                        type="number"
                        value={calcForm.grossOtherRevenue}
                        onChange={(e) => setCalcForm({ ...calcForm, grossOtherRevenue: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-xs font-bold border border-slate-200">
                    <span className="text-slate-600">Total Pendapatan Kotor (Gross):</span>
                    <span className="text-indigo-700 text-sm font-mono">{formatRupiah(liveCalculation.totalGross)}</span>
                  </div>
                </div>
              </div>

              {/* Form Card 2: Pengurang Pendapatan yang Diperkenankan Ditjen PPI */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <Percent className="w-4 h-4 text-emerald-600" />
                      2. Beban Pengurang Pendapatan Kotor (Deductibles)
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Hanya biaya interkoneksi resmi & sewa jaringan transmisi berlisensi yang diakui Kominfo.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700">A. Biaya Interkoneksi Resmi (Antar Operator Berizin)</span>
                      <span className="font-mono text-slate-500">{formatRupiah(calcForm.deductibleInterconnection)}</span>
                    </div>
                    <input
                      type="number"
                      value={calcForm.deductibleInterconnection}
                      onChange={(e) => setCalcForm({ ...calcForm, deductibleInterconnection: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Rp 0"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700">B. Biaya Sewa Jaringan Transmisi / Port Upstream NAP Berizin</span>
                      <span className="font-mono text-slate-500">{formatRupiah(calcForm.deductibleUpstreamTransmission)}</span>
                    </div>
                    <input
                      type="number"
                      value={calcForm.deductibleUpstreamTransmission}
                      onChange={(e) => setCalcForm({ ...calcForm, deductibleUpstreamTransmission: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Rp 0"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl flex justify-between items-center text-xs font-bold border border-emerald-200">
                    <span className="text-emerald-800">Total Beban Pengurang yang Diakui:</span>
                    <span className="text-emerald-700 text-sm font-mono">{formatRupiah(liveCalculation.totalDeductible)}</span>
                  </div>
                </div>
              </div>

              {/* Form Card 3: Opsi Pajak Lainnya & Denda */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-600" />
                    3. Parameter PPN, PPh Badan & Sanksi Keterlambatan
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tarif PPN</label>
                    <select
                      value={calcForm.ppnOutRate}
                      onChange={(e) => setCalcForm({ ...calcForm, ppnOutRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={0.11}>11% (Tarif Berlaku)</option>
                      <option value={0.12}>12% (Simulasi UU HPP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Skema PPh Badan</label>
                    <select
                      value={calcForm.pphBadanScheme}
                      onChange={(e) => setCalcForm({ ...calcForm, pphBadanScheme: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pp55_final_0_5">PP 55 (Final 0.5% Omzet)</option>
                      <option value="pasal31e_11">Pasal 31E (Fasilitas 11%)</option>
                      <option value="normal_22">Normal Umum (22%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Keterlambatan (Bulan)</label>
                    <input
                      type="number"
                      min={0}
                      value={calcForm.lateMonths}
                      onChange={(e) => setCalcForm({ ...calcForm, lateMonths: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary & Official LHK Computation (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Official Computation Card */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Lembar Komputasi PNBP</span>
                    <h3 className="text-base font-bold text-white tracking-tight">Kewajiban Ditjen PPI Kominfo</h3>
                  </div>
                  <div className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg text-[10px] font-bold uppercase">
                    PP No. 43/2023
                  </div>
                </div>

                {/* Calculation Stack */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between py-1 text-slate-300">
                    <span>Pendapatan Kotor (A):</span>
                    <span className="text-white font-bold">{formatRupiah(liveCalculation.totalGross)}</span>
                  </div>

                  <div className="flex justify-between py-1 text-slate-300">
                    <span>Pengurang Diperkenankan (B):</span>
                    <span className="text-emerald-400 font-bold">-{formatRupiah(liveCalculation.totalDeductible)}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between py-1 text-white font-bold bg-slate-800/40 p-2.5 rounded-lg">
                    <span>Dasar Pengenaan BHP (DPB = A - B):</span>
                    <span className="text-emerald-300 text-sm">{formatRupiah(liveCalculation.netRevenueBase)}</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between py-1 text-slate-300">
                      <span>• BHP Tel (0.5% x DPB):</span>
                      <span className="text-white font-bold">{formatRupiah(liveCalculation.bhpTelAmount)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-300">
                      <span>• BHP USO (1.25% x DPB):</span>
                      <span className="text-white font-bold">{formatRupiah(liveCalculation.bhpUsoAmount)}</span>
                    </div>
                    {liveCalculation.totalPenalty > 0 && (
                      <div className="flex justify-between py-1 text-amber-400">
                        <span>• Denda Telat ({calcForm.lateMonths} Bln x 2%):</span>
                        <span className="font-bold">+{formatRupiah(liveCalculation.totalPenalty)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-indigo-900/60 flex justify-between items-center text-sm font-bold text-white bg-indigo-950/60 p-3 rounded-xl border border-indigo-800/50">
                    <span className="text-indigo-200">Total Tagihan PNBP Kominfo:</span>
                    <span className="text-indigo-300 text-base">{formatRupiah(liveCalculation.totalBhpPnbp + liveCalculation.totalPenalty)}</span>
                  </div>
                </div>

                {/* Secondary Taxes (DJP) */}
                <div className="pt-2 border-t border-slate-800 space-y-2 text-xs font-mono">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Kewajiban Perpajakan Lainnya (DJP)</p>
                  <div className="flex justify-between text-slate-300">
                    <span>• PPN Kurang Bayar ({Math.round(calcForm.ppnOutRate * 100)}%):</span>
                    <span className="text-white font-bold">{formatRupiah(Math.max(0, liveCalculation.ppnPayable))}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>• Estimasi PPh Badan (PP 55):</span>
                    <span className="text-white font-bold">{formatRupiah(liveCalculation.pphBadanAmount)}</span>
                  </div>
                </div>

                <div className="pt-3 flex flex-col gap-2">
                  <button
                    onClick={handleSaveReport}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Simpan Laporan & Buat Billing e-BHP
                  </button>
                  <p className="text-[10px] text-center text-slate-400 font-medium">
                    Data dapat langsung diekspor ke format LHK resmi Kominfo
                  </p>
                </div>
              </div>

              {/* Donut Chart: Komposisi Beban Pajak & Regulasi */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">Komposisi Beban Regulasi & Pajak</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Distribusi kewajiban negara</p>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={regulatoryDonutData}
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {regulatoryDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => formatRupiah(Number(val))} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PPN 11% (KELUARAN VS MASUKAN) */}
      {activeSubTab === 'ppn' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PPN Keluaran (Pelanggan)</span>
              <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {formatRupiah(liveCalculation.ppnOutAmount)}
              </div>
              <p className="text-[10px] text-emerald-600 font-bold mt-2">11% dari Tagihan Internet FTTH & B2B</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PPN Masukan (Vendor Upstream)</span>
              <div className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {formatRupiah(liveCalculation.ppnInAmount)}
              </div>
              <p className="text-[10px] text-slate-500 font-bold mt-2">Faktur Pajak dari NAP & Pembelian Material</p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PPN Kurang Bayar (SPT Masa 1111)</span>
              <div className="text-2xl font-bold text-white tracking-tight mt-1">
                {formatRupiah(liveCalculation.ppnPayable)}
              </div>
              <p className="text-[10px] text-indigo-300 font-bold mt-2">Disetor ke Kas Negara sebelum Akhir Bulan</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">Mekanisme Rekonsiliasi e-Faktur PPN ISP</h3>
                <p className="text-xs text-slate-500">Pedoman pelaporan SPT Masa PPN 1111 bagi pengusaha kena pajak (PKP) bidang telekomunikasi.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
                Status: PKP Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Faktur Pajak Keluaran (FPK)</h4>
                <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                  <li>Diterbitkan otomatis untuk setiap invoice pelanggan yang berstatus PKP (B2B).</li>
                  <li>Pelanggan perumahan FTTH retail digabungkan dalam Faktur Pajak Digunggung.</li>
                  <li>Kode Transaksi 010 (Penyerahan BKP/JKP kepada selain Pemungut PPN).</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Faktur Pajak Masukan (FPM)</h4>
                <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                  <li>Diperoleh dari vendor Upstream (Telkom, Indosat, Lintasarta, NAP berizin).</li>
                  <li>Pembelian perangkat server OLT, router MikroTik, dan kabel dropcore.</li>
                  <li>Dapat dikreditkan 100% untuk mengurangi PPN Keluaran periode berjalan.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: PPH 23 (SEWA TIANG & JASA TEKNIK) */}
      {activeSubTab === 'pph23' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">Daftar Pemotongan PPh Pasal 23 (Jasa & Sewa)</h3>
              <p className="text-xs text-slate-500">Tarif 2% atas sewa tiang, sewa core fiber optik, colocation rack, dan jasa splicing vendor luar.</p>
            </div>
            <button
              onClick={() => setShowAddPph23Modal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              + Catat Bukti Potong PPh 23
            </button>
          </div>

          {/* Table PPh 23 Records */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Vendor / Rekanan</th>
                    <th className="px-5 py-3.5">Jenis Objek Pajak</th>
                    <th className="px-5 py-3.5">No. Invoice & Tanggal</th>
                    <th className="px-5 py-3.5">Nilai Bruto</th>
                    <th className="px-5 py-3.5">Tarif</th>
                    <th className="px-5 py-3.5">PPh 23 Dipotong</th>
                    <th className="px-5 py-3.5">Bersih Dibayar</th>
                    <th className="px-5 py-3.5">No. Bupot Unifikasi</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {pph23Records.map(rec => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900">
                        <div>{rec.vendorName}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">NPWP: {rec.vendorNpwp}</div>
                      </td>
                      <td className="px-5 py-4 capitalize">
                        <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-700">
                          {rec.serviceType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-slate-600">
                        <div>{rec.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-400">{rec.invoiceDate}</div>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">{formatRupiah(rec.grossAmount)}</td>
                      <td className="px-5 py-4 font-mono text-indigo-600 font-bold">{(rec.taxRate * 100).toFixed(0)}%</td>
                      <td className="px-5 py-4 font-mono font-bold text-rose-600">{formatRupiah(rec.taxAmount)}</td>
                      <td className="px-5 py-4 font-mono text-emerald-600 font-bold">{formatRupiah(rec.netPaidToVendor)}</td>
                      <td className="px-5 py-4 font-mono text-slate-500">{rec.bupotNumber || '-'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rec.status === 'paid_to_state' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {rec.status === 'paid_to_state' ? 'Disetor' : 'Dipotong'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: PPH BADAN (PP 55 VS PASAL 31E) */}
      {activeSubTab === 'pph_badan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Scheme 1: PP 55 (0.5% Final) */}
            <div className={`p-6 rounded-2xl border transition-all ${
              calcForm.pphBadanScheme === 'pp55_final_0_5' 
                ? 'bg-indigo-50/60 border-indigo-300 shadow-md ring-2 ring-indigo-500/20' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Skema 1 (Pilihan Populer)</span>
                  <h3 className="font-bold text-base text-slate-900">PP 55 Tahun 2022 (UMKM)</h3>
                </div>
                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-bold">0.5% Omzet</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Dikenakan tarif 0.5% final dari seluruh pendapatan kotor (omzet bruto) tahun berjalan. Sangat cocok untuk ISP berkembang dengan omzet di bawah Rp 4.8 Miliar per tahun.
              </p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs space-y-1 mb-4">
                <div className="flex justify-between text-slate-500">
                  <span>Estimasi Omzet:</span>
                  <span>{formatRupiah(liveCalculation.totalGross)}</span>
                </div>
                <div className="flex justify-between font-bold text-indigo-700 pt-1 border-t border-slate-100">
                  <span>Pajak Terutang:</span>
                  <span>{formatRupiah(Math.round(liveCalculation.totalGross * 0.005))}</span>
                </div>
              </div>
              <button
                onClick={() => setCalcForm({ ...calcForm, pphBadanScheme: 'pp55_final_0_5' })}
                className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                  calcForm.pphBadanScheme === 'pp55_final_0_5' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {calcForm.pphBadanScheme === 'pp55_final_0_5' ? 'Skema Aktif' : 'Pilih Skema Ini'}
              </button>
            </div>

            {/* Scheme 2: Fasilitas Pasal 31E (11%) */}
            <div className={`p-6 rounded-2xl border transition-all ${
              calcForm.pphBadanScheme === 'pasal31e_11' 
                ? 'bg-indigo-50/60 border-indigo-300 shadow-md ring-2 ring-indigo-500/20' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Skema 2 (Pembukuan)</span>
                  <h3 className="font-bold text-base text-slate-900">Fasilitas Pasal 31E UU PPh</h3>
                </div>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold">11% PKP</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Mendapat fasilitas diskon 50% dari tarif normal (22% x 50% = 11%) atas Penghasilan Kena Pajak (Laba Bersih Fiskal) untuk peredaran bruto sampai dengan Rp 50 Miliar.
              </p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs space-y-1 mb-4">
                <div className="flex justify-between text-slate-500">
                  <span>Estimasi Laba Fiskal:</span>
                  <span>{formatRupiah(liveCalculation.netRevenueBase * 0.30)}</span>
                </div>
                <div className="flex justify-between font-bold text-indigo-700 pt-1 border-t border-slate-100">
                  <span>Pajak Terutang (11%):</span>
                  <span>{formatRupiah(Math.round((liveCalculation.netRevenueBase * 0.30) * 0.11))}</span>
                </div>
              </div>
              <button
                onClick={() => setCalcForm({ ...calcForm, pphBadanScheme: 'pasal31e_11' })}
                className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                  calcForm.pphBadanScheme === 'pasal31e_11' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {calcForm.pphBadanScheme === 'pasal31e_11' ? 'Skema Aktif' : 'Pilih Skema Ini'}
              </button>
            </div>

            {/* Scheme 3: Tarif Umum 22% */}
            <div className={`p-6 rounded-2xl border transition-all ${
              calcForm.pphBadanScheme === 'normal_22' 
                ? 'bg-indigo-50/60 border-indigo-300 shadow-md ring-2 ring-indigo-500/20' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Skema 3 (Umum)</span>
                  <h3 className="font-bold text-base text-slate-900">Tarif Umum 22% UU HPP</h3>
                </div>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold">22% PKP</span>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Diterapkan bagi badan usaha dengan omzet di atas Rp 50 Miliar per tahun atau tanpa menggunakan fasilitas perpajakan.
              </p>
              <div className="p-3 bg-white rounded-xl border border-slate-200 font-mono text-xs space-y-1 mb-4">
                <div className="flex justify-between text-slate-500">
                  <span>Estimasi Laba Fiskal:</span>
                  <span>{formatRupiah(liveCalculation.netRevenueBase * 0.30)}</span>
                </div>
                <div className="flex justify-between font-bold text-indigo-700 pt-1 border-t border-slate-100">
                  <span>Pajak Terutang (22%):</span>
                  <span>{formatRupiah(Math.round((liveCalculation.netRevenueBase * 0.30) * 0.22))}</span>
                </div>
              </div>
              <button
                onClick={() => setCalcForm({ ...calcForm, pphBadanScheme: 'normal_22' })}
                className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                  calcForm.pphBadanScheme === 'normal_22' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {calcForm.pphBadanScheme === 'normal_22' ? 'Skema Aktif' : 'Pilih Skema Ini'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: RIWAYAT PELAPORAN LHK & NTPN */}
      {activeSubTab === 'riwayat_lhk' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">Arsip Laporan Hasil Kinerja (LHK) & PNBP Kominfo</h3>
                <p className="text-xs text-slate-500">Riwayat penyetoran BHP Tel, BHP USO, Kode Billing SIMPONI, dan nomor NTPN resmi.</p>
              </div>
              <button
                onClick={() => setActiveSubTab('kalkulator_bhp')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                + Buat Perhitungan Baru
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {bhpReports.map(rep => (
                <div key={rep.id} className="p-5 hover:bg-slate-50/60 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900 text-sm">{rep.reportNumber}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        rep.status === 'reported' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        rep.status === 'paid' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {rep.status === 'reported' ? 'Sudah Dilapor e-BHP' : rep.status === 'paid' ? 'Lunas Setor PNBP' : 'Terhitung'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      Periode: <strong className="text-slate-900">{rep.periodLabel}</strong> • Dasar Pengenaan: <span className="font-mono text-slate-800">{formatRupiah(rep.netRevenueBase)}</span>
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-500 pt-1">
                      <div>BHP Tel (0.5%): <strong className="text-slate-800">{formatRupiah(rep.bhpTelAmount)}</strong></div>
                      <div>BHP USO (1.25%): <strong className="text-indigo-700">{formatRupiah(rep.bhpUsoAmount)}</strong></div>
                      <div>Total PNBP: <strong className="text-emerald-700">{formatRupiah(rep.totalBhpPnbp)}</strong></div>
                      {rep.ntpnBhpTel && <div className="text-[11px] text-slate-400">NTPN: {rep.ntpnBhpTel}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <button
                      onClick={() => {
                        setSelectedReport(rep);
                        setBillingForm({
                          billingCodeBhpTel: rep.billingCodeBhpTel || '',
                          billingCodeBhpUso: rep.billingCodeBhpUso || '',
                          ntpnBhpTel: rep.ntpnBhpTel || '',
                          ntpnBhpUso: rep.ntpnBhpUso || '',
                          paidDate: rep.paidDate || new Date().toISOString().split('T')[0],
                          lhkSubmissionNumber: rep.lhkSubmissionNumber || '',
                          status: rep.status || 'paid'
                        });
                        setShowBillingModal(true);
                      }}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Update Billing SIMPONI & NTPN"
                    >
                      <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                      SIMPONI / NTPN
                    </button>

                    <button
                      onClick={() => {
                        setSelectedReport(rep);
                        setShowPrintLhkModal(true);
                      }}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      title="Cetak Formulir LHK Kominfo"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Form LHK
                    </button>

                    <button
                      onClick={() => handleDeleteReport(rep.id)}
                      className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                      title="Hapus Laporan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: KALENDER KEPATUHAN PAJAK ISP */}
      {activeSubTab === 'kalender' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tanggal 10 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg text-xs">Tgl 10 Tiap Bulan</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Batas Setor PPh 21 & PPh 23</h4>
              <p className="text-xs text-slate-500">
                Penyetoran pemotongan pajak gaji teknisi (PPh 21) dan pemotongan sewa tiang/jasa teknik rekanan (PPh 23) masa pajak sebelumnya.
              </p>
            </div>

            {/* Tanggal 15 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs">Tgl 15 Tiap Bulan</span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Batas Setor PPh Final PP 55 / PPh 25</h4>
              <p className="text-xs text-slate-500">
                Penyetoran PPh Final 0.5% omzet UMKM ISP atau angsuran PPh Pasal 25 masa pajak sebelumnya via e-Billing DJP.
              </p>
            </div>

            {/* Akhir Bulan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-xs">Akhir Bulan</span>
                <Clock className="w-4 h-4 text-emerald-500" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Batas Setor & Lapor SPT Masa PPN</h4>
              <p className="text-xs text-slate-500">
                Penyetoran PPN Kurang Bayar (11%) dan pelaporan SPT Masa PPN 1111 melalui web-efaktur DJP Online.
              </p>
            </div>

            {/* 30 April */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3">
              <div className="flex justify-between items-center">
                <span className="px-2.5 py-1 bg-indigo-500/30 text-indigo-200 font-bold rounded-lg text-xs">30 April (Tahunan)</span>
                <ShieldCheck className="w-4 h-4 text-indigo-300" />
              </div>
              <h4 className="font-bold text-sm text-white">Batas Akhir LHK e-BHP & SPT Badan</h4>
              <p className="text-xs text-indigo-200">
                Penyetoran final BHP Tel (0.5%), BHP USO (1.25%) Ditjen PPI Kominfo & Pelaporan SPT Tahunan Badan 1771.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INPUT BUKTI POTONG PPH 23 */}
      <AnimatePresence>
        {showAddPph23Modal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Catat Bukti Potong PPh Pasal 23</h3>
                  <p className="text-xs text-slate-500">Pemotongan pajak atas jasa teknik, sewa tiang, atau sewa transmisi.</p>
                </div>
                <button onClick={() => setShowAddPph23Modal(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddPph23} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Vendor / Rekanan *</label>
                  <input
                    type="text"
                    required
                    value={pph23Form.vendorName}
                    onChange={(e) => setPph23Form({ ...pph23Form, vendorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Contoh: PT Telkom Akses / CV Splicing Fiber"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Objek Pajak</label>
                    <select
                      value={pph23Form.serviceType}
                      onChange={(e) => setPph23Form({ ...pph23Form, serviceType: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="sewa_tiang">Sewa Tiang Jaringan</option>
                      <option value="sewa_core_fo">Sewa Core Fiber Optic</option>
                      <option value="jasa_splicing_teknik">Jasa Splicing & Sambung</option>
                      <option value="sewa_rack_colo">Sewa Colocation Rack</option>
                      <option value="jasa_konsultan">Jasa Konsultan IT/NOC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status NPWP</label>
                    <select
                      value={pph23Form.hasNpwp ? 'true' : 'false'}
                      onChange={(e) => setPph23Form({ ...pph23Form, hasNpwp: e.target.value === 'true' })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="true">Memiliki NPWP (Tarif 2%)</option>
                      <option value="false">Non-NPWP (Tarif 4%)</option>
                    </select>
                  </div>
                </div>

                {pph23Form.hasNpwp && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor NPWP Vendor</label>
                    <input
                      type="text"
                      value={pph23Form.vendorNpwp}
                      onChange={(e) => setPph23Form({ ...pph23Form, vendorNpwp: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="01.234.567.8-901.000"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Invoice Tagihan</label>
                    <input
                      type="text"
                      value={pph23Form.invoiceNumber}
                      onChange={(e) => setPph23Form({ ...pph23Form, invoiceNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="INV-VENDOR-001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Tagihan</label>
                    <input
                      type="date"
                      value={pph23Form.invoiceDate}
                      onChange={(e) => setPph23Form({ ...pph23Form, invoiceDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nilai Tagihan Bruto (Sebelum Pajak) *</label>
                  <input
                    type="number"
                    required
                    value={pph23Form.grossAmount}
                    onChange={(e) => setPph23Form({ ...pph23Form, grossAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Rp 0"
                  />
                </div>

                {Number(pph23Form.grossAmount) > 0 && (
                  <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-100 space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-indigo-900">
                      <span>PPh 23 Dipotong ({pph23Form.hasNpwp ? '2%' : '4%'}):</span>
                      <strong className="text-rose-600">{formatRupiah(Math.round(Number(pph23Form.grossAmount) * (pph23Form.hasNpwp ? 0.02 : 0.04)))}</strong>
                    </div>
                    <div className="flex justify-between text-slate-700 pt-1 border-t border-indigo-200/50 font-bold">
                      <span>Sisa Bersih Dibayar ke Vendor:</span>
                      <span className="text-emerald-700">{formatRupiah(Number(pph23Form.grossAmount) - Math.round(Number(pph23Form.grossAmount) * (pph23Form.hasNpwp ? 0.02 : 0.04)))}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setShowAddPph23Modal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
                    Batal
                  </button>
                  <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm">
                    Simpan Bukti Potong
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: INPUT BILLING SIMPONI & NTPN */}
      <AnimatePresence>
        {showBillingModal && selectedReport && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Kode Billing SIMPONI & NTPN</h3>
                  <p className="text-xs text-slate-500">{selectedReport.reportNumber} ({selectedReport.periodLabel})</p>
                </div>
                <button onClick={() => setShowBillingModal(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Billing SIMPONI - BHP Tel (0.5%)</label>
                  <input
                    type="text"
                    value={billingForm.billingCodeBhpTel}
                    onChange={(e) => setBillingForm({ ...billingForm, billingCodeBhpTel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="82026xxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor NTPN Penyetoran BHP Tel</label>
                  <input
                    type="text"
                    value={billingForm.ntpnBhpTel}
                    onChange={(e) => setBillingForm({ ...billingForm, ntpnBhpTel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="A982B710K991"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Billing SIMPONI - BHP USO (1.25%)</label>
                  <input
                    type="text"
                    value={billingForm.billingCodeBhpUso}
                    onChange={(e) => setBillingForm({ ...billingForm, billingCodeBhpUso: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="82026xxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor NTPN Penyetoran BHP USO</label>
                  <input
                    type="text"
                    value={billingForm.ntpnBhpUso}
                    onChange={(e) => setBillingForm({ ...billingForm, ntpnBhpUso: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="C118F332M002"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Bayar Setor</label>
                    <input
                      type="date"
                      value={billingForm.paidDate}
                      onChange={(e) => setBillingForm({ ...billingForm, paidDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status Laporan</label>
                    <select
                      value={billingForm.status}
                      onChange={(e) => setBillingForm({ ...billingForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="billing_created">Billing Dibuat</option>
                      <option value="paid">Lunas Terbayar</option>
                      <option value="reported">Sudah Dilapor e-BHP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. Bukti Lapor LHK e-BHP Kominfo</label>
                  <input
                    type="text"
                    value={billingForm.lhkSubmissionNumber}
                    onChange={(e) => setBillingForm({ ...billingForm, lhkSubmissionNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="LHK-KOMINFO-2026-XXXXX"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => setShowBillingModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
                    Batal
                  </button>
                  <button onClick={handleSaveBillingNtpn} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm">
                    Simpan SIMPONI & NTPN
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CETAK / PREVIEW FORMULIR LHK RESMI KOMINFO */}
      <AnimatePresence>
        {showPrintLhkModal && selectedReport && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 my-8">
              {/* Header Surat LHK */}
              <div className="border-b-2 border-slate-900 pb-4 text-center relative">
                <button onClick={() => setShowPrintLhkModal(false)} className="absolute right-0 top-0 p-2 hover:bg-slate-100 rounded-lg text-slate-400 print:hidden">
                  <X className="w-5 h-5" />
                </button>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">KEMENTERIAN KOMUNIKASI DAN INFORMATIKA REPUBLIK INDONESIA</p>
                <h2 className="text-base font-black tracking-tight text-slate-900 mt-1 uppercase">
                  LEMBAR HASIL KINERJA (LHK) & PERHITUNGAN BHP TELEKOMUNIKASI DAN BHP USO
                </h2>
                <p className="text-xs text-slate-600 font-mono mt-0.5">Sesuai Peraturan Pemerintah No. 43 Tahun 2023 tentang PNBP Kominfo</p>
              </div>

              {/* Company Info */}
              <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-slate-200">
                <div>
                  <p><strong className="text-slate-600">Nama Penyelenggara:</strong> <span className="font-bold text-slate-900">PT. Musi Cyber Nusantara (ERP ISP)</span></p>
                  <p><strong className="text-slate-600">Nomor Izin ISP:</strong> <span className="font-mono">0220208129881001-ISP</span></p>
                  <p><strong className="text-slate-600">NPWP Perusahaan:</strong> <span className="font-mono">01.889.771.2-312.000</span></p>
                </div>
                <div className="text-right">
                  <p><strong className="text-slate-600">Nomor LHK:</strong> <span className="font-mono font-bold text-slate-900">{selectedReport.reportNumber}</span></p>
                  <p><strong className="text-slate-600">Periode Pelaporan:</strong> <span>{selectedReport.periodLabel}</span></p>
                  <p><strong className="text-slate-600">Tanggal Cetak:</strong> <span>{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</span></p>
                </div>
              </div>

              {/* Table LHK */}
              <div className="py-4 space-y-4">
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-2.5 border-r border-slate-300 w-12 text-center">NO</th>
                      <th className="p-2.5 border-r border-slate-300">URAIAN KOMPONEN PENERIMAAN & PENGURANG</th>
                      <th className="p-2.5 text-right w-44">JUMLAH (RUPIAH)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    <tr className="bg-slate-50/50 font-bold">
                      <td className="p-2 text-center border-r border-slate-300">I</td>
                      <td className="p-2 border-r border-slate-300">PENDAPATAN KOTOR (GROSS REVENUE)</td>
                      <td className="p-2 text-right">{formatRupiah(selectedReport.totalGrossRevenue)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center border-r border-slate-300">1.1</td>
                      <td className="p-2 border-r border-slate-300 pl-6">Pendapatan Jasa Akses Internet (ISP Retail/FTTH)</td>
                      <td className="p-2 text-right">{formatRupiah(selectedReport.grossInternetRevenue)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center border-r border-slate-300">1.2</td>
                      <td className="p-2 border-r border-slate-300 pl-6">Pendapatan Sirkit Sewa (Leased Line / B2B Dedicated)</td>
                      <td className="p-2 text-right">{formatRupiah(selectedReport.grossB2bRevenue)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center border-r border-slate-300">1.3</td>
                      <td className="p-2 border-r border-slate-300 pl-6">Pendapatan Voucher Hotspot & RT-RW Net</td>
                      <td className="p-2 text-right">{formatRupiah(selectedReport.grossHotspotRevenue)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center border-r border-slate-300">1.4</td>
                      <td className="p-2 border-r border-slate-300 pl-6">Pendapatan Jasa Pasang Baru (PSB) & Lainnya</td>
                      <td className="p-2 text-right">{formatRupiah(selectedReport.grossPsbRevenue + selectedReport.grossOtherRevenue)}</td>
                    </tr>
                    
                    <tr className="bg-slate-50/50 font-bold">
                      <td className="p-2 text-center border-r border-slate-300">II</td>
                      <td className="p-2 border-r border-slate-300">PENGURANG PENDAPATAN KOTOR YANG DIPERKENANKAN</td>
                      <td className="p-2 text-right text-rose-700">({formatRupiah(selectedReport.totalDeductible)})</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center border-r border-slate-300">2.1</td>
                      <td className="p-2 border-r border-slate-300 pl-6">Beban Interkoneksi Resmi Antar Penyelenggara</td>
                      <td className="p-2 text-right">{formatRupiah(selectedReport.deductibleInterconnection)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center border-r border-slate-300">2.2</td>
                      <td className="p-2 border-r border-slate-300 pl-6">Beban Sewa Jaringan Transmisi Upstream NAP Berizin</td>
                      <td className="p-2 text-right">{formatRupiah(selectedReport.deductibleUpstreamTransmission)}</td>
                    </tr>

                    <tr className="bg-indigo-50/70 font-bold text-indigo-950 border-t-2 border-b-2 border-slate-400">
                      <td className="p-2.5 text-center border-r border-slate-300">III</td>
                      <td className="p-2.5 border-r border-slate-300">DASAR PENGENAAN BHP (DPB = I - II)</td>
                      <td className="p-2.5 text-right text-xs">{formatRupiah(selectedReport.netRevenueBase)}</td>
                    </tr>

                    <tr>
                      <td className="p-2 text-center border-r border-slate-300 font-bold">IV</td>
                      <td className="p-2 border-r border-slate-300">BHP TELEKOMUNIKASI (0.5% x DPB)</td>
                      <td className="p-2 text-right font-bold">{formatRupiah(selectedReport.bhpTelAmount)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center border-r border-slate-300 font-bold">V</td>
                      <td className="p-2 border-r border-slate-300">BHP USO (UNIVERSAL SERVICE OBLIGATION) (1.25% x DPB)</td>
                      <td className="p-2 text-right font-bold">{formatRupiah(selectedReport.bhpUsoAmount)}</td>
                    </tr>

                    <tr className="bg-slate-900 text-white font-bold">
                      <td className="p-3 text-center border-r border-slate-700">VI</td>
                      <td className="p-3 border-r border-slate-700">TOTAL KEWAJIBAN PNBP KOMINFO (IV + V)</td>
                      <td className="p-3 text-right text-sm text-emerald-300">{formatRupiah(selectedReport.totalBhpPnbp)}</td>
                    </tr>
                  </tbody>
                </table>

                {/* NTPN & SIMPONI Details */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">Billing SIMPONI (BHP Tel):</span> <strong className="text-slate-800">{selectedReport.billingCodeBhpTel || '82026-SIMPONI-TEL'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">NTPN (BHP Tel):</span> <strong className="text-slate-800">{selectedReport.ntpnBhpTel || 'A982B710K991'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Billing SIMPONI (BHP USO):</span> <strong className="text-slate-800">{selectedReport.billingCodeBhpUso || '82026-SIMPONI-USO'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">NTPN (BHP USO):</span> <strong className="text-slate-800">{selectedReport.ntpnBhpUso || 'C118F332M002'}</strong>
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 pt-6 text-center text-xs">
                  <div>
                    <p className="text-slate-500 mb-14">Mengetahui & Menyetujui,<br /><strong>Direktur Utama / Pimpinan ISP</strong></p>
                    <p className="font-bold text-slate-900 underline">M. Ridho Pratama, S.Kom</p>
                    <p className="text-[10px] text-slate-400">PT Musi Cyber Nusantara</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-14">Palembang, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}<br /><strong>Finance & Regulatory Specialist</strong></p>
                    <p className="font-bold text-slate-900 underline">Siti Nurhaliza, A.Md</p>
                    <p className="text-[10px] text-slate-400">Departemen Perpajakan & Legalitas</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 print:hidden">
                <button onClick={() => setShowPrintLhkModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
                  Tutup
                </button>
                <button onClick={() => window.print()} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  Cetak / Download PDF LHK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
