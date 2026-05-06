import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";

// Firebase dependencies for background job
import { initializeApp, cert, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

// Attempt to load Firebase Config
const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig = null;
if (fs.existsSync(firebaseConfigPath)) {
  firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));
}

// Initialize Firebase Admin (Simulated/Best-effort)
let adminDb: any = null;
let adminAuthorized = false;

try {
  if (firebaseConfig) {
    const apps = getApps();
    let adminApp;
    
    if (apps.length === 0) {
      adminApp = initializeApp({
        credential: applicationDefault(),
        projectId: firebaseConfig.projectId
      });
    } else {
      adminApp = apps[0];
    }
    
    const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
    adminDb = getFirestore(adminApp, dbId);
    
    console.log(`[FIREBASE-ADMIN] Init Project: ${firebaseConfig.projectId}, DB: ${dbId}`);
    
    // Connection test
    adminDb.collection("routers").limit(1).get()
      .then((s: any) => {
        adminAuthorized = true;
        console.log(`[FIREBASE-ADMIN] Connection test OK. Collection 'routers' accessible. Count: ${s.size}`);
      })
      .catch((e: any) => {
        adminAuthorized = false;
        console.warn(`[FIREBASE-ADMIN] Background Jobs Limited: ${e.message}`);
        if (e.message.includes("PERMISSION_DENIED")) {
           console.warn("[FIREBASE-ADMIN] Note: Full background automation requires 'Cloud Datastore User' IAM role.");
        }
      });
  }
} catch (e) {
  console.warn("Firebase Admin failed to init.", e);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Mikrotik RouterOS Integration Service
  const routerService = {
    async getRouterLiveStatus(routerId: string) {
      // Simulate real latency
      await new Promise(r => setTimeout(r, 100));
      
      const isUp = Math.random() > 0.05; // 95% uptime simulation
      return {
        id: routerId,
        status: isUp ? "online" : "offline",
        metrics: {
          cpu: Math.floor(Math.random() * 20) + (isUp ? 5 : 0),
          memory: 256,
          temp: 42,
          active_pppoe: isUp ? Math.floor(Math.random() * 50) + 100 : 0,
          active_hotspot: isUp ? Math.floor(Math.random() * 20) + 30 : 0,
          last_update: new Date().toISOString()
        }
      };
    }
  };

  // --- Background Job: Network Health Monitor ---
  const startHealthMonitor = () => {
    const INTERVAL = 5 * 60 * 1000; // 5 Minutes
    
    console.log(`[JOB] Network Health Monitor active. Interval: ${INTERVAL}ms`);
    
    setInterval(async () => {
      if (!adminDb || !adminAuthorized) {
        // Silently skip if not authorized or initialized
        return;
      }

      console.log(`[JOB] Starting network-wide health check at ${new Date().toISOString()}`);
      
      try {
        // 1. Fetch all routers across all tenants
        const routersSnapshot = await adminDb.collection("routers").get();
        console.log(`[JOB] Found ${routersSnapshot.size} routers to check.`);

        for (const doc of routersSnapshot.docs) {
          const routerData = doc.data();
          const routerId = doc.id;

          console.log(`[JOB] Checking Router: ${routerData.name} (${routerId})`);
          
          // 2. Poll live status
          const liveStatus = await routerService.getRouterLiveStatus(routerId);
          
          // 3. Update Firestore
          await adminDb.collection("routers").doc(routerId).update({
            status: liveStatus.status,
            lastSeen: new Date(),
            metrics: liveStatus.metrics
          });
          
          console.log(`[JOB] Updated status for ${routerData.name}: ${liveStatus.status}`);
        }
        
        console.log("[JOB] Health check cycle complete.");
      } catch (err: any) {
        if (err.message.includes("PERMISSION_DENIED")) {
          adminAuthorized = false;
          console.warn("[JOB] Access revoked. Health monitor entering standby.");
        } else {
          console.error("[JOB] Error in health monitor cycle:", err);
        }
      }
    }, INTERVAL);
  };

  // Start the background job
  startHealthMonitor();

  // --- API Routes ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "ISP Billing Engine" });
  });

  // Fetch Router Real-time Data (Proxy for Frontend)
  app.get("/api/network/status/:routerId", async (req, res) => {
    const { routerId } = req.params;
    try {
      const status = await routerService.getRouterLiveStatus(routerId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Mikrotik Timeout" });
    }
  });

  // --- OLT Management API ---
  app.get("/api/olts/:id/unconfigured", async (req, res) => {
    try {
      // In a real app, we'd fetch OLT creds from Firestore and use olt_manager.py
      // For now, we simulate the results from a Huawei/ZTE OLT
      const onus = [
        { sn: "HWTC" + Math.random().toString(36).substring(7).toUpperCase(), pon: "0/1/0", vendor: "Huawei" },
        { sn: "ZTEG" + Math.random().toString(36).substring(7).toUpperCase(), pon: "0/2/1", vendor: "ZTE" }
      ];
      res.json(onus);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch unconfigured ONUs" });
    }
  });

  app.get("/api/olts/:id/configured", async (req, res) => {
    try {
      const onus = [
        { sn: "HWTC78A1B2C3", pon: "0/1/0", vendor: "Huawei", customerId: "cust_1", status: "online" },
        { sn: "ZTEG99X8Y7Z6", pon: "0/1/1", vendor: "ZTE", customerId: "cust_2", status: "online" }
      ];
      res.json(onus);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch configured ONUs" });
    }
  });

  app.get("/api/onus/:sn/details", async (req, res) => {
    const { sn } = req.params;
    try {
      res.json({
        sn,
        signal: {
          rx: (Math.random() * -5 - 18).toFixed(2), // -18 to -23 dBm
          tx: (Math.random() * 2 + 1.5).toFixed(2),  // 1.5 to 3.5 dBm
        },
        metrics: {
          temp: (Math.random() * 10 + 35).toFixed(1), // 35-45 C
          voltage: (Math.random() * 0.2 + 3.2).toFixed(2), // 3.2-3.4V
        },
        customer: {
          id: "cust_1",
          name: "John Doe",
          plan: "100Mbps Fiber"
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ONU diagnostics" });
    }
  });

  app.post("/api/olts/:id/authorize", express.json(), async (req, res) => {
    const { sn, ponPort, customerId } = req.body;
    console.log(`[OLT] Authorizing ONU ${sn} for customer ${customerId} on port ${ponPort}`);
    
    // Simulate successful provisioning
    res.json({ success: true, message: "ONU Provisioned Successfully" });
  });

  app.get("/api/olts/:oltId/onus/:onuSn/details", (req, res) => {
    const { onuSn } = req.params;
    // Mock customer assignment
    res.json({
      customer: {
        id: "CUST-" + Math.floor(Math.random() * 9000 + 1000),
        name: "Ahmad " + (onuSn.substring(0, 4)),
        plan: "Premium 100Mbps",
        address: "Jl. Sudirman No. " + Math.floor(Math.random() * 100 + 1)
      }
    });
  });

  app.get("/api/olts/:oltId/onus/:onuSn/metrics", (req, res) => {
    // Generate realistic optical stats
    const rx = -18.0 - (Math.random() * 5);
    const tx = 1.5 + (Math.random() * 2);
    const temp = 42.0 + (Math.random() * 10);
    const voltage = 3.2 + (Math.random() * 0.2);

    res.json({
      rxPower: rx.toFixed(2),
      txPower: tx.toFixed(2),
      temperature: temp.toFixed(1),
      voltage: voltage.toFixed(2),
      updatedAt: new Date().toISOString()
    });
  });

  app.post("/api/olts/test-connection", express.json(), async (req, res) => {
    const { name, ip, username, password, vendor, protocol } = req.body;
    console.log(`[OLT-PROVISION] Testing connection to ${name} (${ip}) using ${vendor || 'manual'} vendor via ${protocol || 'SSH'}`);
    
    // Artificial latency for realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple validation simulation
    if (!ip || !username || !password) {
      return res.status(400).json({ success: false, error: "Missing required connection parameters" });
    }

    if (ip.startsWith("192.168") || ip.startsWith("172.16") || ip.startsWith("10.")) {
      // Simulate unreachable private IP if needed, but for the demo we'll succeed
      res.json({ 
        success: true, 
        message: `Successfully established ${protocol || 'SSH'} session with ${vendor?.toUpperCase() || 'generic'} OLT at ${ip}`,
        details: {
          uptime: "14d 6h 22m",
          version: "V100R019C10SPC110",
          load: "4%"
        }
      });
    } else {
      // Small chance of failure
      if (Math.random() > 0.8) {
        res.status(502).json({ success: false, error: "Authentication failed or timeout while handshaking" });
      } else {
        res.json({ 
          success: true, 
          message: `Handshake successful with ${vendor?.toUpperCase() || 'generic'} OLT`,
          details: { firmware: "ISP.v3.1", uptime: "243 days" }
        });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ISP Billing Engine running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
