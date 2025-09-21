import { BlockfrostWalletInfo } from '@/components/BlockfrostWalletInfo';
import { Card } from '@/components/ui/card';

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Cardano Preview Testnet Explorer</h1>
          <p className="text-muted-foreground">
            Explore wallet balances and transactions on the Cardano Preview Testnet
          </p>
        </div>
        
        <BlockfrostWalletInfo />
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Powered by Blockfrost.io • Preview Testnet</p>
          <p className="mt-1">
            Get test ADA from the{' '}
            <a 
              href="https://docs.cardano.org/cardano-testnet/tools/faucet" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Cardano Testnet Faucet
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
