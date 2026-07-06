export type Emotion = 'helpful' | 'happy' | 'analytical' | 'worried' | 'excited';

export type Personality = 'tsundere' | 'kuudere' | 'dandere' | 'deredere' | 'yandere';

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  emotion?: Emotion;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

export type AssetType = 'stock' | 'crypto' | 'mutual_fund' | 'gold' | 'cash';

export interface Investment {
  id: string;
  date: string;
  ticker: string;
  name: string;
  buyPrice: number;
  quantity: number;
  currentPrice: number;
  assetType: AssetType;
}

export interface StockInfo {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  peRatio: number;
  dividendYield: number;
  description: string;
}
