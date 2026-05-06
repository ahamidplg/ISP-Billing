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
