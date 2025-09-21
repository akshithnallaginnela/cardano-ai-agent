import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, ExternalLink, Clock, Coins, Hash } from 'lucide-react';
import { blockfrostService, Transaction } from '@/services/blockfrost';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const openInExplorer = (txHash: string) => {
    window.open(`https://preview.cardanoscan.io/transaction/${txHash}`, '_blank');
  };

  return (
    <div className="mt-4">
      <Card className="bg-gradient-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <History className="w-5 h-5 text-crypto-purple" />
            <span>Transaction History</span>
            <Badge variant="outline" className="border-crypto-purple text-crypto-purple">
              {transactions.length} transactions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No transactions found for this wallet.
            </div>
          ) : (
            transactions.map((tx) => (
              <Card key={tx.tx_hash} className="bg-muted border-border hover:bg-muted/80 transition-colors">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Transaction Hash and Explorer Link */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-crypto-blue" />
                        <span className="font-mono text-sm">
                          {blockfrostService.shortenHash(tx.tx_hash, 12)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openInExplorer(tx.tx_hash)}
                        className="h-6 px-2 text-xs hover:bg-crypto-blue/10"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Explorer
                      </Button>
                    </div>

                    {/* Amount and Fee */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Coins className="w-3 h-3" />
                          <span>Amount</span>
                        </div>
                        <div className="font-semibold">
                          {tx.output_amount.length > 0 && tx.output_amount[0].unit === 'lovelace'
                            ? `₳ ${blockfrostService.formatAda(tx.output_amount[0].quantity)}`
                            : 'Multiple Assets'
                          }
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <span>Fee</span>
                        </div>
                        <div className="font-semibold text-crypto-warning">
                          ₳ {blockfrostService.formatAda(tx.fees)}
                        </div>
                      </div>
                    </div>

                    {/* Timestamp and Block */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{blockfrostService.formatTimestamp(tx.block_time)}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span>Block: {tx.block_height}</span>
                        <span>Size: {tx.size} bytes</span>
                      </div>
                    </div>

                    {/* Transaction Status */}
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={tx.valid_contract ? "default" : "destructive"}
                        className={tx.valid_contract 
                          ? "bg-crypto-success text-black" 
                          : "bg-destructive text-destructive-foreground"
                        }
                      >
                        {tx.valid_contract ? "Valid" : "Invalid"}
                      </Badge>
                      {tx.utxo_count > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {tx.utxo_count} UTXOs
                        </Badge>
                      )}
                      {tx.delegation_count > 0 && (
                        <Badge variant="outline" className="text-xs border-crypto-cyan text-crypto-cyan">
                          Delegation
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};