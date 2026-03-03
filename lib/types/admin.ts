export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'manager' | 'support';
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin: string;
}

export interface Agent {
  id: string;
  name: string;
  shopName: string;
  agentCode: string;
  totalSales: number;
  walletBalance: number;
  status: 'active' | 'suspended';
  joinDate: string;
}

export interface DataPurchase {
  id: string;
  date: string;
  time: string;
  customerName: string;
  phoneNumber: string;
  network: 'MTN' | 'TELECEL' | 'AT PREMIUM';
  dataPackage: string;
  gbAmount: number;
  validity: string;
  amount: number;
  agentName: string;
  agentCode: string;
  agentProfit: number;
  status: 'success' | 'pending' | 'failed';
}

export interface DataPackage {
  id: string;
  network: 'MTN' | 'TELECEL' | 'AT PREMIUM';
  packageName: string;
  dataSize: number;
  validity: string;
  basePrice: number;
  defaultAgentProfit: number;
  status: 'active' | 'inactive';
}

export interface Withdrawal {
  id: string;
  agentName: string;
  agentCode: string;
  amount: number;
  requestDate: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
}

export interface DashboardStats {
  totalRevenue: number;
  activeAgents: number;
  totalPurchases: number;
  pendingWithdrawals: number;
  revenueTrend: number;
  agentsTrend: number;
  purchasesTrend: number;
}
