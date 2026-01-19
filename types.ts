
export enum AssetType {
  ETH = 'ETH',
  USDC = 'USDC',
  SOL = 'SOL',
  WBTC = 'WBTC'
}

export interface CollateralAsset {
  type: AssetType;
  amount: number;
  price: number;
  ltv: number; // Max loan-to-value (e.g., 0.7)
}

export interface SecuritySettings {
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  spendingLimit: number | null;
  ipWhitelist: string[];
  auditLogs: { action: string; timestamp: number }[];
}

export interface UserState {
  walletAddress: string | null;
  collateral: CollateralAsset[];
  creditUsed: number;
  totalLimit: number;
  transactions: Transaction[];
  isCardFrozen: boolean;
  security: SecuritySettings;
}

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  timestamp: number;
  status: 'PENDING' | 'COMPLETED' | 'DECLINED';
  category: string;
}

export interface MarketPrice {
  asset: AssetType;
  price: number;
  change24h: number;
}
