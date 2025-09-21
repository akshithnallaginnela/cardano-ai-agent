const BLOCKFROST_API_KEY = 'previewaFC4bilw3rbPc1R7Sw330872AzuvUpDn';
const BLOCKFROST_BASE_URL = 'https://cardano-preview.blockfrost.io/api/v0';

export interface WalletBalance {
  unit: string;
  quantity: string;
}

export interface WalletInfo {
  address: string;
  amount: WalletBalance[];
  stake_address?: string;
  type: string;
  script: boolean;
}

export interface Transaction {
  tx_hash: string;
  tx_index: number;
  output_amount: WalletBalance[];
  fees: string;
  deposit: string;
  size: number;
  invalid_before?: string;
  invalid_hereafter?: string;
  utxo_count: number;
  withdrawal_count: number;
  mir_cert_count: number;
  delegation_count: number;
  stake_cert_count: number;
  pool_update_count: number;
  pool_retire_count: number;
  asset_mint_or_burn_count: number;
  redeemer_count: number;
  valid_contract: boolean;
  block_height: number;
  block_time: number;
}

class BlockfrostService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = BLOCKFROST_API_KEY;
    this.baseUrl = BLOCKFROST_BASE_URL;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'project_id': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Blockfrost API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getWalletInfo(address: string): Promise<WalletInfo> {
    return this.makeRequest<WalletInfo>(`/addresses/${address}`);
  }

  async getTransactionHistory(address: string, count: number = 5): Promise<Transaction[]> {
    const txHashes = await this.makeRequest<string[]>(`/addresses/${address}/transactions?count=${count}&order=desc`);
    
    const transactions: Transaction[] = [];
    for (const hash of txHashes.slice(0, count)) {
      try {
        const tx = await this.makeRequest<Transaction>(`/txs/${hash}`);
        transactions.push(tx);
      } catch (error) {
        console.error(`Error fetching transaction ${hash}:`, error);
      }
    }
    
    return transactions;
  }

  formatAda(lovelace: string): string {
    const ada = parseInt(lovelace) / 1_000_000;
    return ada.toFixed(6);
  }

  formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  shortenHash(hash: string, length: number = 10): string {
    if (hash.length <= length * 2) return hash;
    return `${hash.slice(0, length)}...${hash.slice(-length)}`;
  }
}

export const blockfrostService = new BlockfrostService();