const CARDANOSCAN_API_KEY = 'aFC4bilw3rbPc1R7Sw330872AzuvUpDn';
const CARDANOSCAN_API_URL = 'https://api.cardanoscan.io/api';

interface Transaction {
  hash: string;
  block: string;
  block_height: number;
  time: string;
  slot: number;
  epoch: number;
  epoch_slot: number;
  tx_index: number;
  amount: string;
  fees: string;
  deposit: string;
  size: number;
  invalid_before: string | null;
  invalid_hereafter: string | null;
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

export async function getWalletBalance(address: string): Promise<{
  status: string;
  message: string;
  result: string;
}> {
  try {
    const response = await fetch(
      `${CARDANOSCAN_API_URL}?module=account&action=balance&address=${address}&apikey=${CARDANOSCAN_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching balance: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    throw error;
  }
}

export async function getWalletTransactions(
  address: string,
  page = 1,
  offset = 10
): Promise<{
  status: string;
  message: string;
  result: Transaction[];
}> {
  try {
    const response = await fetch(
      `${CARDANOSCAN_API_URL}?module=account&action=txs&address=${address}&page=${page}&offset=${offset}&sort=desc&apikey=${CARDANOSCAN_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Error fetching transactions: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

export function formatAda(lovelace: string): string {
  // Convert lovelace to ADA (1 ADA = 1,000,000 lovelace)
  const ada = Number(lovelace) / 1000000;
  return `${ada.toLocaleString()} ADA`;
}
