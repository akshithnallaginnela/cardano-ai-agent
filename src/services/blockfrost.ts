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
  block: string;
  block_height: number;
  block_time: number;
  slot: number;
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
}

interface AddressInfo {
  address: string;
  amount: WalletBalance[];
  stake_address?: string;
  type: string;
  script: boolean;
}

interface AddressTransactionsParams {
  count?: number;
  page?: number;
  order?: 'asc' | 'desc';
  from?: string;
  to?: string;
}

class BlockfrostService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = BLOCKFROST_API_KEY;
    this.baseUrl = BLOCKFROST_BASE_URL;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const query = new URLSearchParams();
      
      // Add pagination and other parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query.append(key, String(value));
        }
      });
      
      const queryString = query.toString() ? `?${query}` : '';
      const url = `${this.baseUrl}${endpoint}${queryString}`;
      
      console.log(`Making request to: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'project_id': this.apiKey,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('Blockfrost API error:', {
          status: response.status,
          statusText: response.statusText,
          url,
          error: data
        });
        
        throw new Error(
          data.message || 
          data.error?.message || 
          `Failed to fetch data from Blockfrost: ${response.statusText}`
        );
      }

      return data;
    } catch (error) {
      console.error('Error in makeRequest:', {
        endpoint,
        params,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Address methods
  public async getAddressInfo(address: string): Promise<AddressInfo> {
    try {
      console.log(`Fetching info for address: ${address}`);
      
      // First, get the address info
      const addressInfo = await this.makeRequest<{
        address: string;
        amount: WalletBalance[];
        stake_address?: string;
        type: string;
        script: boolean;
      }>(`/addresses/${address}`);
      
      console.log('Address info received:', addressInfo);
      
      // Then get the UTXOs
      const addressUtxos = await this.makeRequest<Array<{ amount: WalletBalance[] }>>(
        `/addresses/${address}/utxos`
      );
      
      console.log('UTXOs received:', addressUtxos);

      // Calculate total amounts from all UTXOs
      const amountMap = new Map<string, bigint>();
      
      // Initialize with the amounts from addressInfo
      if (addressInfo.amount) {
        addressInfo.amount.forEach(asset => {
          amountMap.set(asset.unit, BigInt(asset.quantity));
        });
      }
      
      // Add amounts from UTXOs
      if (Array.isArray(addressUtxos)) {
        addressUtxos.forEach(utxo => {
          if (utxo.amount && Array.isArray(utxo.amount)) {
            utxo.amount.forEach(asset => {
              const current = amountMap.get(asset.unit) || BigInt(0);
              amountMap.set(asset.unit, current + BigInt(asset.quantity));
            });
          }
        });
      }

      // Convert back to the expected format
      const totalAmounts = Array.from(amountMap.entries()).map(([unit, quantity]) => ({
        unit,
        quantity: quantity.toString()
      }));

      const result = {
        ...addressInfo,
        amount: totalAmounts
      };
      
      console.log('Processed address info:', result);
      return result;
    } catch (error) {
      console.error('Error in getAddressInfo:', error);
      throw error;
    }
  }

  public async getAddressTransactions(
    address: string, 
    params: AddressTransactionsParams = {}
  ): Promise<Transaction[]> {
    try {
      console.log(`Fetching transactions for address: ${address}`, params);
      
      const { count = 5, page = 1, order = 'desc', from, to } = params;
      
      // First, get the transaction hashes
      const txHashes = await this.makeRequest<Array<{tx_hash: string}>>(
        `/addresses/${address}/transactions`,
        {
          count,
          page,
          order,
          from,
          to
        }
      );
      
      console.log(`Found ${txHashes.length} transactions`);

      // If no transactions, return empty array
      if (!txHashes || txHashes.length === 0) {
        return [];
      }

      // Fetch details for each transaction
      const transactions: Transaction[] = [];
      
      for (const { tx_hash } of txHashes) {
        try {
          console.log(`Fetching details for tx: ${tx_hash}`);
          const txDetails = await this.makeRequest<Transaction>(`/txs/${tx_hash}`);
          
          // Get UTXOs for this transaction to determine the amounts
          try {
            const utxos = await this.makeRequest<any[]>(`/txs/${tx_hash}/utxos`);
            
            // Calculate total output amount for this address
            if (utxos && utxos.outputs) {
              const outputAmounts = new Map<string, bigint>();
              
              utxos.outputs.forEach((output: any) => {
                if (output.address === address && output.amount) {
                  output.amount.forEach((asset: WalletBalance) => {
                    const current = outputAmounts.get(asset.unit) || BigInt(0);
                    outputAmounts.set(asset.unit, current + BigInt(asset.quantity));
                  });
                }
              });
              
              // Update the transaction with the calculated amounts
              txDetails.output_amount = Array.from(outputAmounts.entries()).map(([unit, quantity]) => ({
                unit,
                quantity: quantity.toString()
              }));
            }
          } catch (utxoError) {
            console.error(`Error fetching UTXOs for tx ${tx_hash}:`, utxoError);
          }
          
          transactions.push(txDetails);
        } catch (txError) {
          console.error(`Error fetching details for tx ${tx_hash}:`, txError);
          // Continue with other transactions even if one fails
        }
      }

      console.log(`Successfully fetched ${transactions.length} transaction details`);
      return transactions;
    } catch (error) {
      console.error('Error in getAddressTransactions:', error);
      throw error;
    }
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

// Export the service instance
export const blockfrostService = new BlockfrostService();