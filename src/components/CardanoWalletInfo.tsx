import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getWalletBalance, getWalletTransactions, formatAda } from '@/lib/cardano';

interface Transaction {
  hash: string;
  block: string;  // Changed from number to string to match API response
  time: string;
  amount: string;
  // Add other fields that might be present in the API response
  block_height?: number;
  tx_index?: number;
  fees?: string;
  // Add more fields as needed from the API response
}

export function CardanoWalletInfo() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch balance
      const balanceData = await getWalletBalance(address);
      if (balanceData.status === '1') {
        setBalance(balanceData.result);
      } else {
        throw new Error(balanceData.message || 'Failed to fetch balance');
      }
      
      // Fetch transactions
      const txData = await getWalletTransactions(address);
      if (txData.status === '1') {
        setTransactions(txData.result);
      } else {
        throw new Error(txData.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: 'Error',
        description: 'Failed to fetch wallet data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWalletData();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Address copied to clipboard',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Cardano Wallet Explorer</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Cardano wallet address"
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !address.trim()}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-destructive">
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {balance !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Wallet Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{formatAda(balance)}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(address)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Address
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx.hash} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {new Date(tx.time).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {`${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 10)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {parseInt(tx.amount) > 0 ? '+' : ''}
                        {formatAda(tx.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Block: {tx.block}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
