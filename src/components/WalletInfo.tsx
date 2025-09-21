import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Coins, Shield, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { blockfrostService, WalletInfo as WalletInfoType } from '@/services/blockfrost';

interface WalletInfoProps {
  data: WalletInfoType;
}

export const WalletInfo: React.FC<WalletInfoProps> = ({ data }) => {
  const adaBalance = data.amount.find(asset => asset.unit === 'lovelace');
  const otherAssets = data.amount.filter(asset => asset.unit !== 'lovelace');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Address copied successfully",
    });
  };

  return (
    <div className="mt-4 space-y-4">
      <Card className="bg-gradient-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Wallet className="w-5 h-5 text-crypto-blue" />
            <span>Wallet Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Address</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(data.address)}
                className="h-6 px-2 text-xs hover:bg-crypto-blue/10"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <div className="font-mono text-sm bg-muted p-2 rounded border">
              {blockfrostService.shortenHash(data.address, 20)}
            </div>
          </div>

          {/* ADA Balance */}
          {adaBalance && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-crypto-success" />
                <span className="text-sm font-medium">ADA Balance</span>
              </div>
              <div className="text-2xl font-bold text-crypto-success">
                ₳ {blockfrostService.formatAda(adaBalance.quantity)}
              </div>
              <div className="text-xs text-muted-foreground">
                {parseInt(adaBalance.quantity).toLocaleString()} Lovelace
              </div>
            </div>
          )}

          {/* Wallet Type & Properties */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-crypto-blue text-crypto-blue">
              <Shield className="w-3 h-3 mr-1" />
              {data.type}
            </Badge>
            {data.script && (
              <Badge variant="outline" className="border-crypto-purple text-crypto-purple">
                Script Address
              </Badge>
            )}
            {data.stake_address && (
              <Badge variant="outline" className="border-crypto-cyan text-crypto-cyan">
                Staking Active
              </Badge>
            )}
          </div>

          {/* Other Assets */}
          {otherAssets.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Native Tokens</span>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {otherAssets.map((asset, index) => (
                  <div key={index} className="flex justify-between text-sm bg-muted p-2 rounded">
                    <span className="font-mono text-xs">
                      {blockfrostService.shortenHash(asset.unit, 8)}
                    </span>
                    <span className="font-medium">{asset.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
