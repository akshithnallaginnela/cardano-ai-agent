import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { blockfrostService, WalletInfo, Transaction } from '@/services/blockfrost';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-md flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Something went wrong</h3>
            <p className="text-sm mt-1">{this.state.error?.message || 'An unknown error occurred'}</p>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 text-sm text-red-700 underline"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const formatLovelace = (lovelace: string): string => {
  try {
    const amount = parseInt(lovelace, 10) / 1000000;
    return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ADA`;
  } catch (error) {
    console.error('Error formatting lovelace:', error);
    return '0 ADA';
  }
};

interface BlockfrostWalletInfoContentProps {
  error: string | null;
  address: string;
  setAddress: (address: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onRefresh: () => void;
  isLoading: boolean;
  walletInfo: WalletInfo | null;
  transactions: Transaction[];
  copyToClipboard: (text: string, message?: string) => void;
}

function BlockfrostWalletInfoContent({ 
  error, 
  address, 
  setAddress, 
  handleSubmit, 
  onRefresh,
  isLoading, 
  walletInfo, 
  transactions,
  copyToClipboard
}: BlockfrostWalletInfoContentProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cardano Wallet Lookup</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Cardano testnet address (starts with addr_test or Ae2)"
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !address}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Lookup'
              )}
            </Button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {walletInfo && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Wallet Information</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold">
                  {formatLovelace(walletInfo.amount[0].quantity)}
                </p>
              </div>
              {walletInfo.stake_address && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Stake Address</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-mono truncate">
                      {walletInfo.stake_address}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(walletInfo.stake_address!, 'Stake address copied')}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="text-sm capitalize">{walletInfo.type}</p>
              </div>
            </div>

            {walletInfo.amount.length > 1 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Assets</h3>
                <div className="space-y-2">
                  {walletInfo.amount
                    .filter(asset => asset.unit !== 'lovelace')
                    .map(asset => (
                      <div key={asset.unit} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <div>
                          <p className="text-sm font-medium">Asset</p>
                          <p className="text-xs font-mono">{asset.unit}</p>
                        </div>
                        <p className="text-sm font-mono">{asset.quantity}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {transactions && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((tx) => {
                const adaAmount = tx.output_amount?.find(a => a.unit === 'lovelace');
                const formattedAmount = adaAmount ? formatLovelace(adaAmount.quantity) : '0 ADA';
                
                return (
                  <div key={tx.tx_hash} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">
                            {new Date(tx.block_time * 1000).toLocaleString()}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => tx.tx_hash && navigator.clipboard.writeText(tx.tx_hash)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          {tx.tx_hash ? `${tx.tx_hash.substring(0, 10)}...${tx.tx_hash.substring(tx.tx_hash.length - 10)}` : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formattedAmount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.block_time * 1000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-6 p-0 text-xs"
                        onClick={() => tx.tx_hash && window.open(`https://preview.cardanoscan.io/transaction/${tx.tx_hash}`, '_blank')}
                      >
                        View on CardanoScan <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function BlockfrostWalletInfo() {
  console.log('Initializing BlockfrostWalletInfo');
  
  const [address, setAddress] = useState('');
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching wallet data for address:', address);

      // Basic address validation
      const isTestnetAddress = address.startsWith('addr_test') || address.startsWith('Ae2');
      const isMainnetAddress = address.startsWith('addr1') || address.startsWith('Ddz');
      
      if (!isTestnetAddress && !isMainnetAddress) {
        throw new Error('Invalid Cardano address format. Please enter a valid address.');
      }
      
      if (isMainnetAddress) {
        throw new Error('This application is configured for Cardano Testnet. Please use a testnet address (starts with addr_test or Ae2).');
      }

      // Fetch wallet info and transactions in parallel
      const [walletData, txData] = await Promise.all([
        blockfrostService.getAddressInfo(address).catch(err => {
          console.error('Error in getAddressInfo:', err);
          if (err.message && err.message.includes('Invalid address for this network')) {
            throw new Error('The address appears to be for a different network. Please use a testnet address.');
          }
          throw err;
        }),
        blockfrostService.getAddressTransactions(address, { count: 5 }).catch(err => {
          console.error('Error in getAddressTransactions:', err);
          return []; // Return empty array if transactions can't be loaded
        })
      ]);

      setWalletInfo(walletData);
      setTransactions(txData || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching wallet data:', errorMessage);
      setError(errorMessage);
      setWalletInfo(null);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter a valid Cardano address');
      return;
    }

    try {
      await fetchWalletData();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
    }
  };

  const handleRefresh = async () => {
    if (!address) return;
    await fetchWalletData();
  };

  const copyToClipboard = (text: string, message: string = 'Copied to clipboard!') => {
    try {
      navigator.clipboard.writeText(text);
      toast({
        title: 'Success',
        description: message,
      });
    } catch (err) {
      console.error('Failed to copy text:', err);
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  return (
    <ErrorBoundary>
      <BlockfrostWalletInfoContent
        error={error}
        address={address}
        setAddress={setAddress}
        handleSubmit={handleSubmit}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        walletInfo={walletInfo}
        transactions={transactions}
        copyToClipboard={copyToClipboard}
      />
    </ErrorBoundary>
  );
}
