export enum RouterStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  ERROR = "error",
}

export interface Router {
  id: string;
  name: string;
  ip: string;
  status: RouterStatus;
  uptime: string;
  cpuLoad: number;
  memoryUsage: number;
  activeUsers: number;
}

export interface Customer {
  id: string;
  name: string;
  username: string;
  address: string;
  latitude: number;
  longitude: number;
  planId: string;
  balance: number;
  status: "active" | "suspended" | "expired";
}

export interface Plan {
  id: string;
  name: string;
  speedLimit: string;
  price: number;
}

export interface TrafficData {
  timestamp: string;
  rx: number;
  tx: number;
}

export type TransactionType = 'income' | 'expense';

export type IncomeCategory = 
  | 'langganan_bulanan'
  | 'voucher_hotspot'
  | 'biaya_psb'
  | 'penjualan_alat'
  | 'jasa_teknisi'
  | 'lainnya';

export type ExpenseCategory = 
  | 'bandwidth_upstream'
  | 'sewa_tiang_pop'
  | 'gaji_teknisi'
  | 'operasional_transport'
  | 'material_ftth'
  | 'listrik_ups'
  | 'marketing_iklan'
  | 'pajak_legalitas'
  | 'lainnya';

export type PaymentMethod = 
  | 'cash'
  | 'transfer_bca'
  | 'transfer_mandiri'
  | 'transfer_bri'
  | 'transfer_bni'
  | 'qris'
  | 'payment_gateway';

export interface Transaction {
  id?: string;
  tenantId: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod | string;
  description?: string;
  referenceNo?: string;
  recordedBy?: string;
  invoiceId?: string;
  createdAt?: any;
}

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'cancelled';

export interface Invoice {
  id?: string;
  tenantId: string;
  invoiceNumber: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  planId?: string;
  planName?: string;
  amount: number;
  tax?: number;
  discount?: number;
  totalAmount: number;
  status: InvoiceStatus;
  billingMonth: string; // e.g. "Agustus 2026"
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt?: any;
}

export interface FinancialStats {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  outstandingReceivable: number;
  paidInvoicesCount: number;
  unpaidInvoicesCount: number;
  cashBalance: number;
  bankBalance: number;
}

// ==========================================
// ASSET MANAGEMENT TYPES
// ==========================================
export type AssetCategory = 
  | 'core_network' 
  | 'distribution_odp' 
  | 'customer_cpe' 
  | 'technician_tools' 
  | 'operational_vehicle' 
  | 'office_facility';

export type AssetStatus = 
  | 'available' 
  | 'in_use' 
  | 'deployed_to_customer' 
  | 'in_maintenance' 
  | 'broken' 
  | 'disposed';

export interface Asset {
  id?: string;
  tenantId: string;
  assetCode: string;
  name: string;
  category: AssetCategory;
  brandModel: string;
  serialNumber?: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  depreciationPerYear?: number;
  status: AssetStatus;
  location: string;
  assignedTo?: string;
  assignedToName?: string;
  warrantyExpiry?: string;
  notes?: string;
  lastMaintenanceDate?: string;
  createdAt?: any;
}

export interface AssetLoanLog {
  id?: string;
  tenantId: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  employeeId: string;
  employeeName: string;
  borrowDate: string;
  expectedReturnDate: string;
  returnDate?: string;
  purpose: string;
  status: 'borrowed' | 'returned' | 'overdue';
  conditionOnReturn?: string;
  createdAt?: any;
}

// ==========================================
// HR & TEAM MANAGEMENT TYPES
// ==========================================
export type EmployeeRole = 
  | 'technician_field' 
  | 'technician_splicer' 
  | 'noc_engineer' 
  | 'billing_admin' 
  | 'customer_service' 
  | 'sales_marketing' 
  | 'manager';

export type EmploymentType = 'permanent' | 'contract' | 'freelance';

export interface Employee {
  id?: string;
  tenantId: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  department: string;
  employmentType: EmploymentType;
  joinDate: string;
  status: 'active' | 'on_leave' | 'resigned';
  basicSalary: number;
  allowance: number;
  psbIncentivePerTask: number;
  bankAccount: string;
  activeWorkOrdersCount?: number;
  avatarUrl?: string;
  createdAt?: any;
}

export type AttendanceStatus = 'present' | 'late' | 'permission' | 'sick' | 'leave' | 'alpha';
export type ShiftType = 'pagi' | 'siang' | 'malam_noc' | 'standby_oncall';

export interface AttendanceRecord {
  id?: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: AttendanceStatus;
  shift: ShiftType;
  notes?: string;
  location?: string;
  createdAt?: any;
}

export type WorkOrderType = 
  | 'psb_installation' 
  | 'los_troubleshooting' 
  | 'cable_cut_repair' 
  | 'dismantle' 
  | 'relocation' 
  | 'routine_maintenance';

export type WorkOrderPriority = 'low' | 'normal' | 'high' | 'critical';
export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface WorkOrder {
  id?: string;
  tenantId: string;
  orderNumber: string;
  type: WorkOrderType;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  address: string;
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  scheduledDate: string;
  completedAt?: string;
  redamanDb?: string;
  notes?: string;
  usedMaterials?: { name: string; qty: number; unit: string }[];
  createdAt?: any;
}

export interface PayrollSlip {
  id?: string;
  tenantId: string;
  slipNumber: string;
  employeeId: string;
  employeeName: string;
  role: string;
  period: string;
  basicSalary: number;
  allowance: number;
  overtimeBonus: number;
  psbIncentive: number;
  deductions: number;
  totalTakeHomePay: number;
  paymentStatus: 'paid' | 'pending';
  paymentDate?: string;
  paymentMethod?: string;
  createdAt?: any;
}

// ==========================================
// TAX & REGULATORY (BHP TEL, BHP USO, PPN, PPH)
// ==========================================
export type TaxReportType = 'monthly' | 'quarterly' | 'semester' | 'annual';
export type TaxPaymentStatus = 'draft' | 'calculated' | 'billing_created' | 'paid' | 'reported';

export interface BhpTelUsoReport {
  id?: string;
  tenantId: string;
  reportNumber: string;
  periodType: TaxReportType;
  periodLabel: string; // e.g. "Tahun Buku 2025" or "Semester I 2026"
  year: number;
  semester?: 1 | 2;
  quarter?: 1 | 2 | 3 | 4;
  month?: number;
  
  // Gross Revenue Breakdown
  grossInternetRevenue: number;     // Pendapatan Jasa Akses Internet (ISP)
  grossB2bRevenue: number;          // Pendapatan Jasa Sirkit Sewa / B2B Dedicated
  grossHotspotRevenue: number;      // Pendapatan Voucher Hotspot & RT-RW Net
  grossPsbRevenue: number;          // Pendapatan Jasa Pasang Baru & Instalasi
  grossOtherRevenue: number;        // Pendapatan Telekomunikasi Lainnya
  totalGrossRevenue: number;        // Total Pendapatan Kotor

  // Deductible Expenses (Pengurang Pendapatan Kotor yang Diperkenankan Ditjen PPI Kominfo)
  deductibleInterconnection: number; // Biaya Interkoneksi Resmi
  deductibleUpstreamTransmission: number; // Biaya Sewa Jaringan Transmisi / Upstream Berizin
  totalDeductible: number;          // Total Beban Pengurang

  // Calculation Basis & Results
  netRevenueBase: number;           // Dasar Pengenaan BHP (DPB) = Total Kotor - Pengurang
  bhpTelRate: number;               // 0.5% (0.005)
  bhpTelAmount: number;             // BHP Telekomunikasi
  bhpUsoRate: number;               // 1.25% (0.0125)
  bhpUsoAmount: number;             // BHP USO (Kewajiban Pelayanan Universal)
  totalBhpPnbp: number;             // Total PNBP Kominfo (1.75%)
  
  // PPN Calculations
  ppnOutRate: number;               // e.g. 11% or 12%
  ppnOutAmount: number;             // PPN Keluaran
  ppnInAmount: number;              // PPN Masukan dari vendor
  ppnPayable: number;               // PPN Kurang/Lebih Bayar (PPN Out - PPN In)

  // PPh 23 (Jasa Teknik & Sewa Tiang/Core FO)
  pph23Amount: number;

  // PPh Badan (PP 55 0.5% vs Normal 22%)
  pphBadanScheme: 'pp55_final_0_5' | 'pasal31e_11' | 'normal_22';
  pphBadanAmount: number;

  // Status & Compliance Tracking
  status: TaxPaymentStatus;
  billingCodeBhpTel?: string;       // Kode Billing SIMPONI PNBP Kominfo (BHP Tel)
  billingCodeBhpUso?: string;       // Kode Billing SIMPONI PNBP Kominfo (BHP USO)
  billingCodePajak?: string;        // Kode Billing DJP Online (e-Billing)
  ntpnBhpTel?: string;              // Nomor Transaksi Penerimaan Negara
  ntpnBhpUso?: string;
  ntpnPajak?: string;
  paidDate?: string;
  reportedDate?: string;
  lhkSubmissionNumber?: string;     // Nomor Bukti Lapor e-BHP LHK Kominfo
  notes?: string;
  createdAt?: any;
}

export interface Pph23Record {
  id?: string;
  tenantId: string;
  vendorName: string;
  vendorNpwp: string;
  serviceType: 'sewa_tiang' | 'sewa_core_fo' | 'jasa_splicing_teknik' | 'sewa_rack_colo' | 'jasa_konsultan';
  invoiceNumber: string;
  invoiceDate: string;
  grossAmount: number;
  taxRate: number; // 2% with NPWP, 4% non-NPWP
  taxAmount: number;
  netPaidToVendor: number;
  bupotNumber?: string;
  status: 'pending' | 'withheld' | 'paid_to_state';
  createdAt?: any;
}
