import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

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

  async getOnuDetails(sn: string) {
    try {
      const res = await fetch(`/api/onus/${sn}/details`);
      if (!res.ok) throw new Error('ONU link failure');
      return await res.json();
    } catch (e) {
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
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'pppoe_profiles', profileId));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  }
};
