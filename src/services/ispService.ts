import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, setDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Transaction, 
  Invoice, 
  Asset, 
  AssetLoanLog, 
  Employee, 
  AttendanceRecord, 
  WorkOrder, 
  PayrollSlip 
} from '../types';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
}

export interface Router {
  id: string;
  tenantId: string;
  name: string;
  ip: string;
  status: 'online' | 'offline' | 'warning';
  lastSeen?: any;
}

export interface Customer {
  id?: string;
  tenantId: string;
  name: string;
  username: string;
  password?: string;
  address?: string;
  macAddress?: string;
  latitude?: number;
  longitude?: number;
  planId: string;
  routerId?: string;
  status: 'active' | 'suspended' | 'expired';
  balance?: number;
}

export interface PppoeProfile {
  id?: string;
  tenantId: string;
  name: string;
  description?: string;
  remoteAddress?: string;
  rateLimit?: string;
}

export const isValidMacAddress = (mac: string) => {
  const cleanMac = mac.trim();
  const regex = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{2}[-]){5}([0-9A-Fa-f]{2})$/;
  return regex.test(cleanMac);
};

export const ispService = {
  // --- Tenants ---
  async createTenant(name: string, slug: string) {
    const user = auth.currentUser;
    if (!user) throw new Error('Unauthorized');
    
    const tenantId = slug.toLowerCase(); 
    const tenantPath = `tenants/${tenantId}`;
    const memberId = `${tenantId}_${user.uid}`;
    
    try {
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      const tenantRef = doc(db, 'tenants', tenantId);
      const memberRef = doc(db, 'members', memberId);

      batch.set(tenantRef, {
        name,
        slug: tenantId,
        org: 'Musi Cyber Enterprise'
      }, { merge: true });

      batch.set(memberRef, {
        tenantId,
        userId: user.uid,
        role: 'admin'
      }, { merge: true });
      
      await batch.commit();
      console.log(`[ISP-SERVICE] Bootstrapped Tenant & Member: ${tenantId}`);
      return tenantId;
    } catch (e: any) {
      console.warn('[ISP-SERVICE] Bootstrap warning:', e.message);
      return tenantId;
    }
  },

  // --- FTTH Asset Management ---
  async getOltNodes(tenantId: string) {
    const path = 'olt_nodes';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async getOdpNodes(tenantId: string) {
    const path = 'odp_nodes';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async addOdp(tenantId: string, data: any) {
    const path = 'odp_nodes';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        tenantId,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  // --- Automation (Mikrotik) ---
  async syncMikrotikProfile(routerId: string, customerId: string, profile: 'normal' | 'isolated') {
    // Placeholder for backend API call
    try {
      const response = await fetch('/api/network/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ routerId, customerId, profile })
      });
      return await response.json();
    } catch (e) {
      console.error('Mikrotik sync failed', e);
      return null;
    }
  },

  // --- Routers ---
  async getRouters(tenantId: string) {
    const path = 'routers';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Router));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async addRouter(tenantId: string, data: Partial<Router>) {
    const path = 'routers';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        tenantId,
        status: 'online',
        lastSeen: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  // --- Customers ---
  async getCustomers(tenantId: string) {
    const path = 'customers';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async addCustomer(tenantId: string, data: Partial<Customer>) {
    const path = 'customers';
    if (data.macAddress && !isValidMacAddress(data.macAddress)) {
      throw new Error(`The MAC Address "${data.macAddress}" is invalid. Please use the standard format (e.g., XX:XX:XX:XX:XX:XX).`);
    }
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        tenantId,
        createdAt: serverTimestamp(),
        status: data.status || 'active'
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async updateCustomer(customerId: string, data: Partial<Customer>) {
    const path = `customers/${customerId}`;
    if (data.macAddress && !isValidMacAddress(data.macAddress)) {
      throw new Error(`The MAC Address "${data.macAddress}" is invalid. Please use the standard format (e.g., XX:XX:XX:XX:XX:XX).`);
    }
    try {
       await updateDoc(doc(db, 'customers', customerId), data);
    } catch (e) {
       handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async bulkUpdateCustomerStatus(customerIds: string[], status: 'active' | 'suspended') {
    if (!customerIds.length) return;
    try {
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      customerIds.forEach(id => {
        const ref = doc(db, 'customers', id);
        batch.update(ref, { status, updatedAt: serverTimestamp() });
      });
      
      await batch.commit();
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'customers/batch');
    }
  },

  // --- OLT Management ---
  async getOlts(tenantId: string) {
    try {
      const q = query(collection(db, 'olt_nodes'), where('tenantId', '==', tenantId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'olt_nodes');
    }
  },

  async getUnconfiguredOnus(oltId: string) {
    try {
      const res = await fetch(`/api/olts/${oltId}/unconfigured`);
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async getConfiguredOnus(oltId: string) {
    try {
      const res = await fetch(`/api/olts/${oltId}/configured`);
      return await res.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  async testOltConnection(data: any) {
    try {
      const res = await fetch('/api/olts/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('OLT link timeout');
      return await res.json();
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  },

  async authorizeOnu(oltId: string, payload: any) {
    try {
      const res = await fetch(`/api/olts/${oltId}/authorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  },

  async getOnuDetails(oltId: string, onuSn: string) {
    try {
      const res = await fetch(`/api/olts/${oltId}/onus/${onuSn}/details`);
      if (!res.ok) throw new Error('Failed to fetch ONU details');
      return await res.json();
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  },

  async getOnuTechnicalMetrics(oltId: string, onuSn: string) {
    try {
      const res = await fetch(`/api/olts/${oltId}/onus/${onuSn}/metrics`);
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return await res.json();
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  },

  // --- Backend Proxy Calls ---
  async getRouterLiveStatus(routerId: string) {
    try {
      const response = await fetch(`/api/network/status/${routerId}`);
      if (!response.ok) throw new Error('Backend failure');
      return await response.json();
    } catch (e) {
      console.error('Failed to fetch live status:', e);
      return null;
    }
  },

  async getRouterHealth(tenantId: string, routerId: string) {
    try {
      const response = await fetch(`/api/network/health/${routerId}?tenantId=${tenantId}`);
      if (!response.ok) throw new Error('Diagnostic link failure');
      return await response.json();
    } catch (e) {
      console.error('Failed to fetch health data:', e);
      throw e;
    }
  },

  // --- PPPoE Profiles ---
  async getPppoeProfiles(tenantId: string) {
    const path = 'pppoe_profiles';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PppoeProfile));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
    }
  },

  async addPppoeProfile(tenantId: string, data: Partial<PppoeProfile>) {
    const path = 'pppoe_profiles';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        tenantId,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async deletePppoeProfile(profileId: string) {
    const path = `pppoe_profiles/${profileId}`;
    try {
      await deleteDoc(doc(db, 'pppoe_profiles', profileId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // --- Financial Module (Ledger / Buku Kas) ---
  async getTransactions(tenantId: string): Promise<Transaction[]> {
    const path = 'transactions';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async addTransaction(tenantId: string, data: Partial<Transaction>) {
    const path = 'transactions';
    try {
      const docRef = await addDoc(collection(db, path), {
        tenantId,
        type: data.type || 'income',
        category: data.category || 'langganan_bulanan',
        amount: Number(data.amount) || 0,
        date: data.date || new Date().toISOString().split('T')[0],
        paymentMethod: data.paymentMethod || 'cash',
        description: data.description || '',
        referenceNo: data.referenceNo || `TRX-${Date.now()}`,
        recordedBy: data.recordedBy || auth.currentUser?.email || 'admin',
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async deleteTransaction(transactionId: string) {
    const path = `transactions/${transactionId}`;
    try {
      await deleteDoc(doc(db, 'transactions', transactionId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // --- Invoices & Billing Engine ---
  async getInvoices(tenantId: string): Promise<Invoice[]> {
    const path = 'invoices';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Invoice));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async addInvoice(tenantId: string, data: Partial<Invoice>) {
    const path = 'invoices';
    try {
      const invoiceNumber = data.invoiceNumber || `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const docRef = await addDoc(collection(db, path), {
        tenantId,
        invoiceNumber,
        customerId: data.customerId || 'cust_general',
        customerName: data.customerName || 'Pelanggan FTTH',
        customerPhone: data.customerPhone || '',
        planId: data.planId || 'plan_default',
        planName: data.planName || 'Paket Fiber Home',
        amount: Number(data.amount) || 0,
        tax: Number(data.tax) || 0,
        discount: Number(data.discount) || 0,
        totalAmount: Number(data.totalAmount || data.amount) || 0,
        status: data.status || 'unpaid',
        billingMonth: data.billingMonth || new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
        dueDate: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: data.notes || '',
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async updateInvoice(invoiceId: string, data: Partial<Invoice>) {
    const path = `invoices/${invoiceId}`;
    try {
      await updateDoc(doc(db, 'invoices', invoiceId), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async payInvoice(tenantId: string, invoice: Invoice, paymentMethod: string, recordedBy?: string) {
    const invoicePath = `invoices/${invoice.id}`;
    const transactionPath = 'transactions';
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    try {
      // 1. Update Invoice status
      if (invoice.id) {
        await updateDoc(doc(db, 'invoices', invoice.id), {
          status: 'paid',
          paidAt: now,
          paymentMethod: paymentMethod
        });
      }

      // 2. Add income transaction to Cash Flow
      await addDoc(collection(db, transactionPath), {
        tenantId,
        type: 'income',
        category: 'langganan_bulanan',
        amount: Number(invoice.totalAmount || invoice.amount),
        date: today,
        paymentMethod: paymentMethod,
        description: `Pembayaran ${invoice.invoiceNumber} - ${invoice.customerName || 'Pelanggan'} (${invoice.planName || 'Internet'})`,
        referenceNo: invoice.invoiceNumber,
        invoiceId: invoice.id,
        recordedBy: recordedBy || auth.currentUser?.email || 'admin',
        createdAt: serverTimestamp()
      });

      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, invoicePath);
    }
  },

  async deleteInvoice(invoiceId: string) {
    const path = `invoices/${invoiceId}`;
    try {
      await deleteDoc(doc(db, 'invoices', invoiceId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // ==========================================
  // MODUL PENCATATAN ASET
  // ==========================================
  async getAssets(tenantId: string): Promise<Asset[]> {
    const path = 'assets';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Asset));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async createAsset(tenantId: string, data: Omit<Asset, 'id' | 'tenantId'>): Promise<string> {
    const path = 'assets';
    try {
      const docRef = await addDoc(collection(db, path), {
        tenantId,
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
      throw e;
    }
  },

  async updateAsset(assetId: string, data: Partial<Asset>) {
    const path = `assets/${assetId}`;
    try {
      await updateDoc(doc(db, 'assets', assetId), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deleteAsset(assetId: string) {
    const path = `assets/${assetId}`;
    try {
      await deleteDoc(doc(db, 'assets', assetId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  async getAssetLoans(tenantId: string): Promise<AssetLoanLog[]> {
    const path = 'asset_loans';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AssetLoanLog));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async createAssetLoan(tenantId: string, loanData: Omit<AssetLoanLog, 'id' | 'tenantId'>) {
    const path = 'asset_loans';
    try {
      const docRef = await addDoc(collection(db, path), {
        tenantId,
        ...loanData,
        createdAt: serverTimestamp()
      });
      // Update asset status to in_use or assigned
      if (loanData.assetId) {
        await updateDoc(doc(db, 'assets', loanData.assetId), {
          status: 'in_use',
          assignedTo: loanData.employeeId,
          assignedToName: loanData.employeeName
        });
      }
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
      throw e;
    }
  },

  async returnAssetLoan(loanId: string, assetId: string, condition?: string) {
    const loanPath = `asset_loans/${loanId}`;
    const assetPath = `assets/${assetId}`;
    try {
      await updateDoc(doc(db, 'asset_loans', loanId), {
        status: 'returned',
        returnDate: new Date().toISOString().split('T')[0],
        conditionOnReturn: condition || 'Baik'
      });
      await updateDoc(doc(db, 'assets', assetId), {
        status: 'available',
        assignedTo: '',
        assignedToName: ''
      });
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, loanPath);
    }
  },

  // ==========================================
  // MODUL HR & TEAM MANAGEMENT
  // ==========================================
  async getEmployees(tenantId: string): Promise<Employee[]> {
    const path = 'employees';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Employee));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async createEmployee(tenantId: string, data: Omit<Employee, 'id' | 'tenantId'>): Promise<string> {
    const path = 'employees';
    try {
      const docRef = await addDoc(collection(db, path), {
        tenantId,
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
      throw e;
    }
  },

  async updateEmployee(employeeId: string, data: Partial<Employee>) {
    const path = `employees/${employeeId}`;
    try {
      await updateDoc(doc(db, 'employees', employeeId), {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deleteEmployee(employeeId: string) {
    const path = `employees/${employeeId}`;
    try {
      await deleteDoc(doc(db, 'employees', employeeId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  async getAttendances(tenantId: string): Promise<AttendanceRecord[]> {
    const path = 'attendances';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async recordAttendance(tenantId: string, record: Omit<AttendanceRecord, 'id' | 'tenantId'>) {
    const path = 'attendances';
    try {
      const docRef = await addDoc(collection(db, path), {
        tenantId,
        ...record,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
      throw e;
    }
  },

  async getWorkOrders(tenantId: string): Promise<WorkOrder[]> {
    const path = 'work_orders';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as WorkOrder));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async createWorkOrder(tenantId: string, data: Omit<WorkOrder, 'id' | 'tenantId'>) {
    const path = 'work_orders';
    try {
      const docRef = await addDoc(collection(db, path), {
        tenantId,
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
      throw e;
    }
  },

  async updateWorkOrderStatus(workOrderId: string, status: WorkOrder['status'], redamanDb?: string, notes?: string) {
    const path = `work_orders/${workOrderId}`;
    try {
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };
      if (status === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }
      if (redamanDb) updateData.redamanDb = redamanDb;
      if (notes) updateData.notes = notes;

      await updateDoc(doc(db, 'work_orders', workOrderId), updateData);
      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async getPayrollSlips(tenantId: string): Promise<PayrollSlip[]> {
    const path = 'payroll_slips';
    try {
      const q = query(collection(db, path), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PayrollSlip));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async createPayrollSlip(tenantId: string, data: Omit<PayrollSlip, 'id' | 'tenantId'>) {
    const path = 'payroll_slips';
    try {
      const docRef = await addDoc(collection(db, path), {
        tenantId,
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
      throw e;
    }
  },

  async markPayrollSlipPaid(tenantId: string, slip: PayrollSlip, paymentMethod: string) {
    const slipPath = `payroll_slips/${slip.id}`;
    const transactionPath = 'transactions';
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    try {
      if (slip.id) {
        await updateDoc(doc(db, 'payroll_slips', slip.id), {
          paymentStatus: 'paid',
          paymentDate: today,
          paymentMethod
        });
      }

      // Automatically log expense in cash flow
      await addDoc(collection(db, transactionPath), {
        tenantId,
        type: 'expense',
        category: 'gaji_teknisi',
        amount: Number(slip.totalTakeHomePay),
        date: today,
        paymentMethod: paymentMethod,
        description: `Gaji & Insentif ${slip.period} - ${slip.employeeName} (${slip.role})`,
        referenceNo: slip.slipNumber,
        recordedBy: auth.currentUser?.email || 'HR & Finance Admin',
        createdAt: serverTimestamp()
      });

      return true;
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, slipPath);
    }
  }
};
